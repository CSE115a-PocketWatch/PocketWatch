import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService, AuthUser } from '../auth/auth.service.js';
import { SessionGuard } from '../auth/session.guard.js';
import { GoogleCalendarService } from '../integrations/google-calendar/google-calendar.service.js';
import { SchedulingController } from './scheduling.controller.js';

// Stands in for Google's calendar.events.list, so no network is used.
const { listEvents } = vi.hoisted(() => ({ listEvents: vi.fn() }));
vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: class {
        setCredentials(): void {}
      },
    },
    calendar: () => ({ events: { list: listEvents } }),
  },
}));

const user: AuthUser = { id: 'user-1', email: 'student@example.com', name: 'Student', avatarUrl: null };

// Monday 16 Nov 2026, midnight to midnight Pacific (PST is UTC-8).
const monday = 'from=2026-11-16T00:00:00-08:00&to=2026-11-17T00:00:00-08:00';

describe('GET /schedule/free-slots', () => {
  let app: INestApplication;
  let baseUrl: string;
  // Stands in for the real AuthService, so no database is used.
  const authService = {
    getUserFromSession: vi.fn(async (sessionId: string) => (sessionId === 'valid' ? user : null)),
    getAccessToken: vi.fn(async () => 'fake-token'),
  };

  // Sends a request as the signed-in user unless another cookie is given.
  function get(query: string, cookie = 'session=valid'): Promise<Response> {
    return fetch(`${baseUrl}/schedule/free-slots?${query}`, { headers: { cookie } });
  }

  beforeEach(async () => {
    listEvents.mockReset();
    authService.getAccessToken.mockClear();

    const moduleRef = await Test.createTestingModule({
      controllers: [SchedulingController],
      providers: [GoogleCalendarService, SessionGuard, { provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('free-slots-1 returns default availability in the calendar time zone when there are no events', async () => {
    listEvents.mockResolvedValue({ data: { timeZone: 'America/Los_Angeles', items: [] } });

    const res = await get(monday);

    expect(res.status).toBe(200);
    // Default 9am to 9pm Pacific.
    expect(await res.json()).toEqual({
      timeZone: 'America/Los_Angeles',
      free: [{ start: '2026-11-16T17:00:00.000Z', end: '2026-11-17T05:00:00.000Z' }],
    });
    expect(authService.getAccessToken).toHaveBeenCalledWith('user-1');
  });

  it('free-slots-1 removes the user\'s Google Calendar events and returns sorted slots', async () => {
    listEvents.mockResolvedValue({
      data: {
        timeZone: 'America/Los_Angeles',
        items: [
          // Out of order on purpose: 3pm to 4pm, then 11am to noon Pacific.
          {
            summary: 'Work shift',
            start: { dateTime: '2026-11-16T15:00:00-08:00' },
            end: { dateTime: '2026-11-16T16:00:00-08:00' },
          },
          {
            summary: 'Lecture',
            start: { dateTime: '2026-11-16T11:00:00-08:00' },
            end: { dateTime: '2026-11-16T12:00:00-08:00' },
          },
        ],
      },
    });

    const res = await get(monday);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.free).toEqual([
      // 9am to 11am, noon to 3pm, 4pm to 9pm Pacific.
      { start: '2026-11-16T17:00:00.000Z', end: '2026-11-16T19:00:00.000Z' },
      { start: '2026-11-16T20:00:00.000Z', end: '2026-11-16T23:00:00.000Z' },
      { start: '2026-11-17T00:00:00.000Z', end: '2026-11-17T05:00:00.000Z' },
    ]);
    expect(JSON.stringify(body)).not.toMatch(/Work shift|Lecture/);
  });

  it('free-slots-1 rejects bad requests the same way as /calendar/busy', async () => {
    listEvents.mockResolvedValue({ data: { timeZone: 'UTC', items: [] } });

    expect((await get('from=2026-11-16&to=2026-11-17')).status).toBe(400);
    expect((await get(monday, '')).status).toBe(401);
    expect(listEvents).not.toHaveBeenCalled();

    listEvents.mockRejectedValue(new Error('Google is down'));
    expect((await get(monday)).status).toBe(502);
  });
});

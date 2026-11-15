import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService, AuthUser } from '../../auth/auth.service.js';
import { SessionGuard } from '../../auth/session.guard.js';
import { GoogleCalendarController } from './google-calendar.controller.js';
import { GoogleCalendarService } from './google-calendar.service.js';

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

// A valid one-week range in Pacific time.
const week = 'from=2026-11-16T00:00:00-08:00&to=2026-11-23T00:00:00-08:00';

describe('GET /calendar/busy', () => {
  let app: INestApplication;
  let baseUrl: string;
  // Stands in for the real AuthService, so no database is used.
  const authService = {
    getUserFromSession: vi.fn(async (sessionId: string) => (sessionId === 'valid' ? user : null)),
    getAccessToken: vi.fn(async () => 'fake-token'),
  };

  // Sends a request as the signed-in user unless another cookie is given.
  function get(query: string, cookie = 'session=valid'): Promise<Response> {
    return fetch(`${baseUrl}/calendar/busy?${query}`, { headers: { cookie } });
  }

  beforeEach(async () => {
    listEvents.mockReset();
    authService.getAccessToken.mockClear();
    authService.getAccessToken.mockImplementation(async () => 'fake-token');

    const moduleRef = await Test.createTestingModule({
      controllers: [GoogleCalendarController],
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

  it('calendar-busy-times-1 returns busy times and time zone for the signed-in user', async () => {
    listEvents.mockResolvedValue({
      data: {
        timeZone: 'America/Los_Angeles',
        items: [
          {
            status: 'confirmed',
            start: { dateTime: '2026-11-17T09:00:00-08:00' },
            end: { dateTime: '2026-11-17T10:00:00-08:00' },
          },
        ],
      },
    });

    const res = await get(week);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      timeZone: 'America/Los_Angeles',
      busy: [{ start: '2026-11-17T17:00:00.000Z', end: '2026-11-17T18:00:00.000Z' }],
    });
    // Used the signed-in user's Google token and their primary calendar.
    expect(authService.getAccessToken).toHaveBeenCalledWith('user-1');
    expect(listEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        timeMin: '2026-11-16T08:00:00.000Z',
        timeMax: '2026-11-23T08:00:00.000Z',
      }),
    );
  });

  it('calendar-busy-times-1 asks Google to expand recurring events', async () => {
    listEvents.mockResolvedValue({ data: { timeZone: 'UTC', items: [] } });

    await get(week);

    expect(listEvents).toHaveBeenCalledWith(expect.objectContaining({ singleEvents: true }));
  });

  it('calendar-busy-times-1 combines events from every page', async () => {
    listEvents
      .mockResolvedValueOnce({
        data: {
          timeZone: 'UTC',
          nextPageToken: 'page-2',
          items: [{ start: { dateTime: '2026-11-17T17:00:00Z' }, end: { dateTime: '2026-11-17T18:00:00Z' } }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          timeZone: 'UTC',
          items: [{ start: { dateTime: '2026-11-18T17:00:00Z' }, end: { dateTime: '2026-11-18T18:00:00Z' } }],
        },
      });

    const res = await get(week);
    const body = (await res.json()) as { busy: { start: string }[] };

    expect(listEvents).toHaveBeenCalledTimes(2);
    expect(listEvents).toHaveBeenLastCalledWith(expect.objectContaining({ pageToken: 'page-2' }));
    expect(body.busy.map((block) => block.start)).toEqual(['2026-11-17T17:00:00.000Z', '2026-11-18T17:00:00.000Z']);
  });

  it('calendar-busy-times-1 never returns event titles or details', async () => {
    listEvents.mockResolvedValue({
      data: {
        timeZone: 'UTC',
        items: [
          {
            summary: 'Doctor appointment',
            description: 'Private notes',
            location: '123 Main St',
            attendees: [{ email: 'friend@example.com' }],
            start: { dateTime: '2026-11-17T17:00:00Z' },
            end: { dateTime: '2026-11-17T18:00:00Z' },
          },
        ],
      },
    });

    const res = await get(week);
    const body = (await res.json()) as { busy: object[] };

    expect(Object.keys(body.busy[0]).sort()).toEqual(['end', 'start']);
    expect(JSON.stringify(body)).not.toMatch(/Doctor|Private|Main St|friend@example\.com|fake-token/);
  });

  it('calendar-busy-times-1 rejects missing, invalid, or time-zone-less from/to with 400', async () => {
    const badQueries = [
      '',
      'from=2026-11-16T00:00:00Z',
      'to=2026-11-23T00:00:00Z',
      'from=not-a-date&to=2026-11-23T00:00:00Z',
      'from=2026-11-16T00:00:00&to=2026-11-23T00:00:00',
      'from=2026-11-16&to=2026-11-23',
      'from=2026-13-40T00:00:00Z&to=2026-11-23T00:00:00Z',
    ];

    for (const query of badQueries) {
      expect((await get(query)).status, query).toBe(400);
    }
    expect(listEvents).not.toHaveBeenCalled();
  });

  it('calendar-busy-times-1 rejects from after to and ranges over 62 days with 400', async () => {
    const backwards = await get('from=2026-11-23T00:00:00Z&to=2026-11-16T00:00:00Z');
    const same = await get('from=2026-11-16T00:00:00Z&to=2026-11-16T00:00:00Z');
    const tooLong = await get('from=2026-11-01T00:00:00Z&to=2027-01-03T00:00:01Z');

    expect(backwards.status).toBe(400);
    expect(same.status).toBe(400);
    expect(tooLong.status).toBe(400);
    expect(listEvents).not.toHaveBeenCalled();
  });

  it('calendar-busy-times-1 returns 401 without a valid session', async () => {
    const noCookie = await get(week, '');
    const badCookie = await get(week, 'session=unknown');

    expect(noCookie.status).toBe(401);
    expect(badCookie.status).toBe(401);
    expect(listEvents).not.toHaveBeenCalled();
  });

  it('calendar-busy-times-1 returns 401 when the user has no Google access', async () => {
    authService.getAccessToken.mockRejectedValue(new UnauthorizedException('User has not granted Google access'));

    const res = await get(week);

    expect(res.status).toBe(401);
    expect(listEvents).not.toHaveBeenCalled();
  });

  it('calendar-busy-times-1 returns 502 when Google Calendar fails', async () => {
    listEvents.mockRejectedValue(new Error('Google is down'));

    const res = await get(week);

    expect(res.status).toBe(502);
  });
});

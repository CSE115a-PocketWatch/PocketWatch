import { INestApplication, UnauthorizedException } from '@nestjs/common';
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

// "Now" is Monday 16 Nov 2026, 8am Pacific (PST is UTC-8).
const NOW = new Date('2026-11-16T16:00:00Z');

type Session = { assignmentId: string; start: string; end: string; durationMinutes: number };

describe('POST /schedule/generate', () => {
  let app: INestApplication;
  let baseUrl: string;
  // Stands in for the real AuthService, so no database is used.
  const authService = {
    getUserFromSession: vi.fn(async (sessionId: string) => (sessionId === 'valid' ? user : null)),
    getAccessToken: vi.fn(async () => 'fake-token'),
  };

  // Sends a request as the signed-in user unless another cookie is given.
  function generate(body: unknown, cookie = 'session=valid'): Promise<Response> {
    return fetch(`${baseUrl}/schedule/generate`, {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  // Google returns these events, in Pacific time.
  function calendarWith(items: object[] = []): void {
    listEvents.mockResolvedValue({ data: { timeZone: 'America/Los_Angeles', items } });
  }

  beforeEach(async () => {
    // Only fake the clock; real timers keep the test server working.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    listEvents.mockReset();
    authService.getAccessToken.mockReset();
    authService.getAccessToken.mockImplementation(async () => 'fake-token');

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
    vi.useRealTimers();
  });

  it('schedule-generate-1 places sessions in free time around calendar events', async () => {
    // Busy 9am to 10am Pacific on Monday.
    calendarWith([
      {
        summary: 'Lecture',
        start: { dateTime: '2026-11-16T09:00:00-08:00' },
        end: { dateTime: '2026-11-16T10:00:00-08:00' },
      },
    ]);

    const res = await generate({
      assignments: [{ id: 'essay', deadline: '2026-11-17T21:00:00-08:00', estimatedMinutes: 120 }],
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      timeZone: 'America/Los_Angeles',
      // 10:00 to 11:00am, a 10 minute break, then 11:10am to 12:10pm Pacific.
      sessions: [
        { assignmentId: 'essay', start: '2026-11-16T18:00:00.000Z', end: '2026-11-16T19:00:00.000Z', durationMinutes: 60 },
        { assignmentId: 'essay', start: '2026-11-16T19:10:00.000Z', end: '2026-11-16T20:10:00.000Z', durationMinutes: 60 },
      ],
      unplaced: [],
    });
    expect(JSON.stringify(body)).not.toMatch(/Lecture/);
  });

  it('schedule-generate-1 stops at the deadline and returns leftover work as unplaced', async () => {
    calendarWith();

    // Due noon Monday Pacific, but needs 10 hours.
    const res = await generate({
      assignments: [{ id: 'lab', deadline: '2026-11-16T12:00:00-08:00', estimatedMinutes: 600 }],
    });
    const body = await res.json();

    // 9am to noon only fits 160 minutes: 60 + 60 + 40.
    expect(body.sessions).toEqual([
      { assignmentId: 'lab', start: '2026-11-16T17:00:00.000Z', end: '2026-11-16T18:00:00.000Z', durationMinutes: 60 },
      { assignmentId: 'lab', start: '2026-11-16T18:10:00.000Z', end: '2026-11-16T19:10:00.000Z', durationMinutes: 60 },
      { assignmentId: 'lab', start: '2026-11-16T19:20:00.000Z', end: '2026-11-16T20:00:00.000Z', durationMinutes: 40 },
    ]);
    expect(body.unplaced).toEqual([{ assignmentId: 'lab', remainingMinutes: 440 }]);
  });

  it('schedule-generate-1 uses the default session length, daily limit, and breaks', async () => {
    calendarWith();

    // 10 hours due Wednesday 9pm Pacific.
    const res = await generate({
      assignments: [{ id: 'project', deadline: '2026-11-18T21:00:00-08:00', estimatedMinutes: 600 }],
    });
    const sessions: Session[] = (await res.json()).sessions;

    // 240 minutes Monday, 240 Tuesday, then the last 120 Wednesday.
    const minutesByDay: Record<string, number> = {};
    for (const session of sessions) {
      const pacificDay = new Date(Date.parse(session.start) - 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
      minutesByDay[pacificDay] = (minutesByDay[pacificDay] ?? 0) + session.durationMinutes;
    }
    expect(minutesByDay).toEqual({ '2026-11-16': 240, '2026-11-17': 240, '2026-11-18': 120 });

    // Every session is 30 to 60 minutes, with at least 10 minutes between them.
    for (const [index, session] of sessions.entries()) {
      expect(session.durationMinutes).toBeGreaterThanOrEqual(30);
      expect(session.durationMinutes).toBeLessThanOrEqual(60);
      if (index > 0) {
        const gap = Date.parse(session.start) - Date.parse(sessions[index - 1].end);
        expect(gap).toBeGreaterThanOrEqual(10 * 60 * 1000);
      }
    }
  });

  it('schedule-generate-1 never places sessions in the past', async () => {
    // 12:07:30pm Pacific, so the schedule starts at 12:15pm.
    vi.setSystemTime(new Date('2026-11-16T20:07:30Z'));
    calendarWith();

    const res = await generate({
      assignments: [{ id: 'quiz', deadline: '2026-11-16T23:00:00-08:00', estimatedMinutes: 60 }],
    });
    const body = await res.json();

    expect(body.sessions).toEqual([
      { assignmentId: 'quiz', start: '2026-11-16T20:15:00.000Z', end: '2026-11-16T21:15:00.000Z', durationMinutes: 60 },
    ]);
    // Only read the calendar from the schedule start.
    expect(listEvents).toHaveBeenCalledWith(expect.objectContaining({ timeMin: '2026-11-16T20:15:00.000Z' }));
  });

  it('schedule-generate-1 rejects an invalid assignments list with 400', async () => {
    calendarWith();
    const valid = { id: 'a', deadline: '2026-11-20T23:59:00-08:00', estimatedMinutes: 60 };
    const badBodies = [
      {},
      { assignments: [] },
      { assignments: 'essay' },
      { assignments: Array.from({ length: 51 }, (_, i) => ({ ...valid, id: `a${i}` })) },
      { assignments: [{ ...valid, id: '' }] },
      { assignments: [valid, valid] },
      { assignments: [{ ...valid, deadline: '2026-11-20T23:59:00' }] },
      { assignments: [{ ...valid, estimatedMinutes: 0 }] },
      { assignments: [{ ...valid, estimatedMinutes: 1.5 }] },
      { assignments: [{ ...valid, estimatedMinutes: '60' }] },
      // Every deadline already passed.
      { assignments: [{ ...valid, deadline: '2026-11-15T23:59:00-08:00' }] },
    ];

    for (const body of badBodies) {
      expect((await generate(body)).status, JSON.stringify(body).slice(0, 80)).toBe(400);
    }
    expect(listEvents).not.toHaveBeenCalled();
  });

  it('schedule-generate-1 returns 401 without a session or Google access, and 502 on a Google error', async () => {
    const body = { assignments: [{ id: 'a', deadline: '2026-11-20T23:59:00-08:00', estimatedMinutes: 60 }] };

    expect((await generate(body, '')).status).toBe(401);

    authService.getAccessToken.mockRejectedValueOnce(new UnauthorizedException('User has not granted Google access'));
    expect((await generate(body)).status).toBe(401);

    listEvents.mockRejectedValue(new Error('Google is down'));
    expect((await generate(body)).status).toBe(502);
  });
});

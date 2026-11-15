import type { calendar_v3 } from 'googleapis';
import { describe, expect, it } from 'vitest';
import { toBusyTimes } from './busy-times.js';

// Requested range: Monday 16 Nov 2026, 8am to 8pm Pacific (16:00Z to 04:00Z next day).
const from = new Date('2026-11-16T16:00:00Z');
const to = new Date('2026-11-17T04:00:00Z');

// A timed event shaped like Google's (with optional overrides)
function event(start: string, end: string, extra: calendar_v3.Schema$Event = {}): calendar_v3.Schema$Event {
  return { status: 'confirmed', start: { dateTime: start }, end: { dateTime: end }, ...extra };
}

describe('toBusyTimes', () => {
  it('calendar-busy-times-1 returns timed events as UTC busy times', () => {
    const busy = toBusyTimes([event('2026-11-16T09:00:00-08:00', '2026-11-16T10:00:00-08:00')], from, to);

    expect(busy).toEqual([{ start: '2026-11-16T17:00:00.000Z', end: '2026-11-16T18:00:00.000Z' }]);
  });

  it('calendar-busy-times-1 skips cancelled events', () => {
    const cancelled = event('2026-11-16T17:00:00Z', '2026-11-16T18:00:00Z', { status: 'cancelled' });

    expect(toBusyTimes([cancelled], from, to)).toEqual([]);
  });

  it('calendar-busy-times-1 skips events marked free', () => {
    const free = event('2026-11-16T17:00:00Z', '2026-11-16T18:00:00Z', { transparency: 'transparent' });

    expect(toBusyTimes([free], from, to)).toEqual([]);
  });

  it('calendar-busy-times-1 skips events the user declined', () => {
    const declined = event('2026-11-16T17:00:00Z', '2026-11-16T18:00:00Z', {
      attendees: [
        { email: 'organizer@example.com', responseStatus: 'accepted' },
        { email: 'student@example.com', self: true, responseStatus: 'declined' },
      ],
    });
    const accepted = event('2026-11-16T19:00:00Z', '2026-11-16T20:00:00Z', {
      attendees: [{ email: 'student@example.com', self: true, responseStatus: 'accepted' }],
    });

    expect(toBusyTimes([declined, accepted], from, to)).toEqual([
      { start: '2026-11-16T19:00:00.000Z', end: '2026-11-16T20:00:00.000Z' },
    ]);
  });

  it('calendar-busy-times-1 skips all-day events', () => {
    const allDay: calendar_v3.Schema$Event = {
      status: 'confirmed',
      start: { date: '2026-11-16' },
      end: { date: '2026-11-17' },
    };

    expect(toBusyTimes([allDay], from, to)).toEqual([]);
  });

  it('calendar-busy-times-1 trims busy times to the requested range', () => {
    const startsBefore = event('2026-11-16T15:00:00Z', '2026-11-16T17:00:00Z');
    const endsAfter = event('2026-11-17T03:00:00Z', '2026-11-17T06:00:00Z');
    const fullyOutside = event('2026-11-16T10:00:00Z', '2026-11-16T12:00:00Z');

    expect(toBusyTimes([startsBefore, endsAfter, fullyOutside], from, to)).toEqual([
      { start: '2026-11-16T16:00:00.000Z', end: '2026-11-16T17:00:00.000Z' },
      { start: '2026-11-17T03:00:00.000Z', end: '2026-11-17T04:00:00.000Z' },
    ]);
  });

  it('calendar-busy-times-1 merges overlapping and touching busy times', () => {
    const busy = toBusyTimes(
      [
        event('2026-11-16T17:00:00Z', '2026-11-16T18:00:00Z'),
        // Overlaps the first.
        event('2026-11-16T17:30:00Z', '2026-11-16T19:00:00Z'),
        // Starts exactly when the second ends.
        event('2026-11-16T19:00:00Z', '2026-11-16T20:00:00Z'),
        // Inside the merged block.
        event('2026-11-16T17:15:00Z', '2026-11-16T17:45:00Z'),
        // Separate block.
        event('2026-11-16T22:00:00Z', '2026-11-16T23:00:00Z'),
      ],
      from,
      to,
    );

    expect(busy).toEqual([
      { start: '2026-11-16T17:00:00.000Z', end: '2026-11-16T20:00:00.000Z' },
      { start: '2026-11-16T22:00:00.000Z', end: '2026-11-16T23:00:00.000Z' },
    ]);
  });

  it('calendar-busy-times-1 sorts busy times by start time', () => {
    const busy = toBusyTimes(
      [event('2026-11-16T22:00:00Z', '2026-11-16T23:00:00Z'), event('2026-11-16T17:00:00Z', '2026-11-16T18:00:00Z')],
      from,
      to,
    );

    expect(busy.map((block) => block.start)).toEqual(['2026-11-16T17:00:00.000Z', '2026-11-16T22:00:00.000Z']);
  });
});

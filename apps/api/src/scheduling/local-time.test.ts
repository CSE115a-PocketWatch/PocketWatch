import { describe, expect, it } from 'vitest';
import { addDays, localDateOf, localToUtc, weekdayOf } from './local-time.js';

const pacific = 'America/Los_Angeles';

describe('local-time', () => {
  it('free-slots-1 localDateOf gives the date in the time zone, not in UTC', () => {
    // 3am UTC on 17 Nov is still 7pm on 16 Nov in Pacific.
    const moment = new Date('2026-11-17T03:00:00Z');

    expect(localDateOf(moment, pacific)).toEqual({ year: 2026, month: 11, day: 16 });
    expect(localDateOf(moment, 'UTC')).toEqual({ year: 2026, month: 11, day: 17 });
    expect(localDateOf(moment, 'Asia/Tokyo')).toEqual({ year: 2026, month: 11, day: 17 });
  });

  it('free-slots-1 addDays rolls over month, year, and leap day ends', () => {
    expect(addDays({ year: 2026, month: 11, day: 30 }, 1)).toEqual({ year: 2026, month: 12, day: 1 });
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({ year: 2027, month: 1, day: 1 });
    expect(addDays({ year: 2028, month: 2, day: 28 }, 1)).toEqual({ year: 2028, month: 2, day: 29 });
    expect(addDays({ year: 2027, month: 2, day: 28 }, 1)).toEqual({ year: 2027, month: 3, day: 1 });
    expect(addDays({ year: 2026, month: 1, day: 1 }, -1)).toEqual({ year: 2025, month: 12, day: 31 });
  });

  it('free-slots-1 weekdayOf numbers days from Sunday = 0', () => {
    expect(weekdayOf({ year: 2026, month: 11, day: 15 })).toBe(0); // Sunday
    expect(weekdayOf({ year: 2026, month: 11, day: 16 })).toBe(1); // Monday
    expect(weekdayOf({ year: 2026, month: 11, day: 21 })).toBe(6); // Saturday
  });

  it('free-slots-1 localToUtc applies standard and daylight time offsets', () => {
    // PST, UTC-8.
    expect(localToUtc({ year: 2026, month: 11, day: 16 }, '16:00', pacific).toISOString()).toBe(
      '2026-11-17T00:00:00.000Z',
    );
    // PDT, UTC-7.
    expect(localToUtc({ year: 2026, month: 7, day: 1 }, '09:30', pacific).toISOString()).toBe(
      '2026-07-01T16:30:00.000Z',
    );
    // Positive offset, IST is UTC+5:30.
    expect(localToUtc({ year: 2026, month: 11, day: 16 }, '09:00', 'Asia/Kolkata').toISOString()).toBe(
      '2026-11-16T03:30:00.000Z',
    );
  });

  it('free-slots-1 localToUtc handles times either side of a daylight saving change', () => {
    // Clocks go forward at 2am on Sunday 14 Mar 2027.
    const springForward = { year: 2027, month: 3, day: 14 };
    expect(localToUtc(springForward, '01:00', pacific).toISOString()).toBe('2027-03-14T09:00:00.000Z');
    expect(localToUtc(springForward, '03:00', pacific).toISOString()).toBe('2027-03-14T10:00:00.000Z');

    // Clocks go back at 2am on Sunday 1 Nov 2026; 1:30am happens twice, the first (PDT) one is used.
    const fallBack = { year: 2026, month: 11, day: 1 };
    expect(localToUtc(fallBack, '01:30', pacific).toISOString()).toBe('2026-11-01T08:30:00.000Z');
    expect(localToUtc(fallBack, '03:00', pacific).toISOString()).toBe('2026-11-01T11:00:00.000Z');
  });

  it('free-slots-1 localToUtc and localDateOf agree on the same day', () => {
    const date = { year: 2026, month: 11, day: 16 };
    for (const time of ['00:00', '12:00', '23:59']) {
      expect(localDateOf(localToUtc(date, time, pacific), pacific)).toEqual(date);
    }
  });
});

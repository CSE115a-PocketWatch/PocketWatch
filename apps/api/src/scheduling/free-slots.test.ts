import { describe, expect, it } from 'vitest';
import { Availability, DEFAULT_AVAILABILITY } from './availability.js';
import { findFreeSlots } from './free-slots.js';

const pacific = 'America/Los_Angeles';

// Mondays 4pm to 9pm Pacific, 60 minute sessions.
const mondayEvenings: Availability = { availableDays: [1], startTime: '16:00', endTime: '21:00', sessionLengthMinutes: 60 };

// Monday 16 Nov 2026, midnight to midnight Pacific (PST is UTC-8).
const monday = { from: new Date('2026-11-16T08:00:00Z'), to: new Date('2026-11-17T08:00:00Z') };

describe('findFreeSlots', () => {
  it('free-slots-1 turns a chosen day into a UTC slot', () => {
    expect(findFreeSlots(mondayEvenings, [], monday.from, monday.to, pacific)).toEqual([
      { start: '2026-11-17T00:00:00.000Z', end: '2026-11-17T05:00:00.000Z' },
    ]);
  });

  it('free-slots-1 only returns slots on the chosen weekdays', () => {
    const monWed: Availability = { ...mondayEvenings, availableDays: [1, 3] };
    // Sunday 15 Nov to Sunday 22 Nov Pacific.
    const week = { from: new Date('2026-11-15T08:00:00Z'), to: new Date('2026-11-22T08:00:00Z') };

    expect(findFreeSlots(monWed, [], week.from, week.to, pacific)).toEqual([
      { start: '2026-11-17T00:00:00.000Z', end: '2026-11-17T05:00:00.000Z' },
      { start: '2026-11-19T00:00:00.000Z', end: '2026-11-19T05:00:00.000Z' },
    ]);
  });

  it('free-slots-1 converts local times correctly across a daylight saving change', () => {
    const mornings: Availability = { availableDays: [6, 7], startTime: '09:00', endTime: '10:00', sessionLengthMinutes: 60 };
    // Saturday 31 Oct (PDT, UTC-7) and Sunday 1 Nov 2026 (PST, UTC-8, clocks went back at 2am).
    const from = new Date('2026-10-31T07:00:00Z');
    const to = new Date('2026-11-02T08:00:00Z');

    expect(findFreeSlots(mornings, [], from, to, pacific)).toEqual([
      { start: '2026-10-31T16:00:00.000Z', end: '2026-10-31T17:00:00.000Z' },
      { start: '2026-11-01T17:00:00.000Z', end: '2026-11-01T18:00:00.000Z' },
    ]);
  });

  it('free-slots-1 splits a slot around a busy time inside it', () => {
    // Busy 6pm to 7pm Pacific.
    const busy = [{ start: '2026-11-17T02:00:00.000Z', end: '2026-11-17T03:00:00.000Z' }];

    expect(findFreeSlots(mondayEvenings, busy, monday.from, monday.to, pacific)).toEqual([
      { start: '2026-11-17T00:00:00.000Z', end: '2026-11-17T02:00:00.000Z' },
      { start: '2026-11-17T03:00:00.000Z', end: '2026-11-17T05:00:00.000Z' },
    ]);
  });

  it('free-slots-1 removes busy times that overlap the edges or cover the whole window', () => {
    const edges = [
      // 3pm to 5pm Pacific, overlapping the start.
      { start: '2026-11-16T23:00:00.000Z', end: '2026-11-17T01:00:00.000Z' },
      // 8pm to 10pm Pacific, overlapping the end.
      { start: '2026-11-17T04:00:00.000Z', end: '2026-11-17T06:00:00.000Z' },
    ];
    const allEvening = [{ start: '2026-11-16T22:00:00.000Z', end: '2026-11-17T06:00:00.000Z' }];

    expect(findFreeSlots(mondayEvenings, edges, monday.from, monday.to, pacific)).toEqual([
      { start: '2026-11-17T01:00:00.000Z', end: '2026-11-17T04:00:00.000Z' },
    ]);
    expect(findFreeSlots(mondayEvenings, allEvening, monday.from, monday.to, pacific)).toEqual([]);
  });

  it('free-slots-1 trims slots to the requested range', () => {
    // From 6pm to 8pm Pacific on Monday.
    const from = new Date('2026-11-17T02:00:00Z');
    const to = new Date('2026-11-17T04:00:00Z');

    expect(findFreeSlots(mondayEvenings, [], from, to, pacific)).toEqual([
      { start: '2026-11-17T02:00:00.000Z', end: '2026-11-17T04:00:00.000Z' },
    ]);
  });

  it('free-slots-1 drops slots shorter than the session length', () => {
    const busy = [
      // Leaves 4:00 to 4:30pm free: too short.
      { start: '2026-11-17T00:30:00.000Z', end: '2026-11-17T01:00:00.000Z' },
      // Leaves 5:00 to 6:00pm free: exactly one session, kept.
      { start: '2026-11-17T02:00:00.000Z', end: '2026-11-17T05:00:00.000Z' },
    ];

    expect(findFreeSlots(mondayEvenings, busy, monday.from, monday.to, pacific)).toEqual([
      { start: '2026-11-17T01:00:00.000Z', end: '2026-11-17T02:00:00.000Z' },
    ]);
  });

  it('free-slots-1 sorts slots by start time even when busy times are out of order', () => {
    const busy = [
      { start: '2026-11-17T03:00:00.000Z', end: '2026-11-17T04:00:00.000Z' },
      { start: '2026-11-17T01:00:00.000Z', end: '2026-11-17T02:00:00.000Z' },
    ];

    const slots = findFreeSlots(mondayEvenings, busy, monday.from, monday.to, pacific);

    expect(slots.map((slot) => slot.start)).toEqual([
      '2026-11-17T00:00:00.000Z',
      '2026-11-17T02:00:00.000Z',
      '2026-11-17T04:00:00.000Z',
    ]);
  });

  it('free-slots-1 returns no slots when the end time is not after the start time', () => {
    const backwards: Availability = { ...mondayEvenings, startTime: '21:00', endTime: '16:00' };

    expect(findFreeSlots(backwards, [], monday.from, monday.to, pacific)).toEqual([]);
  });

  it('free-slots-1 default availability is every day 9am to 9pm with 60 minute sessions', () => {
    // Saturday 21 Nov 2026 in UTC.
    const from = new Date('2026-11-21T00:00:00Z');
    const to = new Date('2026-11-22T00:00:00Z');

    expect(DEFAULT_AVAILABILITY).toEqual({
      availableDays: [1, 2, 3, 4, 5, 6, 7],
      startTime: '09:00',
      endTime: '21:00',
      sessionLengthMinutes: 60,
    });
    expect(findFreeSlots(DEFAULT_AVAILABILITY, [], from, to, 'UTC')).toEqual([
      { start: '2026-11-21T09:00:00.000Z', end: '2026-11-21T21:00:00.000Z' },
    ]);
  });
});

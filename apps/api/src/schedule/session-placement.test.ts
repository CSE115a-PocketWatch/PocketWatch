import { describe, expect, it } from 'vitest';
import {
  placeSessions,
  type PlacementAssignment,
  type PlacementPreferences,
  type PlacementSlot,
} from './session-placement.js';

// Small helpers keep the examples easier to read.
const assignment = (
  id = 'a1',
  estimatedMinutes = 90,
  deadline = '2030-01-10T18:00:00Z',
): PlacementAssignment => ({
  id,
  deadline,
  estimatedMinutes,
});

const slot = (start: string, end: string): PlacementSlot => ({
  start,
  end,
});

const prefs: PlacementPreferences = {
  minSessionMinutes: 30,
  maxSessionMinutes: 60,
  maxStudyMinutesPerDay: 180,
  breakMinutes: 10,
};

const morning = slot('2030-01-10T09:00:00Z', '2030-01-10T12:00:00Z');

describe('Study session placement', () => {
  it('session-placement-1 places sessions within slots and the deadline', () => {
    // The deadline cuts this slot short, so only 90 minutes can fit.
    const result = placeSessions(
      [assignment('a1', 90, '2030-01-10T10:30:00Z')],
      [morning],
      { ...prefs, breakMinutes: 0 },
      'UTC',
    );

    expect(result).toEqual({
      sessions: [
        {
          assignmentId: 'a1',
          start: '2030-01-10T09:00:00.000Z',
          end: '2030-01-10T10:00:00.000Z',
          durationMinutes: 60,
        },
        {
          assignmentId: 'a1',
          start: '2030-01-10T10:00:00.000Z',
          end: '2030-01-10T10:30:00.000Z',
          durationMinutes: 30,
        },
      ],
      unplaced: [],
    });
  });

  it('session-placement-1 respects session lengths without adding work', () => {
    const result = placeSessions([assignment('a1', 75)], [morning], prefs, 'UTC');

    // A 60-minute session leaves 15 minutes, below the strict minimum.
    expect(result.sessions.map((session) => session.durationMinutes)).toEqual([60]);
    expect(result.unplaced).toEqual([{ assignmentId: 'a1', remainingMinutes: 15 }]);
  });

  it('session-placement-1 shares the daily limit across assignments using local dates', () => {
    const result = placeSessions(
      [assignment('a1', 60, '2030-01-12T00:00:00Z'), assignment('a2', 60, '2030-01-12T00:00:00Z')],
      [
        // These have different UTC dates but the same Los Angeles date.
        slot('2030-01-10T23:00:00Z', '2030-01-11T00:00:00Z'),
        slot('2030-01-11T01:00:00Z', '2030-01-11T02:00:00Z'),
      ],
      { ...prefs, maxStudyMinutesPerDay: 60, breakMinutes: 0 },
      'America/Los_Angeles',
    );

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]?.assignmentId).toBe('a1');
    expect(result.unplaced).toEqual([{ assignmentId: 'a2', remainingMinutes: 60 }]);
  });

  it('session-placement-1 keeps breaks across slots and assignments', () => {
    const slots = [
      slot('2030-01-10T09:00:00Z', '2030-01-10T10:00:00Z'),
      slot('2030-01-10T10:05:00Z', '2030-01-10T12:00:00Z'),
    ];

    // Test both splitting one assignment and placing two assignments.
    for (const assignments of [
      [assignment('a1', 120)],
      [assignment('a1', 60), assignment('a2', 60)],
    ]) {
      const result = placeSessions(assignments, slots, prefs, 'UTC');

      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0]?.end).toBe('2030-01-10T10:00:00.000Z');
      expect(result.sessions[1]?.start).toBe('2030-01-10T10:10:00.000Z');
      expect(result.unplaced).toEqual([]);
    }
  });

  it('session-placement-1 orders deadlines and merges duplicate capacity', () => {
    const result = placeSessions(
      [
        assignment('later', 30, '2030-01-10T12:00:00Z'),
        assignment('first-tie', 30, '2030-01-10T11:00:00Z'),
        assignment('second-tie', 30, '2030-01-10T11:00:00Z'),
      ],
      [
        slot('2030-01-10T09:30:00Z', '2030-01-10T10:00:00Z'),
        slot('2030-01-10T09:00:00Z', '2030-01-10T09:45:00Z'),
        slot('2030-01-10T10:00:00Z', '2030-01-10T10:30:00Z'),
      ],
      { ...prefs, maxSessionMinutes: 30, breakMinutes: 0 },
      'UTC',
    );

    expect(result.sessions.map((session) => session.assignmentId)).toEqual([
      'first-tie',
      'second-tie',
      'later',
    ]);
    expect(result.sessions.map((session) => session.start)).toEqual([
      '2030-01-10T09:00:00.000Z',
      '2030-01-10T09:30:00.000Z',
      '2030-01-10T10:00:00.000Z',
    ]);
  });

  it('session-placement-1 reports exact leftover work when capacity runs out', () => {
    const result = placeSessions(
      [assignment('a1', 120)],
      [slot('2030-01-10T09:00:00Z', '2030-01-10T10:00:00Z')],
      prefs,
      'UTC',
    );

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]?.durationMinutes).toBe(60);
    expect(result.unplaced).toEqual([{ assignmentId: 'a1', remainingMinutes: 60 }]);

    // An assignment already past its deadline gets no sessions.
    const expired = placeSessions(
      [assignment('past', 30, '2030-01-09T12:00:00Z')],
      [morning],
      prefs,
      'UTC',
    );

    expect(expired.sessions).toEqual([]);
    expect(expired.unplaced).toEqual([{ assignmentId: 'past', remainingMinutes: 30 }]);
  });

  it('session-placement-1 handles empty assignments and slots', () => {
    expect(placeSessions([], [morning], prefs, 'UTC')).toEqual({
      sessions: [],
      unplaced: [],
    });

    expect(placeSessions([assignment('a1', 90)], [], prefs, 'UTC')).toEqual({
      sessions: [],
      unplaced: [{ assignmentId: 'a1', remainingMinutes: 90 }],
    });
  });

  it('session-placement-1 rejects invalid inputs with RangeError', () => {
    // Every function below supplies one invalid input.
    const invalidCalls = [
      () => placeSessions([assignment('a1', 0)], [morning], prefs, 'UTC'),
      () => placeSessions([assignment('a1', -1)], [morning], prefs, 'UTC'),
      () => placeSessions([assignment('a1', 1.5)], [morning], prefs, 'UTC'),
      () => placeSessions([assignment('a1', Infinity)], [morning], prefs, 'UTC'),
      () => placeSessions([assignment('a1', NaN)], [morning], prefs, 'UTC'),
      () => placeSessions([assignment('a1', 30, '2030-02-30T12:00:00Z')], [morning], prefs, 'UTC'),
      () => placeSessions([assignment('a1', 30, '2030-01-10T12:00:00')], [morning], prefs, 'UTC'),
      () => placeSessions([assignment(), assignment()], [morning], prefs, 'UTC'),
      () => placeSessions([assignment()], [slot(morning.end, morning.start)], prefs, 'UTC'),
      () => placeSessions([assignment()], [slot(morning.start, morning.start)], prefs, 'UTC'),
      () => placeSessions([assignment()], [slot('bad-date', morning.end)], prefs, 'UTC'),
      () =>
        placeSessions(
          [assignment()],
          [slot('2030-01-10T09:00:00+01:00', morning.end)],
          prefs,
          'UTC',
        ),
      () => placeSessions([assignment()], [morning], { ...prefs, minSessionMinutes: 90 }, 'UTC'),
      () => placeSessions([assignment()], [morning], { ...prefs, breakMinutes: -1 }, 'UTC'),
      () => placeSessions([assignment()], [morning], prefs, 'Invalid/Zone'),
    ];

    for (const call of invalidCalls) {
      expect(call).toThrow(RangeError);
    }

    // Check every numeric preference, not only the estimate.
    for (const field of [
      'minSessionMinutes',
      'maxSessionMinutes',
      'maxStudyMinutesPerDay',
      'breakMinutes',
    ] as const) {
      for (const value of [-1, 1.5, NaN, Infinity]) {
        expect(() =>
          placeSessions([assignment()], [morning], { ...prefs, [field]: value }, 'UTC'),
        ).toThrow(RangeError);
      }
    }
  });

  it('session-placement-1 is repeatable and leaves inputs unchanged', () => {
    const assignments = [assignment()];
    const slots = [{ ...morning }];
    const preferences = { ...prefs };
    const before = structuredClone({ assignments, slots, preferences });

    const first = placeSessions(assignments, slots, preferences, 'UTC');
    const second = placeSessions(assignments, slots, preferences, 'UTC');

    expect(first.sessions.length).toBeGreaterThan(0);
    expect(second).toEqual(first);
    expect({ assignments, slots, preferences }).toEqual(before);
  });

  it('session-placement-1 splits at local midnight across daylight saving days', () => {
    // Los Angeles midnight is 08:00Z before spring's change,
    // and 07:00Z before autumn's change.
    for (const [start, midnight, end] of [
      ['2030-03-10T07:30:00Z', '2030-03-10T08:00:00.000Z', '2030-03-10T12:00:00Z'],
      ['2030-11-03T06:30:00Z', '2030-11-03T07:00:00.000Z', '2030-11-03T12:00:00Z'],
    ]) {
      const result = placeSessions(
        [assignment('a1', 90, end)],
        [slot(start, end)],
        { ...prefs, maxStudyMinutesPerDay: 60, breakMinutes: 0 },
        'America/Los_Angeles',
      );

      expect(result.sessions.map((session) => session.durationMinutes)).toEqual([30, 60]);
      expect(result.sessions[0]?.end).toBe(midnight);
      expect(result.sessions[1]?.start).toBe(midnight);
      expect(result.unplaced).toEqual([]);
    }
  });
});

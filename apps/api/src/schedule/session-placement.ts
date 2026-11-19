// Assignment information we need in order to decide when to study.
export type PlacementAssignment = {
  id: string;
  deadline: string;
  estimatedMinutes: number;
};

// Available time, expressed in UTC.
export type PlacementSlot = {
  start: string;
  end: string;
};

// Study limits supplied by the caller.
export type PlacementPreferences = {
  minSessionMinutes: number;
  maxSessionMinutes: number;
  maxStudyMinutesPerDay: number;
  breakMinutes: number;
};

// One study session placed into the schedule.
export type PlacedSession = {
  assignmentId: string;
  start: string;
  end: string;
  durationMinutes: number;
};

// Work that couldn't fit within the available time and limits.
export type UnplacedAssignment = {
  assignmentId: string;
  remainingMinutes: number;
};

// The complete result returned to the scheduling code.
export type PlacementResult = {
  sessions: PlacedSession[];
  unplaced: UnplacedAssignment[];
};

// Check dates ourselves because Date.parse can normalize invalid dates,
// like February 30, instead of rejecting them.
function parseDateTime(value: string): number {
  if (typeof value !== 'string') {
    throw new RangeError('Date-time must be a string');
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/,
  );

  if (!match) {
    throw new RangeError('Use an ISO date-time with a time zone');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? 0);
  const zone = match[8]!;

  // February has an extra day in a leap year.
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1]! ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new RangeError('Invalid calendar date or time');
  }

  if (zone !== 'Z') {
    const offsetHour = Number(zone.slice(1, 3));
    const offsetMinute = Number(zone.slice(4, 6));

    if (offsetHour > 23 || offsetMinute > 59) {
      throw new RangeError('Invalid UTC offset');
    }
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    throw new RangeError('Invalid date-time');
  }

  return timestamp;
}

// Estimates and limits must be whole minutes we can safely calculate with.
function requireMinutes(value: number, field: string, allowZero = false): void {
  const minimum = allowZero ? 0 : 1;

  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${field} must be a whole number >= ${minimum}`);
  }
}

// Validate all inputs before we start placing any sessions.
function validateInputs(
  assignments: PlacementAssignment[],
  slots: PlacementSlot[],
  prefs: PlacementPreferences,
  timeZone: string,
): void {
  requireMinutes(prefs.minSessionMinutes, 'minSessionMinutes');
  requireMinutes(prefs.maxSessionMinutes, 'maxSessionMinutes');
  requireMinutes(prefs.maxStudyMinutesPerDay, 'maxStudyMinutesPerDay');
  requireMinutes(prefs.breakMinutes, 'breakMinutes', true);

  if (prefs.minSessionMinutes > prefs.maxSessionMinutes) {
    throw new RangeError('Minimum session length exceeds maximum');
  }

  // Intl checks whether this is a supported time zone.
  if (typeof timeZone !== 'string' || timeZone.trim() === '') {
    throw new RangeError('A time zone is required');
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date(0));
  } catch {
    throw new RangeError('Unsupported time zone');
  }

  const seenIds = new Set<string>();

  for (const assignment of assignments) {
    if (
      typeof assignment.id !== 'string' ||
      assignment.id.trim() === '' ||
      seenIds.has(assignment.id)
    ) {
      throw new RangeError('Assignment IDs must be non-empty and unique');
    }

    seenIds.add(assignment.id);
    parseDateTime(assignment.deadline);
    requireMinutes(assignment.estimatedMinutes, 'estimatedMinutes');
  }

  for (const slot of slots) {
    const start = parseDateTime(slot.start);
    const end = parseDateTime(slot.end);

    // Accept Z and explicit zero offsets as UTC.
    const utcSuffix = /(?:Z|[+-]00:00)$/;

    if (!utcSuffix.test(slot.start) || !utcSuffix.test(slot.end)) {
      throw new RangeError('Free slots must use UTC');
    }

    if (end <= start) {
      throw new RangeError('Free slots must end after they start');
    }
  }
}

const MINUTE_MS = 60_000;

// Convert the UTC timestamp into the student's local calendar date.
// Daily limits follow this date, not the server's date.
function localDateKey(timestamp: number, formatter: Intl.DateTimeFormat): string {
  const parts = formatter.formatToParts(new Date(timestamp));
  const get = (type: string) => parts.find((part) => part.type === type)!.value;

  return `${get('year')}-${get('month')}-${get('day')}`;
}

// Find the next local date boundary without assuming every day is 24 hours.
// That matters when daylight saving time changes.
function nextDayBoundary(start: number, limit: number, formatter: Intl.DateTimeFormat): number {
  const date = localDateKey(start, formatter);
  let left = start;

  while (left < limit) {
    const right = Math.min(left + 60 * MINUTE_MS, limit);

    if (localDateKey(right, formatter) !== date) {
      let low = left;
      let high = right;

      // Find the exact millisecond when the local date changes.
      while (high - low > 1) {
        const middle = low + Math.floor((high - low) / 2);

        if (localDateKey(middle, formatter) === date) {
          low = middle;
        } else {
          high = middle;
        }
      }

      return high;
    }

    left = right;
  }

  return limit;
}

type TimeWindow = {
  start: number;
  end: number;
};

// Merge slots so overlapping inputs don't give us duplicate study time.
function mergeSlots(slots: PlacementSlot[]): TimeWindow[] {
  const sorted = slots
    .map((slot) => ({
      start: parseDateTime(slot.start),
      end: parseDateTime(slot.end),
    }))
    .sort((a, b) => a.start - b.start);

  const merged: TimeWindow[] = [];

  for (const slot of sorted) {
    const previous = merged[merged.length - 1];

    if (previous && slot.start <= previous.end) {
      previous.end = Math.max(previous.end, slot.end);
    } else {
      merged.push({ ...slot });
    }
  }

  return merged;
}

// Remove already placed sessions and their required breaks.
// This also protects sessions belonging to other assignments.
function remainingWindows(
  slots: TimeWindow[],
  sessions: PlacedSession[],
  breakMinutes: number,
): TimeWindow[] {
  let windows = slots.map((slot) => ({ ...slot }));
  const breakMs = breakMinutes * MINUTE_MS;

  for (const session of sessions) {
    const blockedStart = Date.parse(session.start) - breakMs;
    const blockedEnd = Date.parse(session.end) + breakMs;

    windows = windows.flatMap((window) => {
      if (blockedEnd <= window.start || blockedStart >= window.end) {
        return [window];
      }

      const pieces: TimeWindow[] = [];

      if (blockedStart > window.start) {
        pieces.push({ start: window.start, end: blockedStart });
      }

      if (blockedEnd < window.end) {
        pieces.push({ start: blockedEnd, end: window.end });
      }

      return pieces;
    });
  }

  return windows;
}

export function placeSessions(
  assignments: PlacementAssignment[],
  slots: PlacementSlot[],
  prefs: PlacementPreferences,
  timeZone: string,
): PlacementResult {
  validateInputs(assignments, slots, prefs, timeZone);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const sessions: PlacedSession[] = [];
  const unplaced: UnplacedAssignment[] = [];
  const studyMinutesByDay = new Map<string, number>();
  const mergedSlots = mergeSlots(slots);

  // Copy before sorting so the caller's assignment list stays unchanged.
  const orderedAssignments = assignments
    .map((assignment, index) => ({
      ...assignment,
      index,
      deadlineMs: parseDateTime(assignment.deadline),
    }))
    .sort((a, b) => a.deadlineMs - b.deadlineMs || a.index - b.index);

  for (const assignment of orderedAssignments) {
    let remaining = assignment.estimatedMinutes;

    // Carry the break forward even when we move into another free slot.
    let nextAllowedStart = Number.NEGATIVE_INFINITY;

    const windows = remainingWindows(mergedSlots, sessions, prefs.breakMinutes);

    for (const window of windows) {
      if (remaining < prefs.minSessionMinutes) {
        break;
      }

      let cursor = Math.max(window.start, nextAllowedStart);
      const windowEnd = Math.min(window.end, assignment.deadlineMs);

      while (cursor < windowEnd && remaining >= prefs.minSessionMinutes) {
        const day = localDateKey(cursor, formatter);
        const dayEnd = nextDayBoundary(cursor, windowEnd, formatter);
        const usedMinutes = studyMinutesByDay.get(day) ?? 0;
        const dailyRemaining = prefs.maxStudyMinutesPerDay - usedMinutes;

        // A session must fit the slot, deadline, local day, and daily cap.
        const availableMinutes = Math.floor((dayEnd - cursor) / MINUTE_MS);

        const durationMinutes = Math.min(
          remaining,
          prefs.maxSessionMinutes,
          dailyRemaining,
          availableMinutes,
        );

        if (durationMinutes < prefs.minSessionMinutes) {
          // This part of the day cannot hold another valid session.
          cursor = dayEnd;
          continue;
        }

        const end = cursor + durationMinutes * MINUTE_MS;

        sessions.push({
          assignmentId: assignment.id,
          start: new Date(cursor).toISOString(),
          end: new Date(end).toISOString(),
          durationMinutes,
        });

        remaining -= durationMinutes;
        studyMinutesByDay.set(day, usedMinutes + durationMinutes);

        // The next generated session must leave room for a break.
        nextAllowedStart = end + prefs.breakMinutes * MINUTE_MS;
        cursor = nextAllowedStart;
      }
    }

    if (remaining > 0) {
      unplaced.push({
        assignmentId: assignment.id,
        remainingMinutes: remaining,
      });
    }
  }

  sessions.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  return { sessions, unplaced };
}

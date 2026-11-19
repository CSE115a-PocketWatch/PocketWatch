import type { Availability } from './availability.js';
import { addDays, localDateOf, localToUtc, weekdayOf } from './local-time.js';

// A block of time as UTC ISO strings. Same shape as a busy time from Google Calendar.
export type TimeSlot = { start: string; end: string };

type Block = { start: number; end: number };

// Removes busy blocks from one window and returns the free pieces left over.
function subtract(window: Block, busy: Block[]): Block[] {
  const free: Block[] = [];
  let cursor = window.start;
  for (const block of busy) {
    if (block.end <= cursor) {
      continue;
    }
    if (block.start >= window.end) {
      break;
    }
    if (block.start > cursor) {
      free.push({ start: cursor, end: block.start });
    }
    cursor = Math.max(cursor, block.end);
  }
  if (cursor < window.end) {
    free.push({ start: cursor, end: window.end });
  }
  return free;
}

// Finds when the student is free to study inside [from, to]: their available days and hours
// (in the calendar's time zone) minus busy times, keeping only slots at least one session long.
export function findFreeSlots(
  availability: Availability,
  busy: TimeSlot[],
  from: Date,
  to: Date,
  timeZone: string,
): TimeSlot[] {
  // Overnight availability out of scope, so there are no slots.
  if (availability.endTime <= availability.startTime) {
    return [];
  }

  const busyBlocks = busy
    .map((slot) => ({ start: Date.parse(slot.start), end: Date.parse(slot.end) }))
    .sort((a, b) => a.start - b.start);
  const minLength = availability.sessionLengthMinutes * 60 * 1000;
  const slots: Block[] = [];

  // Every local day that touches the range, starting a day early in case of time zone edges.
  const lastDay = localDateOf(to, timeZone);
  for (let day = addDays(localDateOf(from, timeZone), -1); ; day = addDays(day, 1)) {
    if (availability.availableDays.includes(weekdayOf(day))) {
      // The day's window, trimmed to the requested range.
      const start = Math.max(localToUtc(day, availability.startTime, timeZone).getTime(), from.getTime());
      const end = Math.min(localToUtc(day, availability.endTime, timeZone).getTime(), to.getTime());
      if (end > start) {
        slots.push(...subtract({ start, end }, busyBlocks));
      }
    }
    if (day.year === lastDay.year && day.month === lastDay.month && day.day === lastDay.day) {
      break;
    }
  }

  return slots
    .filter((slot) => slot.end - slot.start >= minLength)
    .sort((a, b) => a.start - b.start)
    .map((slot) => ({ start: new Date(slot.start).toISOString(), end: new Date(slot.end).toISOString() }));
}

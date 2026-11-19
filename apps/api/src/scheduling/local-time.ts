// Converts between UTC and a time zone's local wall-clock time using built-in Intl.

export type LocalDate = { year: number; month: number; day: number };

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

// The local date and time at this moment in the time zone, as if it were UTC.
function localAsUtcMs(moment: Date, timeZone: string): number {
  const parts: Record<string, number> = {};
  for (const part of formatterFor(timeZone).formatToParts(moment)) {
    if (part.type !== 'literal') {
      parts[part.type] = Number(part.value);
    }
  }
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

// How far the time zone is ahead of UTC at this moment, e.g. -8 hours for Pacific in winter.
function offsetMs(moment: Date, timeZone: string): number {
  const wholeSeconds = Math.floor(moment.getTime() / 1000) * 1000;
  return localAsUtcMs(new Date(wholeSeconds), timeZone) - wholeSeconds;
}

// The calendar date in the time zone at this moment.
export function localDateOf(moment: Date, timeZone: string): LocalDate {
  const local = new Date(localAsUtcMs(moment, timeZone));
  return { year: local.getUTCFullYear(), month: local.getUTCMonth() + 1, day: local.getUTCDate() };
}

// The date a number of days after this one (handles month and year ends).
export function addDays(date: LocalDate, days: number): LocalDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
}

// 1 = Monday ... 7 = Sunday, matching saved study preferences.
export function weekdayOf(date: LocalDate): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() || 7;
}

// The exact moment of a local date and 'HH:MM' time in the time zone.
export function localToUtc(date: LocalDate, time: string, timeZone: string): Date {
  const [hour, minute] = time.split(':').map(Number);
  const wallClock = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  // Guess with the offset at the wall-clock time, then check with the offset at the guess.
  // The second check is what gets daylight saving days right.
  const guess = wallClock - offsetMs(new Date(wallClock), timeZone);
  return new Date(wallClock - offsetMs(new Date(guess), timeZone));
}

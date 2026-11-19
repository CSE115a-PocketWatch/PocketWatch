import type { calendar_v3 } from 'googleapis';

// A block of time the student is already busy, as UTC ISO strings.
export type BusyTime = { start: string; end: string };

// True if the signed-in user declined this event.
function declinedByUser(event: calendar_v3.Schema$Event): boolean {
  return event.attendees?.some((attendee) => attendee.self && attendee.responseStatus === 'declined') ?? false;
}

// Turns Google Calendar events into sorted, merged busy times inside [from, to].
export function toBusyTimes(events: calendar_v3.Schema$Event[], from: Date, to: Date): BusyTime[] {
  const blocks: { start: number; end: number }[] = [];

  for (const event of events) {
    // These don't actually take up the student's time.
    if (event.status === 'cancelled' || event.transparency === 'transparent' || declinedByUser(event)) {
      continue;
    }
    // All-day events only have start.date (no time), so we are skipping them as busy times. 
    if (!event.start?.dateTime || !event.end?.dateTime) {
      continue;
    }

    // Trim within requested range and drop anything left without a length.
    const start = Math.max(new Date(event.start.dateTime).getTime(), from.getTime());
    const end = Math.min(new Date(event.end.dateTime).getTime(), to.getTime());
    if (end > start) {
      blocks.push({ start, end });
    }
  }

  // Sort by start, then merge blocks that overlap or touch (back to back events and includes invites not accepted).
  blocks.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const block of blocks) {
    const last = merged.at(-1);
    if (last && block.start <= last.end) {
      last.end = Math.max(last.end, block.end);
    } else {
      merged.push({ ...block });
    }
  }

  return merged.map((block) => ({
    start: new Date(block.start).toISOString(),
    end: new Date(block.end).toISOString(),
  }));
}

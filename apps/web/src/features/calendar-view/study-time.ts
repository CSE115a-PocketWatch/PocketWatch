// Converts minutes to hours, rounded to 1 decimal place.
// Examples: 360 -> 6, 90 -> 1.5, 100 -> 1.7
export function toHours(minutes: number): number {
  const hours = Math.round((minutes / 60) * 10) / 10;

  // Don't show a tiny amount (like 1 minute) as 0 hours.
  if (minutes > 0 && hours === 0) {
    return 0.1;
  }

  return hours;
}

// Builds the text after "Study time:", e.g. "0 of 6 hours" or "0 of 1 hour".
export function formatStudyTime(completedMinutes: number, estimatedMinutes: number): string {
  const done = toHours(completedMinutes);
  const total = toHours(estimatedMinutes);
  const unit = total === 1 ? 'hour' : 'hours';

  return `${done} of ${total} ${unit}`;
}

// An assignment is overdue if its deadline is earlier than right now.
export function isOverdue(deadline: string, now: Date): boolean {
  return new Date(deadline) < now;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_IN_WEEK = 7;

// Monday (local time) of the week that contains `date`.
export function getWeekStart(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (start.getDay() + 6) % DAYS_IN_WEEK;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

// "November 16-22, 2026", "November 30 - December 6, 2026",
// or "December 28, 2026 - January 3, 2027".
export function formatWeekRange(date: Date): string {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + DAYS_IN_WEEK - 1);

  const startMonth = MONTH_NAMES[start.getMonth()];
  const endMonth = MONTH_NAMES[end.getMonth()];

  if (start.getFullYear() !== end.getFullYear()) {
    return `${startMonth} ${start.getDate()}, ${start.getFullYear()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${startMonth} ${start.getDate()}-${end.getDate()}, ${end.getFullYear()}`;
}

// 0 -> "12 AM", 13 -> "1 PM".
export function formatHourLabel(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const hourOnClock = hour % 12 === 0 ? 12 : hour % 12;
  return `${hourOnClock} ${period}`;
}

const dueDateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDueDate(deadline: string): string {
  return dueDateFormat.format(new Date(deadline));
}

// When a student is willing to study, matching the study preferences form:
// the chosen weekdays, one start and end time in their local time, and the session length.
export type Availability = {
  // 0 = Sunday ... 6 = Saturday.
  days: number[];
  // 'HH:MM' in the student's local time. end must be after start.
  start: string;
  end: string;
  sessionMinutes: number;
};

// Used until saved study preferences exist: every day 09:00 to 21:00 with 60 minute sessions.
export const DEFAULT_AVAILABILITY: Availability = {
  days: [0, 1, 2, 3, 4, 5, 6],
  start: '09:00',
  end: '21:00',
  sessionMinutes: 60,
};

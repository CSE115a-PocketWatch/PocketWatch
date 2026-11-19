// When a student is willing to study. Uses the same field names and day numbers as saved
// StudentPreferences, so saved preferences can be passed straight in.
export type Availability = {
  // 1 = Monday ... 7 = Sunday.
  availableDays: number[];
  // 'HH:MM' in the student's local time. endTime must be after startTime.
  startTime: string;
  endTime: string;
  sessionLengthMinutes: number;
};

// Used until saved study preferences exist: every day 09:00 to 21:00 with 60 minute sessions.
export const DEFAULT_AVAILABILITY: Availability = {
  availableDays: [1, 2, 3, 4, 5, 6, 7],
  startTime: '09:00',
  endTime: '21:00',
  sessionLengthMinutes: 60,
};


export const WEEKDAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tues', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thurs', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 7 },
] as const;

export interface StudentPreferences {
  dailyStudyLimitMinutes: number;
  sessionLengthMinutes: number;
  availableDays: number[];
  startTime: string;
  endTime: string;
}

export const DEFAULT_PREFERENCES: StudentPreferences = {
  dailyStudyLimitMinutes: 240,
  sessionLengthMinutes: 60,
  availableDays: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '21:00',
};


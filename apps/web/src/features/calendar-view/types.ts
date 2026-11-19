// Same shape as SchedulingAssignment in packages/contracts, so this can be
// sent to the backend once assignment saving is built.
export interface NewAssignment {
  title: string;
  deadline: string;
  estimatedMinutes: number;
}

export interface UpcomingAssignment extends NewAssignment {
  id: number;
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const HOURS_IN_DAY = 24;

export type Assignment = {
  id: string;
  title: string;

  // ISO date-time including a UTC offset or Z.
  deadline: string;

  // Total estimated work required.
  estimatedMinutes: number;
};

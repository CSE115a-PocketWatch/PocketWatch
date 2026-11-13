import { z } from 'zod';

// Check actual assignment data before the scheduler uses it.
export const SchedulingAssignmentSchema = z.object({
  // Remove surrounding spaces and reject blank titles.
  title: z.string().trim().min(1, 'Title is required'),

  // Require a real ISO date-time with Z or a UTC offset.
  deadline: z.iso.datetime({
    offset: true,
    error: 'Deadline must be a valid date-time with a time zone',
  }),

  // Require whole minutes greater than zero; do not convert strings.
  estimatedMinutes: z
    .number()
    .int('Time estimate must be whole minutes')
    .positive('Time estimate must be greater than zero'),
});

// Derive the TypeScript type from the runtime rules.
export type SchedulingAssignment = z.infer<typeof SchedulingAssignmentSchema>;

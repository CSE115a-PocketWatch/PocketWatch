import type { z } from 'zod';
import { AssignmentSchema } from './assignment.js';

// The scheduler only needs these three fields.
// Reuse the same rules as the assignment API so they can't drift apart.
export const SchedulingAssignmentSchema = AssignmentSchema.pick({
  title: true,
  deadline: true,
  estimatedMinutes: true,
});

export type SchedulingAssignment = z.infer<typeof SchedulingAssignmentSchema>;
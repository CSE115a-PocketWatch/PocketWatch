import { z } from 'zod';

// Allowed values for priority and status.
export const AssignmentPriority = z.enum(['low', 'medium', 'high']);
export const AssignmentStatus = z.enum(['todo', 'in_progress', 'done']);

// Fields the user fills in on the add/edit form.
const assignmentFields = {
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  description: z.string().trim().max(2000, 'Description must be 2000 characters or fewer').nullable(),
  // ISO date-time with a timezone, e.g. "2026-11-20T23:59:00-08:00" or "...Z"
  deadline: z.iso.datetime({ offset: true, error: 'Deadline must be a valid date and time' }),
  // Total time the work will take, in minutes (the scheduler needs a number).
  estimatedMinutes: z
    .number()
    .int('Time estimate must be whole minutes')
    .min(1, 'Time estimate must be at least 1 minute')
    .max(10_000, 'Time estimate is too large'),
  priority: AssignmentPriority,
};

// A full assignment, as the backend sends it back (list page, edit page).
export const AssignmentSchema = z.object({
  id: z.string(),
  ...assignmentFields,
  status: AssignmentStatus,
});

// Body for POST /assignments. The server sets id and userId; status starts as "todo".
export const CreateAssignmentSchema = z.object({
  ...assignmentFields,
  description: assignmentFields.description.optional(),
  priority: AssignmentPriority.default('medium'),
});

// Body for PATCH /assignments/:id. Every field is optional; send only what changed.
export const UpdateAssignmentSchema = z
  .object({ ...assignmentFields, status: AssignmentStatus })
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update');

export type AssignmentPriority = z.infer<typeof AssignmentPriority>;
export type AssignmentStatus = z.infer<typeof AssignmentStatus>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type CreateAssignment = z.input<typeof CreateAssignmentSchema>;
export type UpdateAssignment = z.infer<typeof UpdateAssignmentSchema>;
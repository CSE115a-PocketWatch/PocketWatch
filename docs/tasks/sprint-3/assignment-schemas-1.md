---
id: assignment-schemas-1
story: 2.2
sprint: 3
assignee: prithika-venkatesh
estimate_hours: 4
---

# Define assignment schemas and add the Assignment table

## Description

Serves story 2.2 by defining what an assignment is, so students can
create, view, edit, and delete assignments with deadlines and time
estimates.

Includes shared Zod schemas, inferred TypeScript types, public exports,
automated tests, a Prisma Assignment model, and its migration. API
endpoints, frontend pages, and scheduling logic are out of scope.

## Specs

- Define AssignmentSchema, CreateAssignmentSchema, and
  UpdateAssignmentSchema in packages/contracts/src/assignment.ts using Zod.
- Define AssignmentPriority (low, medium, high) and AssignmentStatus
  (todo, in_progress, done) enums.
- Export all schemas and inferred types through
  packages/contracts/src/index.ts.
- Require title to be a trimmed, non-empty string of at most 200 characters.
- Allow description to be a trimmed string of at most 2000 characters,
  or null.
- Require deadline to be a valid ISO date-time with Z or a UTC offset.
- Require estimatedMinutes to be a whole number from 1 to 10,000.
- CreateAssignmentSchema: description optional, priority defaults to medium,
  and client-sent id and userId are ignored.
- UpdateAssignmentSchema: every field optional, but at least one required.
- Add an Assignment model to apps/api/prisma/schema.prisma linked to User
  (onDelete: Cascade), with priority defaulting to medium, status defaulting
  to todo, timestamps, and an index on (userId, deadline).
- Add the add_assignment migration.
- Reuse AssignmentSchema rules in SchedulingAssignmentSchema via .pick() so
  validation rules are defined in one place.
- Add tests in packages/contracts/src/assignment.test.ts.

## Requirements

- Use Zod for runtime validation and Prisma for the database model.
- Keep schemas independent of NestJS, React, and database access.
- Store deadlines in UTC.
- Do not change authentication or existing API routes.
- Preserve existing exports in the contracts entry point.
- Existing contracts and backend tests, typecheck, and build must
  continue to pass.

## Acceptance criteria

1. A valid assignment is accepted by CreateAssignmentSchema.
2. Priority defaults to medium when omitted.
3. Empty and whitespace-only titles are rejected.
4. Zero, negative, and fractional time estimates are rejected.
5. Deadlines that are not ISO date-times are rejected.
6. Unknown priority values are rejected.
7. A client-sent userId is absent from the parsed output.
8. UpdateAssignmentSchema accepts a single changed field and rejects an
   empty update.
9. AssignmentSchema requires id and status.
10. The add_assignment migration applies cleanly and the Assignment table
    is linked to User.
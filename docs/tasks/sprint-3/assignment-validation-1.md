---
id: assignment-validation-1
story: 3.2
sprint: 3
assignee: jenitasj
estimate_hours: 3
---

# Validate assignment inputs for study-plan generation

## Description

Serves story 3.2 by validating assignment data before it is used by
the study-plan scheduler.

Includes a reusable runtime schema, inferred TypeScript type, public
exports, and automated tests. Scheduling algorithms, API endpoints,
database storage, priorities, and progress tracking are out of scope.

## Specs

- Define SchedulingAssignmentSchema in
  packages/contracts/src/scheduling-assignment.ts using Zod.
- Export the schema and its inferred SchedulingAssignment type through
  packages/contracts/src/index.ts.
- Accept objects containing title, deadline, and estimatedMinutes.
- Require title to be a string; trim surrounding whitespace and reject
  an empty result.
- Require deadline to be a valid ISO date-time string containing Z
  or an explicit UTC offset.
- Accept correctly formatted past deadlines; checking scheduling
  feasibility is outside this validator.
- Require estimatedMinutes to be a finite, positive integer.
- Do not coerce numeric strings into numbers.
- Strip unrecognized fields from the parsed result.
- Use safeParse to return success with parsed data, or failure with
  validation issues identifying the invalid field.
- Add tests in packages/contracts/src/scheduling-assignment.test.ts.
- Prefix every test name with "assignment-validation-1 ".
- Configure contracts test and typecheck scripts, runnable through
  pnpm --filter @pocket-watch/contracts test and
  pnpm --filter @pocket-watch/contracts typecheck.

## Requirements

- Use Zod for runtime validation.
- Keep validation independent of NestJS, React, and database access.
- Do not add or require a priority field.
- Do not change authentication, database models, or existing API routes.
- Preserve existing exports in the contracts entry point.
- Existing backend tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. A valid object is accepted and available through the public schema export.
2. Surrounding title whitespace is removed; empty and whitespace-only
   titles are rejected.
3. Valid deadlines using Z or an explicit UTC offset are accepted,
   including correctly formatted past dates.
4. Invalid calendar dates, malformed deadlines, and date-times without
   a time zone are rejected.
5. Positive whole-number estimates are accepted; zero, negative,
   fractional, non-finite, and string estimates are rejected.
6. Missing required fields and incorrect field types are rejected.
7. Invalid input returns validation issues identifying the affected field.
8. Unrecognized fields, including priority, are absent from parsed output.

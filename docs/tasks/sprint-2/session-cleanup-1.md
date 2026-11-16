---
id: session-cleanup-1
story: 1.1
sprint: 2
assignee: jenitasj
estimate_hours: 3
---

# Automatically remove expired PocketWatch sessions

## Description

Serves story 1.1 by removing expired session records automatically.
Valid sessions must remain usable.

Includes a backend cleanup service, nightly scheduling, and automated
tests. Frontend changes, database schema changes, Google token changes,
and cleanup while the backend is stopped are out of scope.

## Specs

- Create apps/api/src/auth/session-cleanup.service.ts.
- Define SessionCleanupService.deleteExpiredSessions(now = new Date()).
- Delete Session records whose expiresAt is less than or equal to now.
- Return the number of deleted records.
- Define a scheduled handleNightlyCleanup() method that calls
  deleteExpiredSessions().
- Register a named job, expired-session-cleanup, that runs daily at
  midnight UTC using @nestjs/schedule.
- Initialize scheduling once in apps/api/src/app.module.ts.
- Register SessionCleanupService in apps/api/src/auth/auth.module.ts.
- Use PrismaService for database access.
- Add tests in apps/api/tests/session-cleanup.test.mjs using Node's
  built-in test runner against compiled backend code.
- Test the real cleanup service with an isolated in-memory Prisma
  substitute and verify job registration through SchedulerRegistry.
- Run tests through the existing backend test command.
- Prefix every new test name with "session-cleanup-1 ".

## Requirements

- Preserve existing authentication and logout behavior.
- Do not delete sessions that expire after the cleanup time.
- Use one captured cutoff time per cleanup operation.
- Do not add a public cleanup endpoint.
- Do not log session IDs, credentials, or tokens.
- Add @nestjs/schedule as the scheduling dependency.
- The job runs only while the backend process is running.
- Existing backend tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. Cleanup deletes sessions expiring before the cutoff time.
2. Cleanup deletes sessions expiring exactly at the cutoff time.
3. Cleanup preserves sessions expiring after the cutoff time.
4. Cleanup returns the correct number of deleted records, including
   zero when no sessions are expired.
5. Repeating cleanup with the same cutoff succeeds and returns zero
   after the expired sessions have already been removed.
6. Omitting the cutoff uses the current time to determine expiration.
7. The nightly handler invokes cleanup.
8. The expired-session-cleanup job is registered with a daily
   midnight UTC schedule.

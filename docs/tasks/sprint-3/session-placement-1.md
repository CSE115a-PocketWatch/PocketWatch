---
id: session-placement-1
story: 3.2
sprint: 3
assignee: jenitasj
estimate_hours: 5
---

# Place assignment study sessions into free time slots

## Description

Serves story 3.2 by splitting assignment work into study sessions
that fit the student's free time and study limits.

Includes a reusable placement function, placement input/output types,
and automated tests. Finding free slots, loading saved preferences,
API routes, database storage, editing schedules, and Google Calendar
publishing are out of scope.

## Specs

- Add placeSessions(assignments, slots, prefs, timeZone) in
  apps/api/src/schedule/session-placement.ts.
- Define and export its input/output types from the same file.
- Each assignment contains a unique id, deadline as an ISO date-time
  with a time zone, and estimatedMinutes as a positive whole number.
- Each free slot contains start and end as UTC ISO date-time strings.
  Slots represent available time with existing commitments removed.
- Preferences contain minSessionMinutes, maxSessionMinutes,
  maxStudyMinutesPerDay, and breakMinutes.
- Session lengths and the daily limit must be positive whole minutes;
  minSessionMinutes must not exceed maxSessionMinutes.
  breakMinutes must be a non-negative whole number.
- Invalid dates, reversed or empty slots, invalid numeric inputs,
  duplicate assignment IDs, and unsupported time zones throw RangeError.
- Process assignments by earliest deadline, preserving input order
  when deadlines are equal.
- Sort and merge overlapping or touching free slots before placement.
- Place sessions at the earliest available times within the supplied slots.
  The caller is responsible for excluding past time from those slots.
- Each returned session contains assignmentId, start, end,
  and durationMinutes. Return start/end in UTC and sort sessions by start.
- Sessions must not overlap, cross the assignment deadline, or cross
  midnight in the supplied time zone. Ending exactly at a boundary is allowed.
- Session lengths must be within the minimum and maximum preferences.
  Never schedule more minutes than the assignment requires.
- Count study minutes across all generated assignments toward the
  daily limit, using calendar dates in the supplied time zone.
  Breaks do not count as study time.
- Leave at least breakMinutes between consecutive generated sessions,
  including sessions for different assignments or in different slots.
- Keep sessions already placed when an assignment cannot fully fit.
  Return one unplaced entry with assignmentId and remainingMinutes.
- A remaining amount below the minimum session length is reported
  as unplaced; do not lengthen the assignment or create a shorter session.
- Return sessions and unplaced arrays. Empty assignments return both empty;
  empty slots report every assignment's full estimate as unplaced.
- Results must be deterministic and must not mutate input arrays or objects.
- Add apps/api/src/schedule/session-placement.test.ts.
  Prefix every test name with "session-placement-1 ".
- Tests run through pnpm --filter @pocket-watch/api test.

## Requirements

- Keep the placement function independent of NestJS, database access,
  Google APIs, and network requests.
- Add no runtime dependencies.
- Use the supplied time zone for daily limits rather than the server's
  local time zone.
- Accept free slots shaped as UTC start/end pairs, compatible with
  the free-slots task.
- Treat the supplied slots as the complete available capacity.
  Subtracting existing study usage from the daily limit is out of scope.
- Do not change authentication, database models, or existing API routes.
- Existing backend tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. A valid assignment is split into sessions within supplied free slots,
   with no overlaps or work beyond its deadline.
2. Every session respects minimum/maximum lengths, and scheduled minutes
   never exceed the assignment estimate.
3. Generated study time across assignments does not exceed the daily limit
   for any local calendar date, including when UTC and local dates differ.
4. Consecutive generated sessions have the required break, including
   across assignment and slot boundaries.
5. Assignments are processed by earliest deadline with stable tie ordering;
   unsorted, overlapping, or touching slots do not create duplicate capacity.
6. Insufficient capacity returns the exact remaining minutes while
   preserving valid sessions already placed, including remainders below
   the minimum session length.
7. Empty assignment and slot inputs produce the documented empty or
   fully unplaced results.
8. Invalid inputs throw RangeError as specified.
9. Repeated calls with identical inputs return identical results and
   leave inputs unchanged.
10. Sessions remain within one local calendar day, including across
    daylight saving changes.

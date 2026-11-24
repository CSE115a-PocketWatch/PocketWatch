---
id: schedule-generate-1
story: 3.2
sprint: 4
assignee: arshyg
estimate_hours: 4
---

# Generate a draft study schedule

## Description

For user story 3.2: gives a signed-in student a draft study plan built from their assignments and their free time in Google Calendar.

Includes a signed-in API route that gets the student's busy times, finds their free slots, places study sessions before each deadline, and returns the draft along with any work that didn't fit, plus automated tests. Saving the draft, editing it, loading assignments or saved preferences from the database, overriding limits when work doesn't fit, exporting to Google Calendar, and frontend pages are out of scope.

## Specs

- Add POST /schedule/generate, protected by SessionGuard. The body has an assignments list, each with an id, a deadline with a time zone, and estimatedMinutes.
- The schedule covers from the next quarter hour after now until the latest deadline, up to 62 days.
- It uses getBusyTimes, then findFreeSlots with the default availability, then placeSessions.
- Default study limits are 60 minute sessions, at least 30 minutes per session, 240 minutes per day, and 10 minute breaks.
- It returns the calendar's timeZone, the placed sessions (assignmentId, start, end, durationMinutes in UTC), and unplaced work (assignmentId, remainingMinutes).
- Sessions are never placed in the past or after an assignment's deadline.
- A missing or empty list, more than 50 assignments, an invalid or duplicate id, an invalid deadline or estimate, or every deadline already passed returns 400.
- 401 when not signed in or without Google access, and 502 on a Google error.

## Requirements

- Reuse getBusyTimes, findFreeSlots, and placeSessions; don't rewrite their logic.
- Don't add new dependencies or database tables.
- Tests shouldn't need a real Google account, a database, or network access.
- Return only times and ids (never event titles or details).
- Don't change the /calendar/busy or /schedule/free-slots routes' behavior.
- Existing backend tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. POST /schedule/generate returns study sessions placed in the student's free time, around their Google Calendar events, sorted by start time.
2. Each assignment's sessions end by its deadline, and work that doesn't fit is returned as unplaced with the minutes left.
3. The default study limits are used: sessions of 30 to 60 minutes, at most 240 minutes per day, and 10 minute breaks between sessions.
4. Sessions are only placed between now and the latest deadline, never in the past.
5. An invalid assignments list returns 400.
6. A request without a valid session, or from a user without Google access, returns 401. A Google Calendar error returns 502.

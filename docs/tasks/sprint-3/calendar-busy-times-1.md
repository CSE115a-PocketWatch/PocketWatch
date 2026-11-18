---
id: calendar-busy-times-1
story: 3.2
sprint: 3
assignee: arshyg
estimate_hours: 4
---

# Get a student's busy times from their Google Calendar

## Description

Serves story 3.2 by reading the student's existing Google Calendar events so study sessions can be scheduled around them.

Includes reading events from the primary calendar, deciding which events count as busy, a signed-in API route that returns busy times, and automated tests. Other calendars, scheduling logic, and frontend pages are out of scope.

## Specs

- Add GET /calendar/busy?from=...&to=..., protected by SessionGuard. It returns the calendar's
  timeZone and a list of busy times, each with a start and end in UTC timing.
- GoogleCalendarService.getBusyTimes gets the user's Google access token and reads events from
  their primary calendar for the given requested range. Reminder it doesn't include other calendars. 
- Recurring events are expanded, so each occurrence counts as its own busy time.
- toBusyTimes in busy-times.ts decides what counts as busy. Cancelled, "free", declined, and
  all-day events are skipped.
- Busy times are trimmed to fit inside the requested range. Overlapping or back-to-back busy times are
  merged and the list is sorted by start time.
- from and to must be date-times with a time zone and missing or invalid values,
  from not before to, or a range over 62 days return 400.
- A user who isn't signed in or hasn't granted Google access gets 401. A Google Calendar error
  returns 502.

## Requirements

- Use the existing googleapis package.
- Keep the existing calendar.events permission; don't change Google sign-in scopes.
- Tests shouldn't need a real Google account, a database, or network access.
- Return only busy start and end times (never return details like: event titles, details, or tokens.)
- Do not change existing auth routes or createTestEvent.
- Existing backend tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. GET /calendar/busy returns the signed-in user's busy times for the requested range, sorted by start time.
2. Each occurrence of a recurring event is its own busy time, and events from every page of results are included.
3. Cancelled, "free", declined, and all-day events are not returned.
4. Busy times are trimmed to the requested range; overlapping or back-to-back busy times are merged into one.
5. The response includes the calendar's time zone, and busy times contain only start and end times in UTC.
6. Missing or invalid from/to, from not before to, or a range over 62 days returns 400.
7. A request without a valid session, or from a user without Google access, returns 401.
8. A Google Calendar error returns 502.

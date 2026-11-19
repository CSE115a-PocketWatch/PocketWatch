---
id: free-slots-1
story: 3.2
sprint: 3
assignee: arshyg
estimate_hours: 4
---

# Find a student's free study time slots

## Description

For user story 3.2: finds the times a student is free to study, based on their availability and existing Google Calendar events.

Includes turning the student's available days and hours (in their local time) into exact times, removing busy times from Google Calendar (PR #14), dropping slots shorter than the session length, a signed-in API route that returns free slots, and automated tests. Until saved study preferences exist, the route uses default availability. Placing study sessions, saving preferences, overnight availability, and frontend pages are out of scope.

## Specs

- Add GET /schedule/free-slots?from=...&to=..., protected by SessionGuard. It returns the calendar's timeZone and a list of free slots, each with a start and end in UTC.
- findFreeSlots in free-slots.ts takes availability, busy times, from, to, and a time zone, and returns the free slots.
- Availability is a set of weekdays and one start and end time in the student's local time, like Mon, Wed, Fri from 16:00 to 21:00. Each chosen day's window is turned into UTC using the Google Calendar's time zone, including on daylight saving days.
- Busy times from GoogleCalendarService.getBusyTimes are removed from the windows. A busy time in the middle of a window splits it into two slots.
- Slots are trimmed to the requested range. Slots shorter than the session length are dropped. The list is sorted by start time.
- Until saved preferences exist, the default is every day 09:00 to 21:00 with 60 minute sessions.

## Requirements

- Reuse GoogleCalendarService.getBusyTimes; don't call Google directly. (from PR #14)
- Don't add new dependencies; convert time zones with built-in Intl.
- Tests shouldn't need a real Google account, a database, or network access.
- Return only start and end times.
- Don't change the /calendar/busy route's behavior.
- Existing backend tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. GET /schedule/free-slots returns the signed-in user's free slots for the requested range, sorted by start time.
2. Only the chosen weekdays have slots, and their local start and end times are converted to the correct UTC times, including across a daylight saving change.
3. Busy times are removed from availability, and a busy time inside a window splits it.
4. Slots are trimmed to the requested range, and slots shorter than the session length are not returned.
5. With no saved preferences, the default availability is used.

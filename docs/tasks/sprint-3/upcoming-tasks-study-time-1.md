---
id: upcoming-tasks-study-time-1
story: 2.2
sprint: 3
assignee: prithika-venkatesh
estimate_hours: 2
---

# Show study time and overdue status on Upcoming Tasks

## Description

Serves story 2.2 by showing each assignment's study time on its
Upcoming Tasks card, matching the Figma dashboard ("Study time: X of Y
hours"), and flagging assignments whose deadline has passed.

Completed study time comes from study sessions, which are not built
yet, so it defaults to 0. Backend changes and session tracking are out
of scope.

## Specs

- Add formatting helpers in
  apps/web/src/features/calendar-view/study-time.ts.
- Show "Study time: <done> of <estimate>" on each Upcoming Tasks item,
  with times in hours (for example "0 of 6 hours", "0 of 1.5 hours",
  "0 of 1 hour").
- Round hours to at most one decimal place; show positive amounts
  smaller than 0.1 hours as 0.1.
- Add an optional completedMinutes field to UpcomingAssignment,
  defaulting to 0 when missing.
- Mark an item as overdue when its deadline is before the current time,
  using a visible "Overdue" label (not color alone).
- Let UpcomingTasks accept an optional now prop so tests can control
  the current time.
- Add tests in
  apps/web/src/features/calendar-view/UpcomingTasksStudyTime.test.tsx.
- Prefix every test name with "upcoming-tasks-study-time-1 ".

## Requirements

- Do not change backend code, database models, or API routes.
- Keep the existing Upcoming Tasks sorting and Delete button working.
- Existing web tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. A 360-minute assignment shows "Study time: 0 of 6 hours".
2. 90 minutes shows "1.5 hours" and 60 minutes shows "1 hour".
3. completedMinutes is shown when provided (120 of 360 shows "2 of 6 hours").
4. Hours are rounded to one decimal place, with a minimum of 0.1 for
   positive values.
5. An assignment with a past deadline shows an "Overdue" label.
6. An assignment with a future deadline does not show "Overdue".
7. Items are still sorted by deadline and still have a Delete button.

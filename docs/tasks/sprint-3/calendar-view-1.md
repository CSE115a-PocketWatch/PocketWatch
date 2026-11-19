---
id: calendar-view-1
story: 2.2
sprint: 3
assignee: vmuchukota
estimate_hours: 5
---


# Build the weekly calendar dashboard with an add-assignment form 

## Description
Create a dashboard page that shows the student's week as Monday - Sunday calendar with hour label, a sidebar of upcoming tasks, and an add-assignment form opened from the sidebar. This falls under story 2.2 (add/edit/delete assignments with deadlines and time estimates) by letting a student enter a new assignment's name, deadline, and estimated time. 

This task specificaly covers the frontend layout, form validation, and local page state. Out of scope: saving assignments to backend, editing/deleting assignments, generating/showing study sessions on the grid, switching weeks.

## Specs
- `/dashboard` (`apps/web/src/app/dashboard/page.tsx`) renders `CalendarDashboard`.
- Components live in `apps/web/src/features/calendar-view/components/`: `CalendarDashboard`,
  `WeekGrid`, `UpcomingTasks`, and `AssignmentForm`.
- `CalendarDashboard` props: `userName` (default `"User"`), `today` (default: current date),
  and an optional `onCreateAssignment(assignment)` handler.
- The header shows "Hello, {userName}!", a week-range label, and an "Edit View" button.
- The week-range label shows the Monday–Sunday week containing `today`, in the browser's
  local time zone:
  - same month: "November 16-22, 2026"
  - two months: "November 30 - December 6, 2026"
  - two years: "December 28, 2026 - January 3, 2027"
- `WeekGrid` has seven day columns headed Mon, Tue, Wed, Thu, Fri, Sat, Sun.
- A time column to the left of Mon shows 24 hour labels, 12 AM through 11 PM, one per row.
  The grid scrolls vertically inside the calendar panel.
- `UpcomingTasks` shows an "Upcoming Tasks" heading, a "+" button labeled "Add assignment",
  the assignments added on this page, and a "user profile" link to `/profile/preferences`.
  With no assignments it shows "No upcoming tasks".
- Clicking "Add assignment" opens `AssignmentForm` in a dialog named "Add assignment", with:
  - "Assignment name" text input (placeholder "Assignment name here...")
  - "Due time" input (default 23:59) and "Due date" input (empty by default)
  - "Estimated time to complete (minutes)" number input
  - "Cancel" and "Generate work sessions" buttons
- Submitting a valid form calls `onSubmit` with `{ title, deadline, estimatedMinutes }`:
  `title` is trimmed, `deadline` is an ISO 8601 UTC string built from the local due date and
  time, and `estimatedMinutes` is a whole number. `CalendarDashboard` forwards it to
  `onCreateAssignment`, closes the dialog, and adds the assignment to Upcoming Tasks.
- Upcoming Tasks shows each assignment's name and due date/time, earliest deadline first.
- Invalid input shows the first failing rule's message in an alert and does not submit:
  - blank name: "Assignment name is required."
  - missing due date or time: "Due date and time are required."
  - deadline not after the current time: "Due date must be in the future."
  - estimated time empty, zero, negative, or fractional:
    "Estimated time must be a positive whole number of minutes."
- "Cancel" closes the dialog without submitting. Reopening shows an empty form.
- Tests fix the current date and mock the submit handler. No backend is needed.

## Requirements
- Use the existing Next.js App Router, React, and TypeScript setup. Add no dependencies.
- Follow the S3-T24 structure: a feature folder in `apps/web/src/features/` and a plain CSS
  file imported by the route page.
- Match the "Dashboard v2" Figma layout: header row, mint sidebar, gray grid, and a purple
  "Generate work sessions" button. Add the hour column on the left as specified above.
- Do not change the home page (`apps/web/src/app/page.tsx`) or the root layout.
- Do not add backend, database, or API calls.
- Existing frontend tests must keep passing.

## Acceptance criteria
1. Visiting `/dashboard` renders the greeting, the Edit View button, the Upcoming Tasks
   sidebar with "No upcoming tasks" and an Add assignment button, and day headers Mon
   through Sun in order.
2. The time column shows 24 hour labels from 12 AM to 11 PM in order.
3. The week-range label shows the Monday–Sunday week containing the current date, including
   weeks that span two months and two years.
4. Clicking Add assignment opens a dialog with the name, due time, due date, and estimated
   time inputs and the Cancel and Generate work sessions buttons.
5. Submitting a valid assignment calls the handler once with the trimmed title, ISO deadline,
   and estimated minutes, then closes the dialog.
6. Submitted assignments appear under Upcoming Tasks, ordered by due date, earliest first.
7. Submitting a blank name, a missing due date, or an empty, zero, negative, or fractional
   estimated time shows a validation error and does not call the handler.
8. Submitting a due date in the past shows a validation error and does not call the handler.
9. Clicking Cancel closes the dialog without calling the handler, and reopening it shows
   empty fields.

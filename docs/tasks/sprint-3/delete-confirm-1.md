---
id: delete-confirm-1
story: 2.2
sprint: 3
assignee: prithika-venkatesh
estimate_hours: 3
---

# Add delete with confirmation to Upcoming Tasks

## Description

Serves story 2.2 by letting students delete an assignment from the
Upcoming Tasks list, with a confirmation step so nothing is deleted
by accident.

Includes a confirmation dialog component, a delete button on each
Upcoming Tasks item, and automated tests. The backend delete endpoint
is out of scope; the dialog calls an onDelete callback that will be
connected to the API later.

## Specs

- Add a DeleteAssignmentDialog component in
  apps/web/src/features/calendar-view/components/.
- Add a Delete button to each item in the Upcoming Tasks list.
- Clicking Delete opens the dialog showing the assignment title and
  "This can't be undone."
- Cancel (or Escape) closes the dialog without deleting.
- Confirming calls onDelete with the assignment id exactly once.
- Disable the confirm button while the delete is in progress.
- If onDelete fails, show an error message and keep the assignment.
- The dialog uses role="alertdialog" and is labelled by its title.
- Add tests in
  apps/web/src/features/calendar-view/DeleteAssignmentDialog.test.tsx.
- Prefix every test name with "delete-confirm-1 ".

## Requirements

- Do not change backend code, database models, or API routes.
- Reuse the existing calendar-view styles where possible.
- Existing web tests, typecheck, and build must continue to pass.

## Acceptance criteria

1. Each Upcoming Tasks item has a Delete button.
2. Clicking Delete opens a dialog that shows the assignment's title.
3. Cancel and Escape close the dialog and do not call onDelete.
4. Confirming calls onDelete once with the correct assignment id.
5. The confirm button is disabled while deleting.
6. A failed delete shows an error and the assignment stays in the list.
7. The dialog is accessible as an alertdialog labelled by its title.

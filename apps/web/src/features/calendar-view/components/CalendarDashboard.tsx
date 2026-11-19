'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import AssignmentForm from './AssignmentForm';
import DeleteAssignmentDialog from './DeleteAssignmentDialog';
import UpcomingTasks from './UpcomingTasks';
import WeekGrid from './WeekGrid';
import type { NewAssignment, UpcomingAssignment } from '../types';
import { formatWeekRange } from '../week';

interface CalendarDashboardProps {
  userName?: string;
  today?: Date;
  initialAssignments?: UpcomingAssignment[];
  onCreateAssignment?: (assignment: NewAssignment) => void;
  onDeleteAssignment?: (id: UpcomingAssignment['id']) => Promise<void> | void;
}

// The page is prerendered at build time, so the current date is read only in
// the browser. Otherwise the week label would show the week of the build.
const subscribeToNothing = () => () => {};
const getStartOfToday = () => new Date().setHours(0, 0, 0, 0);
const getServerStartOfToday = () => null;

export default function CalendarDashboard({
  userName = 'User',
  today,
  initialAssignments = [],
  onCreateAssignment,
  onDeleteAssignment,
}: CalendarDashboardProps) {
  const browserToday = useSyncExternalStore(
    subscribeToNothing,
    getStartOfToday,
    getServerStartOfToday,
  );

  const [assignments, setAssignments] = useState<UpcomingAssignment[]>(initialAssignments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<UpcomingAssignment | null>(null);
  const nextAssignmentId = useRef(
    Math.max(0, ...initialAssignments.map((assignment) => assignment.id)) + 1,
  );

  const currentDate = today ?? (browserToday === null ? null : new Date(browserToday));

  function handleCreateAssignment(assignment: NewAssignment) {
    onCreateAssignment?.(assignment);

    const id = nextAssignmentId.current;
    nextAssignmentId.current += 1;

    setAssignments((current) => [...current, { ...assignment, id }]);
    setIsFormOpen(false);
  }

  // If onDeleteAssignment throws, the dialog shows an error and the
  // assignment stays in the list.
  async function handleConfirmDelete(id: UpcomingAssignment['id']) {
    await onDeleteAssignment?.(id);
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
    setAssignmentToDelete(null);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-greeting">Hello, {userName}!</h1>

        <p className="dashboard-week-range">
          {currentDate ? formatWeekRange(currentDate) : ''}
        </p>

        <button type="button" className="dashboard-edit-view">
          Edit View
        </button>
      </header>

      <UpcomingTasks
        assignments={assignments}
        onAddClick={() => setIsFormOpen(true)}
        onDeleteClick={setAssignmentToDelete}
      />

      <main className="dashboard-calendar">
        <WeekGrid />
      </main>

      {isFormOpen && (
        <div className="assignment-dialog-backdrop">
          <div
            className="assignment-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Add assignment"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setIsFormOpen(false);
              }
            }}
          >
            <AssignmentForm
              onSubmit={handleCreateAssignment}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {assignmentToDelete && (
        <DeleteAssignmentDialog
          assignment={assignmentToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setAssignmentToDelete(null)}
        />
      )}
    </div>
  );
}

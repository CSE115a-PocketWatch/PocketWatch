'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import AssignmentForm from './AssignmentForm';
import UpcomingTasks from './UpcomingTasks';
import WeekGrid from './WeekGrid';
import type { NewAssignment, UpcomingAssignment } from '../types';
import { formatWeekRange } from '../week';

interface CalendarDashboardProps {
  userName?: string;
  today?: Date;
  onCreateAssignment?: (assignment: NewAssignment) => void;
}

// The page is prerendered at build time, so the current date is read only in
// the browser. Otherwise the week label would show the week of the build.
const subscribeToNothing = () => () => {};
const getStartOfToday = () => new Date().setHours(0, 0, 0, 0);
const getServerStartOfToday = () => null;

export default function CalendarDashboard({
  userName = 'User',
  today,
  onCreateAssignment,
}: CalendarDashboardProps) {
  const browserToday = useSyncExternalStore(
    subscribeToNothing,
    getStartOfToday,
    getServerStartOfToday,
  );

  const [assignments, setAssignments] = useState<UpcomingAssignment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const nextAssignmentId = useRef(1);

  const currentDate = today ?? (browserToday === null ? null : new Date(browserToday));

  function handleCreateAssignment(assignment: NewAssignment) {
    onCreateAssignment?.(assignment);

    const id = nextAssignmentId.current;
    nextAssignmentId.current += 1;

    setAssignments((current) => [...current, { ...assignment, id }]);
    setIsFormOpen(false);
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

      <UpcomingTasks assignments={assignments} onAddClick={() => setIsFormOpen(true)} />

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
    </div>
  );
}

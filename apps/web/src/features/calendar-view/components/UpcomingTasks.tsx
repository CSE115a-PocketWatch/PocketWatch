import Link from 'next/link';
import { useId } from 'react';
import type { UpcomingAssignment } from '../types';
import { formatDueDate } from '../week';

interface UpcomingTasksProps {
  assignments: UpcomingAssignment[];
  onAddClick: () => void;
  onDeleteClick?: (assignment: UpcomingAssignment) => void;
}

export default function UpcomingTasks({
  assignments,
  onAddClick,
  onDeleteClick,
}: UpcomingTasksProps) {
  const headingId = useId();

  const sortedAssignments = [...assignments].sort(
    (a, b) => Date.parse(a.deadline) - Date.parse(b.deadline),
  );

  return (
    <aside className="upcoming-tasks">
      <div className="upcoming-tasks-header">
        <h2 id={headingId}>Upcoming Tasks</h2>

        <button
          type="button"
          className="upcoming-tasks-add"
          aria-label="Add assignment"
          onClick={onAddClick}
        >
          +
        </button>
      </div>

      {sortedAssignments.length === 0 ? (
        <p className="upcoming-tasks-empty">No upcoming tasks</p>
      ) : (
        <ul className="upcoming-tasks-list" aria-labelledby={headingId}>
          {sortedAssignments.map((assignment) => (
            <li key={assignment.id}>
              <span className="upcoming-task-title">{assignment.title}</span>
              <span className="upcoming-task-due">
                Due {formatDueDate(assignment.deadline)}
              </span>
              {onDeleteClick && (
                <button
                  type="button"
                  className="upcoming-task-delete"
                  aria-label={`Delete ${assignment.title}`}
                  onClick={() => onDeleteClick(assignment)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link href="/profile/preferences" className="user-profile-link">
        user profile
      </Link>
    </aside>
  );
}

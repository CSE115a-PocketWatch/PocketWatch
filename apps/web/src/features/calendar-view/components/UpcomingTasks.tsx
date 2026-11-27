import Link from 'next/link';
import { useId } from 'react';
import type { UpcomingAssignment } from '../types';
import { formatDueDate } from '../week';
import { formatStudyTime, isOverdue } from '../study-time';

interface UpcomingTasksProps {
  assignments: UpcomingAssignment[];
  onAddClick: () => void;
  onDeleteClick?: (assignment: UpcomingAssignment) => void;
  // The current time. Tests pass a fixed date; the app uses the real time.
  now?: Date;
}

export default function UpcomingTasks({
  assignments,
  onAddClick,
  onDeleteClick,
  now = new Date(),
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
          {sortedAssignments.map((assignment) => {
            const overdue = isOverdue(assignment.deadline, now);
            const studyTime = formatStudyTime(
              assignment.completedMinutes ?? 0,
              assignment.estimatedMinutes,
            );

            return (
              <li key={assignment.id} className={overdue ? 'upcoming-task-overdue' : undefined}>
                <span className="upcoming-task-title">{assignment.title}</span>
                <span className="upcoming-task-due">
                  Due {formatDueDate(assignment.deadline)}
                </span>
                {overdue && <span className="upcoming-task-overdue-label">Overdue</span>}
                <span className="upcoming-task-study-time">Study time: {studyTime}</span>
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
            );
          })}
        </ul>
      )}

      <Link href="/profile/preferences" className="user-profile-link">
        user profile
      </Link>
    </aside>
  );
}

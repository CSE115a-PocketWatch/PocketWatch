import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UpcomingTasks from './components/UpcomingTasks';
import { formatStudyTime, toHours } from './study-time';
import type { UpcomingAssignment } from './types';

const now = new Date('2026-11-21T12:00:00-08:00');

const homework: UpcomingAssignment = {
  id: 1,
  title: 'Homework 2',
  deadline: '2026-11-25T23:59:00-08:00',
  estimatedMinutes: 360,
};

function renderTasks(assignments: UpcomingAssignment[]) {
  render(
    <UpcomingTasks
      assignments={assignments}
      onAddClick={vi.fn()}
      onDeleteClick={vi.fn()}
      now={now}
    />,
  );
  return screen.getAllByRole('listitem');
}

describe('upcoming-tasks-study-time-1: study time and overdue status', () => {
  it('upcoming-tasks-study-time-1 shows study time for a 360-minute assignment', () => {
    const [item] = renderTasks([homework]);

    expect(item).toHaveTextContent('Study time: 0 of 6 hours');
  });

  it('upcoming-tasks-study-time-1 shows 90 minutes as 1.5 hours and 60 minutes as 1 hour', () => {
    expect(formatStudyTime(0, 90)).toBe('0 of 1.5 hours');
    expect(formatStudyTime(0, 60)).toBe('0 of 1 hour');
  });

  it('upcoming-tasks-study-time-1 shows completed minutes when provided', () => {
    const [item] = renderTasks([{ ...homework, completedMinutes: 120 }]);

    expect(item).toHaveTextContent('Study time: 2 of 6 hours');
  });

  it('upcoming-tasks-study-time-1 rounds to one decimal with a minimum of 0.1 hours', () => {
    expect(toHours(100)).toBe(1.7);
    expect(toHours(1)).toBe(0.1);
    expect(toHours(0)).toBe(0);
  });

  it('upcoming-tasks-study-time-1 shows Overdue for a past deadline', () => {
    const [item] = renderTasks([{ ...homework, deadline: '2026-11-20T23:59:00-08:00' }]);

    expect(within(item).getByText('Overdue')).toBeInTheDocument();
  });

  it('upcoming-tasks-study-time-1 does not show Overdue for a future deadline', () => {
    const [item] = renderTasks([homework]);

    expect(within(item).queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('upcoming-tasks-study-time-1 keeps deadline sorting and the Delete button', () => {
    const items = renderTasks([
      { ...homework, id: 2, title: 'Later task', deadline: '2026-11-30T23:59:00-08:00' },
      { ...homework, id: 1, title: 'Sooner task', deadline: '2026-11-23T23:59:00-08:00' },
    ]);

    expect(items[0]).toHaveTextContent('Sooner task');
    expect(items[1]).toHaveTextContent('Later task');
    expect(within(items[0]).getByRole('button', { name: 'Delete Sooner task' })).toBeInTheDocument();
  });
});

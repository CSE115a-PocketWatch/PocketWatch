import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CalendarDashboard from './components/CalendarDashboard';
import type { UpcomingAssignment } from './types';

const today = new Date('2026-11-16T00:00:00');

const assignments: UpcomingAssignment[] = [
  { id: 1, title: 'Homework 1', deadline: '2026-11-18T23:59:00-08:00', estimatedMinutes: 120 },
  { id: 2, title: 'Homework 2', deadline: '2026-11-20T23:59:00-08:00', estimatedMinutes: 360 },
];

function renderDashboard(onDeleteAssignment?: (id: number) => Promise<void> | void) {
  render(
    <CalendarDashboard
      today={today}
      initialAssignments={assignments}
      onDeleteAssignment={onDeleteAssignment}
    />,
  );
}

function openDeleteDialog(title: string) {
  fireEvent.click(screen.getByRole('button', { name: `Delete ${title}` }));
  return screen.getByRole('alertdialog');
}

describe('delete-confirm-1: delete with confirmation', () => {
  it('delete-confirm-1 shows a Delete button for each upcoming task', () => {
    renderDashboard();

    expect(screen.getByRole('button', { name: 'Delete Homework 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Homework 2' })).toBeInTheDocument();
  });

  it('delete-confirm-1 opens a dialog that shows the assignment title', () => {
    renderDashboard();

    const dialog = openDeleteDialog('Homework 2');

    expect(dialog).toHaveTextContent('Delete Homework 2?');
    expect(dialog).toHaveTextContent("This can't be undone.");
  });

  it('delete-confirm-1 Cancel closes the dialog without deleting', () => {
    const onDelete = vi.fn();
    renderDashboard(onDelete);

    const dialog = openDeleteDialog('Homework 2');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Homework 2')).toBeInTheDocument();
  });

  it('delete-confirm-1 Escape closes the dialog without deleting', () => {
    const onDelete = vi.fn();
    renderDashboard(onDelete);

    const dialog = openDeleteDialog('Homework 2');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Homework 2')).toBeInTheDocument();
  });

  it('delete-confirm-1 confirming calls onDelete once with the id and removes the assignment', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    renderDashboard(onDelete);

    const dialog = openDeleteDialog('Homework 2');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(2);
    expect(screen.queryByText('Homework 2')).not.toBeInTheDocument();
    expect(screen.getByText('Homework 1')).toBeInTheDocument();
  });

  it('delete-confirm-1 disables the confirm button while deleting', async () => {
    const onDelete = vi.fn(() => new Promise<void>(() => {}));
    renderDashboard(onDelete);

    const dialog = openDeleteDialog('Homework 2');
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(confirmButton).toBeDisabled());
    expect(confirmButton).toHaveTextContent('Deleting…');
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('delete-confirm-1 shows an error and keeps the assignment when the delete fails', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('network error'));
    renderDashboard(onDelete);

    const dialog = openDeleteDialog('Homework 2');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent("Couldn't delete");
    expect(screen.getByText('Homework 2')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Delete' })).toBeEnabled();
  });

  it('delete-confirm-1 dialog is an alertdialog labelled by its title with focus on Cancel', () => {
    renderDashboard();

    openDeleteDialog('Homework 2');
    const dialog = screen.getByRole('alertdialog', { name: 'Delete Homework 2?' });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });
});

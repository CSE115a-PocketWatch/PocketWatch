import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import DashboardPage from '../../app/dashboard/page';
import CalendarDashboard from './components/CalendarDashboard';

// Wednesday, November 18, 2026 at noon, local time.
const NOW = new Date(2026, 10, 18, 12, 0);

async function addAssignment(
  user: UserEvent,
  { title, date, minutes }: { title: string; date: string; minutes: string },
) {
  await user.click(screen.getByRole('button', { name: 'Add assignment' }));

  const dialog = screen.getByRole('dialog', { name: 'Add assignment' });

  await user.type(within(dialog).getByLabelText('Assignment name'), title);
  await user.type(within(dialog).getByLabelText('Due date'), date);
  await user.type(
    within(dialog).getByLabelText('Estimated time to complete (minutes)'),
    minutes,
  );
  await user.click(within(dialog).getByRole('button', { name: 'Generate work sessions' }));
}

function getListText(name: string) {
  return within(screen.getByRole('list', { name }))
    .getAllByRole('listitem')
    .map((item) => item.textContent);
}

describe('calendar-view-1: weekly calendar dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calendar-view-1: /dashboard renders the header, sidebar, and Mon-Sun day headers', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hello, User!' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit View' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upcoming Tasks' })).toBeInTheDocument();
    expect(screen.getByText('No upcoming tasks')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add assignment' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'user profile' })).toHaveAttribute(
      'href',
      '/profile/preferences',
    );
    expect(getListText('Days of the week')).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
  });

  it('calendar-view-1: time column shows 24 hour labels from 12 AM to 11 PM', () => {
    render(<CalendarDashboard />);

    expect(getListText('Hours')).toEqual([
      '12 AM',
      '1 AM',
      '2 AM',
      '3 AM',
      '4 AM',
      '5 AM',
      '6 AM',
      '7 AM',
      '8 AM',
      '9 AM',
      '10 AM',
      '11 AM',
      '12 PM',
      '1 PM',
      '2 PM',
      '3 PM',
      '4 PM',
      '5 PM',
      '6 PM',
      '7 PM',
      '8 PM',
      '9 PM',
      '10 PM',
      '11 PM',
    ]);
  });

  it('calendar-view-1: week label defaults to the week containing the current date', () => {
    render(<CalendarDashboard />);

    expect(screen.getByText('November 16-22, 2026')).toBeInTheDocument();
  });

  it.each([
    ['a Monday', new Date(2026, 10, 16), 'November 16-22, 2026'],
    ['a Wednesday', new Date(2026, 10, 18), 'November 16-22, 2026'],
    ['a Sunday', new Date(2026, 10, 22, 23, 30), 'November 16-22, 2026'],
    ['a week spanning two months', new Date(2026, 11, 2), 'November 30 - December 6, 2026'],
    [
      'a week spanning two years',
      new Date(2027, 0, 1),
      'December 28, 2026 - January 3, 2027',
    ],
  ])('calendar-view-1: week label shows the Monday-Sunday week for %s', (_, today, label) => {
    render(<CalendarDashboard today={today} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('calendar-view-1: Add assignment opens the form dialog with all fields and buttons', async () => {
    const user = userEvent.setup();
    render(<CalendarDashboard />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add assignment' }));

    const dialog = screen.getByRole('dialog', { name: 'Add assignment' });

    expect(within(dialog).getByLabelText('Assignment name')).toHaveAttribute(
      'placeholder',
      'Assignment name here...',
    );
    expect(within(dialog).getByLabelText('Due time')).toHaveValue('23:59');
    expect(within(dialog).getByLabelText('Due date')).toHaveValue('');
    expect(
      within(dialog).getByLabelText('Estimated time to complete (minutes)'),
    ).toHaveValue(null);
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Generate work sessions' }),
    ).toBeInTheDocument();
  });

  it('calendar-view-1: submitting a valid assignment calls the handler once and closes the dialog', async () => {
    const user = userEvent.setup();
    const onCreateAssignment = vi.fn();
    render(<CalendarDashboard onCreateAssignment={onCreateAssignment} />);

    await addAssignment(user, {
      title: '  Essay draft  ',
      date: '2026-11-20',
      minutes: '120',
    });

    expect(onCreateAssignment).toHaveBeenCalledExactlyOnceWith({
      title: 'Essay draft',
      deadline: new Date(2026, 10, 20, 23, 59).toISOString(),
      estimatedMinutes: 120,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calendar-view-1: submitted assignments are listed under Upcoming Tasks by due date', async () => {
    const user = userEvent.setup();
    render(<CalendarDashboard />);

    await addAssignment(user, { title: 'Lab report', date: '2026-11-25', minutes: '90' });
    await addAssignment(user, { title: 'Essay draft', date: '2026-11-20', minutes: '120' });
    await addAssignment(user, { title: 'Problem set', date: '2026-11-22', minutes: '60' });

    expect(screen.queryByText('No upcoming tasks')).not.toBeInTheDocument();

    const tasks = getListText('Upcoming Tasks');

    expect(tasks).toHaveLength(3);
    expect(tasks[0]).toContain('Essay draft');
    expect(tasks[1]).toContain('Problem set');
    expect(tasks[2]).toContain('Lab report');
  });

  it('calendar-view-1: Cancel closes the dialog without submitting and reopens empty', async () => {
    const user = userEvent.setup();
    const onCreateAssignment = vi.fn();
    render(<CalendarDashboard onCreateAssignment={onCreateAssignment} />);

    await user.click(screen.getByRole('button', { name: 'Add assignment' }));

    let dialog = screen.getByRole('dialog', { name: 'Add assignment' });

    await user.type(within(dialog).getByLabelText('Assignment name'), 'Essay draft');
    await user.type(within(dialog).getByLabelText('Due date'), '2026-11-20');
    await user.type(
      within(dialog).getByLabelText('Estimated time to complete (minutes)'),
      '120',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onCreateAssignment).not.toHaveBeenCalled();
    expect(screen.getByText('No upcoming tasks')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add assignment' }));

    dialog = screen.getByRole('dialog', { name: 'Add assignment' });

    expect(within(dialog).getByLabelText('Assignment name')).toHaveValue('');
    expect(within(dialog).getByLabelText('Due time')).toHaveValue('23:59');
    expect(within(dialog).getByLabelText('Due date')).toHaveValue('');
    expect(
      within(dialog).getByLabelText('Estimated time to complete (minutes)'),
    ).toHaveValue(null);
  });
});

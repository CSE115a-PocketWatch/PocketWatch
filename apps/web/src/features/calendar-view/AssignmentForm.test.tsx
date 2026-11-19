import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentForm from './components/AssignmentForm';

// Wednesday, November 18, 2026 at noon, local time.
const NOW = new Date(2026, 10, 18, 12, 0);

const ESTIMATE_ERROR = 'Estimated time must be a positive whole number of minutes.';

function renderForm() {
  const onSubmit = vi.fn();
  render(<AssignmentForm onSubmit={onSubmit} onCancel={vi.fn()} />);

  return {
    onSubmit,
    name: screen.getByLabelText('Assignment name'),
    dueTime: screen.getByLabelText('Due time'),
    dueDate: screen.getByLabelText('Due date'),
    estimate: screen.getByLabelText('Estimated time to complete (minutes)'),
    submit: screen.getByRole('button', { name: 'Generate work sessions' }),
  };
}

describe('calendar-view-1: assignment form validation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['empty', ''],
    ['only spaces', '   '],
  ])('calendar-view-1: rejects an assignment name that is %s', async (_, title) => {
    const user = userEvent.setup();
    const form = renderForm();

    if (title) {
      await user.type(form.name, title);
    }
    await user.type(form.dueDate, '2026-11-20');
    await user.type(form.estimate, '120');
    await user.click(form.submit);

    expect(screen.getByRole('alert')).toHaveTextContent('Assignment name is required.');
    expect(form.onSubmit).not.toHaveBeenCalled();
  });

  it('calendar-view-1: rejects a missing due date', async () => {
    const user = userEvent.setup();
    const form = renderForm();

    await user.type(form.name, 'Essay draft');
    await user.type(form.estimate, '120');
    await user.click(form.submit);

    expect(screen.getByRole('alert')).toHaveTextContent('Due date and time are required.');
    expect(form.onSubmit).not.toHaveBeenCalled();
  });

  it('calendar-view-1: rejects a missing due time', async () => {
    const user = userEvent.setup();
    const form = renderForm();

    await user.type(form.name, 'Essay draft');
    await user.clear(form.dueTime);
    await user.type(form.dueDate, '2026-11-20');
    await user.type(form.estimate, '120');
    await user.click(form.submit);

    expect(screen.getByRole('alert')).toHaveTextContent('Due date and time are required.');
    expect(form.onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['empty', ''],
    ['zero', '0'],
    ['negative', '-30'],
    ['fractional', '1.5'],
  ])('calendar-view-1: rejects an estimated time that is %s', async (_, minutes) => {
    const user = userEvent.setup();
    const form = renderForm();

    await user.type(form.name, 'Essay draft');
    await user.type(form.dueDate, '2026-11-20');
    fireEvent.change(form.estimate, { target: { value: minutes } });
    await user.click(form.submit);

    expect(form.estimate).toHaveValue(minutes === '' ? null : Number(minutes));
    expect(screen.getByRole('alert')).toHaveTextContent(ESTIMATE_ERROR);
    expect(form.onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['yesterday', '2026-11-17', '23:59'],
    ['earlier today', '2026-11-18', '09:00'],
    ['exactly now', '2026-11-18', '12:00'],
  ])('calendar-view-1: rejects a due date in the past (%s)', async (_, date, time) => {
    const user = userEvent.setup();
    const form = renderForm();

    await user.type(form.name, 'Essay draft');
    await user.clear(form.dueTime);
    await user.type(form.dueTime, time);
    await user.type(form.dueDate, date);
    await user.type(form.estimate, '120');
    await user.click(form.submit);

    expect(screen.getByRole('alert')).toHaveTextContent('Due date must be in the future.');
    expect(form.onSubmit).not.toHaveBeenCalled();
  });

  it('calendar-view-1: submits once every field is valid', async () => {
    const user = userEvent.setup();
    const form = renderForm();

    await user.type(form.name, 'Essay draft');
    await user.clear(form.dueTime);
    await user.type(form.dueTime, '12:01');
    await user.type(form.dueDate, '2026-11-18');
    await user.type(form.estimate, '45');
    await user.click(form.submit);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(form.onSubmit).toHaveBeenCalledExactlyOnceWith({
      title: 'Essay draft',
      deadline: new Date(2026, 10, 18, 12, 1).toISOString(),
      estimatedMinutes: 45,
    });
  });
});


import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreferencesForm from './components/PreferencesForm';
import { DEFAULT_PREFERENCES } from './types';

afterEach(() => {
  cleanup();
});

describe('S3-T24: Student Preferences', () => {
  it('S3-T24: renders all preference inputs', () => {
    render(<PreferencesForm />);

    expect(screen.getByLabelText('Daily study limit')).toBeDefined();
    expect(screen.getByLabelText('Session Length')).toBeDefined();
    expect(screen.getByLabelText('Start time')).toBeDefined();
    expect(screen.getByLabelText('End time')).toBeDefined();

    for (const day of ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun']) {
      expect(screen.getByRole('button', { name: day })).toBeDefined();
    }
  });

  it('S3-T24: toggles weekdays independently', async () => {
    const user = userEvent.setup();
    render(<PreferencesForm />);

    const monday = screen.getByRole('button', { name: 'Mon' });
    const tuesday = screen.getByRole('button', { name: 'Tues' });

    expect(monday.getAttribute('aria-pressed')).toBe('true');
    expect(tuesday.getAttribute('aria-pressed')).toBe('true');

    await user.click(monday);

    expect(monday.getAttribute('aria-pressed')).toBe('false');
    expect(tuesday.getAttribute('aria-pressed')).toBe('true');

    await user.click(monday);

    expect(monday.getAttribute('aria-pressed')).toBe('true');
  });

  it('S3-T24: submits valid preferences', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<PreferencesForm onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledExactlyOnceWith(DEFAULT_PREFERENCES);
  });

it('S3-T24: rejects zero and negative study durations', async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();

  render(<PreferencesForm onSave={onSave} />);

  const dailyLimit = screen.getByLabelText(
    'Daily study limit',
  ) as HTMLInputElement;

  // Test zero
  await user.clear(dailyLimit);
  await user.type(dailyLimit, '0');

  expect(dailyLimit.value).toBe('0');

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toContain(
    'Study durations must be greater than zero',
  );

  // Test a negative number
  fireEvent.change(dailyLimit, {
     target: { value: '-10' },
  });

  expect(dailyLimit.value).toBe('-10');

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toContain(
    'Study durations must be greater than zero',
  );
});

  it('S3-T24: rejects missing weekdays and invalid time ranges', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<PreferencesForm onSave={onSave} />);

    for (const day of ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri']) {
      await user.click(screen.getByRole('button', { name: day }));
    }

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain(
      'Select at least one available day',
    );

    await user.click(screen.getByRole('button', { name: 'Mon' }));

    const startTime = screen.getByLabelText('Start time');
    const endTime = screen.getByLabelText('End time');

    await user.clear(startTime);
    await user.type(startTime, '22:00');

    await user.clear(endTime);
    await user.type(endTime, '09:00');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('S3-T24: cancel restores initial preferences', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<PreferencesForm onSave={onSave} />);

    const dailyLimit = screen.getByLabelText(
      'Daily study limit',
    ) as HTMLInputElement;

    await user.clear(dailyLimit);
    await user.type(dailyLimit, '120');
    await user.click(screen.getByRole('button', { name: 'Sat' }));

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(dailyLimit.value).toBe('240');
    expect(
      screen.getByRole('button', { name: 'Sat' }).getAttribute('aria-pressed'),
    ).toBe('false');
    expect(onSave).not.toHaveBeenCalled();
  });
});



'use client';

import { useState, type FormEvent } from 'react';
import WeekdaySelector from './WeekdaySelector';
import TimeRangeInput from './TimeRangeInput';
import {
  DEFAULT_PREFERENCES,
  type StudentPreferences,
} from '../types';

interface PreferencesFormProps {
  initialPreferences?: StudentPreferences;
  onSave?: (preferences: StudentPreferences) => void | Promise<void>;
}

export default function PreferencesForm({
  initialPreferences = DEFAULT_PREFERENCES,
  onSave,
}: PreferencesFormProps) {
  const [preferences, setPreferences] = useState<StudentPreferences>(
    () => ({
      ...initialPreferences,
      availableDays: [...initialPreferences.availableDays],
    }),
  );

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updatePreferences(changes: Partial<StudentPreferences>) {
    setPreferences((current) => ({
      ...current,
      ...changes,
    }));
    setError('');
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !Number.isFinite(preferences.dailyStudyLimitMinutes) ||
      !Number.isFinite(preferences.sessionLengthMinutes) ||
      preferences.dailyStudyLimitMinutes <= 0 ||
      preferences.sessionLengthMinutes <= 0
    ) {
      setError('Study durations must be greater than zero.');
      return;
    }

    if (preferences.availableDays.length === 0) {
      setError('Select at least one available day.');
      return;
    }

    if (
      !preferences.startTime ||
      !preferences.endTime ||
      preferences.startTime >= preferences.endTime
    ) {
      setError('End time must be later than start time.');
      return;
    }

    setIsSaving(true);

    try {
      await onSave?.(preferences);
      setError('');
    } catch {
      setError('Unable to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setPreferences({
      ...initialPreferences,
      availableDays: [...initialPreferences.availableDays],
    });
    setError('');
  }

  return (
    <form
      className="preferences-form"
      onSubmit={handleSave}
      noValidate
    >
      <h1>Study Preferences</h1>

      <div className="preference-row">
        <label htmlFor="daily-limit">Daily study limit</label>

        <input
          id="daily-limit"
          type="number"
          min="1"
          step="1"
          value={
            Number.isNaN(preferences.dailyStudyLimitMinutes)
              ? ''
              : preferences.dailyStudyLimitMinutes
          }
          onChange={(event) =>
            updatePreferences({
              dailyStudyLimitMinutes: event.target.valueAsNumber,
            })
          }
        />

        <span>minutes per day</span>
      </div>

      <div className="preference-row">
        <label htmlFor="session-length">Session Length</label>

        <input
          id="session-length"
          type="number"
          min="1"
          step="1"
          value={
            Number.isNaN(preferences.sessionLengthMinutes)
              ? ''
              : preferences.sessionLengthMinutes
          }
          onChange={(event) =>
            updatePreferences({
              sessionLengthMinutes: event.target.valueAsNumber,
            })
          }
        />

        <span>minutes</span>
      </div>

      <div className="availability-section">
        <h2>Available Hours</h2>

        <WeekdaySelector
          selectedDays={preferences.availableDays}
          onChange={(days) =>
            updatePreferences({
              availableDays: days,
            })
          }
        />

        <TimeRangeInput
          startTime={preferences.startTime}
          endTime={preferences.endTime}
          onStartChange={(startTime) =>
            updatePreferences({
              startTime,
            })
          }
          onEndChange={(endTime) =>
            updatePreferences({
              endTime,
            })
          }
        />
      </div>

      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </button>

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}


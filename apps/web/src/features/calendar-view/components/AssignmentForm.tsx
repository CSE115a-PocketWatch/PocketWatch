'use client';

import { useId, useState, type SubmitEvent } from 'react';
import type { NewAssignment } from '../types';

interface AssignmentFormProps {
  onSubmit: (assignment: NewAssignment) => void;
  onCancel: () => void;
}

const DEFAULT_DUE_TIME = '23:59';

export default function AssignmentForm({ onSubmit, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = useState('');
  const [dueTime, setDueTime] = useState(DEFAULT_DUE_TIME);
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [error, setError] = useState('');

  const dueLabelId = useId();
  const estimateId = useId();

  function getValidationError(): string {
    if (title.trim() === '') {
      return 'Assignment name is required.';
    }

    // A date and time without an offset are read in the browser's time zone.
    const deadline = new Date(`${dueDate}T${dueTime}`);

    if (!dueDate || !dueTime || Number.isNaN(deadline.getTime())) {
      return 'Due date and time are required.';
    }

    if (deadline.getTime() <= Date.now()) {
      return 'Due date must be in the future.';
    }

    const minutes = Number(estimatedMinutes);

    if (estimatedMinutes.trim() === '' || !Number.isInteger(minutes) || minutes <= 0) {
      return 'Estimated time must be a positive whole number of minutes.';
    }

    return '';
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = getValidationError();

    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit({
      title: title.trim(),
      deadline: new Date(`${dueDate}T${dueTime}`).toISOString(),
      estimatedMinutes: Number(estimatedMinutes),
    });
  }

  return (
    <form className="assignment-form" onSubmit={handleSubmit} noValidate>
      <input
        className="assignment-name-input"
        type="text"
        aria-label="Assignment name"
        placeholder="Assignment name here..."
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setError('');
        }}
        autoFocus
      />

      <div className="assignment-form-row" role="group" aria-labelledby={dueLabelId}>
        <span id={dueLabelId} className="assignment-form-label assignment-form-label-caps">
          Due date:
        </span>

        <div className="assignment-form-fields">
          <input
            type="time"
            aria-label="Due time"
            value={dueTime}
            onChange={(event) => {
              setDueTime(event.target.value);
              setError('');
            }}
          />

          <input
            type="date"
            aria-label="Due date"
            value={dueDate}
            onChange={(event) => {
              setDueDate(event.target.value);
              setError('');
            }}
          />
        </div>
      </div>

      <div className="assignment-form-row">
        <label htmlFor={estimateId} className="assignment-form-label">
          Estimated Time to Complete:
        </label>

        <div className="assignment-form-fields">
          <span className="assignment-estimate-field">
            <input
              id={estimateId}
              type="number"
              min="1"
              step="1"
              aria-label="Estimated time to complete (minutes)"
              value={estimatedMinutes}
              onChange={(event) => {
                setEstimatedMinutes(event.target.value);
                setError('');
              }}
            />
            <span aria-hidden="true">min</span>
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="assignment-form-error">
          {error}
        </p>
      )}

      <div className="assignment-form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="button-primary">
          Generate work sessions
        </button>
      </div>
    </form>
  );
}

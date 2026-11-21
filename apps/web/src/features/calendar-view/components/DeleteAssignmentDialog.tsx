'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { UpcomingAssignment } from '../types';

interface DeleteAssignmentDialogProps {
  assignment: UpcomingAssignment;
  onConfirm: (id: UpcomingAssignment['id']) => Promise<void> | void;
  onCancel: () => void;
}

export default function DeleteAssignmentDialog({
  assignment,
  onConfirm,
  onCancel,
}: DeleteAssignmentDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start focus on Cancel so an accidental Enter doesn't delete anything.
  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(assignment.id);
      // On success the parent removes the assignment and closes this dialog.
    } catch {
      setError("Couldn't delete this assignment. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="assignment-dialog-backdrop">
      <div
        className="assignment-dialog delete-assignment-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !isDeleting) {
            onCancel();
          }
        }}
      >
        <h2 id={titleId}>Delete {assignment.title}?</h2>
        <p id={descriptionId}>This can&apos;t be undone.</p>

        {error && (
          <p className="delete-assignment-error" role="alert">
            {error}
          </p>
        )}

        <div className="delete-assignment-actions">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            className="delete-assignment-confirm"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

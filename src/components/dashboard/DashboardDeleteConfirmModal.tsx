'use client';

import { useEffect, useRef } from 'react';

interface DashboardDeleteConfirmModalProps {
  diagramName: string;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  returnFocusElement?: HTMLElement | null;
}

export function DashboardDeleteConfirmModal({
  diagramName,
  error,
  isPending,
  onCancel,
  onConfirm,
  returnFocusElement,
}: DashboardDeleteConfirmModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusElementRef = useRef<HTMLElement | null>(returnFocusElement ?? null);

  useEffect(() => {
    if (!returnFocusElementRef.current && document.activeElement instanceof HTMLElement) {
      returnFocusElementRef.current = document.activeElement;
    }

    const focusTimer = window.setTimeout(() => cancelButtonRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      const focusTarget = returnFocusElementRef.current;
      if (focusTarget?.isConnected) {
        focusTarget.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPending) {
        onCancel();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialogElement = dialogRef.current;
      if (!dialogElement) {
        return;
      }

      const focusableElements = Array.from(
        dialogElement.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPending, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" data-testid="confirm-delete-modal">
      <section
        ref={dialogRef}
        className="card-elevated w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-diagram-title"
        aria-describedby="delete-diagram-description"
      >
        <div className="border-b border-border bg-danger-muted p-5 sm:p-6">
          <p className="badge mb-3">Permanent delete</p>
          <h2 id="delete-diagram-title" className="text-2xl font-bold text-text-primary">
            Delete this diagram?
          </h2>
          <p id="delete-diagram-description" className="mt-3 text-sm leading-6 text-text-secondary">
            This will permanently delete <span className="font-semibold text-text-primary">{diagramName}</span> from your saved diagram library. This action cannot be undone.
          </p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {error ? (
            <div className="rounded-xl border border-danger bg-danger-muted p-4 text-sm font-medium text-danger" role="alert" data-testid="delete-error">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              ref={cancelButtonRef}
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={onCancel}
              disabled={isPending}
              data-testid="cancel-delete-button"
              aria-label="Cancel diagram deletion"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              onClick={onConfirm}
              disabled={isPending}
              data-testid="confirm-delete-button"
              aria-busy={isPending}
              aria-label={isPending ? 'Deleting diagram' : `Delete diagram permanently: ${diagramName}`}
            >
              {isPending ? 'Deleting…' : 'Delete permanently'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

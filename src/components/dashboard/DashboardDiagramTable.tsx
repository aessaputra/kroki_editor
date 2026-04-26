'use client';

import { Component, type KeyboardEvent, type MouseEvent, type ReactNode, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSavedDiagrams } from '@/hooks/useSavedDiagrams';
import { DIAGRAM_TYPES, type SavedDiagram } from '@/types';
import { DashboardDeleteConfirmModal } from './DashboardDeleteConfirmModal';
import { DashboardDiagramDetail } from './DashboardDiagramDetail';
import { formatDiagramTimestamp } from './dashboardFormat';

interface DashboardDiagramTableSectionErrorBoundaryProps {
  children: ReactNode;
}

interface DashboardDiagramTableSectionErrorBoundaryState {
  hasError: boolean;
}

interface DashboardDiagramTableProps {
  diagrams: SavedDiagram[];
  selectedDiagramId: string | null;
  onSelectDiagram: (diagram: SavedDiagram) => void;
  onEditDiagram?: (diagram: SavedDiagram) => void;
  onDeleteDiagram?: (diagram: SavedDiagram, triggerButton: HTMLButtonElement) => void;
}

const diagramTypeLabels = new Map(DIAGRAM_TYPES.map((diagramType) => [diagramType.id, diagramType.label]));

class DashboardDiagramTableSectionErrorBoundary extends Component<
  DashboardDiagramTableSectionErrorBoundaryProps,
  DashboardDiagramTableSectionErrorBoundaryState
> {
  state: DashboardDiagramTableSectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): DashboardDiagramTableSectionErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <DashboardDiagramTableError />;
    }

    return this.props.children;
  }
}

export function DashboardDiagramTableSection() {
  return (
    <DashboardDiagramTableSectionErrorBoundary>
      <DashboardDiagramTableSectionContent />
    </DashboardDiagramTableSectionErrorBoundary>
  );
}

function DashboardDiagramTableSectionContent() {
  const { diagrams, isLoading, deleteDiagram } = useSavedDiagrams();
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
  const [pendingDeleteDiagram, setPendingDeleteDiagram] = useState<SavedDiagram | null>(null);
  const [hiddenDiagramIds, setHiddenDiagramIds] = useState<Set<string>>(() => new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const deleteTriggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  const visibleDiagrams = useMemo(() => {
    return diagrams.filter((diagram) => !hiddenDiagramIds.has(diagram.id));
  }, [diagrams, hiddenDiagramIds]);

  const selectedDiagram = useMemo(() => {
    if (visibleDiagrams.length === 0) return null;
    return visibleDiagrams.find((diagram) => diagram.id === selectedDiagramId) ?? visibleDiagrams[0];
  }, [visibleDiagrams, selectedDiagramId]);

  const handleOpenDeleteModal = (diagram: SavedDiagram, triggerButton: HTMLButtonElement) => {
    deleteTriggerButtonRef.current = triggerButton;
    setDeleteError(null);
    setPendingDeleteDiagram(diagram);
  };

  const handleCancelDelete = () => {
    if (isDeletePending) return;
    setDeleteError(null);
    setPendingDeleteDiagram(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteDiagram || isDeletePending) return;

    const deletedDiagramId = pendingDeleteDiagram.id;

    try {
      setIsDeletePending(true);
      setDeleteError(null);
      await deleteDiagram(deletedDiagramId);

      const remainingDiagrams = visibleDiagrams.filter((diagram) => diagram.id !== deletedDiagramId);
      setHiddenDiagramIds((previousIds) => new Set(previousIds).add(deletedDiagramId));
      if (selectedDiagramId === deletedDiagramId) {
        setSelectedDiagramId(remainingDiagrams[0]?.id ?? null);
      }
      setPendingDeleteDiagram(null);
    } catch (error) {
      console.error('Error deleting dashboard diagram:', error);
      setDeleteError('Failed to delete diagram. The diagram was not deleted. Please try again.');
    } finally {
      setIsDeletePending(false);
    }
  };

  if (isLoading) {
    return <DashboardDiagramTableLoading />;
  }

  if (visibleDiagrams.length === 0) {
    return <DashboardDiagramTableEmptyState />;
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardDiagramTable
        diagrams={visibleDiagrams}
        selectedDiagramId={selectedDiagram?.id ?? null}
        onSelectDiagram={(diagram) => setSelectedDiagramId(diagram.id)}
        onEditDiagram={(diagram) => router.push(`/?diagramId=${encodeURIComponent(diagram.id)}`)}
        onDeleteDiagram={handleOpenDeleteModal}
      />
      <DashboardDiagramDetail diagram={selectedDiagram} />
      {pendingDeleteDiagram ? (
        <DashboardDeleteConfirmModal
          diagramName={pendingDeleteDiagram.title || pendingDeleteDiagram.name || 'Untitled diagram'}
          error={deleteError}
          isPending={isDeletePending}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          returnFocusElement={deleteTriggerButtonRef.current}
        />
      ) : null}
    </div>
  );
}

export function DashboardDiagramTable({
  diagrams,
  selectedDiagramId,
  onSelectDiagram,
  onEditDiagram,
  onDeleteDiagram,
}: DashboardDiagramTableProps) {
  return (
    <section className="card-elevated overflow-hidden" aria-labelledby="diagram-table-title">
      <DashboardDiagramTableHeader diagramCount={diagrams.length} />

      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[64rem] table-fixed text-left" data-testid="diagram-table">
          <thead className="border-y border-border bg-surface-alt text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th scope="col" className="w-56 px-3 py-3 font-semibold sm:px-5">Name</th>
              <th scope="col" className="w-40 px-3 py-3 font-semibold sm:px-5">Type</th>
              <th scope="col" className="w-48 px-3 py-3 font-semibold sm:px-5">Updated</th>
              <th scope="col" className="w-48 px-3 py-3 font-semibold sm:px-5">Created</th>
              <th scope="col" className="w-64 px-3 py-3 text-right font-semibold sm:px-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {diagrams.map((diagram) => {
              const isSelected = diagram.id === selectedDiagramId;
              const displayName = diagram.title || diagram.name || 'Untitled diagram';
              const diagramTypeLabel = diagramTypeLabels.get(diagram.diagramType) ?? diagram.diagramType;

              return (
                <tr
                  key={diagram.id}
                  className={`cursor-pointer transition-colors focus-within:bg-accent-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring ${isSelected ? 'bg-accent-muted/60' : 'hover:bg-surface-alt'}`}
                  data-testid="diagram-row"
                  data-diagram-id={diagram.id}
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => onSelectDiagram(diagram)}
                  onKeyDown={(event) => handleRowKeyDown(event, () => onSelectDiagram(diagram))}
                >
                  <td className="max-w-xs px-3 py-4 sm:px-5">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-semibold text-text-primary" title={displayName}>
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-text-muted" title={diagram.outputFormat.toUpperCase()}>
                        Output: {diagram.outputFormat.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 sm:px-5">
                    <span className="badge-accent whitespace-nowrap">{diagramTypeLabel}</span>
                  </td>
                  <td className="whitespace-normal break-words px-3 py-4 text-sm leading-5 text-text-secondary sm:px-5">{formatDiagramTimestamp(diagram.updatedAt)}</td>
                  <td className="whitespace-normal break-words px-3 py-4 text-sm leading-5 text-text-secondary sm:px-5">{formatDiagramTimestamp(diagram.createdAt)}</td>
                  <td className="px-3 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {isSelected ? <span className="badge">Selected</span> : null}
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectDiagram(diagram);
                        }}
                        aria-label={`View diagram: ${displayName}`}
                        aria-pressed={isSelected}
                        data-testid="view-diagram-button"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={onEditDiagram ? (event) => {
                          event.stopPropagation();
                          onEditDiagram(diagram);
                        } : stopRowSelection}
                        disabled={!onEditDiagram}
                        aria-label={`Edit diagram: ${displayName}`}
                        data-testid="edit-diagram-button"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={onDeleteDiagram ? (event) => {
                          event.stopPropagation();
                          onDeleteDiagram(diagram, event.currentTarget);
                        } : stopRowSelection}
                        disabled={!onDeleteDiagram}
                        aria-label={`Delete diagram: ${displayName}`}
                        data-testid="delete-diagram-button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, onSelect: () => void) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;

  event.preventDefault();
  onSelect();
}

function stopRowSelection(event: MouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

function DashboardDiagramTableHeader({ diagramCount }: { diagramCount: number }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="badge-accent mb-3">Saved diagrams</p>
        <h2 id="diagram-table-title" className="text-xl font-bold text-text-primary sm:text-2xl">
          Diagram library
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Browse saved diagrams, select one locally for read-only review, and open the full editor when changes are needed.
        </p>
      </div>
      <span className="badge flex-none self-start sm:self-center">
        {diagramCount} {diagramCount === 1 ? 'diagram' : 'diagrams'}
      </span>
    </div>
  );
}

function DashboardDiagramTableLoading() {
  return (
    <section className="card-elevated overflow-hidden" aria-labelledby="diagram-table-loading-title" data-testid="diagram-table-loading">
      <div className="p-5 sm:p-6">
        <p className="badge-accent mb-3">Saved diagrams</p>
        <h2 id="diagram-table-loading-title" className="text-xl font-bold text-text-primary sm:text-2xl">
          Loading diagram library
        </h2>
        <p className="mt-2 text-sm text-text-secondary">Checking your saved diagram list…</p>
      </div>
      <div className="border-t border-border p-5 sm:p-6" role="status" aria-label="Loading saved diagrams">
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="grid gap-3 rounded-xl border border-border bg-surface-alt p-4 sm:grid-cols-5">
              <div className="h-4 rounded-full bg-border" />
              <div className="h-4 rounded-full bg-border" />
              <div className="h-4 rounded-full bg-border" />
              <div className="h-4 rounded-full bg-border" />
              <div className="h-4 rounded-full bg-border" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardDiagramTableEmptyState() {
  return (
    <section className="card-elevated overflow-hidden" aria-labelledby="empty-diagrams-title" data-testid="empty-diagrams-state">
      <div className="grid gap-0 lg:grid-cols-5">
        <div className="p-6 sm:p-8 lg:col-span-3">
          <p className="badge-accent mb-4">Saved diagrams</p>
          <h2 id="empty-diagrams-title" className="text-2xl font-bold text-text-primary sm:text-3xl">
            No saved diagrams yet.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            Create diagrams in the editor and saved account diagrams will appear here in your dashboard library.
          </p>
          <Link href="/" className="btn-primary mt-6 w-full sm:w-auto">
            Back to editor
          </Link>
        </div>
        <div className="border-t border-border bg-surface-alt p-6 sm:p-8 lg:col-span-2 lg:border-l lg:border-t-0">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold text-text-primary">What appears here?</p>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="badge flex-none">1</span>
                <span>Saved diagram names with deterministic created and updated timestamps.</span>
              </li>
              <li className="flex gap-3">
                <span className="badge flex-none">2</span>
                <span>Diagram type plus view, edit, and permanent delete actions for each saved row.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardDiagramTableError() {
  return (
    <section className="card-elevated p-6 sm:p-8" aria-labelledby="diagram-table-error-title" data-testid="diagram-table-error">
      <p className="badge mb-4">Saved diagrams</p>
      <h2 id="diagram-table-error-title" className="text-2xl font-bold text-text-primary">
        Diagram list is temporarily unavailable.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
        We could not load your saved diagrams right now. Refresh the dashboard or return to the editor and try again.
      </p>
      <Link href="/" className="btn-secondary mt-6 w-full sm:w-auto">
        Back to editor
      </Link>
    </section>
  );
}

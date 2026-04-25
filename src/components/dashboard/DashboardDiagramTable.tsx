'use client';

import { Component, type ReactNode, useState } from 'react';
import Link from 'next/link';
import { useSavedDiagrams } from '@/hooks/useSavedDiagrams';
import { DIAGRAM_TYPES, type SavedDiagram } from '@/types';

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
  onDeleteDiagram?: (diagram: SavedDiagram) => void;
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
  const { diagrams, isLoading } = useSavedDiagrams();
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);

  if (isLoading) {
    return <DashboardDiagramTableLoading />;
  }

  if (diagrams.length === 0) {
    return <DashboardDiagramTableEmptyState />;
  }

  return (
    <DashboardDiagramTable
      diagrams={diagrams}
      selectedDiagramId={selectedDiagramId}
      onSelectDiagram={(diagram) => setSelectedDiagramId(diagram.id)}
    />
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

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left" data-testid="diagram-table">
          <thead className="border-y border-border bg-surface-alt text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Name</th>
              <th scope="col" className="px-5 py-3 font-semibold">Type</th>
              <th scope="col" className="px-5 py-3 font-semibold">Updated</th>
              <th scope="col" className="px-5 py-3 font-semibold">Created</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
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
                  className={`transition-colors ${isSelected ? 'bg-accent-muted/60' : 'hover:bg-surface-alt'}`}
                  data-testid="diagram-row"
                  data-diagram-id={diagram.id}
                  aria-selected={isSelected}
                >
                  <td className="max-w-xs px-5 py-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-semibold text-text-primary" title={displayName}>
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-text-muted" title={diagram.outputFormat.toUpperCase()}>
                        Output: {diagram.outputFormat.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge-accent whitespace-nowrap">{diagramTypeLabel}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{formatDiagramTimestamp(diagram.updatedAt)}</td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{formatDiagramTimestamp(diagram.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isSelected ? <span className="badge">Selected</span> : null}
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-xs"
                        onClick={() => onSelectDiagram(diagram)}
                        aria-label={`View diagram: ${displayName}`}
                        aria-pressed={isSelected}
                        data-testid="view-diagram-button"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={onEditDiagram ? () => onEditDiagram(diagram) : undefined}
                        disabled={!onEditDiagram}
                        aria-label={`Edit diagram: ${displayName}`}
                        data-testid="edit-diagram-button"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={onDeleteDiagram ? () => onDeleteDiagram(diagram) : undefined}
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

function DashboardDiagramTableHeader({ diagramCount }: { diagramCount: number }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="badge-accent mb-3">Saved diagrams</p>
        <h2 id="diagram-table-title" className="text-xl font-bold text-text-primary sm:text-2xl">
          Diagram library
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Browse saved diagrams, select one locally for review, and keep edit/delete actions staged for the next dashboard tasks.
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
            Create a diagram in the editor, use the manual Save button, and it will appear here in your dashboard library.
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
                <span>Diagram type and action placeholders ready for future edit and delete flows.</span>
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

export function formatDiagramTimestamp(timestamp: number) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute} UTC`;
}

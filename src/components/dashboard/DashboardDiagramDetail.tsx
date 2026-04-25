'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DiagramPreview } from '@/components/DiagramPreview';
import { buildKrokiUrl } from '@/lib/kroki';
import { DIAGRAM_TYPES, OUTPUT_FORMAT_LABELS, type SavedDiagram } from '@/types';
import { formatDiagramTimestamp } from './dashboardFormat';

interface DashboardDiagramDetailProps {
  diagram: SavedDiagram | null;
}

const diagramTypeLabels = new Map(DIAGRAM_TYPES.map((diagramType) => [diagramType.id, diagramType.label]));

export function DashboardDiagramDetail({ diagram }: DashboardDiagramDetailProps) {
  const [validatedPreviewError, setValidatedPreviewError] = useState<{ previewUrl: string; message: string } | null>(null);

  const previewUrl = useMemo(() => {
    if (!diagram) return '';

    try {
      return buildKrokiUrl(diagram.diagramType, diagram.source, diagram.outputFormat, diagram.options);
    } catch (error) {
      console.error('Failed to build dashboard preview URL:', error);
      return '';
    }
  }, [diagram]);

  const staticPreviewError = useMemo(() => {
    if (!diagram) return null;

    if (!diagram.source.trim()) {
      return 'This saved diagram does not contain source code to preview.';
    }

    if (!previewUrl) {
      return 'A preview URL could not be generated for this diagram.';
    }

    return null;
  }, [diagram, previewUrl]);

  const previewError = staticPreviewError
    ?? (validatedPreviewError?.previewUrl === previewUrl ? validatedPreviewError.message : null);

  useEffect(() => {
    if (!diagram || staticPreviewError || !previewUrl) return;

    if (!['svg', 'png', 'jpeg'].includes(diagram.outputFormat)) {
      return;
    }

    let cancelled = false;
    const validationImage = new Image();

    validationImage.onload = () => {
      if (!cancelled) setValidatedPreviewError((currentError) => (
        currentError?.previewUrl === previewUrl ? null : currentError
      ));
    };
    validationImage.onerror = () => {
      if (!cancelled) {
        setValidatedPreviewError({
          previewUrl,
          message: 'Kroki could not render this saved diagram. Review it in the editor to fix the syntax.',
        });
      }
    };

    validationImage.src = previewUrl;

    return () => {
      cancelled = true;
      validationImage.onload = null;
      validationImage.onerror = null;
    };
  }, [diagram, previewUrl, staticPreviewError]);

  if (!diagram) {
    return (
      <section className="card-elevated p-6 sm:p-8" aria-labelledby="diagram-detail-empty-title" data-testid="diagram-detail">
        <p className="badge-accent mb-4">Diagram detail</p>
        <h2 id="diagram-detail-empty-title" className="text-2xl font-bold text-text-primary">
          Select a diagram to inspect.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          Choose a row from the library to see its metadata, read-only source, and Kroki preview without leaving the dashboard.
        </p>
      </section>
    );
  }

  const displayName = diagram.title || diagram.name || 'Untitled diagram';
  const diagramTypeLabel = diagramTypeLabels.get(diagram.diagramType) ?? diagram.diagramType;
  const outputFormatLabel = OUTPUT_FORMAT_LABELS[diagram.outputFormat] ?? diagram.outputFormat.toUpperCase();

  return (
    <section className="card-elevated overflow-hidden" aria-labelledby="diagram-detail-title" data-testid="diagram-detail">
      <div className="grid min-w-0 gap-0 xl:grid-cols-5">
        <div className="min-w-0 p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:flex-col">
            <div className="min-w-0">
              <p className="badge-accent mb-3">Diagram detail</p>
              <h2 id="diagram-detail-title" className="break-words text-2xl font-bold text-text-primary sm:text-3xl">
                {displayName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Read-only review of the saved source and generated Kroki output. Use Edit to continue in the full editor.
              </p>
            </div>
            <Link
              href={`/?diagramId=${encodeURIComponent(diagram.id)}`}
              className="btn-primary flex-none px-4 text-sm"
              data-testid="edit-diagram-button"
              aria-label={`Edit diagram: ${displayName}`}
            >
              Edit diagram
            </Link>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <DashboardDetailItem label="Type" value={diagramTypeLabel} />
            <DashboardDetailItem label="Output" value={outputFormatLabel} />
            <DashboardDetailItem label="Created" value={formatDiagramTimestamp(diagram.createdAt)} />
            <DashboardDetailItem label="Updated" value={formatDiagramTimestamp(diagram.updatedAt)} />
          </dl>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-text-primary">Source</h3>
              <span className="badge">Read-only</span>
            </div>
            <pre className="max-h-96 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-surface-alt p-4 text-xs leading-6 text-text-primary"><code>{diagram.source}</code></pre>
          </div>
        </div>

        <div className="min-w-0 border-t border-border bg-surface-alt p-5 sm:p-6 xl:col-span-3 xl:border-l xl:border-t-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Preview</h3>
              <p className="mt-1 text-sm text-text-secondary">Rendered from the saved diagram source.</p>
            </div>
            <span className="badge-accent">{outputFormatLabel}</span>
          </div>

          <div className="h-80 min-w-0 overflow-auto rounded-xl border border-border bg-surface shadow-sm sm:h-96" data-testid="diagram-preview">
            {previewError ? (
              <DashboardPreviewError message={previewError} />
            ) : (
              <DiagramPreview
                imageUrl={previewUrl}
                diagramType={diagram.diagramType}
                outputFormat={diagram.outputFormat}
                errorTestId="diagram-preview-error"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-alt p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function DashboardPreviewError({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-danger-muted p-6" data-testid="diagram-preview-error" role="status">
      <div className="max-w-md text-center text-danger">
        <svg className="mx-auto mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
        </svg>
        <p className="text-lg font-bold">Preview unavailable</p>
        <p className="mt-2 text-sm leading-6">{message}</p>
      </div>
    </div>
  );
}

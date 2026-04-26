'use client';

/**
 * Kroki Diagram Editor - Main Page
 *
 * A pure client-side diagram editor with Monaco code editor
 * and live Kroki preview.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useConvexAuth } from 'convex/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDiagramEditor } from '@/hooks/useDiagramEditor';
import { useSavedDiagrams } from '@/hooks/useSavedDiagrams';
import {
  DiagramEditor,
  DiagramPreview,
  DiagramTypeSelector,
  DiagramOptions,
  FormatSelector,
  SplitPane,
} from '@/components';
import { MyDiagramsSidebar } from '@/components/DiagramHistory';
import type { SavedDiagram } from '@/types';

interface DiagramSnapshot {
  source: string;
  diagramType: SavedDiagram['diagramType'];
  outputFormat: SavedDiagram['outputFormat'];
  options: string;
}

function createDiagramSnapshot({
  source,
  diagramType,
  outputFormat,
  options,
}: Pick<SavedDiagram, 'source' | 'diagramType' | 'outputFormat' | 'options'>): DiagramSnapshot {
  return {
    source,
    diagramType,
    outputFormat,
    options: JSON.stringify(options),
  };
}

function snapshotsMatch(first: DiagramSnapshot | null, second: DiagramSnapshot): boolean {
  const savedSnapshot = first;
  if (savedSnapshot === null) return false;

  return savedSnapshot.source === second.source
    && savedSnapshot.diagramType === second.diagramType
    && savedSnapshot.outputFormat === second.outputFormat
    && savedSnapshot.options === second.options;
}

function getDiagramLoadMessage(diagramId: string, message: string) {
  return `Diagram ${diagramId}: ${message}`;
}

/**
 * Main editor page component
 */
export function HomePageClient() {
  // Saved diagrams sidebar state
  const [myDiagramsOpen, setMyDiagramsOpen] = useState(false);
  const [currentSavedDiagramId, setCurrentSavedDiagramId] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<DiagramSnapshot | null>(null);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [diagramLoadState, setDiagramLoadState] = useState<string | null>(null);
  const loadedDiagramIdRef = useRef<string | null>(null);
  const { isAuthenticated, isLoading: authIsLoading } = useConvexAuth();
  const searchParams = useSearchParams();
  const diagramId = searchParams.get('diagramId')?.trim() ?? '';

  // Use the diagram editor hook for all state management
  const {
    source,
    setSource,
    diagramType,
    setDiagramType,
    imageUrl,
    editorLanguage,
    isUpdating,
    options,
    setOptions,
    outputFormat,
    setOutputFormat,
    supportedFormats,
  } = useDiagramEditor('plantuml');

  const { loadDiagram } = useSavedDiagrams();

  const currentSnapshot = useMemo(() => createDiagramSnapshot({
    source,
    diagramType,
    outputFormat,
    options,
  }), [diagramType, options, outputFormat, source]);

  const hasUnsavedChanges = useMemo(() => {
    if (currentSavedDiagramId) {
      return !snapshotsMatch(lastSavedSnapshot, currentSnapshot);
    }

    return hasDraftChanges && source.trim().length > 0;
  }, [currentSavedDiagramId, currentSnapshot, hasDraftChanges, lastSavedSnapshot, source]);

  const handleSourceChange = useCallback((nextSource: string) => {
    setHasDraftChanges(true);
    setSource(nextSource);
  }, [setSource]);

  const handleDiagramTypeChange = useCallback((nextDiagramType: typeof diagramType) => {
    setHasDraftChanges(true);
    setDiagramType(nextDiagramType);
  }, [setDiagramType]);

  const handleOutputFormatChange = useCallback((nextOutputFormat: typeof outputFormat) => {
    setHasDraftChanges(true);
    setOutputFormat(nextOutputFormat);
  }, [setOutputFormat]);

  const handleOptionsChange = useCallback((nextOptions: typeof options) => {
    setHasDraftChanges(true);
    setOptions(nextOptions);
  }, [setOptions]);

  // Keyboard shortcuts
  useEffect(() => {
    if (authIsLoading || !isAuthenticated) {
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + H to toggle My Diagrams
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setMyDiagramsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [authIsLoading, isAuthenticated]);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      queueMicrotask(() => {
        setCurrentSavedDiagramId(null);
        setLastSavedSnapshot(null);
        setMyDiagramsOpen(false);
      });
    }
  }, [authIsLoading, isAuthenticated]);

  const handleLoadDiagram = useCallback((diagram: SavedDiagram) => {
    if (hasUnsavedChanges && currentSavedDiagramId !== diagram.id) {
      const shouldDiscard = confirm('Discard unsaved changes?');
      if (!shouldDiscard) {
        return false;
      }
    }

    setDiagramType(diagram.diagramType);
    setOutputFormat(diagram.outputFormat);
    setTimeout(() => {
      setOptions(diagram.options);
      setSource(diagram.source);
    }, 0);
    setCurrentSavedDiagramId(diagram.id);
    setLastSavedSnapshot(createDiagramSnapshot(diagram));
    setHasDraftChanges(false);
    return true;
  }, [currentSavedDiagramId, hasUnsavedChanges, setDiagramType, setOptions, setOutputFormat, setSource]);

  const handleDeleteCurrentDiagram = useCallback((id: string) => {
    if (id !== currentSavedDiagramId) return;
    setCurrentSavedDiagramId(null);
    setLastSavedSnapshot(null);
    setHasDraftChanges(true);
  }, [currentSavedDiagramId]);

  useEffect(() => {
    if (!diagramId) {
      loadedDiagramIdRef.current = null;
      queueMicrotask(() => {
        setDiagramLoadState(null);
      });
      return;
    }

    if (loadedDiagramIdRef.current === diagramId) {
      return;
    }

    if (authIsLoading) {
      queueMicrotask(() => {
        setDiagramLoadState(getDiagramLoadMessage(diagramId, 'checking account access…'));
      });
      return;
    }

    if (!isAuthenticated) {
      queueMicrotask(() => {
        setDiagramLoadState(getDiagramLoadMessage(diagramId, 'sign in to open saved diagrams'));
      });
      return;
    }

    let cancelled = false;

    const run = async () => {
      setDiagramLoadState(getDiagramLoadMessage(diagramId, 'loading…'));
      try {
        const diagram = await loadDiagram(diagramId);
        if (cancelled) return;

        if (!diagram) {
          const message = getDiagramLoadMessage(diagramId, 'not found or no longer available');
          setDiagramLoadState(message);
          toast.error('Saved diagram not found');
          return;
        }

        const loaded = handleLoadDiagram(diagram);
        if (cancelled) return;

        if (!loaded) {
          setDiagramLoadState(getDiagramLoadMessage(diagramId, 'load was cancelled'));
          return;
        }

        loadedDiagramIdRef.current = diagramId;
        setDiagramLoadState(getDiagramLoadMessage(diagramId, 'loaded'));
        toast.success('Saved diagram loaded');
      } catch (error) {
        if (cancelled) return;

        const message = error instanceof Error ? error.message : 'Unable to load saved diagram';
        setDiagramLoadState(getDiagramLoadMessage(diagramId, message));
        toast.error(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [authIsLoading, diagramId, handleLoadDiagram, isAuthenticated, loadDiagram]);

  return (
    <main className="h-full flex flex-col bg-gray-50 dark:bg-gray-950" data-testid="home-page-root">
      {/* Header */}
      <header className="flex-none px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          {/* Logo / Title - compact on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img
              src="/assets/logo.svg"
              alt="Kroki Diagram Editor"
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              <span className="sm:hidden">Kroki</span>
              <span className="hidden sm:inline">Kroki Diagram Editor</span>
            </h1>
          </div>

          {/* Controls - responsive layout */}
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-3">
            {authIsLoading ? (
              <span className="hidden sm:inline-flex badge" role="status" data-testid="auth-loading-state">
                Checking account...
              </span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2" data-testid="authenticated-header-state">
                <span className="hidden sm:inline-flex badge-accent">
                  Signed in
                </span>
                <Link
                  href="/dashboard"
                  className="btn-secondary min-h-[44px] px-3 py-2 text-xs sm:px-4 sm:text-sm"
                  data-testid="dashboard-navigation-link"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => setMyDiagramsOpen(true)}
                  className="btn-secondary min-h-[44px] px-3 py-2 text-xs sm:px-4 sm:text-sm"
                  aria-label="Open My Diagrams"
                  title="My Diagrams"
                  data-testid="my-diagrams-open-button"
                >
                  My Diagrams
                </button>
              </div>
            ) : (
              <Link
                href="/register"
                className="btn-primary min-h-[44px] px-3 py-2 text-sm sm:px-4"
                data-testid="register-navigation-link"
              >
                Register
              </Link>
            )}
              <FormatSelector
                value={outputFormat}
                onChange={handleOutputFormatChange}
                supportedFormats={supportedFormats}
              />
              <DiagramTypeSelector
                value={diagramType}
                onChange={handleDiagramTypeChange}
              />
          </div>
        </div>
        {diagramLoadState ? (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400" role="status" data-testid="diagram-load-state">
            {diagramLoadState}
          </p>
        ) : null}
      </header>


      {/* Main Content - Split Pane */}
      <div className="flex-1 min-h-0 overflow-auto lg:overflow-hidden">
        <SplitPane
          leftTitle={`${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Code`}
          rightTitle="Diagram Preview"
          leftAction={null}
          left={
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                <DiagramEditor
                  value={source}
                  onChange={handleSourceChange}
                  language={editorLanguage}
                  theme="vs-dark"
                />
              </div>
              <div className="flex-none">
                <DiagramOptions
                  diagramType={diagramType}
                  options={options}
                  onChange={handleOptionsChange}
                />
              </div>
            </div>
          }
          right={
            <DiagramPreview
              imageUrl={imageUrl}
              isUpdating={isUpdating}
              diagramType={diagramType}
              outputFormat={outputFormat}
            />
          }
        />
      </div>

      {/* Footer */}
      <footer className="flex-none px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline">
            Powered by{' '}
            <a
              href="https://kroki.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
            >
              Kroki
            </a>
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <a
              href="https://kroki.io/assets/kroki_cheatsheet_20210515_v1.1_EN.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Cheat Sheet
            </a>
            <span className="text-xs">
              {isUpdating ? '⏳ Rendering...' : '✅ Ready'}
            </span>
          </div>
        </div>
      </footer>

      {/* My Diagrams Sidebar */}
      <MyDiagramsSidebar
        isOpen={myDiagramsOpen}
        onClose={() => setMyDiagramsOpen(false)}
        onLoad={handleLoadDiagram}
        currentSavedDiagramId={currentSavedDiagramId}
        onDeleteCurrent={handleDeleteCurrentDiagram}
      />
    </main>
  );
}

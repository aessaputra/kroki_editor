'use client';

/**
 * Kroki Diagram Editor - Main Page
 * 
 * A pure client-side diagram editor with Monaco code editor
 * and live Kroki preview.
 */

import { useState, useEffect } from 'react';
import { useDiagramEditor } from '@/hooks/useDiagramEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDiagramStorage } from '@/hooks/useDiagramStorage';
import {
  DiagramEditor,
  DiagramPreview,
  DiagramTypeSelector,
  DiagramOptions,
  FormatSelector,
  SplitPane,
  DiagramHistory,
  AIGenerateButton,
  AIGenerateModal,
} from '@/components';
import { useOwnerAuth } from '@/hooks/useOwnerAuth';
import type { SavedDiagram } from '@/types';

/**
 * Main editor page component
 */
export default function HomePage() {
  // History sidebar state
  const [historyOpen, setHistoryOpen] = useState(false);

  // AI modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Owner authentication for AI features
  const { isOwner } = useOwnerAuth();

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

  // Storage operations
  const { getLastDiagram } = useDiagramStorage();

  // Enable auto-save
  useAutoSave(source, diagramType, outputFormat, options);

  // Session restore: load last diagram on mount
  useEffect(() => {
    const restoreSession = async () => {
      const lastDiagram = await getLastDiagram();
      if (lastDiagram) {
        setSource(lastDiagram.source);
        setDiagramType(lastDiagram.diagramType);
        setOutputFormat(lastDiagram.outputFormat);
        setOptions(lastDiagram.options);
      }
    };

    restoreSession();
  }, [getLastDiagram, setSource, setDiagramType, setOutputFormat, setOptions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + H to toggle history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setHistoryOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle load diagram from history
  const handleLoadDiagram = (diagram: SavedDiagram) => {
    setSource(diagram.source);
    setDiagramType(diagram.diagramType);
    setOutputFormat(diagram.outputFormat);
    setOptions(diagram.options);
  };

  return (
    <main className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
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
          <div className="flex items-center gap-1.5 sm:gap-3">
            <FormatSelector
              value={outputFormat}
              onChange={setOutputFormat}
              supportedFormats={supportedFormats}
            />
            <DiagramTypeSelector
              value={diagramType}
              onChange={setDiagramType}
            />
            {/* History button - hidden on mobile, shown on md+ */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="hidden md:flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Open history (Ctrl+H)"
              title="History (Ctrl+H)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </button>
          </div>
        </div>
      </header>


      {/* Main Content - Split Pane */}
      <div className="flex-1 min-h-0 overflow-auto lg:overflow-hidden">
        <SplitPane
          leftTitle={`${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Code`}
          rightTitle="Diagram Preview"
          leftAction={
            <button
              onClick={() => setHistoryOpen(true)}
              className="md:hidden w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Open history"
              title="History"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          }
          left={
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                <DiagramEditor
                  value={source}
                  onChange={setSource}
                  language={editorLanguage}
                  theme="vs-dark"
                />
              </div>
              <div className="flex-none">
                <DiagramOptions
                  diagramType={diagramType}
                  options={options}
                  onChange={setOptions}
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

      {/* History Sidebar */}
      <DiagramHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadDiagram}
      />

      {/* AI Generate Button (Owner Only) */}
      <AIGenerateButton
        isOwner={isOwner}
        onClick={() => setAiModalOpen(true)}
      />

      {/* AI Generate Modal */}
      <AIGenerateModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        diagramType={diagramType}
        onGenerate={setSource}
      />
    </main>
  );
}

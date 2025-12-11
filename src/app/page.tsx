'use client';

/**
 * Kroki Diagram Editor - Main Page
 * 
 * A pure client-side diagram editor with Monaco code editor
 * and live Kroki preview.
 */

import { useDiagramEditor } from '@/hooks/useDiagramEditor';
import {
  DiagramEditor,
  DiagramPreview,
  DiagramTypeSelector,
  DiagramOptions,
  SplitPane,
} from '@/components';

/**
 * Main editor page component
 */
export default function HomePage() {
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
  } = useDiagramEditor('plantuml');

  return (
    <main className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex-none px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Kroki Diagram Editor
            </h1>
          </div>

          {/* Diagram Type Selector */}
          <DiagramTypeSelector
            value={diagramType}
            onChange={setDiagramType}
          />
        </div>
      </header>

      {/* Main Content - Split Pane */}
      <div className="flex-1 min-h-0">
        <SplitPane
          leftTitle={`${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Code`}
          rightTitle="Diagram Preview"
          left={
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <DiagramEditor
                  value={source}
                  onChange={setSource}
                  language={editorLanguage}
                  theme="vs-dark"
                />
              </div>
              <DiagramOptions
                diagramType={diagramType}
                options={options}
                onChange={setOptions}
              />
            </div>
          }
          right={
            <DiagramPreview
              imageUrl={imageUrl}
              isUpdating={isUpdating}
              diagramType={diagramType}
            />
          }
        />
      </div>

      {/* Footer */}
      <footer className="flex-none px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
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
          <span>
            {isUpdating ? '⏳ Rendering...' : '✅ Ready'}
          </span>
        </div>
      </footer>
    </main>
  );
}

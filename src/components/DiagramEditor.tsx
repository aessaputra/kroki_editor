'use client';

/**
 * DiagramEditor Component
 * 
 * Monaco Editor wrapper with SSR disabled for Next.js compatibility.
 * Single responsibility: render a code editor with syntax highlighting.
 */

import dynamic from 'next/dynamic';
import type { OnChange, OnMount } from '@monaco-editor/react';

// Dynamic import with SSR disabled - Monaco requires browser environment
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => <EditorSkeleton />,
});

/**
 * Loading skeleton for the editor
 */
function EditorSkeleton() {
    return (
        <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
            <div className="text-gray-500 flex flex-col items-center gap-2">
                <svg
                    className="w-8 h-8 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                <span>Loading editor...</span>
            </div>
        </div>
    );
}

/**
 * Props for DiagramEditor component
 */
interface DiagramEditorProps {
    /** Current editor value */
    value: string;
    /** Callback when editor content changes */
    onChange: (value: string) => void;
    /** Monaco editor language for syntax highlighting */
    language?: string;
    /** Editor theme */
    theme?: 'vs-dark' | 'light';
}

/**
 * Code editor component for diagram source editing
 */
export function DiagramEditor({
    value,
    onChange,
    language = 'plaintext',
    theme = 'vs-dark',
}: DiagramEditorProps) {
    // Handle editor content change
    const handleChange: OnChange = (newValue) => {
        onChange(newValue || '');
    };

    // Handle editor mount for additional configuration
    const handleMount: OnMount = (editor) => {
        // Focus the editor on mount
        editor.focus();
    };

    return (
        <div className="w-full h-full min-h-[300px]">
            <MonacoEditor
                height="100%"
                language={language}
                value={value}
                onChange={handleChange}
                onMount={handleMount}
                theme={theme}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    tabSize: 2,
                    renderWhitespace: 'selection',
                    bracketPairColorization: { enabled: true },
                    padding: { top: 16, bottom: 16 },
                }}
            />
        </div>
    );
}

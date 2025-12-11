/**
 * useDiagramEditor Hook
 * 
 * Main state management hook for the diagram editor.
 * Encapsulates all editor state and logic following Clean Code principles.
 */

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { buildKrokiUrl } from '@/lib/kroki';
import { DiagramType, DEFAULT_TEMPLATES, DIAGRAM_TYPES } from '@/types';

/**
 * Debounce delay for diagram updates (ms)
 */
const DEBOUNCE_DELAY = 300;

/**
 * Return type for useDiagramEditor hook
 */
export interface UseDiagramEditorReturn {
    /** Current diagram source code */
    source: string;
    /** Update diagram source */
    setSource: (source: string) => void;
    /** Current diagram type */
    diagramType: DiagramType;
    /** Update diagram type */
    setDiagramType: (type: DiagramType) => void;
    /** Kroki URL for rendering (empty if no valid source) */
    imageUrl: string;
    /** Monaco editor language based on diagram type */
    editorLanguage: string;
    /** Whether diagram is currently being updated/debounced */
    isUpdating: boolean;
    /** Current diagram options */
    options: Record<string, string | number | boolean>;
    /** Update diagram options */
    setOptions: (opts: Record<string, string | number | boolean>) => void;
}

/**
 * Custom hook for managing diagram editor state
 * Handles source code, diagram type, debouncing, and URL generation
 */
export function useDiagramEditor(
    initialDiagramType: DiagramType = 'plantuml'
): UseDiagramEditorReturn {
    // State management
    const [source, setSource] = useState<string>('');
    const [diagramType, setDiagramType] = useState<DiagramType>(initialDiagramType);
    const [options, setOptions] = useState<Record<string, string | number | boolean>>({});

    // Debounce source updates (300ms delay to avoid spamming Kroki)
    const debouncedSource = useDebounce(source, DEBOUNCE_DELAY);

    // Track if we're in "updating" state (source changed but not yet debounced)
    const isUpdating = source !== debouncedSource;

    // Initialize source with default template when diagram type changes
    useEffect(() => {
        const template = DEFAULT_TEMPLATES[diagramType];
        setSource(template);
        // Reset options when changing diagram type
        setOptions({});
    }, [diagramType]);

    // Generate Kroki URL from debounced source and options
    const imageUrl = useMemo(() => {
        if (debouncedSource.trim()) {
            return buildKrokiUrl(diagramType, debouncedSource, 'svg', options);
        }
        return '';
    }, [debouncedSource, diagramType, options]);

    // Determine Monaco editor language based on diagram type
    const editorLanguage = useMemo(() => {
        const typeInfo = DIAGRAM_TYPES.find((t) => t.id === diagramType);
        return typeInfo?.language || 'plaintext';
    }, [diagramType]);

    return {
        source,
        setSource,
        diagramType,
        setDiagramType,
        imageUrl,
        editorLanguage,
        isUpdating,
        options,
        setOptions,
    };
}

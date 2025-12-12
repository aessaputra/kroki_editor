/**
 * useAutoSave Hook
 * 
 * Automatically saves diagram after user stops typing (debounced).
 * Following best practices: cleanup, debouncing, and error handling.
 */

'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import type { DiagramType, OutputFormat } from '@/types';
import { useDiagramStorage } from './useDiagramStorage';

/**
 * Debounce delay in milliseconds
 * User must stop typing for this duration before auto-save triggers
 */
const AUTO_SAVE_DELAY = 2000; // 2 seconds

/**
 * Auto-save hook with debouncing
 * 
 * @param source - Diagram source code
 * @param diagramType - Type of diagram
 * @param outputFormat - Output format
 * @param options - Diagram options
 * 
 * @example
 * ```tsx
 * function DiagramEditor() {
 *   const [source, setSource] = useState('');
 *   const [diagramType, setDiagramType] = useState('plantuml');
 *   
 *   // Auto-save enabled
 *   useAutoSave(source, diagramType, 'svg', {});
 *   
 *   return <Editor value={source} onChange={setSource} />;
 * }
 * ```
 */
export function useAutoSave(
    source: string,
    diagramType: DiagramType,
    outputFormat: OutputFormat,
    options: Record<string, string | number | boolean>
): void {
    const { saveDiagram } = useDiagramStorage();
    const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const toastIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        // Clear previous timeout on every change
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Dismiss previous toast if exists
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = undefined;
        }

        // Don't save empty diagrams
        if (!source.trim()) {
            return;
        }

        // Debounce: wait for user to stop typing
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await saveDiagram({
                    name: `Auto-saved ${diagramType}`,
                    source,
                    diagramType,
                    outputFormat,
                    options,
                });

                // Show subtle success notification
                toastIdRef.current = toast.success('Auto-saved', {
                    duration: 2000,
                    icon: '💾',
                    position: 'bottom-right',
                    style: {
                        fontSize: '13px',
                        padding: '8px 12px',
                    },
                });
            } catch (error) {
                // Error already handled in saveDiagram
                console.error('Auto-save failed:', error);
            }
        }, AUTO_SAVE_DELAY);

        // Cleanup timeout on unmount or dependency change
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
        };
    }, [source, diagramType, outputFormat, options, saveDiagram]);
}

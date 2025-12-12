/**
 * DiagramHistory Component
 * 
 * Displays saved diagrams in a sidebar with load/delete actions.
 * Following best practices: loading states, error handling, accessibility.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useDiagramStorage } from '@/hooks/useDiagramStorage';
import type { SavedDiagram } from '@/types';

interface DiagramHistoryProps {
    /** Callback when user loads a diagram */
    onLoad: (diagram: SavedDiagram) => void;
    /** Whether the sidebar is currently open */
    isOpen: boolean;
    /** Callback to close the sidebar */
    onClose: () => void;
}

/**
 * Diagram history sidebar component
 */
export function DiagramHistory({ onLoad, isOpen, onClose }: DiagramHistoryProps) {
    const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Inline editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Refs for focus management
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    const { getAllDiagrams, deleteDiagram, togglePin, renameDiagram } = useDiagramStorage();

    // Load diagrams on mount
    const loadHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const saved = await getAllDiagrams();
            setDiagrams(saved);
        } catch (err) {
            setError('Failed to load diagram history');
            console.error('Error loading history:', err);
        } finally {
            setIsLoading(false);
        }
    }, [getAllDiagrams]);

    // Handle Escape key and focus management
    useEffect(() => {
        if (!isOpen) return;

        // Store currently focused element to restore later
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Focus close button when sidebar opens
        const focusTimeout = setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 100);

        // Handle Escape key
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(focusTimeout);
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus when sidebar closes
            previousActiveElement.current?.focus();
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen, loadHistory]);

    // Handle load diagram
    const handleLoad = useCallback(async (diagram: SavedDiagram) => {
        onLoad(diagram);
        toast.success(`Loaded: ${diagram.name}`);
        onClose();
    }, [onLoad, onClose]);

    // Handle delete with confirmation
    const handleDelete = useCallback(async (id: string, name: string) => {
        // Simple confirm dialog
        if (!confirm(`Delete "${name}"?`)) {
            return;
        }

        try {
            await deleteDiagram(id);
            toast.success('Diagram deleted');
            await loadHistory(); // Reload list
        } catch (error) {
            // Error already handled in deleteDiagram
        }
    }, [deleteDiagram, loadHistory]);

    // Handle toggle pin
    const handleTogglePin = useCallback(async (id: string) => {
        try {
            await togglePin(id);
            await loadHistory(); // Reload to show updated pin status
        } catch (error) {
            // Error already handled in togglePin
        }
    }, [togglePin, loadHistory]);

    // Start editing diagram name
    const startEdit = useCallback((diagram: SavedDiagram) => {
        setEditingId(diagram.id);
        setEditValue(diagram.name);
        // Focus input on next tick
        setTimeout(() => editInputRef.current?.focus(), 50);
    }, []);

    // Submit rename
    const submitEdit = useCallback(async () => {
        if (!editingId || !editValue.trim()) {
            setEditingId(null);
            return;
        }
        try {
            await renameDiagram(editingId, editValue.trim());
            await loadHistory();
        } catch (error) {
            // Error handled in renameDiagram
        }
        setEditingId(null);
    }, [editingId, editValue, renameDiagram, loadHistory]);

    // Cancel editing
    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditValue('');
    }, []);

    // Handle keyboard in edit input
    const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    }, [submitEdit, cancelEdit]);

    // Handle overlay keyboard event
    const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
        }
    }, [onClose]);

    // Format timestamp
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay for mobile - accessible */}
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onClose}
                onKeyDown={handleOverlayKeyDown}
                role="button"
                tabIndex={0}
                aria-label="Close sidebar"
            />

            {/* Sidebar - full width on mobile, fixed width on larger screens */}
            <aside
                className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 overflow-y-auto shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label="Diagram history"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            History
                        </h2>
                        {diagrams.length > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                {diagrams.length}
                            </span>
                        )}
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Close history sidebar"
                    >
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content - with safe area padding for notch/home indicator */}
                <div className="p-4 pb-[env(safe-area-inset-bottom,16px)]">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8" role="status" aria-label="Loading diagrams">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && diagrams.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">No saved diagrams</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your diagrams will auto-save as you type</p>
                        </div>
                    )}

                    {!isLoading && !error && diagrams.length > 0 && (
                        <ul className="space-y-3" role="list" aria-label="Saved diagrams">
                            {diagrams.map((diagram) => (
                                <li
                                    key={diagram.id}
                                    className={`p-4 bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all hover:shadow-md ${diagram.isPinned
                                            ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                        }`}
                                >
                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {diagram.isPinned && (
                                                    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Pinned">
                                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                                    </svg>
                                                )}
                                                {editingId === diagram.id ? (
                                                    <input
                                                        ref={editInputRef}
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={submitEdit}
                                                        onKeyDown={handleEditKeyDown}
                                                        className="flex-1 px-2 py-1 text-sm font-medium bg-white dark:bg-gray-700 border-2 border-blue-500 rounded-lg focus:outline-none"
                                                        aria-label="Edit diagram name"
                                                    />
                                                ) : (
                                                    <h3
                                                        className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        onDoubleClick={() => startEdit(diagram)}
                                                        title="Double-click to rename"
                                                    >
                                                        {diagram.name}
                                                    </h3>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatDate(diagram.timestamp)}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg font-medium whitespace-nowrap">
                                            {diagram.diagramType}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-3" />

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleTogglePin(diagram.id)}
                                            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${diagram.isPinned
                                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600 focus:ring-yellow-500'
                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 focus:ring-gray-500'
                                                }`}
                                            aria-label={diagram.isPinned ? `Unpin ${diagram.name}` : `Pin ${diagram.name}`}
                                            aria-pressed={diagram.isPinned}
                                            title={diagram.isPinned ? 'Unpin' : 'Pin'}
                                        >
                                            <svg className="w-5 h-5" fill={diagram.isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleLoad(diagram)}
                                            className="flex-1 min-h-[44px] px-4 py-2.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            aria-label={`Load diagram: ${diagram.name}`}
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDelete(diagram.id, diagram.name)}
                                            className="min-h-[44px] p-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            aria-label={`Delete diagram: ${diagram.name}`}
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </>
    );
}


/**
 * My Diagrams sidebar component
 * 
 * Displays a user's saved diagrams in a sidebar with load/delete actions.
 * Following best practices: loading states, error handling, accessibility.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSavedDiagrams } from '@/hooks/useSavedDiagrams';
import type { SavedDiagram } from '@/types';

interface MyDiagramsSidebarProps {
    /** Callback when user loads a diagram */
    onLoad: (diagram: SavedDiagram) => boolean | void;
    /** Whether the sidebar is currently open */
    isOpen: boolean;
    /** Callback to close the sidebar */
    onClose: () => void;
    /** Currently loaded saved diagram id */
    currentSavedDiagramId: string | null;
    /** Callback when the current saved diagram is deleted */
    onDeleteCurrent: (id: string) => void;
}

/**
 * My Diagrams sidebar component
 */
export function MyDiagramsSidebar({
    onLoad,
    isOpen,
    onClose,
    currentSavedDiagramId,
    onDeleteCurrent,
}: MyDiagramsSidebarProps) {
    const [error, setError] = useState<string | null>(null);
    const [hiddenDiagramIds, setHiddenDiagramIds] = useState<Set<string>>(() => new Set());

    // Inline editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Refs for focus management
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    const {
        diagrams,
        isLoading,
        isAuthenticated,
        deleteDiagram,
        renameDiagram,
    } = useSavedDiagrams();

    const visibleDiagrams = isAuthenticated
        ? diagrams.filter((diagram) => !hiddenDiagramIds.has(diagram.id))
        : [];

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

    // Handle load diagram
    const handleLoad = useCallback(async (diagram: SavedDiagram) => {
        const didLoad = onLoad(diagram);
        if (didLoad === false) return;

        toast.success(`Loaded: ${diagram.title}`);
        onClose();
    }, [onLoad, onClose]);

    // Handle delete with confirmation
    const handleDelete = useCallback(async (id: string, name: string) => {
        // Simple confirm dialog
        if (!confirm(`Delete "${name}"?`)) {
            return;
        }

        try {
            setError(null);
            await deleteDiagram(id);
            setHiddenDiagramIds((previousIds) => new Set(previousIds).add(id));
            if (id === currentSavedDiagramId) {
                onDeleteCurrent(id);
            }
            toast.success('Diagram deleted');
        } catch (err) {
            setError('Failed to delete diagram');
            console.error('Error deleting diagram:', err);
            toast.error('Failed to delete diagram');
        }
    }, [currentSavedDiagramId, deleteDiagram, onDeleteCurrent]);

    // Start editing diagram name
    const startEdit = useCallback((diagram: SavedDiagram) => {
        setEditingId(diagram.id);
        setEditValue(diagram.title);
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
            setError(null);
            await renameDiagram(editingId, editValue.trim());
            toast.success('Diagram renamed');
        } catch (err) {
            setError('Failed to rename diagram');
            console.error('Error renaming diagram:', err);
            toast.error('Failed to rename diagram');
        }
        setEditingId(null);
    }, [editingId, editValue, renameDiagram]);

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
                aria-label="My Diagrams"
                data-testid="my-diagrams-sidebar"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2m14 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4m4 4h6" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            My Diagrams
                        </h2>
                        {visibleDiagrams.length > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                {visibleDiagrams.length}
                            </span>
                        )}
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Close My Diagrams sidebar"
                        data-testid="my-diagrams-close-button"
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

                    {!isLoading && !isAuthenticated && (
                        <div className="text-center py-12 px-4" data-testid="my-diagrams-auth-prompt">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Register to use My Diagrams</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Guests can keep editing and previewing. Registered users can manage saved diagrams from their account.
                            </p>
                            <Link
                                href="/register"
                                className="btn-primary mt-5 w-full"
                                data-testid="my-diagrams-register-link"
                            >
                                Register for My Diagrams
                            </Link>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    {!isLoading && isAuthenticated && !error && visibleDiagrams.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">No saved diagrams yet</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Saved diagrams you add to your account will appear here.</p>
                        </div>
                    )}

                    {!isLoading && isAuthenticated && !error && visibleDiagrams.length > 0 && (
                        <ul className="space-y-3" role="list" aria-label="My saved diagrams">
                            {visibleDiagrams.map((diagram) => (
                                <li
                                    key={diagram.id}
                                    className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
                                    data-testid="my-diagram-list-item"
                                    data-diagram-id={diagram.id}
                                >
                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {editingId === diagram.id ? (
                                                    <input
                                                        ref={editInputRef}
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={handleEditKeyDown}
                                                        className="flex-1 px-2 py-1 text-sm font-medium bg-white dark:bg-gray-700 border-2 border-blue-500 rounded-lg focus:outline-none"
                                                        aria-label="Edit diagram name"
                                                        data-testid="my-diagram-rename-input"
                                                    />
                                                ) : (
                                                    <h3
                                                        className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        onDoubleClick={() => startEdit(diagram)}
                                                        title="Double-click to rename"
                                                        data-testid="my-diagram-title"
                                                    >
                                                        {diagram.title}
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

                                    {currentSavedDiagramId === diagram.id && (
                                        <p className="badge-accent mt-3" data-testid="current-saved-diagram-indicator">
                                            Currently open
                                        </p>
                                    )}

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-3" />

                                    {/* Actions */}
                                    {editingId === diagram.id ? (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void submitEdit()}
                                                className="btn-primary flex-1 min-h-[40px] px-3 py-2 text-sm"
                                                data-testid="my-diagram-rename-save-button"
                                            >
                                                Save name
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="btn-secondary min-h-[40px] px-3 py-2 text-sm"
                                                data-testid="my-diagram-rename-cancel-button"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLoad(diagram)}
                                                className="btn-primary min-h-[44px] px-4 py-2.5 text-sm"
                                                aria-label={`Load diagram: ${diagram.title}`}
                                                data-testid="my-diagram-load-button"
                                            >
                                                Load
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => startEdit(diagram)}
                                                className="btn-secondary min-h-[44px] px-3 py-2.5 text-sm"
                                                aria-label={`Rename diagram: ${diagram.title}`}
                                                data-testid="my-diagram-rename-button"
                                            >
                                                Rename
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(diagram.id, diagram.title)}
                                                className="min-h-[44px] p-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                aria-label={`Delete diagram: ${diagram.title}`}
                                                title="Delete"
                                                data-testid="my-diagram-delete-button"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </>
    );
}

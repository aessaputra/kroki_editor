/**
 * useDiagramStorage Hook
 * 
 * Provides CRUD operations for diagram persistence using IndexedDB.
 * Includes Hybrid Storage Retention: max count, age limit, and pin protection.
 */

'use client';

import { useMemo, useCallback } from 'react';
import { get, set, del, entries } from 'idb-keyval';
import toast from 'react-hot-toast';
import type { SavedDiagram } from '@/types';

// ============================================================================
// Constants - Retention Policy Configuration
// ============================================================================

/** Maximum number of diagrams to keep */
const MAX_DIAGRAMS = 50;

/** Number of days to retain diagrams */
const RETENTION_DAYS = 90;

/** Retention period in milliseconds */
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

// ============================================================================
// Pure Functions (Outside Hook - Stable by Default)
// ============================================================================

/**
 * Generate a unique diagram ID
 */
function generateDiagramId(): string {
    return `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fetch all diagrams from IndexedDB, sorted by:
 * 1. Pinned first
 * 2. Then by timestamp (newest first)
 */
async function fetchAllDiagrams(): Promise<SavedDiagram[]> {
    const allEntries = await entries<string, SavedDiagram>();
    return allEntries
        .map(([_, diagram]) => diagram)
        .filter((diagram): diagram is SavedDiagram => diagram !== undefined)
        .sort((a, b) => {
            // Pinned items first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then by timestamp (newest first)
            return b.timestamp - a.timestamp;
        });
}

/**
 * Fetch a single diagram by ID from IndexedDB
 */
async function fetchDiagram(id: string): Promise<SavedDiagram | undefined> {
    return await get<SavedDiagram>(id);
}

/**
 * Save a diagram to IndexedDB
 */
async function saveDiagramToDb(diagram: SavedDiagram): Promise<void> {
    await set(diagram.id, diagram);
}

/**
 * Delete a diagram from IndexedDB
 */
async function deleteDiagramFromDb(id: string): Promise<void> {
    await del(id);
}

/**
 * Check storage quota and return percentage used
 */
async function checkQuota(): Promise<number | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage && estimate.quota) {
            return (estimate.usage / estimate.quota) * 100;
        }
    }
    return null;
}

/**
 * Toggle pin status of a diagram in IndexedDB
 */
async function togglePinInDb(id: string): Promise<boolean> {
    const diagram = await fetchDiagram(id);
    if (!diagram) {
        throw new Error('Diagram not found');
    }
    const newPinStatus = !diagram.isPinned;
    await saveDiagramToDb({ ...diagram, isPinned: newPinStatus });
    return newPinStatus;
}

/**
 * Rename a diagram in IndexedDB
 */
async function renameDiagramInDb(id: string, newName: string): Promise<void> {
    const diagram = await fetchDiagram(id);
    if (!diagram) {
        throw new Error('Diagram not found');
    }
    await saveDiagramToDb({ ...diagram, name: newName });
}

/**
 * Cleanup old and excess diagrams (respects pinned status)
 * @returns Number of diagrams deleted
 */
async function cleanupDiagrams(): Promise<number> {
    const diagrams = await fetchAllDiagrams();
    const now = Date.now();
    let deletedCount = 0;

    // Separate pinned and unpinned diagrams
    const pinnedDiagrams = diagrams.filter(d => d.isPinned);
    const unpinnedDiagrams = diagrams.filter(d => !d.isPinned);

    // 1. Delete expired unpinned diagrams (older than RETENTION_DAYS)
    for (const diagram of unpinnedDiagrams) {
        const age = now - diagram.timestamp;
        if (age > RETENTION_MS) {
            await deleteDiagramFromDb(diagram.id);
            deletedCount++;
        }
    }

    // 2. Enforce max count limit (delete oldest unpinned if over limit)
    const remainingDiagrams = await fetchAllDiagrams();
    const remainingUnpinned = remainingDiagrams.filter(d => !d.isPinned);

    if (remainingDiagrams.length > MAX_DIAGRAMS) {
        // Sort unpinned by timestamp (oldest first)
        const sortedUnpinned = remainingUnpinned.sort((a, b) => a.timestamp - b.timestamp);
        const excessCount = remainingDiagrams.length - MAX_DIAGRAMS;

        for (let i = 0; i < Math.min(excessCount, sortedUnpinned.length); i++) {
            await deleteDiagramFromDb(sortedUnpinned[i].id);
            deletedCount++;
        }
    }

    return deletedCount;
}

// ============================================================================
// Hook Interface & Implementation
// ============================================================================

/**
 * Return type for useDiagramStorage hook
 */
interface UseDiagramStorageReturn {
    /** Save a diagram to IndexedDB */
    saveDiagram: (diagram: Omit<SavedDiagram, 'id' | 'timestamp'>) => Promise<string>;
    /** Load a specific diagram by ID */
    loadDiagram: (id: string) => Promise<SavedDiagram | undefined>;
    /** Delete a diagram by ID */
    deleteDiagram: (id: string) => Promise<void>;
    /** Get all saved diagrams, sorted by timestamp (newest first) */
    getAllDiagrams: () => Promise<SavedDiagram[]>;
    /** Get the most recently saved diagram */
    getLastDiagram: () => Promise<SavedDiagram | undefined>;
    /** Check storage quota usage */
    checkStorageQuota: () => Promise<void>;
    /** Toggle pin/favorite status of a diagram */
    togglePin: (id: string) => Promise<boolean>;
    /** Cleanup old and excess diagrams */
    cleanupOldDiagrams: () => Promise<number>;
    /** Rename a diagram */
    renameDiagram: (id: string, newName: string) => Promise<void>;
}

/**
 * Custom hook for diagram storage operations
 * 
 * Features:
 * - Auto-cleanup: max 50 diagrams, 90-day retention
 * - Pin/favorite protection: pinned diagrams are never auto-deleted
 * 
 * @example
 * ```tsx
 * const { saveDiagram, togglePin, cleanupOldDiagrams } = useDiagramStorage();
 * 
 * // Save a diagram
 * const id = await saveDiagram({ ... });
 * 
 * // Pin a diagram to protect it
 * await togglePin(id);
 * 
 * // Manual cleanup
 * const deleted = await cleanupOldDiagrams();
 * ```
 */
export function useDiagramStorage(): UseDiagramStorageReturn {
    /**
     * Save a diagram to IndexedDB
     * Validates required fields, generates unique ID, and runs cleanup
     */
    const saveDiagram = useCallback(async (
        diagram: Omit<SavedDiagram, 'id' | 'timestamp'>
    ): Promise<string> => {
        try {
            // Validate required fields
            if (!diagram.source || !diagram.diagramType) {
                throw new Error('Invalid diagram: missing required fields');
            }

            // Create saved diagram with generated ID and timestamp
            const savedDiagram: SavedDiagram = {
                id: generateDiagramId(),
                timestamp: Date.now(),
                isPinned: false,
                ...diagram,
            };

            await saveDiagramToDb(savedDiagram);

            // Run cleanup after save to enforce retention policy
            const deletedCount = await cleanupDiagrams();
            if (deletedCount > 0) {
                console.log(`Auto-cleanup: removed ${deletedCount} old diagram(s)`);
            }

            return savedDiagram.id;
        } catch (error) {
            console.error('Failed to save diagram:', error);
            toast.error('Failed to save diagram');
            throw error;
        }
    }, []);

    /**
     * Load a specific diagram by ID
     */
    const loadDiagram = useCallback(async (id: string): Promise<SavedDiagram | undefined> => {
        try {
            return await fetchDiagram(id);
        } catch (error) {
            console.error('Failed to load diagram:', error);
            toast.error('Failed to load diagram');
            return undefined;
        }
    }, []);

    /**
     * Delete a diagram by ID
     */
    const deleteDiagram = useCallback(async (id: string): Promise<void> => {
        try {
            await deleteDiagramFromDb(id);
        } catch (error) {
            console.error('Failed to delete diagram:', error);
            toast.error('Failed to delete diagram');
            throw error;
        }
    }, []);

    /**
     * Get all saved diagrams, sorted by timestamp (newest first)
     */
    const getAllDiagrams = useCallback(async (): Promise<SavedDiagram[]> => {
        try {
            return await fetchAllDiagrams();
        } catch (error) {
            console.error('Failed to load diagrams:', error);
            toast.error('Failed to load diagrams');
            return [];
        }
    }, []);

    /**
     * Get the most recently saved diagram (for session restore)
     */
    const getLastDiagram = useCallback(async (): Promise<SavedDiagram | undefined> => {
        try {
            const diagrams = await fetchAllDiagrams();
            return diagrams[0];
        } catch (error) {
            console.error('Failed to get last diagram:', error);
            return undefined;
        }
    }, []);

    /**
     * Check storage quota and warn user if running low
     */
    const checkStorageQuota = useCallback(async (): Promise<void> => {
        try {
            const percentUsed = await checkQuota();
            if (percentUsed !== null && percentUsed > 90) {
                toast(
                    'Storage almost full. Consider deleting old diagrams.',
                    {
                        icon: '⚠️',
                        duration: 5000
                    }
                );
            }
        } catch (error) {
            console.error('Failed to check storage quota:', error);
        }
    }, []);

    /**
     * Toggle pin/favorite status of a diagram
     * Pinned diagrams are protected from auto-cleanup
     */
    const togglePin = useCallback(async (id: string): Promise<boolean> => {
        try {
            const newStatus = await togglePinInDb(id);
            toast.success(newStatus ? 'Diagram pinned 📌' : 'Diagram unpinned');
            return newStatus;
        } catch (error) {
            console.error('Failed to toggle pin:', error);
            toast.error('Failed to toggle pin status');
            throw error;
        }
    }, []);

    /**
     * Manually trigger cleanup of old and excess diagrams
     */
    const cleanupOldDiagrams = useCallback(async (): Promise<number> => {
        try {
            const deletedCount = await cleanupDiagrams();
            if (deletedCount > 0) {
                toast.success(`Cleaned up ${deletedCount} old diagram(s)`);
            } else {
                toast('No diagrams to clean up', { icon: '✓' });
            }
            return deletedCount;
        } catch (error) {
            console.error('Failed to cleanup diagrams:', error);
            toast.error('Failed to cleanup diagrams');
            return 0;
        }
    }, []);

    /**
     * Rename a diagram
     */
    const renameDiagram = useCallback(async (id: string, newName: string): Promise<void> => {
        try {
            if (!newName.trim()) {
                throw new Error('Name cannot be empty');
            }
            await renameDiagramInDb(id, newName.trim());
            toast.success('Diagram renamed');
        } catch (error) {
            console.error('Failed to rename diagram:', error);
            toast.error('Failed to rename diagram');
            throw error;
        }
    }, []);

    // Return memoized object with all methods
    return useMemo(() => ({
        saveDiagram,
        loadDiagram,
        deleteDiagram,
        getAllDiagrams,
        getLastDiagram,
        checkStorageQuota,
        togglePin,
        cleanupOldDiagrams,
        renameDiagram,
    }), [saveDiagram, loadDiagram, deleteDiagram, getAllDiagrams, getLastDiagram, checkStorageQuota, togglePin, cleanupOldDiagrams, renameDiagram]);
}

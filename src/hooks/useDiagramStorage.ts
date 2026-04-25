'use client';

import { useCallback, useMemo } from 'react';
import { useSavedDiagrams } from './useSavedDiagrams';
import type { SavedDiagram } from '@/types';

interface UseDiagramStorageReturn {
    saveDiagram: (diagram: Omit<SavedDiagram, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    loadDiagram: (id: string) => Promise<SavedDiagram | undefined>;
    deleteDiagram: (id: string) => Promise<void>;
    getAllDiagrams: () => Promise<SavedDiagram[]>;
    renameDiagram: (id: string, newName: string) => Promise<void>;
}

export function useDiagramStorage(): UseDiagramStorageReturn {
    const {
        createDiagram,
        loadDiagram,
        deleteDiagram,
        listDiagrams,
        renameDiagram,
    } = useSavedDiagrams();

    const saveDiagram = useCallback(async (
        diagram: Omit<SavedDiagram, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>,
    ): Promise<string> => {
        const saved = await createDiagram({
            title: diagram.title ?? diagram.name,
            source: diagram.source,
            diagramType: diagram.diagramType,
            outputFormat: diagram.outputFormat,
            options: diagram.options,
        });
        return saved.id;
    }, [createDiagram]);

    return useMemo(() => ({
        saveDiagram,
        loadDiagram,
        deleteDiagram,
        getAllDiagrams: listDiagrams,
        renameDiagram,
    }), [deleteDiagram, listDiagrams, loadDiagram, renameDiagram, saveDiagram]);
}

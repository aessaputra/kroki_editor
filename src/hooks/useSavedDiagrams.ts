'use client';

import { useCallback, useMemo } from 'react';
import { useConvex, useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { DiagramType, OutputFormat, SavedDiagram } from '@/types';

type DiagramId = Id<'diagrams'>;

interface SaveDiagramInput {
    title?: string;
    source: string;
    diagramType: DiagramType;
    outputFormat: OutputFormat;
    options: Record<string, string | number | boolean>;
}

interface UpdateDiagramInput {
    id: string;
    source: string;
    diagramType: DiagramType;
    outputFormat: OutputFormat;
    options: Record<string, string | number | boolean>;
}

interface UseSavedDiagramsReturn {
    diagrams: SavedDiagram[];
    isLoading: boolean;
    isAuthenticated: boolean;
    createDiagram: (diagram: SaveDiagramInput) => Promise<SavedDiagram>;
    updateDiagram: (diagram: UpdateDiagramInput) => Promise<SavedDiagram>;
    saveCurrentDiagram: (diagram: SaveDiagramInput, currentSavedDiagramId?: string | null) => Promise<SavedDiagram>;
    loadDiagram: (id: string) => Promise<SavedDiagram | undefined>;
    deleteDiagram: (id: string) => Promise<void>;
    renameDiagram: (id: string, title: string) => Promise<void>;
    listDiagrams: () => Promise<SavedDiagram[]>;
}

function toDiagramId(id: string): DiagramId {
    return id as DiagramId;
}

export function mapSavedDiagram(diagram: SavedDiagramDocument): SavedDiagram {
    return {
        id: diagram._id,
        title: diagram.title,
        name: diagram.title,
        source: diagram.source,
        diagramType: diagram.diagramType,
        outputFormat: diagram.outputFormat,
        options: diagram.options,
        createdAt: diagram.createdAt,
        updatedAt: diagram.updatedAt,
        timestamp: diagram.updatedAt,
    };
}

type SavedDiagramDocument = Doc<'diagrams'>;

export function assertAuthenticated(isAuthenticated: boolean): void {
    if (!isAuthenticated) {
        throw new Error('Login required to save diagrams');
    }
}

export function useSavedDiagrams(): UseSavedDiagramsReturn {
    const { isAuthenticated, isLoading: authIsLoading } = useConvexAuth();
    const convex = useConvex();
    const queryArgs = isAuthenticated ? {} : 'skip';
    const diagrams = useQuery(api.diagrams.listMyDiagrams, queryArgs);
    const createDiagramMutation = useMutation(api.diagrams.createDiagram);
    const updateDiagramMutation = useMutation(api.diagrams.updateDiagram);
    const renameDiagramMutation = useMutation(api.diagrams.renameDiagram);
    const deleteDiagramMutation = useMutation(api.diagrams.deleteDiagram);

    const savedDiagrams = useMemo(() => {
        return (diagrams ?? []).map(mapSavedDiagram);
    }, [diagrams]);

    const createDiagram = useCallback(async (diagram: SaveDiagramInput): Promise<SavedDiagram> => {
        assertAuthenticated(isAuthenticated);
        const id = await createDiagramMutation({
            title: diagram.title?.trim() || makeDefaultDiagramTitle(diagram.diagramType),
            source: diagram.source,
            diagramType: diagram.diagramType,
            outputFormat: diagram.outputFormat,
            options: diagram.options,
        });
        return {
            id,
            title: diagram.title?.trim() || makeDefaultDiagramTitle(diagram.diagramType),
            name: diagram.title?.trim() || makeDefaultDiagramTitle(diagram.diagramType),
            source: diagram.source,
            diagramType: diagram.diagramType,
            outputFormat: diagram.outputFormat,
            options: diagram.options,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            timestamp: Date.now(),
        };
    }, [createDiagramMutation, isAuthenticated]);

    const updateDiagram = useCallback(async (diagram: UpdateDiagramInput): Promise<SavedDiagram> => {
        assertAuthenticated(isAuthenticated);
        const updated = await updateDiagramMutation({
            id: toDiagramId(diagram.id),
            source: diagram.source,
            diagramType: diagram.diagramType,
            outputFormat: diagram.outputFormat,
            options: diagram.options,
        });
        if (!updated) {
            throw new Error('Diagram not found');
        }
        return mapSavedDiagram(updated);
    }, [isAuthenticated, updateDiagramMutation]);

    const saveCurrentDiagram = useCallback(async (
        diagram: SaveDiagramInput,
        currentSavedDiagramId?: string | null,
    ): Promise<SavedDiagram> => {
        if (currentSavedDiagramId) {
            return updateDiagram({ id: currentSavedDiagramId, ...diagram });
        }
        return createDiagram(diagram);
    }, [createDiagram, updateDiagram]);

    const loadDiagram = useCallback(async (id: string): Promise<SavedDiagram | undefined> => {
        assertAuthenticated(isAuthenticated);
        const diagram = await convex.query(api.diagrams.getMyDiagram, { id: toDiagramId(id) });
        return diagram ? mapSavedDiagram(diagram) : undefined;
    }, [convex, isAuthenticated]);

    const deleteDiagram = useCallback(async (id: string): Promise<void> => {
        assertAuthenticated(isAuthenticated);
        await deleteDiagramMutation({ id: toDiagramId(id) });
    }, [deleteDiagramMutation, isAuthenticated]);

    const renameDiagram = useCallback(async (id: string, title: string): Promise<void> => {
        assertAuthenticated(isAuthenticated);
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            throw new Error('Title cannot be empty');
        }
        await renameDiagramMutation({ id: toDiagramId(id), title: trimmedTitle });
    }, [isAuthenticated, renameDiagramMutation]);

    const listDiagrams = useCallback(async (): Promise<SavedDiagram[]> => {
        assertAuthenticated(isAuthenticated);
        return savedDiagrams;
    }, [isAuthenticated, savedDiagrams]);

    return useMemo(() => ({
        diagrams: savedDiagrams,
        isLoading: authIsLoading || (isAuthenticated && diagrams === undefined),
        isAuthenticated,
        createDiagram,
        updateDiagram,
        saveCurrentDiagram,
        loadDiagram,
        deleteDiagram,
        renameDiagram,
        listDiagrams,
    }), [
        authIsLoading,
        createDiagram,
        deleteDiagram,
        diagrams,
        isAuthenticated,
        listDiagrams,
        loadDiagram,
        renameDiagram,
        saveCurrentDiagram,
        savedDiagrams,
        updateDiagram,
    ]);
}

export function makeDefaultDiagramTitle(diagramType: DiagramType): string {
    return `${diagramType} diagram ${new Date().toLocaleString()}`;
}

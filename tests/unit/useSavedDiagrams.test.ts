import { describe, expect, it, vi } from 'vitest';
import { assertAuthenticated, makeDefaultDiagramTitle, mapSavedDiagram } from '@/hooks/useSavedDiagrams';
import type { Doc } from '../../convex/_generated/dataModel';

describe('useSavedDiagrams helpers', () => {
    it('maps Convex diagram documents to SavedDiagram compatibility shape', () => {
        const document = {
            _id: 'diagram-id',
            _creationTime: 100,
            title: 'Architecture draft',
            source: '@startuml\nAlice -> Bob\n@enduml',
            diagramType: 'plantuml',
            outputFormat: 'svg',
            options: { handwritten: false, scale: 1, theme: 'plain' },
            ownerTokenIdentifier: 'user-token',
            createdAt: 1_700_000_000_000,
            updatedAt: 1_700_000_001_000,
        } as unknown as Doc<'diagrams'>;

        expect(mapSavedDiagram(document)).toEqual({
            id: 'diagram-id',
            title: 'Architecture draft',
            name: 'Architecture draft',
            source: '@startuml\nAlice -> Bob\n@enduml',
            diagramType: 'plantuml',
            outputFormat: 'svg',
            options: { handwritten: false, scale: 1, theme: 'plain' },
            createdAt: 1_700_000_000_000,
            updatedAt: 1_700_000_001_000,
            timestamp: 1_700_000_001_000,
        });
    });

    it('throws the local auth guard message before storage mutations run for guests', () => {
        expect(() => assertAuthenticated(false)).toThrow('Login required to save diagrams');
        expect(() => assertAuthenticated(true)).not.toThrow();
    });

    it('creates a deterministic default title from diagram type and current time', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-25T12:34:56Z'));

        expect(makeDefaultDiagramTitle('mermaid')).toContain('mermaid diagram');
        expect(makeDefaultDiagramTitle('plantuml')).toContain('plantuml diagram');

        vi.useRealTimers();
    });
});

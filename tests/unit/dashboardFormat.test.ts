import { describe, expect, it } from 'vitest';
import { formatDiagramTimestamp } from '@/components/dashboard/dashboardFormat';

describe('formatDiagramTimestamp', () => {
    it('formats timestamps in deterministic UTC', () => {
        expect(formatDiagramTimestamp(Date.UTC(2026, 3, 25, 12, 34, 0))).toBe('2026-04-25 12:34 UTC');
    });

    it('returns Unknown for invalid timestamps', () => {
        expect(formatDiagramTimestamp(Number.NaN)).toBe('Unknown');
    });
});

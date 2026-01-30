import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants';
import type { Snapshot, Competitor } from '../types';

const MAX_AUTO_SNAPSHOTS_PER_COMPETITOR = 50;

/**
 * Generate a unique ID for snapshots
 * Uses timestamp + random string pattern matching existing codebase
 */
const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export interface UseSnapshotsReturn {
    snapshots: Snapshot[];
    getSnapshots: (competitorId: string) => Snapshot[];
    addSnapshot: (competitorId: string, competitor: Competitor, type: 'auto' | 'milestone', label?: string) => Snapshot;
    deleteSnapshot: (snapshotId: string) => void;
    createSnapshotFromCompetitor: (competitor: Competitor, type: 'auto' | 'milestone', label?: string) => Snapshot;
}

export const useSnapshots = (): UseSnapshotsReturn => {
    const [snapshots, setSnapshots] = useLocalStorage<Snapshot[]>(STORAGE_KEYS.SNAPSHOTS, []);

    /**
     * Get all snapshots for a specific competitor, sorted by timestamp descending
     */
    const getSnapshots = useCallback((competitorId: string): Snapshot[] => {
        return snapshots
            .filter(s => s.competitorId === competitorId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [snapshots]);

    /**
     * Auto-prune snapshots to keep only the most recent auto-snapshots per competitor
     * Milestones are never pruned
     */
    const pruneSnapshots = useCallback((allSnapshots: Snapshot[], competitorId: string): Snapshot[] => {
        const competitorSnapshots = allSnapshots.filter(s => s.competitorId === competitorId);
        const otherSnapshots = allSnapshots.filter(s => s.competitorId !== competitorId);

        // Separate milestones (never pruned) from auto-snapshots
        const milestones = competitorSnapshots.filter(s => s.type === 'milestone');
        const autoSnapshots = competitorSnapshots
            .filter(s => s.type === 'auto')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Keep only the most recent auto-snapshots
        const prunedAutoSnapshots = autoSnapshots.slice(0, MAX_AUTO_SNAPSHOTS_PER_COMPETITOR);

        return [...otherSnapshots, ...milestones, ...prunedAutoSnapshots];
    }, []);

    /**
     * Create a snapshot object from a competitor (helper function)
     */
    const createSnapshotFromCompetitor = useCallback((
        competitor: Competitor,
        type: 'auto' | 'milestone',
        label?: string
    ): Snapshot => {
        return {
            id: generateId(),
            competitorId: competitor.id,
            timestamp: new Date().toISOString(),
            type,
            label,
            data: { ...competitor }, // Deep copy the competitor data
        };
    }, []);

    /**
     * Add a new snapshot for a competitor
     */
    const addSnapshot = useCallback((
        competitorId: string,
        competitor: Competitor,
        type: 'auto' | 'milestone',
        label?: string
    ): Snapshot => {
        const snapshot = createSnapshotFromCompetitor(competitor, type, label);

        const newSnapshots = [...snapshots, snapshot];
        const prunedSnapshots = pruneSnapshots(newSnapshots, competitorId);

        setSnapshots(prunedSnapshots);

        return snapshot;
    }, [snapshots, setSnapshots, createSnapshotFromCompetitor, pruneSnapshots]);

    /**
     * Delete a specific snapshot by ID
     */
    const deleteSnapshot = useCallback((snapshotId: string): void => {
        setSnapshots(snapshots.filter(s => s.id !== snapshotId));
    }, [snapshots, setSnapshots]);

    return useMemo(() => ({
        snapshots,
        getSnapshots,
        addSnapshot,
        deleteSnapshot,
        createSnapshotFromCompetitor,
    }), [snapshots, getSnapshots, addSnapshot, deleteSnapshot, createSnapshotFromCompetitor]);
};

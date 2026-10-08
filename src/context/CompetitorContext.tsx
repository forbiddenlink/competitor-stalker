import React, { createContext, type ReactNode, useEffect, useRef, useCallback } from 'react';
import type { Competitor, BusinessProfile, FeatureStatus, Snapshot } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSnapshots } from '../hooks/useSnapshots';
import { normalizeCompetitors, normalizeProfile } from '../utils/validation';
import { SEED_COMPETITORS, SEED_USER_PROFILE } from '../data/seedData';

interface CompetitorContextType {
    competitors: Competitor[];
    userProfile: BusinessProfile;
    addCompetitor: (competitor: Competitor) => void;
    updateCompetitor: (id: string, updates: Partial<Competitor>) => void;
    removeCompetitor: (id: string) => void;
    updateUserProfile: (updates: Partial<BusinessProfile>) => void;
    resetToSeedData: () => void;
    clearAllData: () => void;
    importData: (competitors: Competitor[], userProfile: BusinessProfile, snapshots?: Snapshot[]) => void;
    // Snapshot functionality
    storageError?: string | null;
    rawStorageRecovery?: Record<string, string>;
    snapshots: Snapshot[];
    getSnapshots: (competitorId: string) => Snapshot[];
    addMilestone: (competitorId: string, label: string) => Snapshot | null;
    deleteSnapshot: (snapshotId: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CompetitorContext = createContext<CompetitorContextType | undefined>(undefined);

const DEFAULT_PROFILE: BusinessProfile = {
    name: '',
    positionX: 50,
    positionY: 50,
    features: {},
    pricingModels: [],
};

export const CompetitorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [competitors, setCompetitors, competitorStorageError, replaceCompetitors, rawCompetitors] = useLocalStorage<Competitor[]>('stalker_competitors', [], normalizeCompetitors);
    const [userProfile, setUserProfile, profileStorageError, replaceProfile, rawProfile] = useLocalStorage<BusinessProfile>('stalker_profile', DEFAULT_PROFILE, normalizeProfile);
    const { snapshots, getSnapshots, addSnapshot, deleteSnapshot, clearSnapshots, replaceSnapshots, storageError: snapshotStorageError, rawStorage: rawSnapshots } = useSnapshots();

    // Migration: Fix legacy array features (runs once on mount)
    const hasMigrated = useRef(false);
    const hasSeeded = useRef((() => {
        try {
            return window.localStorage.getItem('stalker_competitors') !== null || window.localStorage.getItem('stalker_profile') !== null;
        } catch {
            return true;
        }
    })());

    useEffect(() => {
        if (hasMigrated.current) return;
        if (Array.isArray(userProfile.features)) {
            hasMigrated.current = true;
            const newFeatures: Record<string, FeatureStatus> = {};
            (userProfile.features as unknown as string[]).forEach((f: string) => {
                newFeatures[f] = 'Have';
            });
            setUserProfile({ ...userProfile, features: newFeatures });
        }
    }, [userProfile, setUserProfile]);

    // Auto-seed on first load if no data exists
    useEffect(() => {
        if (hasSeeded.current) return;
        hasSeeded.current = true;
        try {
            if (localStorage.getItem('stalker_competitors') !== null ||
                localStorage.getItem('stalker_profile') !== null) return;
        } catch {
            // Storage may be unavailable; keep the in-memory first-load behavior.
        }
        if (competitors.length === 0 && !userProfile.name) {
            hasSeeded.current = true;
            setCompetitors(SEED_COMPETITORS);
            setUserProfile(SEED_USER_PROFILE);
        }
    }, [competitors.length, userProfile.name, setCompetitors, setUserProfile]);

    const addCompetitor = (competitor: Competitor) => {
        const now = new Date().toISOString();
        setCompetitors(current => [...current, { ...competitor, createdAt: now, updatedAt: now }]);
    };

    const updateCompetitor = useCallback((id: string, updates: Partial<Competitor>) => {
        const now = new Date().toISOString();
        setCompetitors(current => {
            const previous = current.find(c => c.id === id);
            if (!previous) return current;
            addSnapshot(id, previous, 'auto');
            return current.map(c => c.id === id ? { ...c, ...updates, updatedAt: now } : c);
        });
    }, [setCompetitors, addSnapshot]);

    const removeCompetitor = (id: string) => {
        setCompetitors(current => current.filter(c => c.id !== id));
    };

    const updateUserProfile = (updates: Partial<BusinessProfile>) => {
        setUserProfile(current => ({ ...current, ...updates }));
    };

    const resetToSeedData = () => {
        replaceSnapshots([]);
        replaceCompetitors(SEED_COMPETITORS);
        replaceProfile(SEED_USER_PROFILE);
    };

    const clearAllData = () => {
        clearSnapshots();
        replaceCompetitors([]);
        replaceProfile(DEFAULT_PROFILE);
    };

    const importData = (importedCompetitors: Competitor[], importedProfile: BusinessProfile, importedSnapshots?: Snapshot[]) => {
        if (importedSnapshots !== undefined) replaceSnapshots(importedSnapshots);
        replaceCompetitors(importedCompetitors);
        replaceProfile(importedProfile);
    };

    /**
     * Add a milestone snapshot for a competitor with a user-provided label
     */
    const addMilestone = useCallback((competitorId: string, label: string): Snapshot | null => {
        const competitor = competitors.find(c => c.id === competitorId);
        if (!competitor) return null;
        return addSnapshot(competitorId, competitor, 'milestone', label);
    }, [competitors, addSnapshot]);

    return (
        <CompetitorContext.Provider value={{
            competitors,
            userProfile,
            addCompetitor,
            updateCompetitor,
            removeCompetitor,
            updateUserProfile,
            resetToSeedData,
            clearAllData,
            importData,
            // Snapshot functionality
            storageError: competitorStorageError || profileStorageError || snapshotStorageError,
            rawStorageRecovery: {
                ...(rawCompetitors !== null ? { stalker_competitors: rawCompetitors } : {}),
                ...(rawProfile !== null ? { stalker_profile: rawProfile } : {}),
                ...(rawSnapshots !== null ? { stalker_snapshots: rawSnapshots } : {}),
            },
            snapshots,
            getSnapshots,
            addMilestone,
            deleteSnapshot,
        }}>
            {children}
        </CompetitorContext.Provider>
    );
};

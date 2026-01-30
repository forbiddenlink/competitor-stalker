import React, { createContext, type ReactNode, useEffect, useRef, useCallback } from 'react';
import type { Competitor, BusinessProfile, FeatureStatus, Snapshot } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSnapshots } from '../hooks/useSnapshots';
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
    // Snapshot functionality
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
    const [competitors, setCompetitors] = useLocalStorage<Competitor[]>('stalker_competitors', []);
    const [userProfile, setUserProfile] = useLocalStorage<BusinessProfile>('stalker_profile', DEFAULT_PROFILE);
    const { snapshots, getSnapshots, addSnapshot, deleteSnapshot } = useSnapshots();

    // Migration: Fix legacy array features (runs once on mount)
    const hasMigrated = useRef(false);
    const hasSeeded = useRef(false);

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
        if (competitors.length === 0 && !userProfile.name) {
            hasSeeded.current = true;
            setCompetitors(SEED_COMPETITORS);
            setUserProfile(SEED_USER_PROFILE);
        }
    }, [competitors.length, userProfile.name, setCompetitors, setUserProfile]);

    const addCompetitor = (competitor: Competitor) => {
        const now = new Date().toISOString();
        setCompetitors([...competitors, { ...competitor, createdAt: now, updatedAt: now }]);
    };

    const updateCompetitor = useCallback((id: string, updates: Partial<Competitor>) => {
        // Find the current competitor state before updating
        const currentCompetitor = competitors.find(c => c.id === id);

        // Create auto-snapshot of the "before" state if competitor exists
        if (currentCompetitor) {
            addSnapshot(id, currentCompetitor, 'auto');
        }

        const now = new Date().toISOString();
        setCompetitors(competitors.map(c => c.id === id ? { ...c, ...updates, updatedAt: now } : c));
    }, [competitors, setCompetitors, addSnapshot]);

    const removeCompetitor = (id: string) => {
        setCompetitors(competitors.filter(c => c.id !== id));
    };

    const updateUserProfile = (updates: Partial<BusinessProfile>) => {
        setUserProfile({ ...userProfile, ...updates });
    };

    const resetToSeedData = () => {
        setCompetitors(SEED_COMPETITORS);
        setUserProfile(SEED_USER_PROFILE);
    };

    const clearAllData = () => {
        setCompetitors([]);
        setUserProfile(DEFAULT_PROFILE);
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
            // Snapshot functionality
            snapshots,
            getSnapshots,
            addMilestone,
            deleteSnapshot,
        }}>
            {children}
        </CompetitorContext.Provider>
    );
};

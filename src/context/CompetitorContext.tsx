import React, { createContext, type ReactNode, useEffect, useRef } from 'react';
import type { Competitor, BusinessProfile, FeatureStatus } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CompetitorContextType {
    competitors: Competitor[];
    userProfile: BusinessProfile;
    addCompetitor: (competitor: Competitor) => void;
    updateCompetitor: (id: string, updates: Partial<Competitor>) => void;
    removeCompetitor: (id: string) => void;
    updateUserProfile: (updates: Partial<BusinessProfile>) => void;
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

    // Migration: Fix legacy array features (runs once on mount)
    const hasMigrated = useRef(false);
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

    const addCompetitor = (competitor: Competitor) => {
        setCompetitors([...competitors, competitor]);
    };

    const updateCompetitor = (id: string, updates: Partial<Competitor>) => {
        setCompetitors(competitors.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const removeCompetitor = (id: string) => {
        setCompetitors(competitors.filter(c => c.id !== id));
    };

    const updateUserProfile = (updates: Partial<BusinessProfile>) => {
        setUserProfile({ ...userProfile, ...updates });
    };

    return (
        <CompetitorContext.Provider value={{
            competitors,
            userProfile,
            addCompetitor,
            updateCompetitor,
            removeCompetitor,
            updateUserProfile
        }}>
            {children}
        </CompetitorContext.Provider>
    );
};

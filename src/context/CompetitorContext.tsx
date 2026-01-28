import React, { createContext, type ReactNode, useEffect } from 'react';
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

export const CompetitorContext = createContext<CompetitorContextType | undefined>(undefined);

const DEFAULT_PROFILE: BusinessProfile = {
    name: 'My Startup',
    positionX: 50,
    positionY: 50,
    features: { 'AI Analytics': 'Have', 'Real-time Sync': 'Have' },
    pricingModels: [],
};

export const CompetitorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [competitors, setCompetitors] = useLocalStorage<Competitor[]>('stalker_competitors', []);
    const [userProfile, setUserProfile] = useLocalStorage<BusinessProfile>('stalker_profile', DEFAULT_PROFILE);

    // Migration: Fix legacy array features
    useEffect(() => {
        if (Array.isArray(userProfile.features)) {
            const newFeatures: Record<string, FeatureStatus> = {};
            (userProfile.features as any[]).forEach((f: string) => {
                newFeatures[f] = 'Have';
            });
            setUserProfile({ ...userProfile, features: newFeatures });
        }
    }, []);

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

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCompetitors } from '../useCompetitors';
import { CompetitorProvider } from '../../context/CompetitorContext';
import type { Competitor } from '../../types';

const createTestCompetitor = (overrides: Partial<Competitor> = {}): Competitor => ({
    id: crypto.randomUUID(),
    name: 'Test Competitor',
    website: 'https://test.com',
    threatLevel: 'Medium',
    features: {},
    pricingModels: [],
    notes: '',
    ...overrides,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CompetitorProvider>{children}</CompetitorProvider>
);

// Helper to set up localStorage with a user profile name to prevent auto-seeding
const preventAutoSeed = () => {
    localStorage.setItem('stalker_profile', JSON.stringify({
        name: 'Test Company',
        positionX: 50,
        positionY: 50,
        features: {},
        pricingModels: [],
    }));
    localStorage.setItem('stalker_competitors', JSON.stringify([]));
};

describe('useCompetitors', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('throws error when used outside CompetitorProvider', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useCompetitors());
        }).toThrow('useCompetitors must be used within a CompetitorProvider');

        consoleSpy.mockRestore();
    });

    it('auto-seeds data when localStorage is empty', () => {
        const { result } = renderHook(() => useCompetitors(), { wrapper });
        // When localStorage is empty, it auto-seeds with sample data
        expect(result.current.competitors.length).toBeGreaterThan(0);
        expect(result.current.userProfile.name).toBe('Railway');
    });

    it('returns empty competitors array when seeding is prevented', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });
        expect(result.current.competitors).toEqual([]);
    });

    it('returns stored user profile when seeding is prevented', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });

        expect(result.current.userProfile).toEqual({
            name: 'Test Company',
            positionX: 50,
            positionY: 50,
            features: {},
            pricingModels: [],
        });
    });

    it('adds a competitor', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });
        const newCompetitor = createTestCompetitor({ name: 'New Corp' });

        act(() => {
            result.current.addCompetitor(newCompetitor);
        });

        expect(result.current.competitors).toHaveLength(1);
        expect(result.current.competitors[0].name).toBe('New Corp');
    });

    it('updates a competitor', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });
        const competitor = createTestCompetitor({ name: 'Original Name' });

        act(() => {
            result.current.addCompetitor(competitor);
        });

        act(() => {
            result.current.updateCompetitor(competitor.id, { name: 'Updated Name' });
        });

        expect(result.current.competitors[0].name).toBe('Updated Name');
    });

    it('removes a competitor', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });
        const competitor = createTestCompetitor();

        act(() => {
            result.current.addCompetitor(competitor);
        });

        expect(result.current.competitors).toHaveLength(1);

        act(() => {
            result.current.removeCompetitor(competitor.id);
        });

        expect(result.current.competitors).toHaveLength(0);
    });

    it('updates user profile', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });

        act(() => {
            result.current.updateUserProfile({ name: 'My Company', positionX: 75 });
        });

        expect(result.current.userProfile.name).toBe('My Company');
        expect(result.current.userProfile.positionX).toBe(75);
        expect(result.current.userProfile.positionY).toBe(50); // unchanged
    });

    it('handles multiple competitors', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });

        act(() => {
            result.current.addCompetitor(createTestCompetitor({ name: 'Comp 1' }));
        });
        act(() => {
            result.current.addCompetitor(createTestCompetitor({ name: 'Comp 2' }));
        });
        act(() => {
            result.current.addCompetitor(createTestCompetitor({ name: 'Comp 3' }));
        });

        expect(result.current.competitors).toHaveLength(3);
    });

    it('only updates the targeted competitor', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });
        const comp1 = createTestCompetitor({ name: 'Comp 1' });
        const comp2 = createTestCompetitor({ name: 'Comp 2' });

        act(() => {
            result.current.addCompetitor(comp1);
        });
        act(() => {
            result.current.addCompetitor(comp2);
        });

        act(() => {
            result.current.updateCompetitor(comp1.id, { threatLevel: 'High' });
        });

        const updated1 = result.current.competitors.find(c => c.id === comp1.id);
        const updated2 = result.current.competitors.find(c => c.id === comp2.id);

        expect(updated1?.threatLevel).toBe('High');
        expect(updated2?.threatLevel).toBe('Medium'); // unchanged
    });

    it('resets to seed data', () => {
        preventAutoSeed();
        const { result } = renderHook(() => useCompetitors(), { wrapper });

        expect(result.current.competitors).toHaveLength(0);

        act(() => {
            result.current.resetToSeedData();
        });

        expect(result.current.competitors.length).toBeGreaterThan(0);
        expect(result.current.userProfile.name).toBe('Railway');
    });

    it('clears all data', () => {
        const { result } = renderHook(() => useCompetitors(), { wrapper });

        // Should have seed data initially
        expect(result.current.competitors.length).toBeGreaterThan(0);

        act(() => {
            result.current.clearAllData();
        });

        expect(result.current.competitors).toHaveLength(0);
        expect(result.current.userProfile.name).toBe('');
    });
});

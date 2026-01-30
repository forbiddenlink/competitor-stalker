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

    describe('importData', () => {
        it('imports competitors and user profile', () => {
            preventAutoSeed();
            const { result } = renderHook(() => useCompetitors(), { wrapper });

            const importedCompetitors = [
                createTestCompetitor({ name: 'Imported 1' }),
                createTestCompetitor({ name: 'Imported 2' }),
            ];
            const importedProfile = {
                name: 'Imported Company',
                positionX: 80,
                positionY: 20,
                features: {},
                pricingModels: [],
            };

            act(() => {
                result.current.importData(importedCompetitors, importedProfile);
            });

            expect(result.current.competitors).toHaveLength(2);
            expect(result.current.competitors[0].name).toBe('Imported 1');
            expect(result.current.competitors[1].name).toBe('Imported 2');
            expect(result.current.userProfile.name).toBe('Imported Company');
            expect(result.current.userProfile.positionX).toBe(80);
        });

        it('replaces existing data on import', () => {
            preventAutoSeed();
            const { result } = renderHook(() => useCompetitors(), { wrapper });

            // Add existing data
            act(() => {
                result.current.addCompetitor(createTestCompetitor({ name: 'Existing' }));
            });
            expect(result.current.competitors).toHaveLength(1);

            // Import new data
            const importedCompetitors = [createTestCompetitor({ name: 'Imported' })];
            const importedProfile = {
                name: 'New Profile',
                positionX: 50,
                positionY: 50,
                features: {},
                pricingModels: [],
            };

            act(() => {
                result.current.importData(importedCompetitors, importedProfile);
            });

            expect(result.current.competitors).toHaveLength(1);
            expect(result.current.competitors[0].name).toBe('Imported');
        });
    });

    describe('snapshot functionality', () => {
        it('creates auto-snapshot when updating competitor', () => {
            preventAutoSeed();
            const { result } = renderHook(() => useCompetitors(), { wrapper });
            const competitor = createTestCompetitor({ name: 'Test Corp' });

            act(() => {
                result.current.addCompetitor(competitor);
            });

            // Update competitor to trigger auto-snapshot
            act(() => {
                result.current.updateCompetitor(competitor.id, { threatLevel: 'High' });
            });

            const snapshots = result.current.getSnapshots(competitor.id);
            expect(snapshots.length).toBeGreaterThanOrEqual(1);
            expect(snapshots[0].type).toBe('auto');
            expect(snapshots[0].data.name).toBe('Test Corp');
        });

        it('adds milestone snapshot', () => {
            preventAutoSeed();
            const { result } = renderHook(() => useCompetitors(), { wrapper });
            const competitor = createTestCompetitor({ name: 'Test Corp' });

            act(() => {
                result.current.addCompetitor(competitor);
            });

            act(() => {
                result.current.addMilestone(competitor.id, 'Q1 Update');
            });

            const snapshots = result.current.getSnapshots(competitor.id);
            const milestone = snapshots.find(s => s.type === 'milestone');
            expect(milestone).toBeDefined();
            expect(milestone?.label).toBe('Q1 Update');
        });

        it('returns null when adding milestone for non-existent competitor', () => {
            preventAutoSeed();
            const { result } = renderHook(() => useCompetitors(), { wrapper });

            let milestoneResult: ReturnType<typeof result.current.addMilestone>;
            act(() => {
                milestoneResult = result.current.addMilestone('non-existent-id', 'Test');
            });

            expect(milestoneResult!).toBeNull();
        });

        it('deletes snapshot', () => {
            preventAutoSeed();
            const { result } = renderHook(() => useCompetitors(), { wrapper });
            const competitor = createTestCompetitor({ name: 'Test Corp' });

            act(() => {
                result.current.addCompetitor(competitor);
            });

            // Create a milestone
            let snapshot: ReturnType<typeof result.current.addMilestone>;
            act(() => {
                snapshot = result.current.addMilestone(competitor.id, 'To Delete');
            });

            expect(result.current.getSnapshots(competitor.id).find(s => s.id === snapshot!?.id)).toBeDefined();

            // Delete it
            act(() => {
                if (snapshot) {
                    result.current.deleteSnapshot(snapshot.id);
                }
            });

            expect(result.current.getSnapshots(competitor.id).find(s => s.id === snapshot!?.id)).toBeUndefined();
        });
    });
});

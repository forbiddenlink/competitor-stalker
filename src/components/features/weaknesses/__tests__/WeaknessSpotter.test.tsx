import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeaknessSpotter } from '../WeaknessSpotter';
import { CompetitorContext } from '../../../../context/CompetitorContext';
import type { Competitor, BusinessProfile, Snapshot } from '../../../../types';

const mockCompetitors: Competitor[] = [
    {
        id: 'comp-1',
        name: 'Competitor One',
        website: 'https://one.com',
        threatLevel: 'High',
        features: {},
        pricingModels: [],
        notes: '',
        weaknesses: [
            { id: 'w1', text: 'Slow support', severity: 'Medium', source: 'G2', date: '2024-01-01' }
        ],
    },
    {
        id: 'comp-2',
        name: 'Competitor Two',
        website: 'https://two.com',
        threatLevel: 'Low',
        features: {},
        pricingModels: [],
        notes: '',
        weaknesses: [],
    },
];

const mockUserProfile: BusinessProfile = {
    name: 'My Company',
    positionX: 50,
    positionY: 50,
    features: {},
    pricingModels: [],
};

const createMockContext = (overrides = {}) => ({
    competitors: mockCompetitors,
    userProfile: mockUserProfile,
    addCompetitor: vi.fn(),
    updateCompetitor: vi.fn(),
    removeCompetitor: vi.fn(),
    updateUserProfile: vi.fn(),
    resetToSeedData: vi.fn(),
    clearAllData: vi.fn(),
    importData: vi.fn(),
    snapshots: [] as Snapshot[],
    getSnapshots: vi.fn(() => []),
    addMilestone: vi.fn(),
    deleteSnapshot: vi.fn(),
    ...overrides,
});

const renderWithContext = (contextValue = createMockContext()) => {
    return render(
        <CompetitorContext.Provider value={contextValue}>
            <WeaknessSpotter />
        </CompetitorContext.Provider>
    );
};

describe('WeaknessSpotter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initial state selection', () => {
        it('auto-selects first competitor via derived state (no setState during render)', async () => {
            // This test verifies the fix: selection is derived during render,
            // not set via setState. The component uses effectiveSelectedId which
            // falls back to first competitor when selectedCompetitorId is empty.

            let renderCount = 0;
            const originalError = console.error;
            const errors: string[] = [];
            console.error = (...args: unknown[]) => {
                errors.push(String(args[0]));
                originalError.apply(console, args);
            };

            // Create a wrapper to track renders
            const TestWrapper = () => {
                renderCount++;
                return (
                    <CompetitorContext.Provider value={createMockContext()}>
                        <WeaknessSpotter />
                    </CompetitorContext.Provider>
                );
            };

            render(<TestWrapper />);

            // The first competitor should be visually selected immediately (derived state)
            await waitFor(() => {
                expect(screen.getByText('Competitor One')).toBeInTheDocument();
            });

            const firstCompetitorButton = screen.getByRole('button', { name: /Competitor One/i });
            expect(firstCompetitorButton).toHaveClass('border-accent-red');

            // Should have minimal re-renders (just initial render in strict mode = 2)
            expect(renderCount).toBeLessThanOrEqual(2);

            // No React errors about state updates during render
            const stateUpdateErrors = errors.filter(e =>
                e.includes('Cannot update a component') ||
                e.includes('too many re-renders')
            );
            expect(stateUpdateErrors).toHaveLength(0);

            console.error = originalError;
        });

        it('does not auto-select when no competitors exist', () => {
            const context = createMockContext({ competitors: [] });
            renderWithContext(context);

            expect(screen.getByText('No targets loaded.')).toBeInTheDocument();
        });

        it('maintains explicit selection when competitors change', async () => {
            const context = createMockContext();
            const { rerender } = render(
                <CompetitorContext.Provider value={context}>
                    <WeaknessSpotter />
                </CompetitorContext.Provider>
            );

            // Wait for initial auto-selection (first competitor)
            await waitFor(() => {
                const firstButton = screen.getByRole('button', { name: /Competitor One/i });
                expect(firstButton).toHaveClass('border-accent-red');
            });

            // Manually select Competitor Two
            const competitorTwoButton = screen.getByRole('button', { name: /Competitor Two/i });
            await userEvent.click(competitorTwoButton);

            // Verify Competitor Two is now selected
            await waitFor(() => {
                expect(competitorTwoButton).toHaveClass('border-accent-red');
            });

            // Add a new competitor at the beginning
            const newCompetitors: Competitor[] = [
                {
                    id: 'comp-new',
                    name: 'New Competitor',
                    website: 'https://new.com',
                    threatLevel: 'Medium' as const,
                    features: {},
                    pricingModels: [],
                    notes: '',
                    weaknesses: [],
                },
                ...mockCompetitors,
            ];

            const newContext = createMockContext({ competitors: newCompetitors });
            rerender(
                <CompetitorContext.Provider value={newContext}>
                    <WeaknessSpotter />
                </CompetitorContext.Provider>
            );

            // Explicit selection should be maintained (Competitor Two)
            await waitFor(() => {
                const competitorTwoBtn = screen.getByRole('button', { name: /Competitor Two/i });
                expect(competitorTwoBtn).toHaveClass('border-accent-red');
            });
        });
    });

    describe('rendering', () => {
        it('renders the component title', () => {
            renderWithContext();
            expect(screen.getByText('Weakness Spotter')).toBeInTheDocument();
        });

        it('displays all competitors in the sidebar', () => {
            renderWithContext();
            expect(screen.getByText('Competitor One')).toBeInTheDocument();
            expect(screen.getByText('Competitor Two')).toBeInTheDocument();
        });

        it('shows vulnerability count for each competitor', () => {
            renderWithContext();
            expect(screen.getByText('1 Vulnerabilities')).toBeInTheDocument();
            expect(screen.getByText('0 Vulnerabilities')).toBeInTheDocument();
        });
    });

    describe('context unavailable', () => {
        it('shows error message when context is unavailable', () => {
            render(<WeaknessSpotter />);
            expect(screen.getByText('Error: Context unavailable')).toBeInTheDocument();
        });
    });
});

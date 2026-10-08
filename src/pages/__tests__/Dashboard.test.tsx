import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CompetitorContext } from '../../context/CompetitorContext';
import type { Competitor } from '../../types';
import Dashboard from '../Dashboard';

const record = (id: string, overrides: Partial<Competitor> = {}): Competitor => ({
    id, name: id, website: 'https://example.com', threatLevel: 'Low',
    features: {}, pricingModels: [], notes: '', ...overrides,
});

const renderDashboard = (competitors: Competitor[]): void => {
    render(
        <MemoryRouter>
            <CompetitorContext.Provider value={{
                competitors,
                userProfile: { name: 'My business', positionX: 50, positionY: 50, features: {}, pricingModels: [] },
                addCompetitor: vi.fn(), updateCompetitor: vi.fn(), removeCompetitor: vi.fn(),
                updateUserProfile: vi.fn(), resetToSeedData: vi.fn(), clearAllData: vi.fn(),
                importData: vi.fn(), snapshots: [], getSnapshots: () => [],
                addMilestone: () => null, deleteSnapshot: vi.fn(),
            }}>
                <Dashboard />
            </CompetitorContext.Provider>
        </MemoryRouter>,
    );
};

describe('Dashboard research briefing', () => {
    it('gives an empty workspace a real add/import path', () => {
        renderDashboard([]);
        expect(screen.getByRole('link', { name: /add a competitor/i })).toHaveAttribute('href', '/dossier');
        expect(screen.getByRole('link', { name: /import research/i })).toHaveAttribute('href', '/settings');
        expect(screen.getByText('Start your research workspace')).toBeInTheDocument();
    });

    it('prioritizes high threats and links each queued record to its dossier', () => {
        renderDashboard([
            record('Low'),
            record('High & new', { threatLevel: 'High', updatedAt: '2026-10-08', sources: [{ id: 's', url: 'https://example.com', label: 'Source', addedAt: '2026-10-08' }] }),
            record('Medium', { threatLevel: 'Medium' }),
        ]);
        const links = within(screen.getByRole('region', { name: 'Research queue' })).getAllByRole('link');
        expect(links[0]).toHaveTextContent('High & new');
        expect(links[0]).toHaveAttribute('href', '/dossier?competitor=High%20%26%20new');
        expect(links[1]).toHaveTextContent('Medium');
    });

    it('labels missing or invalid saved dates without claiming verification', () => {
        renderDashboard([record('Unknown', { updatedAt: 'invalid' })]);
        expect(screen.getByText('No saved date')).toBeInTheDocument();
        expect(screen.getByText('No linked sources')).toBeInTheDocument();
        expect(screen.getByText(/saved dates reflect local edits/i)).toBeInTheDocument();
        expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
    });
});

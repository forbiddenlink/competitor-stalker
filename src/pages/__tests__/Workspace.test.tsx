import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { CompetitorProvider } from '../../context/CompetitorContext';
import { DossierGrid } from '../../components/features/dossier/DossierGrid';
import { FeatureMatrix } from '../../components/features/matrix/FeatureMatrix';
import { PositioningMap } from '../../components/features/positioning/PositioningMap';
import { MovementAlerts } from '../../components/features/alerts/MovementAlerts';
import { SocialSurveillance } from '../../components/features/social/SocialSurveillance';
import { CounterStrategy } from '../../components/features/strategy/CounterStrategy';
import type { Competitor } from '../../types';
import type { ReactNode } from 'react';

const competitor: Competitor = { id: 'example', name: 'Example', website: 'https://example.com', threatLevel: 'High', features: { API: 'Have' }, pricingModels: [], notes: '', positionX: 100, positionY: 0 };
const renderWorkspace = (node: ReactNode, url = '/'): void => {
    render(<MemoryRouter initialEntries={[url]}><CompetitorProvider>{node}</CompetitorProvider></MemoryRouter>);
};
const stored = (): Competitor => JSON.parse(localStorage.getItem('stalker_competitors') || '[]')[0];

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('stalker_competitors', JSON.stringify([competitor]));
    localStorage.setItem('stalker_profile', JSON.stringify({ name: 'Mine', positionX: 50, positionY: 50, features: { API: 'Have' }, pricingModels: [] }));
});

describe('Research workspace journeys', () => {
    it('opens a selected battlecard from a dossier query', () => {
        renderWorkspace(<DossierGrid />, '/dossier?competitor=example');
        expect(screen.getByRole('heading', { name: 'Example / Battlecard' })).toBeInTheDocument();
        expect(screen.getByText('No strengths recorded.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download brief' })).toBeInTheDocument();
    });

    it('combines dossier filters and can recover from no matches', async () => {
        renderWorkspace(<DossierGrid />);
        await userEvent.type(screen.getByRole('searchbox', { name: 'Find competitors' }), 'missing');
        expect(screen.getByText('No matching competitors')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
        expect(screen.getByRole('button', { name: 'Open battlecard for Example' })).toBeInTheDocument();
    });

    it('focuses the competitor form and restores focus after dismissal', async () => {
        renderWorkspace(<DossierGrid />);
        const trigger = screen.getByRole('button', { name: 'Add Target' });
        await userEvent.click(trigger);
        expect(screen.getByRole('textbox', { name: /company name/i })).toHaveFocus();
        await userEvent.keyboard('{Escape}');
        expect(trigger).toHaveFocus();
    });

    it('cycles matrix status by keyboard and saves history', async () => {
        renderWorkspace(<FeatureMatrix />);
        const cell = screen.getByRole('button', { name: 'Example: API — Have. Change status' });
        cell.focus();
        await userEvent.keyboard('{Enter}');
        expect(stored().features.API).toBe('Better');
        expect(JSON.parse(localStorage.getItem('stalker_snapshots') || '[]')).toHaveLength(1);
    });

    it('clamps keyboard positioning at the edges', async () => {
        renderWorkspace(<PositioningMap />);
        const marker = screen.getByRole('button', { name: /Position Example/i });
        marker.focus();
        await userEvent.keyboard('{ArrowRight}{ArrowUp}');
        expect(stored().positionX).toBe(100);
        expect(stored().positionY).toBe(0);
        expect(JSON.parse(localStorage.getItem('stalker_snapshots') || '[]')).toHaveLength(0);
        await userEvent.keyboard('{ArrowLeft}{ArrowDown}');
        expect(stored().positionX).toBe(99);
        expect(stored().positionY).toBe(1);
    });

    it('derives local feature changes from snapshots and respects categories', async () => {
        localStorage.setItem('stalker_snapshots', JSON.stringify([{ id: 's1', competitorId: 'example', timestamp: '2026-10-01T00:00:00Z', type: 'auto', data: { ...competitor, features: { API: 'DontHave' } } }]));
        renderWorkspace(<MovementAlerts />);
        expect(screen.getByText('Example: features changed')).toBeInTheDocument();
        expect(screen.getByText(/local saved changes, not external monitoring/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Pricing' }));
        expect(screen.queryByText('Example: features changed')).not.toBeInTheDocument();
    });

    it('keeps retained history visible for a removed dossier', () => {
        localStorage.setItem('stalker_competitors', '[]');
        localStorage.setItem('stalker_snapshots', JSON.stringify([
            { id: 's1', competitorId: 'example', timestamp: '2026-10-01T00:00:00Z', type: 'auto', data: { ...competitor, features: { API: 'DontHave' } } },
            { id: 's2', competitorId: 'example', timestamp: '2026-10-05T00:00:00Z', type: 'auto', data: { ...competitor, updatedAt: '2026-10-01T00:00:00Z' } },
        ]));
        renderWorkspace(<MovementAlerts />);
        expect(screen.getByText('Example: features changed')).toBeInTheDocument();
        expect(screen.getByText(/removed dossier/i)).toBeInTheDocument();
    });

    it('offers a real public research link without claiming a connected feed', () => {
        renderWorkspace(<SocialSurveillance />);
        expect(screen.getByRole('link', { name: 'Research Example on X' })).toHaveAttribute('href', 'https://x.com/search?q=Example');
        expect(screen.getByText(/no social feed is connected/i)).toBeInTheDocument();
    });

    it('creates a strategy using labeled controls and preserves the selected target', async () => {
        renderWorkspace(<CounterStrategy />);
        await userEvent.type(screen.getByRole('textbox', { name: 'Strategy title' }), 'Improve onboarding');
        await userEvent.selectOptions(screen.getByRole('combobox', { name: /select target competitor/i }), 'example');
        await userEvent.click(screen.getByRole('button', { name: 'Plan' }));
        expect(stored().strategies?.[0].title).toBe('Improve onboarding');
        expect(stored().strategies?.[0].targetCompetitorId).toBe('example');
    });
});

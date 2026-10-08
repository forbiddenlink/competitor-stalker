import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../context/ToastContext';
import { CompetitorProvider } from '../../context/CompetitorContext';
import SettingsPage from '../SettingsPage';
import { PricingIntel } from '../../components/features/pricing/PricingIntel';
import { WeaknessSpotter } from '../../components/features/weaknesses/WeaknessSpotter';
import { SnapshotDiff } from '../../components/features/history/SnapshotDiff';
import { HistoryDrawer } from '../../components/features/history/HistoryDrawer';
import { SearchCommand } from '../../components/common/SearchCommand';
import type { Competitor, Snapshot } from '../../types';
const competitor: Competitor = { id: 'audit-one', name: 'Audit One', website: 'https://example.com', notes: '', threatLevel: 'Medium', features: {}, pricingModels: [{ name: 'A', price: '$1', description: '' }, { name: 'B', price: '$2', description: '' }, { name: 'C', price: '$3', description: '' }] };
const snapshot: Snapshot = { id: 'before', competitorId: competitor.id, timestamp: '2026-10-01T00:00:00Z', type: 'auto', data: { ...competitor, notes: 'Before' } };
const mount = (node: React.ReactNode) => render(<BrowserRouter><ToastProvider><CompetitorProvider>{node}</CompetitorProvider></ToastProvider></BrowserRouter>);
beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('stalker_competitors', JSON.stringify([competitor]));
    localStorage.setItem('stalker_profile', JSON.stringify({ name: 'Audit Business', positionX: 50, positionY: 50, features: {}, pricingModels: competitor.pricingModels }));
    localStorage.setItem('stalker_snapshots', JSON.stringify([snapshot]));
});
describe('pricing row identity', () => {
    for (const owner of ['Audit Business', 'Audit One']) {
        it(`edits the displayed plan after deleting an earlier ${owner} row`, async () => {
            mount(<PricingIntel />);
            const section = screen.getByRole('heading', { name: owner }).closest('section')!;
            await userEvent.click(within(section).getAllByRole('button', { name: 'Delete pricing plan' })[0]);
            await userEvent.click(within(section).getAllByRole('button', { name: 'Edit pricing plan' })[0]);
            expect(within(section).getByLabelText('Plan Name')).toHaveValue('B');
            await userEvent.click(within(section).getByRole('button', { name: 'Save' }));
            expect(within(section).getByRole('heading', { name: 'B' })).toBeInTheDocument();
        });
        it(`keeps an open ${owner} draft on its own row when an earlier row is deleted`, async () => {
            mount(<PricingIntel />);
            const section = screen.getByRole('heading', { name: owner }).closest('section')!;
            await userEvent.click(within(section).getAllByRole('button', { name: 'Edit pricing plan' })[1]);
            await userEvent.clear(within(section).getByLabelText('Plan Name'));
            await userEvent.type(within(section).getByLabelText('Plan Name'), 'B revised');
            await userEvent.click(within(section).getAllByRole('button', { name: 'Delete pricing plan' })[0]);
            await userEvent.click(within(section).getByRole('button', { name: 'Save' }));
            const data = JSON.parse(localStorage.getItem(owner === 'Audit One' ? 'stalker_competitors' : 'stalker_profile')!);
            const plans = owner === 'Audit One' ? data[0].pricingModels : data.pricingModels;
            expect(plans.map((p: { name: string }) => p.name)).toEqual(['B revised', 'C']);
        });
    }
});
it('rejects blank weakness descriptions and never invents a source', async () => {
    mount(<WeaknessSpotter />);
    await userEvent.type(screen.getByLabelText('Vulnerability Description'), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Log' }));
    expect(JSON.parse(localStorage.getItem('stalker_competitors')!)[0].weaknesses || []).toEqual([]);
    await userEvent.clear(screen.getByLabelText('Vulnerability Description'));
    await userEvent.type(screen.getByLabelText('Vulnerability Description'), '  Requires investigation  ');
    await userEvent.click(screen.getByRole('button', { name: 'Log' }));
    expect(JSON.parse(localStorage.getItem('stalker_competitors')!)[0].weaknesses[0]).toMatchObject({ text: 'Requires investigation', source: 'Unknown' });
});
it('shows source changes rather than claiming content is identical', () => {
    const source = { id: 's', label: 'Evidence', addedAt: '2026-10-01', url: 'https://example.com/old' };
    render(<SnapshotDiff snapshot1={{ ...snapshot, data: { ...competitor, sources: [source] } }} snapshot2={{ ...snapshot, id: 'after', data: { ...competitor, sources: [{ ...source, url: 'https://example.com/new' }] } }} onClose={() => {}} />);
    expect(screen.queryByText('These snapshots have identical data.')).not.toBeInTheDocument();
    expect(screen.getByText(/https:\/\/example.com\/old/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/example.com\/new/)).toBeInTheDocument();
});
it('compares the first saved before-state to current without creating a milestone', async () => {
    mount(<HistoryDrawer competitor={competitor} isOpen onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Compare with current' }));
    expect(screen.getByText('Comparing Snapshots')).toBeInTheDocument();
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('stalker_snapshots')!)).toHaveLength(1);
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
});
it('keeps focus inside history after a milestone save', async () => {
    mount(<HistoryDrawer competitor={competitor} isOpen onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Milestone' }));
    await userEvent.type(screen.getByLabelText('Milestone Label'), 'Audit review');
    await userEvent.click(screen.getByRole('button', { name: 'Save Milestone' }));
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
});
it('normalizes a padded search query', async () => {
    mount(<SearchCommand isOpen onClose={() => {}} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Search competitors and pages' }), ' Audit One ');
    expect(screen.getByRole('button', { name: /Audit One/ })).toBeInTheDocument();
});

it('lets users name their existing business profile without editing a JSON file', async () => {
    const view = mount(<SettingsPage />);
    await userEvent.clear(screen.getByLabelText('Your business name'));
    await userEvent.type(screen.getByLabelText('Your business name'), 'Audit Company');
    expect(JSON.parse(localStorage.getItem('stalker_profile')!).name).toBe('Audit Company');
    view.unmount();
    mount(<SettingsPage />);
    expect(screen.getByLabelText('Your business name')).toHaveValue('Audit Company');
});

it('handles Escape from a focused history control, returning from compare then closing', async () => {
    const close = vi.fn();
    mount(<HistoryDrawer competitor={competitor} isOpen onClose={close} />);
    await userEvent.click(screen.getByRole('button', { name: 'Compare with current' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Add Milestone' })).toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledOnce();
});

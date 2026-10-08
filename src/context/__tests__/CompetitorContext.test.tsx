import React, { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CompetitorProvider } from '../CompetitorContext';
import { useCompetitors } from '../../hooks/useCompetitors';
import type { Competitor } from '../../types';
const competitor: Competitor = { id: 'audit-one', name: 'Audit One', website: '', threatLevel: 'Medium', features: {}, pricingModels: [], notes: '' };
const wrapper = ({ children }: { children: React.ReactNode }) => <StrictMode><CompetitorProvider>{children}</CompetitorProvider></StrictMode>;
beforeEach(() => localStorage.clear());
describe('workspace persistence', () => {
    it('keeps an intentionally cleared workspace empty after remount', () => {
        const first = renderHook(useCompetitors, { wrapper });
        act(() => first.result.current.clearAllData());
        first.unmount();
        const next = renderHook(useCompetitors, { wrapper });
        expect(next.result.current.competitors).toEqual([]);
        expect(next.result.current.userProfile.name).toBe('');
    });
    it('retains synchronous additions and consecutive before-state snapshots exactly once', () => {
        const { result } = renderHook(useCompetitors, { wrapper });
        act(() => result.current.clearAllData());
        act(() => { result.current.addCompetitor(competitor); result.current.addCompetitor({ ...competitor, id: 'audit-two', name: 'Audit Two' }); });
        expect(result.current.competitors).toHaveLength(2);
        act(() => { result.current.updateCompetitor(competitor.id, { notes: 'first' }); result.current.updateCompetitor(competitor.id, { oneLiner: 'second' }); });
        expect(result.current.competitors[0]).toMatchObject({ notes: 'first', oneLiner: 'second' });
        expect(result.current.snapshots).toHaveLength(2);
        expect(result.current.snapshots.map(s => s.data.notes)).toEqual(expect.arrayContaining(['', 'first']));
    });
});

it('restores supplied backup history and clears it only on explicit clear/reset', () => {
    const { result } = renderHook(useCompetitors, { wrapper });
    const history = [{ id: 'saved-before', competitorId: competitor.id, timestamp: '2026-10-08T00:00:00Z', type: 'auto' as const, data: competitor }];
    act(() => result.current.importData([competitor], { name: 'Audit', positionX: 50, positionY: 50, features: {}, pricingModels: [] }, history));
    expect(result.current.snapshots).toHaveLength(1);
    act(() => result.current.clearAllData());
    expect(result.current.snapshots).toEqual([]);
    expect(JSON.parse(localStorage.getItem('stalker_snapshots')!)).toEqual([]);
    act(() => result.current.importData([competitor], { name: 'Audit', positionX: 50, positionY: 50, features: {}, pricingModels: [] }, history));
    act(() => result.current.resetToSeedData());
    expect(result.current.snapshots).toEqual([]);
});

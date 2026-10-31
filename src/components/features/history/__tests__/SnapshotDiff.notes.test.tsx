import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SnapshotDiff } from '../SnapshotDiff';
import type { Competitor, Snapshot } from '../../../../types';

const base: Competitor = { id: 'c', name: 'C', website: 'https://example.com', notes: '', threatLevel: 'Medium', features: {}, pricingModels: [] };
const snap = (id: string, notes: string): Snapshot => ({ id, competitorId: 'c', timestamp: '2026-10-01T00:00:00Z', type: 'auto', data: { ...base, notes } });
const mount = (a: string, b: string) => render(<SnapshotDiff snapshot1={snap('a', a)} snapshot2={snap('b', b)} onClose={() => {}} />);

describe('notes word diff', () => {
    it('shows a change after character 50 with ins and del elements', () => {
        const head = 'word '.repeat(20);
        const { container } = mount(`${head}alpha`, `${head}beta`);
        expect(container.querySelector('del')?.textContent).toBe('Removed: alpha');
        expect(container.querySelector('ins')?.textContent).toBe('Added: beta');
    });

    it('labels removed and added words for assistive tech', () => {
        mount('one two', 'one three');
        expect(screen.getByText('Removed:')).toBeInTheDocument();
        expect(screen.getByText('Added:')).toBeInTheDocument();
    });

    it('shows notes added to an empty note', () => {
        const { container } = mount('', 'fresh note');
        expect(container.querySelector('ins')?.textContent).toBe('Added: fresh note');
    });

    it('says when a very long note is not word-diffed', () => {
        const big = Array.from({ length: 5000 }, (_, i) => `w${i}`).join(' ');
        const { container } = mount(big, 'short');
        expect(container.querySelector('ins, del')).toBeNull();
        expect(screen.getByText(/too long for a word-level comparison/i)).toBeInTheDocument();
        expect(within(container).getByText(/w0/)).toBeInTheDocument();
    });
});

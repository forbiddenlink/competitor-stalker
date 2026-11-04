import type { Snapshot } from '../types';

/**
 * Illustrative before/after record used when the workspace has no saved snapshots.
 * Hosts use example.com (RFC 2606); nothing here describes a real company.
 */
export interface LedgerField {
    label: string;
    before: string;
    after: string;
}

export interface LedgerRecord {
    name: string;
    host: string;
    beforeLabel: string;
    afterLabel: string;
    fields: LedgerField[];
    isSample: boolean;
}

export const SAMPLE_LEDGER: LedgerRecord = {
    name: 'Sample Co',
    host: 'pricing.example.com',
    beforeLabel: 'Snapshot 14',
    afterLabel: 'Snapshot 15',
    isSample: true,
    fields: [
        {
            label: 'Pricing',
            before: 'Team plan $20 per seat per month, billed annually',
            after: 'Team plan $24 per seat per month, billed annually, 5 seat minimum',
        },
        {
            label: 'Positioning',
            before: 'Deploys for small teams',
            after: 'Deploys for growing platform teams',
        },
        {
            label: 'Notes',
            before: 'Free tier includes 3 projects. Support is email only.',
            after: 'Free tier includes 1 project. Support is email only. Status page now public.',
        },
    ],
};

/**
 * Build a ledger from the competitor's two most recent saved snapshots,
 * using the same fields the history diff compares. Returns null when no
 * competitor has two snapshots that differ in these fields.
 */
export const ledgerFromSnapshots = (snapshots: Snapshot[]): LedgerRecord | null => {
    const byCompetitor = new Map<string, Snapshot[]>();
    for (const s of snapshots) byCompetitor.set(s.competitorId, [...(byCompetitor.get(s.competitorId) ?? []), s]);
    let best: LedgerRecord | null = null;
    let bestTime = 0;
    for (const list of byCompetitor.values()) {
        if (list.length < 2) continue;
        const sorted = [...list].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
        const [after, before] = sorted;
        const newTime = Date.parse(after.timestamp) || 0;
        const fields: LedgerField[] = [
            { label: 'Positioning', before: before.data.oneLiner ?? '', after: after.data.oneLiner ?? '' },
            { label: 'Target audience', before: before.data.targetAudience ?? '', after: after.data.targetAudience ?? '' },
            { label: 'Notes', before: before.data.notes ?? '', after: after.data.notes ?? '' },
        ].filter((f) => f.before !== f.after);
        if (fields.length === 0 || newTime < bestTime) continue;
        bestTime = newTime;
        let host = after.data.website ?? '';
        try { host = new URL(host).host; } catch { /* keep raw value */ }
        best = {
            name: after.data.name,
            host,
            beforeLabel: new Date(before.timestamp).toLocaleDateString(),
            afterLabel: new Date(after.timestamp).toLocaleDateString(),
            fields,
            isSample: false,
        };
    }
    return best;
};

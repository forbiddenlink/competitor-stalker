import React, { useMemo } from 'react';
import { X, ArrowRight, Clock } from 'lucide-react';
import type { Snapshot, Competitor } from '../../../types';

interface SnapshotDiffProps {
    snapshot1: Snapshot; // Older snapshot (before)
    snapshot2: Snapshot; // Newer snapshot (after)
    onClose: () => void;
}

type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

interface DiffItem {
    field: string;
    label: string;
    oldValue: string;
    newValue: string;
    status: DiffStatus;
}

/**
 * Format a timestamp for display
 */
const formatDate = (timestamp: string): string => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

/**
 * Compare two values and return their diff status
 */
const getDiffStatus = (oldVal: unknown, newVal: unknown): DiffStatus => {
    const oldEmpty = oldVal === undefined || oldVal === null || oldVal === '' ||
                     (Array.isArray(oldVal) && oldVal.length === 0) ||
                     (typeof oldVal === 'object' && Object.keys(oldVal || {}).length === 0);
    const newEmpty = newVal === undefined || newVal === null || newVal === '' ||
                     (Array.isArray(newVal) && newVal.length === 0) ||
                     (typeof newVal === 'object' && Object.keys(newVal || {}).length === 0);

    if (oldEmpty && !newEmpty) return 'added';
    if (!oldEmpty && newEmpty) return 'removed';
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) return 'changed';
    return 'unchanged';
};

/**
 * Format a value for display
 */
const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return '(empty)';
    if (Array.isArray(value)) {
        if (value.length === 0) return '(empty)';
        return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return '(empty)';
        return `${keys.length} items`;
    }
    return String(value);
};

/**
 * Get status for array field comparison
 */
const getArrayDiffStatus = (oldLen: number, newLen: number, hasContentChanged: boolean): DiffStatus => {
    const lengthStatus = getDiffStatus(oldLen, newLen);
    return lengthStatus === 'unchanged' && hasContentChanged ? 'changed' : lengthStatus;
};

/**
 * Compare array fields and create diff item
 */
const diffArrayField = (
    field: string,
    label: string,
    oldArr: unknown[],
    newArr: unknown[],
    formatFn: (arr: unknown[]) => string
): DiffItem | null => {
    if (JSON.stringify(oldArr) === JSON.stringify(newArr)) return null;
    return {
        field,
        label,
        oldValue: formatFn(oldArr),
        newValue: formatFn(newArr),
        status: getArrayDiffStatus(oldArr.length, newArr.length, true),
    };
};

/**
 * Basic fields configuration for diff comparison
 */
const BASIC_FIELDS: Array<{ key: keyof Competitor; label: string }> = [
    { key: 'name', label: 'Name' },
    { key: 'website', label: 'Website' },
    { key: 'oneLiner', label: 'Description' },
    { key: 'threatLevel', label: 'Threat Level' },
    { key: 'size', label: 'Company Size' },
    { key: 'estimatedRevenue', label: 'Est. Revenue' },
    { key: 'targetAudience', label: 'Target Audience' },
    { key: 'founded', label: 'Founded' },
    { key: 'location', label: 'Location' },
];

/**
 * SWOT fields configuration
 */
const SWOT_FIELDS: Array<{ key: 'strengths' | 'opportunities' | 'threats'; label: string }> = [
    { key: 'strengths', label: 'Strengths' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'threats', label: 'Threats' },
];

/**
 * Calculate feature diff summary
 */
const calculateFeatureDiff = (oldFeatures: Record<string, unknown>, newFeatures: Record<string, unknown>): DiffItem | null => {
    if (JSON.stringify(oldFeatures) === JSON.stringify(newFeatures)) return null;

    const oldEntries = Object.entries(oldFeatures || {});
    const newEntries = Object.entries(newFeatures || {});

    const added = newEntries.filter(([k]) => !(k in (oldFeatures || {}))).length;
    const removed = oldEntries.filter(([k]) => !(k in (newFeatures || {}))).length;
    const changed = newEntries.filter(([k, v]) => k in (oldFeatures || {}) && oldFeatures[k] !== v).length;

    const summary = [
        added > 0 ? `+${added} added` : '',
        removed > 0 ? `-${removed} removed` : '',
        changed > 0 ? `${changed} changed` : '',
    ].filter(Boolean).join(', ');

    return {
        field: 'features',
        label: 'Features',
        oldValue: `${oldEntries.length} features`,
        newValue: `${newEntries.length} features (${summary})`,
        status: 'changed',
    };
};

/**
 * Calculate all diffs between two competitor snapshots
 */
const calculateDiffs = (old: Competitor, newC: Competitor): DiffItem[] => {
    const diffs: DiffItem[] = [];

    // Basic fields
    BASIC_FIELDS.forEach(({ key, label }) => {
        const status = getDiffStatus(old[key], newC[key]);
        if (status !== 'unchanged') {
            diffs.push({
                field: key,
                label,
                oldValue: formatValue(old[key]),
                newValue: formatValue(newC[key]),
                status,
            });
        }
    });

    // Position
    if (old.positionX !== newC.positionX || old.positionY !== newC.positionY) {
        diffs.push({
            field: 'position',
            label: 'Market Position',
            oldValue: `(${old.positionX ?? '-'}, ${old.positionY ?? '-'})`,
            newValue: `(${newC.positionX ?? '-'}, ${newC.positionY ?? '-'})`,
            status: 'changed',
        });
    }

    // Features (special handling for summary)
    const featureDiff = calculateFeatureDiff(old.features, newC.features);
    if (featureDiff) diffs.push(featureDiff);

    // Pricing
    const pricingDiff = diffArrayField(
        'pricingModels',
        'Pricing Plans',
        old.pricingModels || [],
        newC.pricingModels || [],
        (arr) => arr.length > 0
            ? (arr as Array<{ name: string; price: string }>).map(p => `${p.name}: ${p.price}`).join(', ')
            : '(none)'
    );
    if (pricingDiff) diffs.push(pricingDiff);

    // Weaknesses
    const weaknessDiff = diffArrayField(
        'weaknesses',
        'Weaknesses',
        old.weaknesses || [],
        newC.weaknesses || [],
        (arr) => `${arr.length} identified`
    );
    if (weaknessDiff) diffs.push(weaknessDiff);

    // Strategies
    const strategyDiff = diffArrayField(
        'strategies',
        'Counter-Strategies',
        old.strategies || [],
        newC.strategies || [],
        (arr) => `${arr.length} strategies`
    );
    if (strategyDiff) diffs.push(strategyDiff);

    // SWOT fields
    SWOT_FIELDS.forEach(({ key, label }) => {
        const swotDiff = diffArrayField(key, label, old[key] || [], newC[key] || [], (arr) => `${arr.length} items`);
        if (swotDiff) diffs.push(swotDiff);
    });

    // Social handles
    if (JSON.stringify(old.socialHandles) !== JSON.stringify(newC.socialHandles)) {
        const formatHandles = (handles: Record<string, string> | undefined) => {
            const entries = Object.entries(handles || {}).filter(([, v]) => v).map(([k]) => k);
            return entries.length > 0 ? entries.join(', ') : '(none)';
        };
        diffs.push({
            field: 'socialHandles',
            label: 'Social Handles',
            oldValue: formatHandles(old.socialHandles),
            newValue: formatHandles(newC.socialHandles),
            status: 'changed',
        });
    }

    // Notes
    if (old.notes !== newC.notes) {
        const formatNotes = (notes: string | undefined) =>
            notes ? `${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}` : '(empty)';
        diffs.push({
            field: 'notes',
            label: 'Notes',
            oldValue: formatNotes(old.notes),
            newValue: formatNotes(newC.notes),
            status: getDiffStatus(old.notes, newC.notes),
        });
    }

    return diffs;
};

const StatusBadge: React.FC<{ status: DiffStatus }> = ({ status }) => {
    const styles: Record<DiffStatus, string> = {
        added: 'bg-[var(--accent-success-muted)] text-[var(--accent-success)]',
        removed: 'bg-[var(--accent-danger-muted)] text-[var(--accent-danger)]',
        changed: 'bg-[var(--accent-warning-muted)] text-[var(--accent-warning)]',
        unchanged: 'bg-[var(--bg-secondary)] text-[var(--text-muted)]',
    };

    const labels: Record<DiffStatus, string> = {
        added: 'Added',
        removed: 'Removed',
        changed: 'Changed',
        unchanged: 'No change',
    };

    return (
        <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

const DiffRow: React.FC<{ diff: DiffItem }> = ({ diff }) => {
    const bgStyles: Record<DiffStatus, string> = {
        added: 'border-l-[var(--accent-success)]',
        removed: 'border-l-[var(--accent-danger)]',
        changed: 'border-l-[var(--accent-warning)]',
        unchanged: 'border-l-[var(--border-muted)]',
    };

    return (
        <div className={`p-3 rounded-lg bg-[var(--bg-secondary)] border-l-2 ${bgStyles[diff.status]}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">{diff.label}</span>
                <StatusBadge status={diff.status} />
            </div>
            <div className="flex items-start gap-2 text-xs">
                <div className={`flex-1 p-2 rounded ${diff.status === 'removed' ? 'bg-[var(--accent-danger-muted)]/30' : 'bg-[var(--bg-tertiary)]'}`}>
                    <span className="text-[var(--text-muted)]">{diff.oldValue}</span>
                </div>
                <ArrowRight size={14} className="flex-shrink-0 text-[var(--text-muted)] mt-1.5" />
                <div className={`flex-1 p-2 rounded ${diff.status === 'added' ? 'bg-[var(--accent-success-muted)]/30' : diff.status === 'changed' ? 'bg-[var(--accent-warning-muted)]/30' : 'bg-[var(--bg-tertiary)]'}`}>
                    <span className="text-[var(--text-primary)]">{diff.newValue}</span>
                </div>
            </div>
        </div>
    );
};

export const SnapshotDiff: React.FC<SnapshotDiffProps> = ({ snapshot1, snapshot2, onClose }) => {
    const diffs = useMemo(() => calculateDiffs(snapshot1.data, snapshot2.data), [snapshot1, snapshot2]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                        Comparing Snapshots
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                        <Clock size={10} />
                        <span>{formatDate(snapshot1.timestamp)}</span>
                        <ArrowRight size={10} />
                        <span>{formatDate(snapshot2.timestamp)}</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Diff content */}
            <div className="flex-1 overflow-y-auto p-5">
                {diffs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-[var(--text-secondary)]">No differences found</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            These snapshots have identical data.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {diffs.map((diff) => (
                            <DiffRow key={diff.field} diff={diff} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{diffs.length} change{diffs.length !== 1 ? 's' : ''} detected</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-success)]" />
                            Added
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-danger)]" />
                            Removed
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-warning)]" />
                            Changed
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

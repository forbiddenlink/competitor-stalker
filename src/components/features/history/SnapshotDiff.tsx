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
 * Calculate all diffs between two competitor snapshots
 */
const calculateDiffs = (old: Competitor, newC: Competitor): DiffItem[] => {
    const diffs: DiffItem[] = [];

    // Basic fields
    const basicFields: Array<{ key: keyof Competitor; label: string }> = [
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

    basicFields.forEach(({ key, label }) => {
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

    // Features
    const oldFeatures = Object.entries(old.features || {});
    const newFeatures = Object.entries(newC.features || {});

    if (JSON.stringify(old.features) !== JSON.stringify(newC.features)) {
        const added = newFeatures.filter(([k]) => !old.features?.[k]).length;
        const removed = oldFeatures.filter(([k]) => !newC.features?.[k]).length;
        const changed = newFeatures.filter(([k, v]) => old.features?.[k] && old.features[k] !== v).length;

        const summary: string[] = [];
        if (added > 0) summary.push(`+${added} added`);
        if (removed > 0) summary.push(`-${removed} removed`);
        if (changed > 0) summary.push(`${changed} changed`);

        diffs.push({
            field: 'features',
            label: 'Features',
            oldValue: `${oldFeatures.length} features`,
            newValue: `${newFeatures.length} features (${summary.join(', ')})`,
            status: 'changed',
        });
    }

    // Pricing
    const oldPricing = old.pricingModels || [];
    const newPricing = newC.pricingModels || [];
    if (JSON.stringify(oldPricing) !== JSON.stringify(newPricing)) {
        diffs.push({
            field: 'pricingModels',
            label: 'Pricing Plans',
            oldValue: oldPricing.length > 0 ? oldPricing.map(p => `${p.name}: ${p.price}`).join(', ') : '(none)',
            newValue: newPricing.length > 0 ? newPricing.map(p => `${p.name}: ${p.price}`).join(', ') : '(none)',
            status: getDiffStatus(oldPricing.length, newPricing.length) === 'unchanged' ? 'changed' : getDiffStatus(oldPricing.length, newPricing.length),
        });
    }

    // Weaknesses
    const oldWeaknesses = old.weaknesses || [];
    const newWeaknesses = newC.weaknesses || [];
    if (JSON.stringify(oldWeaknesses) !== JSON.stringify(newWeaknesses)) {
        diffs.push({
            field: 'weaknesses',
            label: 'Weaknesses',
            oldValue: `${oldWeaknesses.length} identified`,
            newValue: `${newWeaknesses.length} identified`,
            status: getDiffStatus(oldWeaknesses.length, newWeaknesses.length) === 'unchanged' ? 'changed' : getDiffStatus(oldWeaknesses.length, newWeaknesses.length),
        });
    }

    // Strategies
    const oldStrategies = old.strategies || [];
    const newStrategies = newC.strategies || [];
    if (JSON.stringify(oldStrategies) !== JSON.stringify(newStrategies)) {
        diffs.push({
            field: 'strategies',
            label: 'Counter-Strategies',
            oldValue: `${oldStrategies.length} strategies`,
            newValue: `${newStrategies.length} strategies`,
            status: getDiffStatus(oldStrategies.length, newStrategies.length) === 'unchanged' ? 'changed' : getDiffStatus(oldStrategies.length, newStrategies.length),
        });
    }

    // SWOT fields
    const swotFields: Array<{ key: 'strengths' | 'opportunities' | 'threats'; label: string }> = [
        { key: 'strengths', label: 'Strengths' },
        { key: 'opportunities', label: 'Opportunities' },
        { key: 'threats', label: 'Threats' },
    ];

    swotFields.forEach(({ key, label }) => {
        const oldVal = old[key] || [];
        const newVal = newC[key] || [];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            diffs.push({
                field: key,
                label,
                oldValue: `${oldVal.length} items`,
                newValue: `${newVal.length} items`,
                status: getDiffStatus(oldVal.length, newVal.length) === 'unchanged' ? 'changed' : getDiffStatus(oldVal.length, newVal.length),
            });
        }
    });

    // Social handles
    if (JSON.stringify(old.socialHandles) !== JSON.stringify(newC.socialHandles)) {
        const oldHandles = Object.entries(old.socialHandles || {}).filter(([, v]) => v).map(([k]) => k);
        const newHandles = Object.entries(newC.socialHandles || {}).filter(([, v]) => v).map(([k]) => k);
        diffs.push({
            field: 'socialHandles',
            label: 'Social Handles',
            oldValue: oldHandles.length > 0 ? oldHandles.join(', ') : '(none)',
            newValue: newHandles.length > 0 ? newHandles.join(', ') : '(none)',
            status: 'changed',
        });
    }

    // Notes
    if (old.notes !== newC.notes) {
        diffs.push({
            field: 'notes',
            label: 'Notes',
            oldValue: old.notes ? `${old.notes.substring(0, 50)}${old.notes.length > 50 ? '...' : ''}` : '(empty)',
            newValue: newC.notes ? `${newC.notes.substring(0, 50)}${newC.notes.length > 50 ? '...' : ''}` : '(empty)',
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

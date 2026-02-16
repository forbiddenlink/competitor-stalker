import React, { useMemo, useState } from 'react';
import { Star, Circle, Clock, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../common/Button';
import { useCompetitors } from '../../../hooks/useCompetitors';
import type { Snapshot } from '../../../types';

interface SnapshotTimelineProps {
    competitorId: string;
    onCompare?: (snap1: Snapshot, snap2: Snapshot) => void;
}

/**
 * Compare two snapshots and return a summary of what changed
 */
const getChangeSummary = (current: Snapshot, previous: Snapshot | null): string => {
    if (!previous) return 'Initial snapshot';

    const changes: string[] = [];
    const curr = current.data;
    const prev = previous.data;

    // Check key fields for changes
    if (curr.threatLevel !== prev.threatLevel) {
        changes.push(`Threat: ${prev.threatLevel} → ${curr.threatLevel}`);
    }
    if (curr.name !== prev.name) {
        changes.push('Name updated');
    }
    if (curr.website !== prev.website) {
        changes.push('Website changed');
    }
    if (curr.oneLiner !== prev.oneLiner) {
        changes.push('Description updated');
    }

    // Pricing changes
    const prevPricing = JSON.stringify(prev.pricingModels || []);
    const currPricing = JSON.stringify(curr.pricingModels || []);
    if (prevPricing !== currPricing) {
        changes.push('Pricing modified');
    }

    // Features changes
    const prevFeatures = JSON.stringify(prev.features || {});
    const currFeatures = JSON.stringify(curr.features || {});
    if (prevFeatures !== currFeatures) {
        changes.push('Features updated');
    }

    // Weaknesses changes
    const prevWeaknesses = (prev.weaknesses || []).length;
    const currWeaknesses = (curr.weaknesses || []).length;
    if (prevWeaknesses !== currWeaknesses) {
        const diff = currWeaknesses - prevWeaknesses;
        changes.push(`Weaknesses ${diff > 0 ? '+' : ''}${diff}`);
    }

    // Position changes
    if (curr.positionX !== prev.positionX || curr.positionY !== prev.positionY) {
        changes.push('Position moved');
    }

    // SWOT changes
    const swotChanged =
        JSON.stringify(curr.strengths) !== JSON.stringify(prev.strengths) ||
        JSON.stringify(curr.opportunities) !== JSON.stringify(prev.opportunities) ||
        JSON.stringify(curr.threats) !== JSON.stringify(prev.threats);
    if (swotChanged) {
        changes.push('SWOT updated');
    }

    return changes.length > 0 ? changes.slice(0, 3).join(', ') : 'Minor changes';
};

/**
 * Format a timestamp for display
 */
const formatDate = (timestamp: string): { date: string; time: string } => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();

    let date: string;
    if (isToday) {
        date = 'Today';
    } else if (isYesterday) {
        date = 'Yesterday';
    } else {
        date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    }

    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return { date, time };
};

interface TimelineItemProps {
    snapshot: Snapshot;
    previousSnapshot: Snapshot | null;
    isSelected: boolean;
    onToggleSelect: () => void;
    compareMode: boolean;
    isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
    snapshot,
    previousSnapshot,
    isSelected,
    onToggleSelect,
    compareMode,
    isLast,
}) => {
    const [expanded, setExpanded] = useState(false);
    const isMilestone = snapshot.type === 'milestone';
    const { date, time } = formatDate(snapshot.timestamp);
    const summary = getChangeSummary(snapshot, previousSnapshot);

    return (
        <div className="relative flex gap-3">
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%-8px)] bg-[var(--border-muted)]" />
            )}

            {/* Icon */}
            <div className="relative flex-shrink-0 mt-1">
                {isMilestone ? (
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-warning-muted)] flex items-center justify-center">
                        <Star size={12} className="text-[var(--accent-warning)] fill-[var(--accent-warning)]" />
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-muted)] flex items-center justify-center">
                        <Circle size={8} className="text-[var(--text-muted)] fill-[var(--text-muted)]" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                                {isMilestone ? snapshot.label : 'Auto-saved'}
                            </span>
                            {isMilestone && (
                                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--accent-warning-muted)] text-[var(--accent-warning)] font-medium">
                                    Milestone
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-muted)]">
                            <Clock size={10} />
                            <span>{date} at {time}</span>
                        </div>
                    </div>

                    {/* Compare checkbox */}
                    {compareMode && (
                        <button
                            type="button"
                            onClick={onToggleSelect}
                            className={`
                                flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center
                                transition-colors
                                ${isSelected
                                    ? 'bg-[var(--accent-brand)] border-[var(--accent-brand)] text-[var(--text-primary)]'
                                    : 'border-[var(--border-muted)] hover:border-[var(--border-emphasis)]'}
                            `}
                        >
                            {isSelected && <Check size={12} />}
                        </button>
                    )}
                </div>

                {/* Change summary */}
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span>{summary}</span>
                </button>

                {/* Expanded details */}
                {expanded && (
                    <div className="mt-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
                        <SnapshotDetails snapshot={snapshot} />
                    </div>
                )}
            </div>
        </div>
    );
};

const SnapshotDetails: React.FC<{ snapshot: Snapshot }> = ({ snapshot }) => {
    const data = snapshot.data;

    const detailItems = [
        { label: 'Threat Level', value: data.threatLevel },
        { label: 'Website', value: data.website || 'Not set' },
        { label: 'Size', value: data.size || 'Not set' },
        { label: 'Revenue', value: data.estimatedRevenue || 'Not set' },
        { label: 'Features', value: `${Object.keys(data.features || {}).length} tracked` },
        { label: 'Weaknesses', value: `${(data.weaknesses || []).length} identified` },
        { label: 'Pricing Plans', value: `${(data.pricingModels || []).length} plans` },
    ];

    return (
        <div className="grid grid-cols-2 gap-2">
            {detailItems.map(item => (
                <div key={item.label}>
                    <span className="text-[var(--text-muted)]">{item.label}:</span>{' '}
                    <span className="text-[var(--text-primary)]">{item.value}</span>
                </div>
            ))}
        </div>
    );
};

export const SnapshotTimeline: React.FC<SnapshotTimelineProps> = ({ competitorId, onCompare }) => {
    const { getSnapshots } = useCompetitors();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [compareMode, setCompareMode] = useState(false);

    const snapshots = useMemo(() => getSnapshots(competitorId), [getSnapshots, competitorId]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            // Only allow 2 selections
            if (prev.length >= 2) {
                return [prev[1], id];
            }
            return [...prev, id];
        });
    };

    const handleCompare = () => {
        if (selectedIds.length === 2 && onCompare) {
            const snap1 = snapshots.find(s => s.id === selectedIds[0]);
            const snap2 = snapshots.find(s => s.id === selectedIds[1]);
            if (snap1 && snap2) {
                // Sort so older snapshot is first
                const sorted = [snap1, snap2].sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
                onCompare(sorted[0], sorted[1]);
            }
        }
    };

    const handleCancelCompare = () => {
        setCompareMode(false);
        setSelectedIds([]);
    };

    // Empty state
    if (snapshots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-3">
                    <Clock size={20} className="text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">No history yet</p>
                <p className="text-xs text-[var(--text-muted)]">
                    Changes will be tracked automatically when you edit this competitor.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Compare mode controls */}
            {onCompare && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
                    {compareMode ? (
                        <>
                            <span className="text-xs text-[var(--text-muted)]">
                                {selectedIds.length === 0
                                    ? 'Select two snapshots to compare'
                                    : selectedIds.length === 1
                                        ? 'Select one more snapshot'
                                        : 'Ready to compare'}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelCompare}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={selectedIds.length !== 2}
                                    onClick={handleCompare}
                                >
                                    Compare
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-xs text-[var(--text-muted)]">
                                {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCompareMode(true)}
                                disabled={snapshots.length < 2}
                            >
                                Compare
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="relative">
                {snapshots.map((snapshot, index) => (
                    <TimelineItem
                        key={snapshot.id}
                        snapshot={snapshot}
                        previousSnapshot={index < snapshots.length - 1 ? snapshots[index + 1] : null}
                        isSelected={selectedIds.includes(snapshot.id)}
                        onToggleSelect={() => toggleSelect(snapshot.id)}
                        compareMode={compareMode}
                        isLast={index === snapshots.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

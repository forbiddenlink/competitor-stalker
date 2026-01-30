import React, { useState, useEffect, useRef } from 'react';
import { X, History, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '../../common/Button';
import { SnapshotTimeline } from './SnapshotTimeline';
import { SnapshotDiff } from './SnapshotDiff';
import { MilestoneForm } from './MilestoneForm';
import type { Competitor, Snapshot } from '../../../types';

interface HistoryDrawerProps {
    competitor: Competitor;
    isOpen: boolean;
    onClose: () => void;
}

type DrawerView = 'timeline' | 'milestone' | 'diff';

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ competitor, isOpen, onClose }) => {
    const [view, setView] = useState<DrawerView>('timeline');
    const [diffSnapshots, setDiffSnapshots] = useState<{ snap1: Snapshot; snap2: Snapshot } | null>(null);
    const prevIsOpen = useRef(isOpen);

    // Reset view when drawer opens (using ref to avoid effect setState lint error)
    useEffect(() => {
        if (isOpen && !prevIsOpen.current) {
            // Drawer just opened - reset state on next tick to avoid cascading renders
            requestAnimationFrame(() => {
                setView('timeline');
                setDiffSnapshots(null);
            });
        }
        prevIsOpen.current = isOpen;
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (view !== 'timeline') {
                    setView('timeline');
                    setDiffSnapshots(null);
                } else {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, view, onClose]);

    const handleCompare = (snap1: Snapshot, snap2: Snapshot) => {
        setDiffSnapshots({ snap1, snap2 });
        setView('diff');
    };

    const handleMilestoneSaved = () => {
        setView('timeline');
    };

    const handleBackToTimeline = () => {
        setView('timeline');
        setDiffSnapshots(null);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`
                    fixed inset-y-0 right-0 z-50 w-full max-w-md
                    flex flex-col
                    bg-[var(--bg-primary)] border-l border-[var(--border-default)]
                    shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3 min-w-0">
                        {view !== 'timeline' && (
                            <button
                                type="button"
                                onClick={handleBackToTimeline}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                                <History size={18} className="text-[var(--accent-brand)]" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold text-[var(--text-primary)] truncate">
                                    {view === 'diff' ? 'Compare Snapshots' : view === 'milestone' ? 'Add Milestone' : 'History'}
                                </h2>
                                <p className="text-xs text-[var(--text-muted)] truncate">
                                    {competitor.name}
                                </p>
                            </div>
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

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {view === 'timeline' && (
                        <div className="h-full flex flex-col">
                            {/* Add Milestone Button */}
                            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    leftIcon={<Plus size={14} />}
                                    onClick={() => setView('milestone')}
                                >
                                    Add Milestone
                                </Button>
                            </div>

                            {/* Timeline */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <SnapshotTimeline
                                    competitorId={competitor.id}
                                    onCompare={handleCompare}
                                />
                            </div>
                        </div>
                    )}

                    {view === 'milestone' && (
                        <div className="p-5">
                            <MilestoneForm
                                competitorId={competitor.id}
                                onSave={handleMilestoneSaved}
                                onCancel={handleBackToTimeline}
                            />
                        </div>
                    )}

                    {view === 'diff' && diffSnapshots && (
                        <SnapshotDiff
                            snapshot1={diffSnapshots.snap1}
                            snapshot2={diffSnapshots.snap2}
                            onClose={handleBackToTimeline}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

import React, { useState, useContext } from 'react';
import { CompetitorContext } from '../../../context/CompetitorContext';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Crosshair, Plus, ArrowRight, CheckCircle, Clock, Trash2, Zap } from 'lucide-react';
import type { Strategy } from '../../../types';

export const CounterStrategy: React.FC = () => {
    const context = useContext(CompetitorContext);
    const [newStrategy, setNewStrategy] = useState({ title: '', targetId: '' });

    const { competitors, updateCompetitor } = context || { competitors: [], updateCompetitor: () => {} };

    const getStrategiesByStatus = (status: Strategy['status']) => {
        return competitors.flatMap((comp) =>
            (comp.strategies || [])
                .filter((s) => s.status === status)
                .map((s) => ({ ...s, competitorName: comp.name, competitorColor: comp.threatLevel }))
        );
    };

    const handleAddStrategy = () => {
        if (!newStrategy.title || !newStrategy.targetId) return;

        const competitor = competitors.find((c) => c.id === newStrategy.targetId);
        if (!competitor) return;

        const strategy: Strategy = {
            id: crypto.randomUUID(),
            title: newStrategy.title,
            description: '',
            status: 'Planned',
            targetCompetitorId: newStrategy.targetId,
            deadline: new Date().toLocaleDateString(),
        };

        updateCompetitor(newStrategy.targetId, {
            strategies: [...(competitor.strategies || []), strategy],
        });

        setNewStrategy({ title: '', targetId: '' });
    };

    const moveStrategy = (strategy: Strategy, newStatus: Strategy['status']) => {
        const competitor = competitors.find((c) => c.id === strategy.targetCompetitorId);
        if (!competitor) return;

        const updatedStrategies = (competitor.strategies || []).map((s) =>
            s.id === strategy.id ? { ...s, status: newStatus } : s
        );

        updateCompetitor(competitor.id, { strategies: updatedStrategies });
    };

    const deleteStrategy = (strategy: Strategy) => {
        const competitor = competitors.find((c) => c.id === strategy.targetCompetitorId);
        if (!competitor) return;

        const updatedStrategies = (competitor.strategies || []).filter((s) => s.id !== strategy.id);
        updateCompetitor(competitor.id, { strategies: updatedStrategies });
    };

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'High':
                return 'border-[var(--accent-danger)]';
            case 'Medium':
                return 'border-[var(--accent-warning)]';
            default:
                return 'border-[var(--accent-success)]';
        }
    };

    if (!context) return <div>Error: Context unavailable</div>;

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                        <Crosshair className="text-[var(--accent-danger)]" /> Strategy Board
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                        Plan and execute counter-offensives against high-value targets.
                    </p>
                </div>

                <div className="flex gap-2 items-end bg-[var(--bg-primary)]/60 p-2 rounded-[var(--radius-control)] border border-[var(--border-default)] border-dashed">
                    <div className="w-56">
                        <Input
                            placeholder="New tactic name..."
                            value={newStrategy.title}
                            onChange={(e) => setNewStrategy({ ...newStrategy, title: e.target.value })}
                            className="h-10 text-sm"
                        />
                    </div>
                    <label htmlFor="target-select" className="sr-only">Select Target Competitor</label>
                    <select
                        id="target-select"
                        className="h-10 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-control)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-info)] outline-none"
                        value={newStrategy.targetId}
                        onChange={(e) => setNewStrategy({ ...newStrategy, targetId: e.target.value })}
                        aria-label="Select target competitor"
                    >
                        <option value="">Select target</option>
                        {competitors.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <Button size="sm" onClick={handleAddStrategy} disabled={!newStrategy.title || !newStrategy.targetId} className="h-10">
                        <Plus size={14} className="mr-1" /> Plan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                {(['Planned', 'Active', 'Completed'] as const).map((status) => (
                    <div key={status} className="flex flex-col h-full">
                        <div
                            className={`
                                flex items-center gap-2 uppercase text-xs font-semibold tracking-wide mb-4 pb-2 border-b-2
                                ${status === 'Planned' ? 'border-[var(--text-muted)] text-[var(--text-muted)]' : ''}
                                ${status === 'Active' ? 'border-[var(--accent-info)] text-[var(--accent-info)]' : ''}
                                ${status === 'Completed' ? 'border-[var(--accent-success)] text-[var(--accent-success)]' : ''}
                            `}
                        >
                            {status === 'Planned' && <Clock size={16} />}
                            {status === 'Active' && <Zap size={16} />}
                            {status === 'Completed' && <CheckCircle size={16} />}
                            {status}
                        </div>

                        <div className="flex-1 bg-[var(--bg-primary)]/40 rounded-[var(--radius-card)] p-2 space-y-3 overflow-y-auto border border-[var(--border-default)]">
                            {getStrategiesByStatus(status).length === 0 && (
                                <div className="text-center p-4 opacity-50 text-xs font-mono border border-dashed border-[var(--border-default)] rounded-[var(--radius-control)] text-[var(--text-muted)]">
                                    No strategies yet
                                </div>
                            )}

                            {getStrategiesByStatus(status).map((strategy: Strategy) => (
                                <Card
                                    key={strategy.id}
                                    className={`p-4 border-l-4 hover:bg-[var(--bg-hover)] transition-colors group relative ${getThreatColor(strategy.competitorColor || 'Medium')}`}
                                >
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => deleteStrategy(strategy)}
                                            className="text-[var(--text-muted)] hover:text-[var(--accent-danger)]"
                                            aria-label="Delete strategy"
                                            title="Delete strategy"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1 flex justify-between">
                                        <span>Target: {strategy.competitorName}</span>
                                    </div>
                                    <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">{strategy.title}</h4>

                                    <div className="flex justify-between items-center mt-2">
                                        {status === 'Planned' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-7 w-full"
                                                onClick={() => moveStrategy(strategy, 'Active')}
                                            >
                                                Activate <ArrowRight size={12} className="ml-1" />
                                            </Button>
                                        )}
                                        {status === 'Active' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-7 w-full border-[var(--accent-success)] text-[var(--accent-success)] hover:bg-[var(--accent-success-muted)]"
                                                onClick={() => moveStrategy(strategy, 'Completed')}
                                            >
                                                Complete <CheckCircle size={12} className="ml-1" />
                                            </Button>
                                        )}
                                        {status === 'Completed' && (
                                            <span className="text-xs text-[var(--accent-success)] font-mono flex items-center gap-1 mx-auto">
                                                <CheckCircle size={12} /> Executed
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

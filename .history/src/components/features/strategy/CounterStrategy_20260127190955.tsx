
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

    // Handle missing context gracefully
    const { competitors, updateCompetitor } = context || { competitors: [], updateCompetitor: () => { } };

    const getStrategiesByStatus = (status: Strategy['status']) => {
        return competitors.flatMap(comp =>
            (comp.strategies || [])
                .filter(s => s.status === status)
                .map(s => ({ ...s, competitorName: comp.name, competitorColor: comp.threatLevel }))
        );
    };

    const handleAddStrategy = () => {
        if (!newStrategy.title || !newStrategy.targetId) return;

        const competitor = competitors.find(c => c.id === newStrategy.targetId);
        if (!competitor) return;

        const strategy: Strategy = {
            id: crypto.randomUUID(),
            title: newStrategy.title,
            description: '',
            status: 'Planned',
            targetCompetitorId: newStrategy.targetId,
            deadline: new Date().toLocaleDateString()
        };

        updateCompetitor(newStrategy.targetId, {
            strategies: [...(competitor.strategies || []), strategy]
        });

        setNewStrategy({ title: '', targetId: '' });
    };

    const moveStrategy = (strategy: Strategy, newStatus: Strategy['status']) => {
        const competitor = competitors.find(c => c.id === strategy.targetCompetitorId);
        if (!competitor) return;

        const updatedStrategies = (competitor.strategies || []).map(s =>
            s.id === strategy.id ? { ...s, status: newStatus } : s
        );

        updateCompetitor(competitor.id, { strategies: updatedStrategies });
    };

    const deleteStrategy = (strategy: Strategy) => {
        const competitor = competitors.find(c => c.id === strategy.targetCompetitorId);
        if (!competitor) return;

        const updatedStrategies = (competitor.strategies || []).filter(s => s.id !== strategy.id);
        updateCompetitor(competitor.id, { strategies: updatedStrategies });
    };

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'High': return 'border-accent-red';
            case 'Medium': return 'border-accent-amber';
            default: return 'border-accent-green';
        }
    };

    if (!context) return <div>Error: Context unavailable</div>;

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-mono text-white tracking-widest uppercase flex items-center gap-2">
                        <Crosshair className="text-accent-red animate-spin-slow" /> War Room
                    </h2>
                    <p className="text-sm text-text-muted">Plan and execute counter-offensives against high-value targets.</p>
                </div>

                <div className="flex gap-2 items-end bg-black/40 p-2 rounded border border-border-dim border-dashed">
                    <div className="w-48">
                        <Input
                            placeholder="New Tactic Name..."
                            value={newStrategy.title}
                            onChange={(e) => setNewStrategy({ ...newStrategy, title: e.target.value })}
                            className="h-8 text-xs bg-bg-primary"
                        />
                    </div>
                    <select
                        className="h-8 bg-bg-primary border border-border-dim rounded px-2 text-xs text-text-primary focus:border-accent-cyan outline-none"
                        value={newStrategy.targetId}
                        onChange={(e) => setNewStrategy({ ...newStrategy, targetId: e.target.value })}
                    >
                        <option value="">Select Target</option>
                        {competitors.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <Button size="sm" onClick={handleAddStrategy} disabled={!newStrategy.title || !newStrategy.targetId} className="h-8">
                        <Plus size={14} className="mr-1" /> Plan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Columns */}
                {(['Planned', 'Active', 'Completed'] as const).map(status => (
                    <div key={status} className="flex flex-col h-full">
                        <div className={`
                            flex items-center gap-2 uppercase font-mono text-sm tracking-widest mb-4 pb-2 border-b-2
                            ${status === 'Planned' ? 'border-text-muted text-text-muted' : ''}
                            ${status === 'Active' ? 'border-accent-cyan text-accent-cyan' : ''}
                            ${status === 'Completed' ? 'border-accent-green text-accent-green' : ''}
                        `}>
                            {status === 'Planned' && <Clock size={16} />}
                            {status === 'Active' && <Zap size={16} />}
                            {status === 'Completed' && <CheckCircle size={16} />}
                            {status}
                        </div>

                        <div className="flex-1 bg-black/20 rounded-lg p-2 space-y-3 overflow-y-auto border border-border-dim/30">
                            {getStrategiesByStatus(status).length === 0 && (
                                <div className="text-center p-4 opacity-30 text-xs font-mono border-2 border-dashed border-border-dim rounded">
                                    NO INTEL
                                </div>
                            )}

                            {getStrategiesByStatus(status).map((strategy: Strategy) => (
                                <Card
                                    key={strategy.id}
                                    className={`p-4 border-l-4 hover:bg-white/5 transition-all group relative ${getThreatColor(strategy.competitorColor || 'Medium')}`}
                                >
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => deleteStrategy(strategy)}
                                            className="text-text-muted hover:text-accent-red"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 flex justify-between">
                                        <span>Target: {strategy.competitorName}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-white mb-3">{strategy.title}</h4>

                                    <div className="flex justify-between items-center mt-2">
                                        {status === 'Planned' && (
                                            <Button size="sm" variant="outline" className="text-xs h-6 w-full" onClick={() => moveStrategy(strategy, 'Active')}>
                                                Activate <ArrowRight size={12} className="ml-1" />
                                            </Button>
                                        )}
                                        {status === 'Active' && (
                                            <Button size="sm" variant="outline" className="text-xs h-6 w-full border-accent-green text-accent-green hover:bg-accent-green/10" onClick={() => moveStrategy(strategy, 'Completed')}>
                                                Complete <CheckCircle size={12} className="ml-1" />
                                            </Button>
                                        )}
                                        {status === 'Completed' && (
                                            <span className="text-xs text-accent-green font-mono flex items-center gap-1 mx-auto">
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


import React, { useState, useContext } from 'react';
import { CompetitorContext } from '../../../context/CompetitorContext';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Plus, X, ShieldAlert } from 'lucide-react';
import type { Weakness } from '../../../types';

export const WeaknessSpotter: React.FC = () => {
    const context = useContext(CompetitorContext);
    const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('');
    const [newWeakness, setNewWeakness] = useState<Partial<Weakness>>({
        severity: 'Medium',
        source: 'G2 Crowd'
    });

    if (!context) return <div>Error: Context unavailable</div>;
    const { competitors, updateCompetitor } = context;

    // Derive effective selected ID: use state if valid, otherwise fall back to first competitor
    const effectiveSelectedId = (selectedCompetitorId && competitors.some(c => c.id === selectedCompetitorId))
        ? selectedCompetitorId
        : competitors[0]?.id ?? '';

    const handleAddWeakness = () => {
        if (!effectiveSelectedId || !newWeakness.text) return;

        const competitor = competitors.find(c => c.id === effectiveSelectedId);
        if (!competitor) return;

        const weakness: Weakness = {
            id: crypto.randomUUID(),
            text: newWeakness.text,
            source: newWeakness.source || 'Unknown',
            severity: newWeakness.severity as 'Low' | 'Medium' | 'Critical',
            date: new Date().toLocaleDateString()
        };

        updateCompetitor(effectiveSelectedId, {
            weaknesses: [...(competitor.weaknesses || []), weakness]
        });

        setNewWeakness({ severity: 'Medium', source: 'G2 Crowd', text: '' });
    };

    const handleDeleteWeakness = (competitorId: string, weaknessId: string) => {
        const competitor = competitors.find(c => c.id === competitorId);
        if (!competitor) return;

        updateCompetitor(competitorId, {
            weaknesses: (competitor.weaknesses || []).filter(w => w.id !== weaknessId)
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'text-accent-red border-accent-red/50 bg-accent-red/10';
            case 'Medium': return 'text-accent-amber border-accent-amber/50 bg-accent-amber/10';
            case 'Low': return 'text-accent-green border-accent-green/50 bg-accent-green/10';
            default: return 'text-gray-400 border-gray-400/50';
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-mono text-accent-red tracking-widest uppercase flex items-center gap-2">
                        <ShieldAlert className="animate-pulse" /> Weakness Spotter
                    </h2>
                    <p className="text-sm text-text-muted">Catalog and exploit competitor vulnerabilities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Sidebar: Competitor Selector */}
                <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto">
                    {competitors.map(comp => (
                        <button
                            key={comp.id}
                            onClick={() => setSelectedCompetitorId(comp.id)}
                            className={`
                                p-4 border text-left transition-all duration-200 group
                                ${effectiveSelectedId === comp.id
                                    ? 'border-accent-red bg-accent-red/10 text-white shadow-[0_0_10px_rgba(255,51,51,0.2)]'
                                    : 'border-border-dim bg-bg-secondary hover:border-accent-red/50 text-text-muted hover:text-white'
                                }
                            `}
                        >
                            <div className="font-bold tracking-wide uppercase">{comp.name}</div>
                            <div className="text-xs mt-1 flex justify-between opacity-70">
                                <span>{(comp.weaknesses || []).length} Vulnerabilities</span>
                            </div>
                        </button>
                    ))}
                    {competitors.length === 0 && (
                        <div className="p-4 border border-dashed border-gray-700 text-gray-500 text-sm text-center">
                            No targets loaded.
                        </div>
                    )}
                </div>

                {/* Main Content: Weakness List */}
                <Card className="lg:col-span-3 flex flex-col bg-black/40 border-accent-red/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ShieldAlert size={200} />
                    </div>

                    {effectiveSelectedId ? (
                        <>
                            {/* Add Form */}
                            <div className="p-6 border-b border-border-dim bg-bg-secondary/30 backdrop-blur-md z-10">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <Input
                                            label="Vulnerability Description"
                                            placeholder="e.g. Server downtime during peak hours..."
                                            value={newWeakness.text || ''}
                                            onChange={(e) => setNewWeakness({ ...newWeakness, text: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-48">
                                        <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1 block">Severity</label>
                                        <select
                                            className="w-full bg-black/30 border border-border-dim px-3 py-2 text-text-primary focus:border-accent-cyan outline-none"
                                            value={newWeakness.severity}
                                            onChange={(e) => setNewWeakness({ ...newWeakness, severity: e.target.value as 'Low' | 'Medium' | 'Critical' })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="w-48">
                                        <Input
                                            label="Source"
                                            placeholder="e.g. G2 Review"
                                            value={newWeakness.source || ''}
                                            onChange={(e) => setNewWeakness({ ...newWeakness, source: e.target.value })}
                                        />
                                    </div>
                                    <Button onClick={handleAddWeakness} variant="secondary" className="bg-accent-red hover:bg-accent-red/80 shadow-[0_0_10px_rgba(255,51,51,0.4)]">
                                        <Plus size={18} className="mr-1" /> Log
                                    </Button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-0">
                                {(() => {
                                    const comp = competitors.find(c => c.id === effectiveSelectedId);
                                    if (!comp || !comp.weaknesses || comp.weaknesses.length === 0) {
                                        return (
                                            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                                <ShieldAlert size={64} className="mb-4" />
                                                <p>NO VULNERABILITIES LOGGED</p>
                                            </div>
                                        );
                                    }
                                    return comp.weaknesses.map(w => (
                                        <div key={w.id} className={`flex items-start justify-between p-4 border border-l-4 bg-bg-primary/80 backdrop-blur-sm transition-all hover:translate-x-1 ${getSeverityColor(w.severity)}`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getSeverityColor(w.severity)} bg-transparent`}>
                                                        {w.severity.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-text-muted font-mono">{w.date} • {w.source}</span>
                                                </div>
                                                <p className="text-text-primary mt-1 font-medium">{w.text}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteWeakness(effectiveSelectedId, w.id)}
                                                className="text-text-muted hover:text-accent-red transition-colors p-2"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-muted">
                            Select a target to view vulnerabilities.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

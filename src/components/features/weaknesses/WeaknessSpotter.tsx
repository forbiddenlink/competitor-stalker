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
        source: 'G2 Crowd',
    });

    if (!context) return <div>Error: Context unavailable</div>;
    const { competitors, updateCompetitor } = context;

    const effectiveSelectedId =
        selectedCompetitorId && competitors.some((c) => c.id === selectedCompetitorId)
            ? selectedCompetitorId
            : competitors[0]?.id ?? '';

    const handleAddWeakness = () => {
        if (!effectiveSelectedId || !newWeakness.text) return;

        const competitor = competitors.find((c) => c.id === effectiveSelectedId);
        if (!competitor) return;

        const weakness: Weakness = {
            id: crypto.randomUUID(),
            text: newWeakness.text,
            source: newWeakness.source || 'Unknown',
            severity: newWeakness.severity as 'Low' | 'Medium' | 'Critical',
            date: new Date().toLocaleDateString(),
        };

        updateCompetitor(effectiveSelectedId, {
            weaknesses: [...(competitor.weaknesses || []), weakness],
        });

        setNewWeakness({ severity: 'Medium', source: 'G2 Crowd', text: '' });
    };

    const handleDeleteWeakness = (competitorId: string, weaknessId: string) => {
        const competitor = competitors.find((c) => c.id === competitorId);
        if (!competitor) return;

        updateCompetitor(competitorId, {
            weaknesses: (competitor.weaknesses || []).filter((w) => w.id !== weaknessId),
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical':
                return 'text-[var(--accent-danger)] border-[var(--accent-danger)]/50 bg-[var(--accent-danger-muted)]';
            case 'Medium':
                return 'text-[var(--accent-warning)] border-[var(--accent-warning)]/50 bg-[var(--accent-warning-muted)]';
            case 'Low':
                return 'text-[var(--accent-success)] border-[var(--accent-success)]/50 bg-[var(--accent-success-muted)]';
            default:
                return 'text-[var(--text-muted)] border-[var(--text-muted)]/50';
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                        <ShieldAlert className="text-[var(--accent-danger)]" /> Weakness Spotter
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">Catalog and exploit competitor vulnerabilities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto">
                    {competitors.map((comp) => (
                        <button
                            key={comp.id}
                            onClick={() => setSelectedCompetitorId(comp.id)}
                            className={`
                                p-4 border rounded-[var(--radius-control)] text-left transition-colors group
                                ${
                                    effectiveSelectedId === comp.id
                                        ? 'border-[var(--accent-danger)] bg-[var(--accent-danger-muted)] text-[var(--text-primary)]'
                                        : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent-danger)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }
                            `}
                        >
                            <div className="font-semibold tracking-wide uppercase">{comp.name}</div>
                            <div className="text-xs mt-1 flex justify-between opacity-70">
                                <span>{(comp.weaknesses || []).length} vulnerabilities</span>
                            </div>
                        </button>
                    ))}
                    {competitors.length === 0 && (
                        <div className="p-4 border border-dashed border-[var(--border-default)] text-[var(--text-muted)] text-sm text-center rounded-[var(--radius-control)]">
                            No targets loaded.
                        </div>
                    )}
                </div>

                <Card className="lg:col-span-3 flex flex-col bg-[var(--bg-primary)]/50 border-[var(--accent-danger)]/30 relative overflow-hidden" variant="surface">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ShieldAlert size={200} />
                    </div>

                    {effectiveSelectedId ? (
                        <>
                            <div className="p-6 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/40 backdrop-blur-md z-10">
                                <div className="flex gap-4 items-end flex-wrap">
                                    <div className="flex-1 min-w-[280px]">
                                        <Input
                                            label="Vulnerability Description"
                                            placeholder="e.g. Server downtime during peak hours..."
                                            value={newWeakness.text || ''}
                                            onChange={(e) => setNewWeakness({ ...newWeakness, text: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-48">
                                        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1 block">Severity</label>
                                        <select
                                            className="w-full h-10 bg-[var(--bg-primary)] border border-[var(--border-default)] px-3 rounded-[var(--radius-control)] text-[var(--text-primary)] focus:border-[var(--accent-info)] outline-none"
                                            value={newWeakness.severity}
                                            onChange={(e) =>
                                                setNewWeakness({ ...newWeakness, severity: e.target.value as 'Low' | 'Medium' | 'Critical' })
                                            }
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
                                    <Button onClick={handleAddWeakness} variant="danger" className="h-10">
                                        <Plus size={18} className="mr-1" /> Log
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-0">
                                {(() => {
                                    const comp = competitors.find((c) => c.id === effectiveSelectedId);
                                    if (!comp || !comp.weaknesses || comp.weaknesses.length === 0) {
                                        return (
                                            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                                                <ShieldAlert size={64} className="mb-4" />
                                                <p>No vulnerabilities logged</p>
                                            </div>
                                        );
                                    }
                                    return comp.weaknesses.map((w) => (
                                        <div
                                            key={w.id}
                                            className={`flex items-start justify-between p-4 border border-l-4 bg-[var(--bg-primary)]/80 backdrop-blur-sm transition-colors hover:bg-[var(--bg-hover)] ${getSeverityColor(w.severity)}`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-control)] border ${getSeverityColor(
                                                            w.severity
                                                        )} bg-transparent`}
                                                    >
                                                        {w.severity.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-[var(--text-muted)] font-mono">
                                                        {w.date} • {w.source}
                                                    </span>
                                                </div>
                                                <p className="text-[var(--text-primary)] mt-1 font-medium">{w.text}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteWeakness(effectiveSelectedId, w.id)}
                                                className="text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-colors p-2"
                                                aria-label="Delete weakness"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                            Select a target to view vulnerabilities.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

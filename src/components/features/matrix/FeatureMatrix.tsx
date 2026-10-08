import React, { useState, useMemo } from 'react';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Check, X, Minus, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { FeatureStatus } from '../../../types';

export const FeatureMatrix: React.FC = () => {
    const { competitors, userProfile, updateCompetitor, updateUserProfile } = useCompetitors();
    const [newFeatureName, setNewFeatureName] = useState('');

    const allFeatures = useMemo(() => {
        const features = new Set<string>();
        Object.keys(userProfile.features).forEach((f) => features.add(f));
        competitors.forEach((comp) => {
            Object.keys(comp.features).forEach((f) => features.add(f));
        });
        return Array.from(features).sort();
    }, [competitors, userProfile]);

    const handleAddFeature = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFeatureName.trim()) return;

        if (!userProfile.features[newFeatureName]) {
            const newFeatures = { ...userProfile.features, [newFeatureName]: 'Have' as FeatureStatus };
            updateUserProfile({ features: newFeatures });
        }
        setNewFeatureName('');
    };

    const toggleUserFeature = (feature: string) => {
        const currentStatus = userProfile.features[feature];
        let nextStatus: FeatureStatus | undefined;

        if (!currentStatus) nextStatus = 'Have';
        else if (currentStatus === 'Have') nextStatus = 'Better';
        else if (currentStatus === 'Better') nextStatus = 'Worse';
        else if (currentStatus === 'Worse') nextStatus = 'DontHave';
        else nextStatus = undefined;

        const newFeatures = { ...userProfile.features };
        if (nextStatus) {
            newFeatures[feature] = nextStatus;
        } else {
            delete newFeatures[feature];
        }
        updateUserProfile({ features: newFeatures });
    };

    const cycleCompetitorFeature = (competitorId: string, feature: string) => {
        const comp = competitors.find((c) => c.id === competitorId);
        if (!comp) return;

        const currentStatus = comp.features[feature];
        let nextStatus: FeatureStatus | undefined;

        if (!currentStatus) nextStatus = 'Have';
        else if (currentStatus === 'Have') nextStatus = 'Better';
        else if (currentStatus === 'Better') nextStatus = 'Worse';
        else if (currentStatus === 'Worse') nextStatus = 'DontHave';
        else nextStatus = undefined;

        const newFeatures = { ...comp.features };
        if (nextStatus) {
            newFeatures[feature] = nextStatus;
        } else {
            delete newFeatures[feature];
        }
        updateCompetitor(competitorId, { features: newFeatures });
    };

    const getIconForStatus = (status?: FeatureStatus) => {
        switch (status) {
            case 'Have':
                return <Check size={16} className="text-[var(--accent-success)]" />;
            case 'DontHave':
                return <X size={16} className="text-[var(--accent-danger)]" />;
            case 'Better':
                return <TrendingUp size={16} className="text-[var(--accent-info)]" />;
            case 'Worse':
                return <TrendingDown size={16} className="text-[var(--accent-warning)]" />;
            default:
                return <Minus size={16} className="text-[var(--text-muted)] opacity-20" />;
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-end gap-4 flex-wrap">
                <div>
                    <h1 className="workspace-title text-[var(--text-primary)]">Feature Matrix</h1>
                    <p className="text-sm text-[var(--text-muted)]">Comparative analysis of capabilities.</p>
                </div>

                <form onSubmit={handleAddFeature} className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        value={newFeatureName}
                        onChange={(e) => setNewFeatureName(e.target.value)}
                        aria-label="New feature name"
                        placeholder="New feature..."
                        className="min-w-0 flex-1 h-10 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-control)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-info)] outline-none"
                    />
                    <button
                        type="submit"
                        className="h-10 w-10 shrink-0 flex items-center justify-center bg-[var(--accent-info-muted)] text-[var(--accent-info)] border border-[var(--accent-info)] rounded-[var(--radius-control)] hover:bg-[var(--accent-info-muted)]/80 transition-colors"
                        aria-label="Add feature"
                    >
                        <Plus size={16} />
                    </button>
                </form>
            </div>

            <p className="text-xs text-[var(--text-muted)]">Scroll sideways to compare all competitors. Select a status to change it.</p>
            <div className="flex-1 overflow-auto bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-card)]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky top-0 z-20 bg-[var(--bg-primary)] h-11 px-3 text-left font-mono text-xs text-[var(--text-muted)] uppercase border-b border-[var(--border-default)] min-w-[160px] sticky left-0">
                                Feature
                            </th>
                            <th className="sticky top-0 z-20 bg-[var(--bg-primary)] h-11 px-3 text-center font-mono text-xs text-[var(--accent-info)] uppercase border-b border-[var(--border-default)] min-w-[140px]">
                                Your Startup
                            </th>
                            {competitors.map((comp) => (
                                <th
                                    key={comp.id}
                                    className="sticky top-0 z-20 bg-[var(--bg-primary)] h-11 px-3 text-center font-mono text-xs text-[var(--text-primary)] uppercase border-b border-[var(--border-default)] min-w-[140px]"
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                comp.threatLevel === 'High'
                                                    ? 'bg-[var(--accent-danger)]'
                                                    : comp.threatLevel === 'Medium'
                                                        ? 'bg-[var(--accent-warning)]'
                                                        : 'bg-[var(--accent-success)]'
                                            }`}
                                        />
                                        {comp.name}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allFeatures.length === 0 ? (
                            <tr>
                                <td colSpan={2 + competitors.length} className="p-8 text-center text-[var(--text-muted)] italic">
                                    No features tracked yet. Add one above.
                                </td>
                            </tr>
                        ) : (
                            allFeatures.map((feature) => (
                                <tr
                                    key={feature}
                                    className="group h-[52px] hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-subtle)]"
                                >
                                    <td className="sticky left-0 bg-[var(--bg-secondary)] z-10 px-3 py-2.5 font-mono text-sm text-[var(--text-primary)] border-r border-[var(--border-subtle)]">
                                        {feature}
                                    </td>

                                    <td
                                        className="px-3 py-2.5 text-center cursor-pointer hover:bg-[var(--bg-hover)] border-r border-[var(--border-subtle)] transition-colors"
                                    >
                                        <button type="button" onClick={() => toggleUserFeature(feature)} aria-label={`Your Startup: ${feature} — ${userProfile.features[feature] || 'Unknown'}. Change status`} className="flex w-full min-h-10 justify-center flex-col items-center gap-1">
                                            {getIconForStatus(userProfile.features[feature])}
                                            <span className="text-[10px] uppercase text-[var(--text-muted)] font-mono ">
                                                {userProfile.features[feature] || 'Unknown'}
                                            </span>
                                        </button>
                                    </td>

                                    {competitors.map((comp) => (
                                        <td
                                            key={comp.id}
                                            className="px-3 py-2.5 text-center cursor-pointer hover:bg-[var(--bg-hover)] border-r border-[var(--border-subtle)] transition-colors"
                                        >
                                            <button type="button" onClick={() => cycleCompetitorFeature(comp.id, feature)} aria-label={`${comp.name}: ${feature} — ${comp.features[feature] || 'Unknown'}. Change status`} className="flex w-full min-h-10 justify-center flex-col items-center gap-1">
                                                {getIconForStatus(comp.features[feature])}
                                                <span className="text-[10px] uppercase text-[var(--text-muted)] font-mono ">
                                                    {comp.features[feature] || 'Unknown'}
                                                </span>
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)] font-mono p-3 border border-[var(--border-default)] rounded-[var(--radius-control)] bg-[var(--bg-primary)]/50">
                <span className="flex items-center gap-1"><Check size={12} className="text-[var(--accent-success)]" /> Have</span>
                <span className="flex items-center gap-1"><TrendingUp size={12} className="text-[var(--accent-info)]" /> Better</span>
                <span className="flex items-center gap-1"><TrendingDown size={12} className="text-[var(--accent-warning)]" /> Worse</span>
                <span className="flex items-center gap-1"><X size={12} className="text-[var(--accent-danger)]" /> Missing</span>
                <span className="ml-auto">Activate a status to cycle · Scroll sideways for all competitors</span>
            </div>
        </div>
    );
};

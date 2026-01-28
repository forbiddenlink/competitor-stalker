import React, { useState, useMemo } from 'react';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Check, X, Minus, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { FeatureStatus } from '../../../types';

export const FeatureMatrix: React.FC = () => {
    const { competitors, userProfile, updateCompetitor, updateUserProfile } = useCompetitors();
    const [newFeatureName, setNewFeatureName] = useState('');

    // Derived unique features
    const allFeatures = useMemo(() => {
        const features = new Set<string>();
        // Add user features
        Object.keys(userProfile.features).forEach(f => features.add(f));
        // Add competitor features
        competitors.forEach(comp => {
            Object.keys(comp.features).forEach(f => features.add(f));
        });
        return Array.from(features).sort();
    }, [competitors, userProfile]);

    const handleAddFeature = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFeatureName.trim()) return;

        // Add to user profile map if not exists
        if (!userProfile.features[newFeatureName]) {
            const newFeatures = { ...userProfile.features, [newFeatureName]: 'Have' as FeatureStatus };
            updateUserProfile({ features: newFeatures });
        }
        setNewFeatureName('');
    };

    const toggleUserFeature = (feature: string) => {
        const currentStatus = userProfile.features[feature];
        let nextStatus: FeatureStatus | undefined;

        // Cycle: undefined -> Have -> Better -> Worse -> DontHave -> undefined
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
        const comp = competitors.find(c => c.id === competitorId);
        if (!comp) return;

        const currentStatus = comp.features[feature];
        let nextStatus: FeatureStatus | undefined;

        // Cycle: undefined -> Have -> Better -> Worse -> DontHave -> undefined
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
            case 'Have': return <Check size={16} className="text-accent-green" />;
            case 'DontHave': return <X size={16} className="text-accent-red" />;
            case 'Better': return <TrendingUp size={16} className="text-accent-cyan" />;
            case 'Worse': return <TrendingDown size={16} className="text-accent-amber" />;
            default: return <Minus size={16} className="text-text-muted opacity-20" />;
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-mono text-text-primary">Feature Matrix</h2>
                    <p className="text-sm text-text-muted">Comparative analysis of capabilities.</p>
                </div>

                <form onSubmit={handleAddFeature} className="flex gap-2">
                    <input
                        type="text"
                        value={newFeatureName}
                        onChange={(e) => setNewFeatureName(e.target.value)}
                        placeholder="New Feature..."
                        className="bg-bg-secondary border border-border-dim rounded px-3 py-1 text-sm text-text-primary focus:border-accent-cyan outline-none"
                    />
                    <button type="submit" className="p-1.5 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan rounded hover:bg-accent-cyan/20">
                        <Plus size={16} />
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-auto bg-bg-secondary border border-border-dim rounded p-1">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky top-0 z-20 bg-bg-primary p-4 text-left font-mono text-xs text-text-muted uppercase border-b border-border-dim min-w-[200px]">
                                Feature Specification
                            </th>
                            <th className="sticky top-0 z-20 bg-bg-primary p-4 text-center font-mono text-xs text-accent-cyan uppercase border-b border-border-dim min-w-[120px]">
                                YOUR STARTUP
                            </th>
                            {competitors.map(comp => (
                                <th key={comp.id} className="sticky top-0 z-20 bg-bg-primary p-4 text-center font-mono text-xs text-text-primary uppercase border-b border-border-dim min-w-[120px]">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${comp.threatLevel === 'High' ? 'bg-accent-red' :
                                            comp.threatLevel === 'Medium' ? 'bg-accent-amber' : 'bg-accent-green'
                                            }`} />
                                        {comp.name}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allFeatures.length === 0 ? (
                            <tr>
                                <td colSpan={2 + competitors.length} className="p-8 text-center text-text-muted italic">
                                    No features tracked yet. Add one above.
                                </td>
                            </tr>
                        ) : (
                            allFeatures.map((feature) => (
                                <tr key={feature} className="group hover:bg-white/5 transition-colors border-b border-white/5">
                                    <td className="p-4 font-mono text-sm text-text-primary border-r border-white/5">
                                        {feature}
                                    </td>

                                    {/* User Column */}
                                    <td
                                        onClick={() => toggleUserFeature(feature)}
                                        className="p-4 text-center cursor-pointer hover:bg-white/10 border-r border-white/5 transition-colors"
                                    >
                                        <div className="flex justify-center flex-col items-center gap-1">
                                            {getIconForStatus(userProfile.features[feature])}
                                            <span className="text-[10px] uppercase text-text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                {userProfile.features[feature] || '-'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Competitor Columns */}
                                    {competitors.map(comp => (
                                        <td
                                            key={comp.id}
                                            onClick={() => cycleCompetitorFeature(comp.id, feature)}
                                            className="p-4 text-center cursor-pointer hover:bg-white/10 border-r border-white/5 transition-colors"
                                        >
                                            <div className="flex justify-center flex-col items-center gap-1">
                                                {getIconForStatus(comp.features[feature])}
                                                <span className="text-[10px] uppercase text-text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {comp.features[feature] || '-'}
                                                </span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-4 text-xs text-text-muted font-mono p-2 border border-border-dim rounded bg-black/20">
                <span className="flex items-center gap-1"><Check size={12} className="text-accent-green" /> Have</span>
                <span className="flex items-center gap-1"><TrendingUp size={12} className="text-accent-cyan" /> Better</span>
                <span className="flex items-center gap-1"><TrendingDown size={12} className="text-accent-amber" /> Worse</span>
                <span className="flex items-center gap-1"><X size={12} className="text-accent-red" /> Missing</span>
                <span className="ml-auto opacity-50">Click cells to toggle status</span>
            </div>
        </div>
    );
};

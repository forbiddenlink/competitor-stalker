import React from 'react';
import { DossierCard } from './DossierCard';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Plus } from 'lucide-react';
import type { Competitor } from '../../../types';

export const DossierGrid: React.FC = () => {
    const { competitors, addCompetitor } = useCompetitors();
    // const [isAdding, setIsAdding] = useState(false);

    // Quick mock add for prototype functionality
    const handleQuickAdd = () => {
        const mockCompetitor: Competitor = {
            id: crypto.randomUUID(),
            name: `Rival Corp ${competitors.length + 1}`,
            website: 'https://example.com',
            threatLevel: 'Medium',
            oneLiner: 'Disrupting the industry with AI-driven widgets.',
            features: {},
            pricingModels: [],
            notes: '',
            size: '50-100',
            estimatedRevenue: '$5M - $10M'
        };
        addCompetitor(mockCompetitor);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border-dim pb-4">
                <div>
                    <h2 className="text-2xl font-mono text-text-primary">Target Dossiers</h2>
                    <p className="text-sm text-text-muted mt-1">Active surveillance targets</p>
                </div>
                <button
                    onClick={handleQuickAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/20 transition-all uppercase tracking-wider text-sm font-bold skew-x-[-10deg]"
                >
                    <Plus size={16} className="skew-x-[10deg]" />
                    <span className="skew-x-[10deg]">Add Target</span>
                </button>
            </div>

            {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border-dim rounded bg-white/5">
                    <div className="text-4xl mb-4 opacity-50">🕵️</div>
                    <h3 className="text-xl font-mono mb-2">No Targets Identified</h3>
                    <p className="text-text-muted text-sm max-w-md text-center mb-6">
                        The database is empty. Add a competitor to begin surveillance operations.
                    </p>
                    <button
                        onClick={handleQuickAdd}
                        className="px-6 py-2 bg-text-primary text-bg-primary font-bold hover:bg-white transition-colors uppercase tracking-widest text-sm"
                    >
                        Initialize First Target
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {competitors.map(comp => (
                        <DossierCard key={comp.id} competitor={comp} />
                    ))}
                </div>
            )}
        </div>
    );
};

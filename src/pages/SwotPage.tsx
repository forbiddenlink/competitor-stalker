import React, { useState } from 'react';
import { SquareStack, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCompetitors } from '../hooks/useCompetitors';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import type { Competitor } from '../types';

interface SwotCardProps {
    title: string;
    items: string[];
    color: string;
    bgColor: string;
    onAdd: (text: string) => void;
    onRemove: (index: number) => void;
}

const SwotCard: React.FC<SwotCardProps> = ({
    title,
    items,
    color,
    bgColor,
    onAdd,
    onRemove,
}) => {
    const [newItem, setNewItem] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem('');
            setIsAdding(false);
        }
    };

    return (
        <div className={`surface-card p-4 ${bgColor}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${color}`}>{title}</h3>
                <span className="text-xs text-[var(--text-muted)]">{items.length} items</span>
            </div>

            <div className="space-y-2 min-h-[100px]">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded-lg bg-[var(--bg-primary)] group"
                    >
                        <span className="flex-1 text-sm text-[var(--text-secondary)]">{item}</span>
                        <button
                            onClick={() => onRemove(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {items.length === 0 && !isAdding && (
                    <div className="text-center py-4 text-sm text-[var(--text-muted)]">
                        No items yet
                    </div>
                )}

                {isAdding ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            placeholder={`Add ${title.toLowerCase()}...`}
                            className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)]"
                            autoFocus
                        />
                        <Button size="sm" onClick={handleAdd}>Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center justify-center gap-1 p-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-dashed border-[var(--border-default)] hover:border-[var(--border-muted)] rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </button>
                )}
            </div>
        </div>
    );
};

const SwotAnalysis: React.FC<{
    competitor: Competitor;
    onUpdate: (updates: Partial<Competitor>) => void;
}> = ({ competitor, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const strengths = competitor.strengths || [];
    const weaknessTexts = competitor.weaknesses?.map(w => w.text) || [];
    const opportunities = competitor.opportunities || [];
    const threats = competitor.threats || [];

    return (
        <div className="surface-card overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
                        <span className="text-sm font-semibold">
                            {competitor.name.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold">{competitor.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            {strengths.length + weaknessTexts.length + opportunities.length + threats.length} total insights
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`
                        badge
                        ${competitor.threatLevel === 'High' ? 'badge-danger' :
                          competitor.threatLevel === 'Medium' ? 'badge-warning' : 'badge-success'}
                    `}>
                        {competitor.threatLevel}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {/* SWOT Grid */}
            {isExpanded && (
                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SwotCard
                        title="Strengths"
                        items={strengths}
                        color="text-[var(--accent-success)]"
                        bgColor="border-l-2 border-l-[var(--accent-success)]"
                        onAdd={(text) => onUpdate({ strengths: [...strengths, text] })}
                        onRemove={(index) => onUpdate({
                            strengths: strengths.filter((_, i) => i !== index)
                        })}
                    />
                    <SwotCard
                        title="Weaknesses"
                        items={weaknessTexts}
                        color="text-[var(--accent-danger)]"
                        bgColor="border-l-2 border-l-[var(--accent-danger)]"
                        onAdd={(text) => onUpdate({
                            weaknesses: [
                                ...(competitor.weaknesses || []),
                                {
                                    id: `w-${Date.now()}`,
                                    text,
                                    source: 'SWOT Analysis',
                                    severity: 'Medium',
                                    date: new Date().toISOString().split('T')[0],
                                }
                            ]
                        })}
                        onRemove={(index) => onUpdate({
                            weaknesses: competitor.weaknesses?.filter((_, i) => i !== index)
                        })}
                    />
                    <SwotCard
                        title="Opportunities"
                        items={opportunities}
                        color="text-[var(--accent-info)]"
                        bgColor="border-l-2 border-l-[var(--accent-info)]"
                        onAdd={(text) => onUpdate({ opportunities: [...opportunities, text] })}
                        onRemove={(index) => onUpdate({
                            opportunities: opportunities.filter((_, i) => i !== index)
                        })}
                    />
                    <SwotCard
                        title="Threats"
                        items={threats}
                        color="text-[var(--accent-warning)]"
                        bgColor="border-l-2 border-l-[var(--accent-warning)]"
                        onAdd={(text) => onUpdate({ threats: [...threats, text] })}
                        onRemove={(index) => onUpdate({
                            threats: threats.filter((_, i) => i !== index)
                        })}
                    />
                </div>
            )}
        </div>
    );
};

const SwotPage: React.FC = () => {
    const { competitors, updateCompetitor } = useCompetitors();
    const toast = useToast();
    const [filter, setFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

    const filteredCompetitors = filter === 'all'
        ? competitors
        : competitors.filter(c => c.threatLevel === filter);

    const handleUpdate = (id: string, updates: Partial<Competitor>) => {
        updateCompetitor(id, updates);
        toast.success('SWOT analysis updated');
    };

    // Calculate summary stats
    const totalStrengths = competitors.reduce((acc, c) => acc + (c.strengths?.length || 0), 0);
    const totalWeaknesses = competitors.reduce((acc, c) => acc + (c.weaknesses?.length || 0), 0);
    const totalOpportunities = competitors.reduce((acc, c) => acc + (c.opportunities?.length || 0), 0);
    const totalThreats = competitors.reduce((acc, c) => acc + (c.threats?.length || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        <SquareStack className="w-7 h-7 text-[var(--accent-purple)]" />
                        SWOT Analysis
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">
                        Analyze strengths, weaknesses, opportunities, and threats
                    </p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    {(['all', 'High', 'Medium', 'Low'] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            className={`
                                px-3 py-1.5 text-sm rounded-lg transition-colors
                                ${filter === level
                                    ? 'bg-[var(--accent-brand)] text-[var(--text-primary)]'
                                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}
                            `}
                        >
                            {level === 'all' ? 'All' : level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="metric-card border-l-2 border-l-[var(--accent-success)]">
                    <div className="text-sm text-[var(--text-muted)]">Strengths</div>
                    <div className="text-2xl font-semibold data-mono text-[var(--accent-success)]">{totalStrengths}</div>
                </div>
                <div className="metric-card border-l-2 border-l-[var(--accent-danger)]">
                    <div className="text-sm text-[var(--text-muted)]">Weaknesses</div>
                    <div className="text-2xl font-semibold data-mono text-[var(--accent-danger)]">{totalWeaknesses}</div>
                </div>
                <div className="metric-card border-l-2 border-l-[var(--accent-info)]">
                    <div className="text-sm text-[var(--text-muted)]">Opportunities</div>
                    <div className="text-2xl font-semibold data-mono text-[var(--accent-info)]">{totalOpportunities}</div>
                </div>
                <div className="metric-card border-l-2 border-l-[var(--accent-warning)]">
                    <div className="text-sm text-[var(--text-muted)]">Threats</div>
                    <div className="text-2xl font-semibold data-mono text-[var(--accent-warning)]">{totalThreats}</div>
                </div>
            </div>

            {/* Competitor SWOT Cards */}
            <div className="space-y-4">
                {filteredCompetitors.length === 0 ? (
                    <div className="empty-state">
                        <SquareStack className="w-12 h-12 mb-4 text-[var(--text-subtle)]" />
                        <p className="text-lg mb-2">No competitors found</p>
                        <p className="text-sm">
                            {filter !== 'all'
                                ? `No ${filter.toLowerCase()} threat competitors`
                                : 'Add competitors to start your SWOT analysis'}
                        </p>
                    </div>
                ) : (
                    filteredCompetitors.map(competitor => (
                        <SwotAnalysis
                            key={competitor.id}
                            competitor={competitor}
                            onUpdate={(updates) => handleUpdate(competitor.id, updates)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SwotPage;

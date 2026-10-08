import React, { useState } from 'react';
import { DossierCard } from './DossierCard';
import { CompetitorForm } from './CompetitorForm';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Button } from '../../common/Button';
import { useSearchParams } from 'react-router';
import { downloadFile } from '../../../utils/export';
import { Plus, Users } from 'lucide-react';
import type { Competitor } from '../../../types';

export const DossierGrid: React.FC = () => {
    const { competitors, addCompetitor, updateCompetitor, removeCompetitor } = useCompetitors();
    const [params, setParams] = useSearchParams();
    const [query, setQuery] = useState('');
    const [threat, setThreat] = useState('All');
    const [sort, setSort] = useState('name');
    const selected = competitors.find(c => c.id === params.get('competitor'));
    const visible = competitors.filter(c => (threat === 'All' || c.threatLevel === threat)
        && `${c.name} ${c.oneLiner || ''} ${c.website}`.toLowerCase().includes(query.toLowerCase().trim()))
        .sort((a, b) => sort === 'threat'
            ? ({ High: 0, Medium: 1, Low: 2 }[a.threatLevel] - { High: 0, Medium: 1, Low: 2 }[b.threatLevel] || a.name.localeCompare(b.name))
            : sort === 'saved' ? (Date.parse(b.updatedAt || '') || 0) - (Date.parse(a.updatedAt || '') || 0) : a.name.localeCompare(b.name));
    const [showForm, setShowForm] = useState(false);
    const [editingCompetitor, setEditingCompetitor] = useState<Competitor | undefined>(undefined);

    const handleAdd = () => {
        setEditingCompetitor(undefined);
        setShowForm(true);
    };

    const handleEdit = (competitor: Competitor) => {
        setEditingCompetitor(competitor);
        setShowForm(true);
    };

    const handleSave = (competitor: Competitor) => {
        if (editingCompetitor) {
            updateCompetitor(competitor.id, competitor);
        } else {
            addCompetitor(competitor);
        }
        setShowForm(false);
        setEditingCompetitor(undefined);
    };

    const handleDelete = (id: string) => {
        removeCompetitor(id);
        setShowForm(false);
        setEditingCompetitor(undefined);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCompetitor(undefined);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="workspace-title">
                        Competitors
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        {competitors.length} {competitors.length === 1 ? 'competitor' : 'competitors'} in your local research workspace
                    </p>
                </div>
                <Button
                    onClick={handleAdd}
                    leftIcon={<Plus size={16} />}
                >
                    Add Target
                </Button>
            </div>

            <div className="panel p-4 flex flex-wrap gap-3 items-end">
                <label className="basis-full sm:basis-0 flex-1 min-w-0 text-xs text-[var(--text-muted)]">Find competitors
                    <input type="search" aria-label="Find competitors" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, summary or website" className="block w-full h-10 px-3 mt-1" />
                </label>
                <label className="text-xs text-[var(--text-muted)]">Threat
                    <select value={threat} onChange={e => setThreat(e.target.value)} className="block h-10 px-3 mt-1">
                        {['All', 'High', 'Medium', 'Low'].map(t => <option key={t}>{t}</option>)}
                    </select>
                </label>
                <label className="text-xs text-[var(--text-muted)]">Sort by
                    <select value={sort} onChange={e => setSort(e.target.value)} className="block h-10 px-3 mt-1">
                        <option value="name">Name</option><option value="threat">Threat</option><option value="saved">Recently saved</option>
                    </select>
                </label>
                <Button variant="ghost" onClick={() => { setQuery(''); setThreat('All'); }}>Clear filters</Button>
            </div>

            {selected && (
                <section className="panel p-5 battlecard" aria-label={`${selected.name} battlecard`}>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                        <div><p className="section-label mb-2">Saved intelligence / Unverified summary</p><h2 className="text-2xl font-display font-normal">{selected.name} / Battlecard</h2><p className="mt-2 text-[var(--text-secondary)] break-words">{selected.oneLiner || selected.website}</p></div>
                        <div className="flex flex-wrap gap-2 print-hidden">
                            <Button variant="secondary" size="sm" onClick={() => handleEdit(selected)}>Edit dossier</Button>
                            <Button variant="secondary" size="sm" onClick={() => downloadFile([
                                `${selected.name} / Battlecard`, 'Local saved research; verify against sources.', selected.website, selected.oneLiner || '',
                                `Threat: ${selected.threatLevel}`, `Strengths: ${(selected.strengths || []).join('; ') || 'None recorded'}`,
                                `Weaknesses: ${(selected.weaknesses || []).map(w => `${w.text} [${w.source}]`).join('; ') || 'None recorded'}`,
                                `Opportunities: ${(selected.opportunities || []).join('; ') || 'None recorded'}`, `Threats: ${(selected.threats || []).join('; ') || 'None recorded'}`,
                                `Features: ${Object.entries(selected.features || {}).map(([f, status]) => `${f}: ${status}`).join('; ') || 'None recorded'}`,
                                `Pricing: ${(selected.pricingModels || []).map(p => `${p.name}: ${p.price} — ${p.description}`).join('; ') || 'None recorded'}`,
                                `Strategies: ${(selected.strategies || []).map(s => `${s.title} (${s.status})`).join('; ') || 'None recorded'}`,
                                `Sources: ${(selected.sources || []).map(s => `${s.label}: ${s.url}`).join('; ') || 'None linked'}`, selected.notes,
                            ].join('\n\n'), 'competitor-brief.txt', 'text/plain')}>Download brief</Button>
                            <Button variant="ghost" size="sm" onClick={() => window.print()}>Print</Button>
                            <Button variant="ghost" size="sm" onClick={() => setParams({})}>Close battlecard</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            { title: 'Strengths', items: selected.strengths || [] },
                            { title: 'Weaknesses', items: (selected.weaknesses || []).map(w => `${w.text} — ${w.source || 'No source recorded'}`) },
                            { title: 'Opportunities', items: selected.opportunities || [] },
                            { title: 'Threats', items: selected.threats || [] },
                            { title: 'Response strategies', items: (selected.strategies || []).map(s => `${s.title} / ${s.status}`) },
                            { title: 'Features', items: Object.entries(selected.features || {}).map(([name, status]) => `${name}: ${status}`) },
                            { title: 'Pricing', items: (selected.pricingModels || []).map(plan => `${plan.name}: ${plan.price} — ${plan.description}`) },
                            { title: 'Linked sources', items: (selected.sources || []).map(s => `${s.label}: ${s.url}`) },
                        ].map(section => <div key={section.title} className="border-t border-[var(--border-muted)] pt-3"><h3 className="section-label mb-2">{section.title}</h3>{section.items.length ? <ul className="space-y-2 text-sm text-[var(--text-secondary)] break-words">{section.items.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="text-sm text-[var(--text-muted)]">No {section.title.toLowerCase()} recorded.</p>}</div>)}
                    </div>
                </section>
            )}
            {/* Content */}
            {competitors.length === 0 ? (
                <div className="empty-state">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mb-4">
                        <Users size={24} className="text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        No Targets Identified
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
                        Add a competitor to begin surveillance operations and track their market movements.
                    </p>
                    <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                        Add First Target
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {visible.map((comp, index) => (
                        <div
                            key={comp.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <Button variant="ghost" size="sm" className="mb-2" onClick={() => setParams({ competitor: comp.id })} aria-label={`Open battlecard for ${comp.name}`}>Open battlecard</Button>
                            <DossierCard
                                competitor={comp}
                                onEdit={() => handleEdit(comp)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {competitors.length > 0 && visible.length === 0 && <div className="empty-state"><h2 className="text-lg">No matching competitors</h2><p className="mt-2">Clear the filters or try a different search.</p></div>}
            {/* Form Modal */}
            {showForm && (
                <CompetitorForm
                    competitor={editingCompetitor}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={editingCompetitor ? handleDelete : undefined}
                />
            )}
        </div>
    );
};

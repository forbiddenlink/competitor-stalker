import React, { useState } from 'react';
import { DossierCard } from './DossierCard';
import { CompetitorForm } from './CompetitorForm';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Button } from '../../common/Button';
import { Plus, Users } from 'lucide-react';
import type { Competitor } from '../../../types';

export const DossierGrid: React.FC = () => {
    const { competitors, addCompetitor, updateCompetitor, removeCompetitor } = useCompetitors();
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
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Competitors
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        {competitors.length} {competitors.length === 1 ? 'target' : 'targets'} under surveillance
                    </p>
                </div>
                <Button
                    onClick={handleAdd}
                    leftIcon={<Plus size={16} />}
                >
                    Add Target
                </Button>
            </div>

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
                    {competitors.map((comp, index) => (
                        <div
                            key={comp.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <DossierCard
                                competitor={comp}
                                onEdit={() => handleEdit(comp)}
                            />
                        </div>
                    ))}
                </div>
            )}

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

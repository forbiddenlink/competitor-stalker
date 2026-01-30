import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { useToast } from '../../../context/ToastContext';

interface MilestoneFormProps {
    competitorId: string;
    onSave: () => void;
    onCancel: () => void;
}

export const MilestoneForm: React.FC<MilestoneFormProps> = ({ competitorId, onSave, onCancel }) => {
    const [label, setLabel] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addMilestone, competitors } = useCompetitors();
    const { success, error } = useToast();

    const competitor = competitors.find(c => c.id === competitorId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!label.trim()) {
            error('Please enter a milestone label');
            return;
        }

        if (!competitor) {
            error('Competitor not found');
            return;
        }

        setIsSubmitting(true);

        try {
            const snapshot = addMilestone(competitorId, label.trim());

            if (snapshot) {
                success(`Milestone "${label.trim()}" saved`);
                onSave();
            } else {
                error('Failed to create milestone');
            }
        } catch {
            error('An error occurred while saving the milestone');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-muted)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-warning-muted)] flex items-center justify-center">
                        <Star size={12} className="text-[var(--accent-warning)] fill-[var(--accent-warning)]" />
                    </div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">
                        Add Milestone
                    </h4>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <Input
                        label="Milestone Label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g., Series B announcement, Major pricing change"
                        autoFocus
                        hint="Add a label to mark this point in time. The current competitor state will be saved."
                    />
                </div>

                {competitor && (
                    <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-xs">
                        <span className="text-[var(--text-muted)]">Saving snapshot for:</span>{' '}
                        <span className="text-[var(--text-primary)] font-medium">{competitor.name}</span>
                        <span className="text-[var(--text-muted)]"> ({competitor.threatLevel} threat)</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        isLoading={isSubmitting}
                        disabled={!label.trim()}
                        leftIcon={<Star size={14} className="fill-current" />}
                    >
                        Save Milestone
                    </Button>
                </div>
            </form>
        </div>
    );
};

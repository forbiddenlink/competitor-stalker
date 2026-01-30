import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import type { Competitor, ThreatLevel } from '../../../types';

interface CompetitorFormProps {
    competitor?: Competitor;
    onSave: (competitor: Competitor) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}

export const CompetitorForm: React.FC<CompetitorFormProps> = ({
    competitor,
    onSave,
    onCancel,
    onDelete
}) => {
    const isNew = !competitor;
    const [form, setForm] = useState<Partial<Competitor>>({
        name: competitor?.name || '',
        website: competitor?.website || '',
        threatLevel: competitor?.threatLevel || 'Medium',
        oneLiner: competitor?.oneLiner || '',
        size: competitor?.size || '',
        estimatedRevenue: competitor?.estimatedRevenue || '',
        notes: competitor?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name?.trim()) return;

        const saved: Competitor = {
            id: competitor?.id || crypto.randomUUID(),
            name: form.name.trim(),
            website: form.website || '',
            threatLevel: form.threatLevel as ThreatLevel,
            oneLiner: form.oneLiner || '',
            size: form.size || '',
            estimatedRevenue: form.estimatedRevenue || '',
            notes: form.notes || '',
            features: competitor?.features || {},
            pricingModels: competitor?.pricingModels || [],
            weaknesses: competitor?.weaknesses || [],
            strategies: competitor?.strategies || [],
            socialHandles: competitor?.socialHandles || {},
            positionX: competitor?.positionX,
            positionY: competitor?.positionY,
        };
        onSave(saved);
    };

    const updateField = (field: keyof Competitor, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-xl overflow-hidden animate-fade-in"
                style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        {isNew ? 'Add Competitor' : 'Edit Competitor'}
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Company Name *
                        </label>
                        <Input
                            value={form.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="e.g. Acme Corp"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Website
                        </label>
                        <Input
                            value={form.website || ''}
                            onChange={(e) => updateField('website', e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Threat Level
                        </label>
                        <select
                            value={form.threatLevel}
                            onChange={(e) => updateField('threatLevel', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                                Company Size
                            </label>
                            <Input
                                value={form.size || ''}
                                onChange={(e) => updateField('size', e.target.value)}
                                placeholder="e.g. 50-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                                Est. Revenue
                            </label>
                            <Input
                                value={form.estimatedRevenue || ''}
                                onChange={(e) => updateField('estimatedRevenue', e.target.value)}
                                placeholder="e.g. $5M - $10M"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            One-liner Description
                        </label>
                        <Input
                            value={form.oneLiner || ''}
                            onChange={(e) => updateField('oneLiner', e.target.value)}
                            placeholder="What do they do?"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Notes
                        </label>
                        <textarea
                            value={form.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value)}
                            placeholder="Additional notes..."
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)] resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                        <div>
                            {!isNew && onDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onDelete(competitor.id)}
                                    className="text-[var(--accent-danger)] hover:bg-[var(--accent-danger-muted)]"
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!form.name?.trim()}>
                                {isNew ? 'Add Competitor' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

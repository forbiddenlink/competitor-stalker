import React, { useState } from 'react';
import type { PricingPlan } from '../../../types';
import { Card } from '../../common/Card';
import { Input, Textarea } from '../../common/Input';
import { Button } from '../../common/Button';
import { Trash2, Edit2, Save, X, DollarSign } from 'lucide-react';

interface PricingCardProps {
    plan: PricingPlan;
    isEditable?: boolean;
    onSave?: (updatedPlan: PricingPlan) => void;
    onDelete?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
    plan,
    isEditable = false,
    onSave,
    onDelete
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlan, setEditedPlan] = useState<PricingPlan>(plan);

    const handleSave = () => {
        if (onSave) {
            onSave(editedPlan);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditedPlan(plan);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Card variant="surface" className="h-full" padding="lg">
                <div className="space-y-4">
                    <Input
                        label="Plan Name"
                        value={editedPlan.name}
                        onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                        placeholder="e.g. Pro Tier"
                    />
                    <Input
                        label="Price"
                        value={editedPlan.price}
                        onChange={(e) => setEditedPlan({ ...editedPlan, price: e.target.value })}
                        placeholder="e.g. $49/mo"
                        leftElement={<DollarSign size={14} />}
                    />
                    <Textarea
                        label="Description"
                        value={editedPlan.description}
                        onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                        placeholder="Describe what's included..."
                        rows={4}
                    />
                    <div className="flex gap-2 justify-end pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            leftIcon={<X size={14} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            leftIcon={<Save size={14} />}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="default" className="h-full group" padding="none">
            <div className="p-5 h-full flex flex-col">
                {/* Header with actions */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                            {plan.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-semibold font-mono text-[var(--accent-brand)]">
                                {plan.price}
                            </span>
                            {plan.price !== 'Custom' && !plan.price.includes('Contact') && (
                                <span className="text-xs text-[var(--text-muted)]">/month</span>
                            )}
                        </div>
                    </div>

                    {isEditable && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-brand)] hover:bg-[var(--bg-hover)] transition-colors"
                                aria-label="Edit pricing plan"
                            >
                                <Edit2 size={14} />
                            </button>
                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-danger)] hover:bg-[var(--accent-danger-muted)] transition-colors"
                                    aria-label="Delete pricing plan"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1 whitespace-pre-wrap">
                    {plan.description}
                </p>
            </div>
        </Card>
    );
};

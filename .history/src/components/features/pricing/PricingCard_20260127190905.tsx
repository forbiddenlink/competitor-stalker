
import React, { useState } from 'react';
import type { PricingPlan } from '../../../types';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Trash2, Edit2, Save, X } from 'lucide-react';

interface PricingCardProps {
    plan: PricingPlan;
    isEditable?: boolean;
    onSave?: (updatedPlan: PricingPlan) => void;
    onDelete?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isEditable = false, onSave, onDelete }) => {
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
            <Card className="h-full flex flex-col gap-3 p-4 border-neon-blue/50">
                <Input
                    label="Plan Name"
                    value={editedPlan.name}
                    onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                    placeholder="e.g. Free Tier"
                />
                <Input
                    label="Price"
                    value={editedPlan.price}
                    onChange={(e) => setEditedPlan({ ...editedPlan, price: e.target.value })}
                    placeholder="e.g. $0/mo"
                />
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                        className="w-full bg-black/50 border border-neon-blue/30 rounded p-2 text-white focus:border-neon-blue focus:outline-none resize-none h-24"
                        value={editedPlan.description}
                        onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                    />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col p-4 relative group hover:border-neon-blue transition-colors">
            {isEditable && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 hover:text-neon-blue text-gray-400 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-1 hover:text-red-500 text-gray-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="text-2xl font-mono text-neon-pink mb-4">{plan.price}</div>
            <p className="text-gray-400 text-sm whitespace-pre-wrap flex-1">{plan.description}</p>
        </Card>
    );
};

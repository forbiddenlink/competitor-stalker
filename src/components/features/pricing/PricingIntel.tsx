import React, { useContext } from 'react';
import { CompetitorContext } from '../../../context/CompetitorContext';
import { PricingCard } from './PricingCard';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Plus, DollarSign } from 'lucide-react';
import type { PricingPlan } from '../../../types';

export const PricingIntel: React.FC = () => {
    const context = useContext(CompetitorContext);

    if (!context) return null;

    const { userProfile, competitors, updateUserProfile, updateCompetitor } = context;

    const handleAddUserPlan = () => {
        const newPlan: PricingPlan = {
            name: 'New Plan',
            price: '$0',
            description: 'Description here...'
        };
        updateUserProfile({
            pricingModels: [...(userProfile.pricingModels || []), newPlan]
        });
    };

    const handleUpdateUserPlan = (index: number, updatedPlan: PricingPlan) => {
        const newPlans = [...(userProfile.pricingModels || [])];
        newPlans[index] = updatedPlan;
        updateUserProfile({ pricingModels: newPlans });
    };

    const handleDeleteUserPlan = (index: number) => {
        const newPlans = [...(userProfile.pricingModels || [])];
        newPlans.splice(index, 1);
        updateUserProfile({ pricingModels: newPlans });
    };

    const handleAddCompetitorPlan = (competitorId: string) => {
        const competitor = competitors.find(c => c.id === competitorId);
        if (!competitor) return;

        const newPlan: PricingPlan = {
            name: 'New Plan',
            price: '$0',
            description: 'Description here...'
        };

        updateCompetitor(competitorId, {
            pricingModels: [...(competitor.pricingModels || []), newPlan]
        });
    };

    const handleUpdateCompetitorPlan = (competitorId: string, index: number, updatedPlan: PricingPlan) => {
        const competitor = competitors.find(c => c.id === competitorId);
        if (!competitor) return;

        const newPlans = [...(competitor.pricingModels || [])];
        newPlans[index] = updatedPlan;
        updateCompetitor(competitorId, { pricingModels: newPlans });
    };

    const handleDeleteCompetitorPlan = (competitorId: string, index: number) => {
        const competitor = competitors.find(c => c.id === competitorId);
        if (!competitor) return;

        const newPlans = [...(competitor.pricingModels || [])];
        newPlans.splice(index, 1);
        updateCompetitor(competitorId, { pricingModels: newPlans });
    };

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Pricing Intelligence
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                    Compare pricing strategies across your market
                </p>
            </div>

            {/* Your Business Section */}
            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            {userProfile.name}
                        </h2>
                        <Badge variant="brand" size="sm">You</Badge>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleAddUserPlan}
                        leftIcon={<Plus size={14} />}
                    >
                        Add Plan
                    </Button>
                </div>

                {(!userProfile.pricingModels || userProfile.pricingModels.length === 0) ? (
                    <div className="empty-state py-12">
                        <DollarSign size={24} className="mb-3" />
                        <p className="text-sm">No pricing plans defined. Add one to start comparing.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {userProfile.pricingModels.map((plan, idx) => (
                            <PricingCard
                                key={`user-plan-${idx}`}
                                plan={plan}
                                isEditable={true}
                                onSave={(updated) => handleUpdateUserPlan(idx, updated)}
                                onDelete={() => handleDeleteUserPlan(idx)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Divider */}
            <div className="divider" />

            {/* Competitors Section */}
            {competitors.map(competitor => (
                <section key={competitor.id} className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                {competitor.name}
                            </h2>
                            <Badge
                                variant={
                                    competitor.threatLevel === 'High' ? 'danger' :
                                    competitor.threatLevel === 'Medium' ? 'warning' : 'success'
                                }
                                size="sm"
                                dot
                            >
                                {competitor.threatLevel}
                            </Badge>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddCompetitorPlan(competitor.id)}
                            leftIcon={<Plus size={14} />}
                        >
                            Add Plan
                        </Button>
                    </div>

                    {(!competitor.pricingModels || competitor.pricingModels.length === 0) ? (
                        <div className="text-sm text-[var(--text-muted)] p-6 rounded-lg border border-dashed border-[var(--border-muted)] bg-[var(--bg-secondary)] text-center">
                            No pricing intelligence gathered for {competitor.name}.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {competitor.pricingModels.map((plan, idx) => (
                                <PricingCard
                                    key={`${competitor.id}-plan-${idx}`}
                                    plan={plan}
                                    isEditable={true}
                                    onSave={(updated) => handleUpdateCompetitorPlan(competitor.id, idx, updated)}
                                    onDelete={() => handleDeleteCompetitorPlan(competitor.id, idx)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            ))}

            {competitors.length === 0 && (
                <div className="empty-state">
                    <p className="text-sm">
                        No competitors found. Add competitors from the dashboard to track their pricing.
                    </p>
                </div>
            )}
        </div>
    );
};

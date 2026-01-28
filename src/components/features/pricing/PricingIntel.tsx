
import React, { useContext } from 'react';
import { CompetitorContext } from '../../../context/CompetitorContext';
import { PricingCard } from './PricingCard';
import { Button } from '../../common/Button';
import { Plus } from 'lucide-react';
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
        <div className="p-6 space-y-12 pb-20">
            {/* My Business Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h2 className="text-2xl font-black tracking-widest text-neon-blue uppercase">
                        {userProfile.name} <span className="text-sm text-gray-500 font-normal normal-case ml-2">(You)</span>
                    </h2>
                    <Button size="sm" onClick={handleAddUserPlan}>
                        <Plus className="w-4 h-4 mr-1" /> Add Plan
                    </Button>
                </div>

                {(!userProfile.pricingModels || userProfile.pricingModels.length === 0) ? (
                    <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg text-gray-500 bg-black/20">
                        No pricing plans defined yet. Add one to start comparing.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

            {/* Competitors Section */}
            {competitors.map(competitor => (
                <section key={competitor.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h2 className="text-2xl font-black tracking-widest text-neon-pink uppercase">
                            {competitor.name}
                        </h2>
                        <Button variant="secondary" size="sm" onClick={() => handleAddCompetitorPlan(competitor.id)}>
                            <Plus className="w-4 h-4 mr-1" /> Add Competitor Plan
                        </Button>
                    </div>

                    {(!competitor.pricingModels || competitor.pricingModels.length === 0) ? (
                        <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg text-gray-500 bg-black/20 text-sm">
                            No pricing intelligence gathered for {competitor.name}.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="text-center py-20 text-gray-500">
                    No competitors found. Add competitors from the dashboard to track their pricing.
                </div>
            )}
        </div>
    );
};

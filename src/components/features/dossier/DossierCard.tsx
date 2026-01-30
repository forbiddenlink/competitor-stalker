import React, { useState } from 'react';
import { ExternalLink, Search, Building2, DollarSign, Pencil, History } from 'lucide-react';
import { Card } from '../../common/Card';
import { ThreatBadge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { HistoryDrawer } from '../history';
import type { Competitor } from '../../../types';

interface DossierCardProps {
    competitor: Competitor;
    onEdit?: () => void;
}

export const DossierCard: React.FC<DossierCardProps> = ({ competitor, onEdit }) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`https://www.google.com/search?q=${encodeURIComponent(competitor.name + ' news')}`, '_blank');
    };

    const getHostname = (url: string): string => {
        try {
            return new URL(url).hostname;
        } catch {
            return 'Invalid URL';
        }
    };

    return (
        <Card
            variant="surface"
            interactive
            className="group cursor-pointer"
            padding="none"
            onClick={onEdit}
        >
            {/* Header */}
            <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className={`
                            flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center
                            text-base font-semibold
                            ${competitor.threatLevel === 'High' ? 'bg-[var(--accent-danger-muted)] text-[var(--accent-danger)]' :
                              competitor.threatLevel === 'Medium' ? 'bg-[var(--accent-warning-muted)] text-[var(--accent-warning)]' :
                              'bg-[var(--accent-success-muted)] text-[var(--accent-success)]'}
                        `}>
                            {competitor.logo ? (
                                <img
                                    src={competitor.logo}
                                    alt={competitor.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                competitor.name?.[0] || '?'
                            )}
                        </div>

                        {/* Name & Website */}
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-brand-soft)] transition-colors">
                                {competitor.name || 'Unknown'}
                            </h3>
                            {competitor.website && (
                                <a
                                    href={competitor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent-brand)] transition-colors mt-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink size={10} />
                                    {getHostname(competitor.website)}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Threat Level */}
                    <ThreatBadge level={competitor.threatLevel} size="sm" />
                </div>
            </div>

            {/* Stats */}
            <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <Building2 size={12} />
                            <span className="text-[10px] uppercase tracking-wide font-medium">Size</span>
                        </div>
                        <p className="text-sm font-medium font-mono text-[var(--text-secondary)]">
                            {competitor.size || 'Unknown'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <DollarSign size={12} />
                            <span className="text-[10px] uppercase tracking-wide font-medium">Revenue</span>
                        </div>
                        <p className="text-sm font-medium font-mono text-[var(--text-secondary)]">
                            {competitor.estimatedRevenue || 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>

            {/* One Liner */}
            {competitor.oneLiner && (
                <div className="mx-5 mb-4 p-3 rounded-lg bg-[var(--bg-secondary)] border-l-2 border-[var(--border-muted)]">
                    <p className="text-xs text-[var(--text-muted)] italic leading-relaxed line-clamp-2">
                        "{competitor.oneLiner}"
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="px-5 pb-5 pt-2 flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Search size={14} />}
                    onClick={handleSearch}
                >
                    Research
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsHistoryOpen(true);
                    }}
                    title="View history"
                >
                    <History size={14} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                    }}
                >
                    <Pencil size={14} />
                </Button>
            </div>

            {/* History Drawer */}
            <HistoryDrawer
                competitor={competitor}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </Card>
    );
};

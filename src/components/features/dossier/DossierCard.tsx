import React from 'react';
import { Search, Globe, ShieldAlert, Target } from 'lucide-react';
import type { Competitor } from '../../../types';

interface DossierCardProps {
    competitor: Competitor;
}

export const DossierCard: React.FC<DossierCardProps> = ({ competitor }) => {
    const threatColor = {
        Low: 'border-accent-green text-accent-green',
        Medium: 'border-accent-amber text-accent-amber',
        High: 'border-accent-red text-accent-red'
    }[competitor.threatLevel];

    const threatBg = {
        Low: 'bg-accent-green/10',
        Medium: 'bg-accent-amber/10',
        High: 'bg-accent-red/10'
    }[competitor.threatLevel];

    const handleSearch = (query: string) => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    return (
        <div className={`
      relative bg-bg-secondary border-t-4 p-6 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg
      ${threatColor} border-t-current border-x border-b border-white/5
    `}>
            {/* Top Secret Stamp */}
            <div className="absolute top-4 right-4 opacity-50">
                <div className={`stamp text-[0.6rem] px-2 py-0.5 border-2 ${threatColor} rotate-[-12deg]`}>
                    CONFIDENTIAL
                </div>
            </div>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded flex items-center justify-center text-xl font-bold ${threatBg} ${threatColor}`}>
                    {competitor.logo ? <img src={competitor.logo} alt={competitor.name} className="w-full h-full object-cover rounded" /> : (competitor.name?.[0] || '?')}
                </div>
                <div>
                    <h3 className="text-xl font-mono font-bold text-text-primary">{competitor.name || 'Unknown Target'}</h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                        <Globe size={12} />
                        {competitor.website ? (
                            <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent-cyan transition-colors">
                                {(() => {
                                    try {
                                        return new URL(competitor.website).hostname;
                                    } catch {
                                        return 'Invalid URL';
                                    }
                                })()}
                            </a>
                        ) : (
                            <span>No Intel</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Company Size</div>
                    <div className="font-mono text-text-primary">{competitor.size || 'Unknown'}</div>
                </div>
                <div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Revenue</div>
                    <div className="font-mono text-text-primary">{competitor.estimatedRevenue || 'Unknown'}</div>
                </div>
            </div>

            {/* One Liner */}
            <div className="mb-6 p-3 bg-black/30 border-l-2 border-border-dim italic text-text-secondary text-sm">
                "{competitor.oneLiner}"
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                    onClick={() => handleSearch(`${competitor.name} news`)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-wider border border-border-dim hover:border-accent-cyan hover:text-accent-cyan transition-colors bg-white/5"
                >
                    <Search size={14} />
                    <span>Intel</span>
                </button>
                <button
                    onClick={() => handleSearch(`${competitor.name} reviews`)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-wider border border-border-dim hover:border-accent-red hover:text-accent-red transition-colors bg-white/5"
                >
                    <ShieldAlert size={14} />
                    <span>Dirt</span>
                </button>
            </div>

            {/* Decorative Crosshairs */}
            <Target className="absolute bottom-2 right-2 text-white/5" size={40} strokeWidth={1} />
        </div>
    );
};

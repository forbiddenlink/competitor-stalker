import React, { useContext } from 'react';
import { CompetitorContext } from '../context/CompetitorContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Activity,
    Target,
    Eye,
    ArrowUpRight,
    RefreshCw,
    Users
} from 'lucide-react';

// Metric Card Component
interface MetricCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    accentColor: 'brand' | 'success' | 'warning' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    accentColor
}) => {
    const colorMap = {
        brand: {
            border: '#3b82f6',
            text: '#60a5fa',
            bg: 'rgba(59, 130, 246, 0.15)',
        },
        success: {
            border: '#22c55e',
            text: '#4ade80',
            bg: 'rgba(34, 197, 94, 0.15)',
        },
        warning: {
            border: '#f59e0b',
            text: '#fbbf24',
            bg: 'rgba(245, 158, 11, 0.15)',
        },
        danger: {
            border: '#ef4444',
            text: '#f87171',
            bg: 'rgba(239, 68, 68, 0.15)',
        },
    };

    const colors = colorMap[accentColor];

    const getChangeColor = () => {
        if (changeType === 'positive') return '#4ade80';
        if (changeType === 'negative') return '#f87171';
        return '#71717a';
    };

    return (
        <div
            className="relative rounded-lg overflow-hidden p-5"
            style={{
                background: '#121218',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeftWidth: '3px',
                borderLeftColor: colors.border,
            }}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: '#71717a' }}
                    >
                        {title}
                    </span>
                    <div className="flex items-baseline gap-3">
                        <span
                            className="text-3xl font-semibold font-mono tracking-tight"
                            style={{ color: colors.text }}
                        >
                            {value}
                        </span>
                        {change && (
                            <span
                                className="flex items-center gap-1 text-xs font-medium"
                                style={{ color: getChangeColor() }}
                            >
                                {changeType === 'positive' && <TrendingUp size={12} />}
                                {changeType === 'negative' && <TrendingDown size={12} />}
                                {change}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    className="p-2.5 rounded-lg"
                    style={{ background: colors.bg }}
                >
                    <Icon size={18} style={{ color: colors.text }} />
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const context = useContext(CompetitorContext);
    const { competitors = [], userProfile } = context || { competitors: [], userProfile: null };

    // Calculate real metrics from data
    const highThreats = competitors.filter(c => c.threatLevel === 'High').length;
    const mediumThreats = competitors.filter(c => c.threatLevel === 'Medium').length;
    const totalCompetitors = competitors.length;

    // Calculate feature coverage - how many features are tracked
    const allFeatures = new Set<string>();
    competitors.forEach(c => {
        Object.keys(c.features || {}).forEach(f => allFeatures.add(f));
    });
    if (userProfile?.features) {
        Object.keys(userProfile.features).forEach(f => allFeatures.add(f));
    }
    const featureCount = allFeatures.size;

    // Calculate weaknesses found
    const totalWeaknesses = competitors.reduce((sum, c) => sum + (c.weaknesses?.length || 0), 0);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#fafafa' }}>
                        Dashboard
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#71717a' }}>
                        Intelligence overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw size={14} />}
                    onClick={() => window.location.reload()}
                >
                    Refresh Data
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="High Threats"
                    value={highThreats}
                    icon={AlertTriangle}
                    accentColor="danger"
                />
                <MetricCard
                    title="Medium Threats"
                    value={mediumThreats}
                    icon={Activity}
                    accentColor="warning"
                />
                <MetricCard
                    title="Features Tracked"
                    value={featureCount}
                    icon={Eye}
                    accentColor="success"
                />
                <MetricCard
                    title="Targets Tracked"
                    value={totalCompetitors}
                    icon={Target}
                    accentColor="brand"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Competitor Summary */}
                <div
                    className="lg:col-span-2 rounded-lg overflow-hidden"
                    style={{
                        background: '#121218',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <div className="flex items-center justify-between px-5 pt-5 pb-4">
                        <div>
                            <h3 className="text-base font-semibold" style={{ color: '#fafafa' }}>Competitor Overview</h3>
                            <p className="text-sm mt-0.5" style={{ color: '#71717a' }}>
                                {totalCompetitors > 0 ? 'Your tracked competitors' : 'No competitors tracked yet'}
                            </p>
                        </div>
                        {totalCompetitors > 0 && (
                            <Badge variant="info" size="sm">
                                {totalCompetitors} tracked
                            </Badge>
                        )}
                    </div>
                    <div className="px-2 pb-2">
                        {competitors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users size={48} className="mb-4 opacity-20" style={{ color: '#71717a' }} />
                                <p className="text-sm" style={{ color: '#71717a' }}>No competitors added yet</p>
                                <p className="text-xs mt-1" style={{ color: '#52525b' }}>
                                    Add competitors from the Dossiers page to see them here
                                </p>
                            </div>
                        ) : (
                            competitors.slice(0, 5).map((comp, index) => (
                                <div
                                    key={comp.id}
                                    style={{ borderTop: index > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }}
                                >
                                    <div className="flex gap-4 p-4 rounded-lg transition-colors group hover:bg-white/5">
                                        <div
                                            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{
                                                background: comp.threatLevel === 'High'
                                                    ? 'rgba(239, 68, 68, 0.15)'
                                                    : comp.threatLevel === 'Medium'
                                                    ? 'rgba(245, 158, 11, 0.15)'
                                                    : 'rgba(34, 197, 94, 0.15)'
                                            }}
                                        >
                                            <Target
                                                size={16}
                                                style={{
                                                    color: comp.threatLevel === 'High'
                                                        ? '#f87171'
                                                        : comp.threatLevel === 'Medium'
                                                        ? '#fbbf24'
                                                        : '#4ade80'
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium truncate" style={{ color: '#fafafa' }}>
                                                    {comp.name}
                                                </span>
                                                <Badge
                                                    variant={
                                                        comp.threatLevel === 'High' ? 'danger'
                                                        : comp.threatLevel === 'Medium' ? 'warning'
                                                        : 'success'
                                                    }
                                                    size="sm"
                                                >
                                                    {comp.threatLevel}
                                                </Badge>
                                            </div>
                                            <p className="text-sm truncate mt-0.5" style={{ color: '#71717a' }}>
                                                {comp.oneLiner || comp.website || 'No description'}
                                            </p>
                                        </div>
                                        <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" style={{ color: '#52525b' }} />
                                    </div>
                                </div>
                            ))
                        )}
                        {competitors.length > 5 && (
                            <div className="text-center py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <span className="text-xs" style={{ color: '#71717a' }}>
                                    +{competitors.length - 5} more competitors
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div
                    className="rounded-lg overflow-hidden"
                    style={{
                        background: '#121218',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <div className="px-5 pt-5 pb-4">
                        <h3 className="text-base font-semibold" style={{ color: '#fafafa' }}>Intelligence Summary</h3>
                        <p className="text-sm mt-0.5" style={{ color: '#71717a' }}>Data overview</p>
                    </div>
                    <div className="p-5 pt-0 space-y-4">
                        {/* Stats Items */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: '#71717a' }}>Total Competitors</span>
                                <span className="font-mono" style={{ color: '#a1a1aa' }}>{totalCompetitors}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: '#71717a' }}>Features Compared</span>
                                <span className="font-mono" style={{ color: '#a1a1aa' }}>{featureCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: '#71717a' }}>Weaknesses Found</span>
                                <span className="font-mono" style={{ color: '#a1a1aa' }}>{totalWeaknesses}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div
                            className="h-px"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.12) 80%, transparent)'
                            }}
                        />

                        {/* Threat Breakdown */}
                        <div className="space-y-3">
                            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#71717a' }}>
                                Threat Breakdown
                            </span>
                            <div
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ background: '#18181b' }}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#ef4444' }}
                                    />
                                    <span className="text-sm" style={{ color: '#fafafa' }}>High</span>
                                </div>
                                <span className="text-sm font-mono" style={{ color: '#f87171' }}>{highThreats}</span>
                            </div>
                            <div
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ background: '#18181b' }}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#f59e0b' }}
                                    />
                                    <span className="text-sm" style={{ color: '#fafafa' }}>Medium</span>
                                </div>
                                <span className="text-sm font-mono" style={{ color: '#fbbf24' }}>{mediumThreats}</span>
                            </div>
                            <div
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ background: '#18181b' }}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#22c55e' }}
                                    />
                                    <span className="text-sm" style={{ color: '#fafafa' }}>Low</span>
                                </div>
                                <span className="text-sm font-mono" style={{ color: '#4ade80' }}>
                                    {totalCompetitors - highThreats - mediumThreats}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

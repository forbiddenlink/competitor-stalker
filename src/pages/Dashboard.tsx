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
    Users,
} from 'lucide-react';

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
    accentColor,
}) => {
    const colorMap = {
        brand: {
            border: 'var(--accent-brand)',
            text: 'var(--accent-brand-soft)',
            bg: 'var(--accent-brand-muted)',
        },
        success: {
            border: 'var(--accent-success)',
            text: 'var(--accent-success-soft)',
            bg: 'var(--accent-success-muted)',
        },
        warning: {
            border: 'var(--accent-warning)',
            text: 'var(--accent-warning-soft)',
            bg: 'var(--accent-warning-muted)',
        },
        danger: {
            border: 'var(--accent-danger)',
            text: 'var(--accent-danger-soft)',
            bg: 'var(--accent-danger-muted)',
        },
    };

    const colors = colorMap[accentColor];

    const changeColorMap = {
        positive: 'var(--accent-success-soft)',
        negative: 'var(--accent-danger-soft)',
        neutral: 'var(--text-muted)',
    } as const;

    return (
        <div
            className="metric-card metric-card-accent-left"
            style={{ borderLeftColor: colors.border }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-3 min-w-0">
                    <span className="section-label block">{title}</span>
                    <div className="flex items-baseline gap-3">
                        <span className="kpi-value" style={{ color: colors.text }}>
                            {value}
                        </span>
                        {change && (
                            <span
                                className="flex items-center gap-1 text-xs font-medium"
                                style={{ color: changeColorMap[changeType] }}
                            >
                                {changeType === 'positive' && <TrendingUp size={12} />}
                                {changeType === 'negative' && <TrendingDown size={12} />}
                                {change}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    className="h-9 w-9 rounded-[var(--radius-control)] flex items-center justify-center"
                    style={{ background: colors.bg }}
                >
                    <Icon size={18} style={{ color: colors.text }} />
                </div>
            </div>
        </div>
    );
};

const threatStyleMap = {
    High: {
        bg: 'var(--accent-danger-muted)',
        text: 'var(--accent-danger-soft)',
        dot: 'var(--accent-danger)',
    },
    Medium: {
        bg: 'var(--accent-warning-muted)',
        text: 'var(--accent-warning-soft)',
        dot: 'var(--accent-warning)',
    },
    Low: {
        bg: 'var(--accent-success-muted)',
        text: 'var(--accent-success-soft)',
        dot: 'var(--accent-success)',
    },
} as const;

const Dashboard: React.FC = () => {
    const context = useContext(CompetitorContext);
    const { competitors = [], userProfile } = context || { competitors: [], userProfile: null };

    const highThreats = competitors.filter((c) => c.threatLevel === 'High').length;
    const mediumThreats = competitors.filter((c) => c.threatLevel === 'Medium').length;
    const totalCompetitors = competitors.length;

    const allFeatures = new Set<string>();
    competitors.forEach((c) => {
        Object.keys(c.features || {}).forEach((f) => allFeatures.add(f));
    });
    if (userProfile?.features) {
        Object.keys(userProfile.features).forEach((f) => allFeatures.add(f));
    }
    const featureCount = allFeatures.size;

    const totalWeaknesses = competitors.reduce((sum, c) => sum + (c.weaknesses?.length || 0), 0);

    return (
        <div className="page-stack animate-fade-in">
            <div className="page-header flex-col sm:flex-row">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                        Dashboard
                    </h1>
                    <p className="text-sm mt-1 text-[var(--text-muted)]">
                        Intelligence overview for{' '}
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="High Threats" value={highThreats} icon={AlertTriangle} accentColor="danger" />
                <MetricCard title="Medium Threats" value={mediumThreats} icon={Activity} accentColor="warning" />
                <MetricCard title="Features Tracked" value={featureCount} icon={Eye} accentColor="success" />
                <MetricCard title="Targets Tracked" value={totalCompetitors} icon={Target} accentColor="brand" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="panel lg:col-span-2 overflow-hidden">
                    <div className="flex items-center justify-between px-5 pt-5 pb-4">
                        <div>
                            <h3 className="text-base font-semibold text-[var(--text-primary)]">Competitor Overview</h3>
                            <p className="text-sm mt-0.5 text-[var(--text-muted)]">
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
                                <Users size={48} className="mb-4 opacity-20 text-[var(--text-muted)]" />
                                <p className="text-sm text-[var(--text-muted)]">No competitors added yet</p>
                                <p className="text-xs mt-1 text-[var(--text-subtle)]">
                                    Add competitors from the Dossiers page to see them here
                                </p>
                            </div>
                        ) : (
                            competitors.slice(0, 5).map((comp, index) => {
                                const threatStyles = threatStyleMap[comp.threatLevel];

                                return (
                                    <div
                                        key={comp.id}
                                        className={index > 0 ? 'border-t border-[var(--border-subtle)]' : ''}
                                    >
                                        <div className="row-dense flex gap-4 rounded-[var(--radius-control)] transition-colors group hover:bg-[var(--bg-hover)]">
                                            <div
                                                className="flex-shrink-0 h-9 w-9 rounded-[var(--radius-control)] flex items-center justify-center"
                                                style={{ background: threatStyles.bg }}
                                            >
                                                <Target size={16} style={{ color: threatStyles.text }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium truncate text-[var(--text-primary)]">
                                                        {comp.name}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            comp.threatLevel === 'High'
                                                                ? 'danger'
                                                                : comp.threatLevel === 'Medium'
                                                                    ? 'warning'
                                                                    : 'success'
                                                        }
                                                        size="sm"
                                                    >
                                                        {comp.threatLevel}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm truncate mt-0.5 text-[var(--text-muted)]">
                                                    {comp.oneLiner || comp.website || 'No description'}
                                                </p>
                                            </div>
                                            <ArrowUpRight
                                                size={16}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 text-[var(--text-subtle)]"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {competitors.length > 5 && (
                            <div className="text-center py-3 border-t border-[var(--border-subtle)]">
                                <span className="text-xs text-[var(--text-muted)]">
                                    +{competitors.length - 5} more competitors
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel overflow-hidden">
                    <div className="px-5 pt-5 pb-4">
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">Intelligence Summary</h3>
                        <p className="text-sm mt-0.5 text-[var(--text-muted)]">Data overview</p>
                    </div>
                    <div className="p-5 pt-0 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--text-muted)]">Total Competitors</span>
                                <span className="font-mono text-[var(--text-secondary)]">{totalCompetitors}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--text-muted)]">Features Compared</span>
                                <span className="font-mono text-[var(--text-secondary)]">{featureCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--text-muted)]">Weaknesses Found</span>
                                <span className="font-mono text-[var(--text-secondary)]">{totalWeaknesses}</span>
                            </div>
                        </div>

                        <div className="divider" />

                        <div className="space-y-3">
                            <span className="section-label block">Threat Breakdown</span>

                            <div className="row-dense rounded-[var(--radius-control)] bg-[var(--bg-tertiary)] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full" style={{ background: threatStyleMap.High.dot }} />
                                    <span className="text-sm text-[var(--text-primary)]">High</span>
                                </div>
                                <span className="text-sm font-mono" style={{ color: threatStyleMap.High.text }}>
                                    {highThreats}
                                </span>
                            </div>

                            <div className="row-dense rounded-[var(--radius-control)] bg-[var(--bg-tertiary)] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full" style={{ background: threatStyleMap.Medium.dot }} />
                                    <span className="text-sm text-[var(--text-primary)]">Medium</span>
                                </div>
                                <span className="text-sm font-mono" style={{ color: threatStyleMap.Medium.text }}>
                                    {mediumThreats}
                                </span>
                            </div>

                            <div className="row-dense rounded-[var(--radius-control)] bg-[var(--bg-tertiary)] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full" style={{ background: threatStyleMap.Low.dot }} />
                                    <span className="text-sm text-[var(--text-primary)]">Low</span>
                                </div>
                                <span className="text-sm font-mono" style={{ color: threatStyleMap.Low.text }}>
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

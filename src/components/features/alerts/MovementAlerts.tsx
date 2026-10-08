import { Link } from 'react-router';
import React, { useState } from 'react';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Radio, DollarSign, Tag, Megaphone, Users, Bell, Check, ChevronRight } from 'lucide-react';
import type { Alert } from '../../../types';

type AlertFilter = 'All' | 'Pricing' | 'Feature' | 'Marketing';

export const MovementAlerts: React.FC = () => {
    const { competitors, snapshots } = useCompetitors();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [filter, setFilter] = useState<AlertFilter>('All');

    const changes = [...new Set([...competitors.map(c => c.id), ...snapshots.map(s => s.competitorId)])].flatMap(competitorId => {
        const competitor = competitors.find(c => c.id === competitorId);
        const history = snapshots.filter(s => s.competitorId === competitorId).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
        return history.flatMap((snapshot, index) => {
            const after = history[index + 1]?.data || competitor;
            if (!after) return [];
            const date = after.updatedAt || snapshot.timestamp;
            const name = competitor?.name || snapshot.data.name;
            return ([
                { type: 'Pricing', field: 'pricingModels', label: 'pricing' },
                { type: 'Feature', field: 'features', label: 'features' },
                { type: 'Marketing', field: 'oneLiner', label: 'positioning summary' },
            ] as const).filter(category => JSON.stringify(snapshot.data[category.field]) !== JSON.stringify(after[category.field]))
                .map(category => ({ id: `${snapshot.id}-${category.field}`, competitorId, removed: !competitor, title: `${name}: ${category.label} changed`, type: category.type, date }));
        });
    }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const visibleChanges = changes.filter(change => filter === 'All' || change.type === filter).slice(0, 20);

    const handleAlertClick = (alert: Alert) => {
        const updatedAlerts = alerts.map(a =>
            a.id === alert.id ? { ...a, isRead: true } : a
        );
        setAlerts(updatedAlerts);
        setSelectedAlert({ ...alert, isRead: true });
    };

    const markAllRead = () => {
        setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    };

    const filteredAlerts = filter === 'All'
        ? alerts
        : alerts.filter(a => a.type === filter);

    const unreadCount = alerts.filter(a => !a.isRead).length;

    const getTypeIcon = (type: string) => {
        const iconProps = { size: 14 };
        switch (type) {
            case 'Pricing': return <DollarSign {...iconProps} />;
            case 'Feature': return <Tag {...iconProps} />;
            case 'Marketing': return <Megaphone {...iconProps} />;
            case 'Personnel': return <Users {...iconProps} />;
            default: return <Bell {...iconProps} />;
        }
    };

    const getTypeBadgeVariant = (type: string): 'success' | 'info' | 'purple' | 'warning' | 'default' => {
        switch (type) {
            case 'Pricing': return 'success';
            case 'Feature': return 'info';
            case 'Marketing': return 'purple';
            case 'Personnel': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="workspace-title">
                            Alerts
                        </h1>
                        {unreadCount > 0 && (
                            <Badge variant="danger" size="sm">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Review local saved changes and recorded intelligence
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllRead}
                    leftIcon={<Check size={14} />}
                    disabled={unreadCount === 0}
                >
                    Mark All Read
                </Button>
            </div>

            <section className="panel p-5" aria-label="Local change history">
                <h2 className="text-xl mb-2">Local change history</h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">Local saved changes, not external monitoring. Compare full versions from a dossier's History action.</p>
                {visibleChanges.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No saved changes in this category. Edit a dossier to begin recording history.</p> : <ul className="divide-y divide-[var(--border-subtle)]">{visibleChanges.map(change => <li key={change.id} className="py-3 flex flex-wrap justify-between gap-2">{change.removed ? <span className="font-medium">{change.title}<small className="block text-[var(--text-muted)]">Removed dossier · Retained history</small></span> : <Link className="font-medium text-[var(--accent-brand)]" to={`/dossier?competitor=${encodeURIComponent(change.competitorId)}`}>{change.title}</Link>}<span className="text-xs text-[var(--text-muted)]">{change.type} · {Number.isFinite(Date.parse(change.date)) ? new Date(change.date).toLocaleString() : 'Unknown date'}</span></li>)}</ul>}
                <p className="text-xs text-[var(--text-muted)] mt-4">{snapshots.filter(s => s.type === 'milestone').length} saved milestones · Showing up to 20 changes</p>
            </section>
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Alert List */}
                <Card variant="surface" padding="none" className="lg:col-span-4">
                    {/* Filter Tabs */}
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex gap-2 overflow-x-auto">
                        {(['All', 'Pricing', 'Feature', 'Marketing'] as AlertFilter[]).map(f => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className={`
                                    px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap
                                    ${filter === f
                                        ? 'bg-[var(--accent-brand-muted)] text-[var(--accent-brand-soft)] border border-[rgba(59,130,246,0.3)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    }
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Alert Items */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredAlerts.length === 0 ? (
                            <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                                <Bell size={32} className="mx-auto mb-3 opacity-30" />
                                <p>No alerts yet</p>
                                <p className="text-xs mt-1 opacity-70">No external alert feed is connected. Local edits appear in the change history above.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border-subtle)]">
                                {filteredAlerts.map(alert => (
                                    <button
                                        key={alert.id}
                                        type="button"
                                        onClick={() => handleAlertClick(alert)}
                                        className={`
                                            w-full min-h-[84px] px-4 py-3 text-left transition-colors relative group
                                            ${selectedAlert?.id === alert.id
                                                ? 'bg-[var(--accent-brand-muted)]'
                                                : 'hover:bg-[var(--bg-hover)]'
                                            }
                                        `}
                                    >
                                        {/* Unread indicator */}
                                        {!alert.isRead && (
                                            <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--accent-brand)] animate-pulse-soft" />
                                        )}

                                        {/* Type & Time */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={getTypeBadgeVariant(alert.type)} size="sm">
                                                {getTypeIcon(alert.type)}
                                                {alert.type}
                                            </Badge>
                                            <span className="text-[10px] text-[var(--text-subtle)]">{alert.date}</span>
                                        </div>

                                        {/* Title */}
                                        <h4 className={`text-sm font-medium truncate pr-4 ${
                                            !alert.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                                        }`}>
                                            {alert.title}
                                        </h4>

                                        {/* Competitor */}
                                        <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                                            {competitors.find(c => c.id === alert.competitorId)?.name}
                                        </p>

                                        {/* Arrow on hover */}
                                        <ChevronRight
                                            size={14}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Alert Detail */}
                <Card variant="default" padding="none" className="lg:col-span-8">
                    {selectedAlert ? (
                        <div className="p-6 h-full">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <Badge variant={getTypeBadgeVariant(selectedAlert.type)}>
                                    {getTypeIcon(selectedAlert.type)}
                                    {selectedAlert.type} Intel
                                </Badge>
                                <span className="text-xs text-[var(--text-muted)]">{selectedAlert.date}</span>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                                {selectedAlert.title}
                            </h2>

                            {/* Target */}
                            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[var(--border-subtle)]">
                                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Target</span>
                                <span className="font-medium text-[var(--accent-brand-soft)]">
                                    {competitors.find(c => c.id === selectedAlert.competitorId)?.name}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {selectedAlert.description}
                                </p>

                                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border-l-2 border-[var(--accent-info)]">
                                    <p className="text-sm text-[var(--text-muted)] italic">
                                        <strong className="text-[var(--text-secondary)] not-italic">Analysis:</strong> This move suggests a strategic shift. Consider reviewing your own {selectedAlert.type.toLowerCase()} strategy to maintain competitive advantage.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <Radio size={48} className="mb-4 opacity-30" />
                            <p className="text-sm">{alerts.length === 0 ? 'No alerts to display' : 'Select an alert to view details'}</p>
                            {alerts.length === 0 && (
                                <p className="text-xs mt-2 opacity-70 max-w-xs text-center">
                                    Use dossier history to compare saved versions. This workspace does not monitor external activity.
                                </p>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

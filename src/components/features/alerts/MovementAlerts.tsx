
import React, { useState, useContext, useEffect } from 'react';
import { CompetitorContext } from '../../../context/CompetitorContext';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Radio, Users, Tag, DollarSign, Bell, Circle } from 'lucide-react';
import type { Alert } from '../../../types';

export const MovementAlerts: React.FC = () => {
    const context = useContext(CompetitorContext);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [filter, setFilter] = useState<'All' | 'Pricing' | 'Feature' | 'Marketing'>('All');

    // Handle missing context gracefully
    const { competitors } = context || { competitors: [] };

    // Generate mock alerts on mount/competitor change
    useEffect(() => {
        if (competitors.length === 0) return;

        const mockAlerts: Alert[] = competitors.flatMap(comp => [
            {
                id: `alert-${comp.id}-1`,
                competitorId: comp.id,
                type: 'Pricing',
                title: 'New Pricing Tier Detected',
                description: `${comp.name} has launched a new "Enterprise Plus" tier starting at $999/mo. This targets high-volume users.`,
                date: '2 hours ago',
                isRead: false
            } as Alert,
            {
                id: `alert-${comp.id}-2`,
                competitorId: comp.id,
                type: 'Marketing',
                title: 'Ad Campaign Surge',
                description: `Significant increase in ad spend detected for keywords "AI Analytics" by ${comp.name}.`,
                date: '1 day ago',
                isRead: true
            } as Alert
        ]);

        setAlerts(mockAlerts);
        if (mockAlerts.length > 0) setSelectedAlert(mockAlerts[0]);
    }, [competitors]);

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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Pricing': return <DollarSign size={16} className="text-accent-green" />;
            case 'Feature': return <Tag size={16} className="text-accent-cyan" />;
            case 'Marketing': return <Radio size={16} className="text-accent-pink" />;
            case 'Personnel': return <Users size={16} className="text-accent-amber" />;
            default: return <Bell size={16} />;
        }
    };

    if (!context) return <div>Error: Context unavailable</div>;

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-mono text-accent-cyan tracking-widest uppercase flex items-center gap-2">
                        <Radio className="animate-pulse" /> Movement Alerts
                    </h2>
                    <p className="text-sm text-text-muted">Real-time intelligence feed on competitor activities.</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={markAllRead}>Mark All Read</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Alert List */}
                <Card className="col-span-1 flex flex-col bg-black/40 border-accent-cyan/30">
                    <div className="p-4 border-b border-border-dim flex gap-2 overflow-x-auto">
                        {['All', 'Pricing', 'Feature', 'Marketing'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as 'All' | 'Pricing' | 'Feature' | 'Marketing')}
                                className={`
                                    px-3 py-1 text-xs font-mono uppercase rounded-full border transition-all
                                    ${filter === f
                                        ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                                        : 'border-transparent text-text-muted hover:bg-white/5'
                                    }
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredAlerts.length === 0 ? (
                            <div className="p-8 text-center text-text-muted text-sm italic">
                                No activity detected.
                            </div>
                        ) : (
                            filteredAlerts.map(alert => (
                                <div
                                    key={alert.id}
                                    onClick={() => handleAlertClick(alert)}
                                    className={`
                                        p-4 border-b border-border-dim cursor-pointer transition-colors relative
                                        ${selectedAlert?.id === alert.id ? 'bg-accent-cyan/10' : 'hover:bg-white/5'}
                                    `}
                                >
                                    {!alert.isRead && (
                                        <div className="absolute top-4 right-4 text-accent-cyan animate-pulse">
                                            <Circle size={8} fill="currentColor" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-1 text-xs text-text-muted">
                                        {getTypeIcon(alert.type)}
                                        <span className="font-mono uppercase">{alert.type}</span>
                                        <span className="opacity-50">• {alert.date}</span>
                                    </div>
                                    <h4 className={`text-sm font-bold mb-1 ${!alert.isRead ? 'text-white' : 'text-text-muted'}`}>
                                        {alert.title}
                                    </h4>
                                    <div className="text-xs text-text-muted truncate">
                                        {competitors.find(c => c.id === alert.competitorId)?.name}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* detailed View */}
                <Card className="col-span-1 lg:col-span-2 relative bg-black/60 border-accent-cyan/30">
                    {selectedAlert ? (
                        <div className="p-8 h-full overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-xs font-mono uppercase border border-accent-cyan/50 rounded">
                                    {selectedAlert.type} INTEL
                                </span>
                                <span className="text-text-muted text-sm font-mono">{selectedAlert.date}</span>
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-4 tracking-wide">
                                {selectedAlert.title}
                            </h1>

                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border-dim">
                                <div className="text-sm text-text-muted uppercase tracking-widest">Target:</div>
                                <div className="font-bold text-accent-pink text-lg">
                                    {competitors.find(c => c.id === selectedAlert.competitorId)?.name}
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg leading-relaxed text-text-primary">
                                    {selectedAlert.description}
                                </p>
                                <p className="mt-6 text-text-muted italic text-sm border-l-2 border-accent-cyan pl-4">
                                    Analysis: This move suggests a strategic shift. Consider reviewing your own {selectedAlert.type.toLowerCase()} strategy to maintain competitive advantage.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                            <Radio size={64} className="mb-4" />
                            <p>SELECT AN INTERCEPTED TRANSMISSION</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

import React from 'react';
import { Link } from 'react-router';
import { useCompetitors } from '../hooks/useCompetitors';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ArrowUpRight, Plus, RefreshCw, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { competitors, userProfile } = useCompetitors();
    const highThreats = competitors.filter((c) => c.threatLevel === 'High').length;
    const mediumThreats = competitors.filter((c) => c.threatLevel === 'Medium').length;
    const totalWeaknesses = competitors.reduce((sum, c) => sum + (c.weaknesses?.length || 0), 0);
    const featureCount = new Set([
        ...competitors.flatMap((c) => Object.keys(c.features || {})),
        ...Object.keys(userProfile.features || {}),
    ]).size;
    const strategies = competitors.flatMap((c) => c.strategies || []);
    const activeStrategies = strategies.filter((s) => s.status === 'Active').length;
    const threatRank = { High: 0, Medium: 1, Low: 2 };
    const queue = [...competitors].sort((a, b) =>
        threatRank[a.threatLevel] - threatRank[b.threatLevel]
        || Number(Boolean(a.sources?.length)) - Number(Boolean(b.sources?.length))
        || (Date.parse(a.updatedAt || '') || 0) - (Date.parse(b.updatedAt || '') || 0),
    ).slice(0, 5);

    return (
        <div className="page-stack dashboard-briefing animate-fade-in">
            <div className="page-header flex-col items-start sm:flex-row sm:items-end">
                <div>
                    <p className="section-label mb-3">01 / Research briefing</p>
                    <h1 className="workspace-title">Your competitive landscape.</h1>
                    <p className="text-[var(--text-secondary)] mt-3 max-w-xl">
                        Review the evidence. Compare the gaps. Decide your next move.
                    </p>
                </div>
                <Link className="workspace-link workspace-link-primary shrink-0" to="/dossier">
                    <Plus size={16} /> Add a competitor
                </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--border-default)] py-3 text-xs text-[var(--text-muted)]">
                <p>Browser-local research · Starter records are examples; verify details against sources.</p>
                <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={13} />} onClick={() => window.location.reload()}>
                    Refresh Data
                </Button>
            </div>

            <dl className="order-3 lg:order-none grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Targets tracked', value: competitors.length, detail: 'Competitor dossiers' },
                    { label: 'High threats', value: highThreats, detail: `${mediumThreats} medium threats` },
                    { label: 'Features tracked', value: featureCount, detail: 'Across your comparison' },
                    { label: 'Weaknesses found', value: totalWeaknesses, detail: 'Recorded research findings' },
                ].map((metric) => (
                    <div key={metric.label} className="border-l border-[var(--border-muted)] pl-4 py-1">
                        <dt className="section-label">{metric.label}</dt>
                        <dd className="kpi-value mt-2 lg:mt-3">{metric.value}</dd>
                        <dd className="text-xs text-[var(--text-muted)] mt-1 lg:mt-2">{metric.detail}</dd>
                    </div>
                ))}
            </dl>

            <div className="order-2 lg:order-none grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
                <section className="panel overflow-hidden" aria-labelledby="research-queue-title">
                    <div className="p-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="section-label mb-2">Where to focus</p>
                            <h2 id="research-queue-title" className="text-xl">Research queue</h2>
                            <p className="text-sm text-[var(--text-muted)] mt-1">High threats first, then missing sources and older saved records.</p>
                        </div>
                        <span className="font-mono text-sm text-[var(--text-muted)]">{String(queue.length).padStart(2, '0')}</span>
                    </div>
                    {queue.length === 0 ? (
                        <div className="p-6 border-t border-[var(--border-subtle)]">
                            <h3 className="text-lg">Start your research workspace</h3>
                            <p className="text-sm text-[var(--text-muted)] mt-2 mb-4">Add your first competitor or bring in an existing research export.</p>
                            <Link to="/settings" className="workspace-link">Import research <ArrowRight size={15} /></Link>
                        </div>
                    ) : queue.map((comp, index) => {
                        const savedDate = Date.parse(comp.updatedAt || '');
                        return (
                            <Link key={comp.id} to={`/dossier?competitor=${encodeURIComponent(comp.id)}`} className="briefing-row">
                                <span className="font-mono text-xs text-[var(--text-muted)] pt-1">{String(index + 1).padStart(2, '0')}</span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base break-words">{comp.name}</h3>
                                        <Badge variant={comp.threatLevel === 'High' ? 'danger' : comp.threatLevel === 'Medium' ? 'warning' : 'success'} size="sm">{comp.threatLevel} threat</Badge>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1 break-words">{comp.oneLiner || comp.website || 'Add a research summary to this dossier.'}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] mt-3">
                                        <span>{Number.isFinite(savedDate) ? `Saved ${new Date(savedDate).toLocaleDateString()}` : 'No saved date'}</span>
                                        <span>{comp.sources?.length ? `${comp.sources.length} linked source${comp.sources.length === 1 ? '' : 's'}` : 'No linked sources'}</span>
                                    </div>
                                </div>
                                <ArrowUpRight size={17} className="text-[var(--accent-brand)] mt-1" />
                            </Link>
                        );
                    })}
                    <div className="p-5 border-t border-[var(--border-default)] flex flex-wrap justify-between items-center gap-3">
                        <p className="text-xs text-[var(--text-muted)]">Saved dates reflect local edits, not verified research.</p>
                        <Link to="/dossier" className="text-sm font-medium text-[var(--accent-brand)] flex items-center gap-2">All competitors <ArrowRight size={14} /></Link>
                    </div>
                </section>

                <div className="space-y-6">
                    <section className="panel p-5">
                        <p className="section-label mb-3">From research to response</p>
                        <h2 className="font-display text-2xl font-normal">Make the next move.</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-2 mb-5">Turn a recorded weakness into a practical response for {userProfile.name || 'your business'}.</p>
                        <Link to="/strategy" className="workspace-link w-full justify-between">Open strategy board <ArrowRight size={16} /></Link>
                        <p className="text-xs text-[var(--text-muted)] mt-3">{activeStrategies} active · {strategies.filter((s) => s.status === 'Planned').length} planned strategies</p>
                    </section>
                    <section className="border-t border-[var(--border-muted)] pt-5">
                        <h2 className="section-label mb-3">Compare & investigate</h2>
                        {[
                            { to: '/matrix', title: 'Feature comparison', detail: `${featureCount} features across your landscape` },
                            { to: '/pricing', title: 'Pricing intelligence', detail: 'Compare recorded plans and packaging' },
                            { to: '/weaknesses', title: 'Weakness research', detail: `${totalWeaknesses} findings to investigate` },
                        ].map((action) => (
                            <Link key={action.to} to={action.to} className="block py-3 border-b border-[var(--border-subtle)] group">
                                <span className="flex items-center justify-between gap-3 font-medium group-hover:text-[var(--accent-brand)]">{action.title}<ArrowUpRight size={15} /></span>
                                <span className="block text-xs text-[var(--text-muted)] mt-1">{action.detail}</span>
                            </Link>
                        ))}
                    </section>
                    <section aria-label="Threat breakdown" className="text-sm">
                        <h2 className="section-label mb-3">Threat breakdown</h2>
                        <div className="flex flex-wrap gap-3 text-[var(--text-secondary)]"><span>High {highThreats}</span><span>Medium {mediumThreats}</span><span>Low {competitors.length - highThreats - mediumThreats}</span></div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

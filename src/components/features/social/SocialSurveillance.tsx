import React, { useState, useEffect } from 'react';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Search, Twitter, Linkedin, Wifi } from 'lucide-react';

interface FeedItem {
    id: string;
    source: 'twitter' | 'linkedin' | 'news';
    author: string;
    content: string;
    timestamp: string;
    sentiment: 'neutral' | 'negative' | 'positive';
}

export const SocialSurveillance: React.FC = () => {
    const { competitors, updateCompetitor } = useCompetitors();
    const [searchTerm, setSearchTerm] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [feed, setFeed] = useState<FeedItem[]>([]);

    const filteredCompetitors = competitors.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.socialHandles?.twitter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.socialHandles?.linkedin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (isScanning) {
            const timer = setTimeout(() => {
                setIsScanning(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isScanning]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsScanning(true);
        setFeed([]);
    };

    const updateHandle = (id: string, platform: 'twitter' | 'linkedin' | 'instagram', value: string) => {
        const competitor = competitors.find((c) => c.id === id);
        if (!competitor) return;

        const currentHandles = competitor.socialHandles || {};
        updateCompetitor(id, {
            socialHandles: {
                ...currentHandles,
                [platform]: value,
            },
        });
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                        <Wifi className="text-[var(--accent-info)]" /> Social Monitor
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">Monitor competitor chatter and social signals.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                    <Input
                        placeholder="Enter keywords (e.g. pricing, launch)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="font-mono"
                    />
                    <Button type="submit" disabled={isScanning}>
                        {isScanning ? 'Scanning...' : <Search size={18} />}
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 bg-transparent">
                <Card className="col-span-1 flex flex-col gap-4 overflow-y-auto bg-[var(--bg-primary)]/60" variant="surface">
                    <h3 className="font-semibold text-[var(--text-secondary)] border-b border-[var(--border-default)] pb-2">Target Links</h3>

                    {filteredCompetitors.length === 0 && <p className="text-[var(--text-muted)] text-sm italic">No targets found.</p>}

                    {filteredCompetitors.map((comp) => (
                        <div
                            key={comp.id}
                            className="p-3 border border-[var(--border-default)] rounded-[var(--radius-card)] bg-[var(--bg-secondary)]/70 hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        comp.threatLevel === 'High'
                                            ? 'bg-[var(--accent-danger)]'
                                            : comp.threatLevel === 'Medium'
                                                ? 'bg-[var(--accent-warning)]'
                                                : 'bg-[var(--accent-success)]'
                                    }`}
                                />
                                <span className="font-semibold text-sm tracking-wide text-[var(--text-primary)]">{comp.name}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Twitter size={14} className="text-[var(--accent-info)]" aria-hidden="true" />
                                    <input
                                        className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-control)] px-2 py-1 text-xs text-[var(--text-primary)] w-full focus:border-[var(--accent-info)] outline-none font-mono"
                                        placeholder="@handle"
                                        aria-label={`Twitter handle for ${comp.name}`}
                                        value={comp.socialHandles?.twitter || ''}
                                        onChange={(e) => updateHandle(comp.id, 'twitter', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Linkedin size={14} className="text-[var(--accent-brand)]" aria-hidden="true" />
                                    <input
                                        className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-control)] px-2 py-1 text-xs text-[var(--text-primary)] w-full focus:border-[var(--accent-info)] outline-none font-mono"
                                        placeholder="/in/company"
                                        aria-label={`LinkedIn handle for ${comp.name}`}
                                        value={comp.socialHandles?.linkedin || ''}
                                        onChange={(e) => updateHandle(comp.id, 'linkedin', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </Card>

                <Card
                    className="col-span-1 lg:col-span-2 flex flex-col relative overflow-hidden bg-[var(--bg-primary)]/80 font-mono text-sm leading-relaxed border-[var(--accent-info)]/30"
                    variant="surface"
                >
                    <div className="h-1 bg-[var(--accent-info)]/40" />

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!isScanning && feed.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-[var(--accent-info)]/50">
                                <Wifi size={64} className="mb-4 opacity-50" />
                                <p>Awaiting input sequence...</p>
                                <p className="text-xs mt-2 text-[var(--text-muted)]">
                                    Configure social API integrations to enable live signal monitoring
                                </p>
                            </div>
                        )}

                        {isScanning && (
                            <div className="space-y-1">
                                <div className="text-[var(--accent-success)]">{'>'} Initializing search protocols...</div>
                                <div className="text-[var(--accent-success)]">{'>'} Connecting to node 64.23.1...</div>
                                <div className="text-[var(--accent-success)] animate-pulse">{'>'} Intercepting packets...</div>
                            </div>
                        )}

                        {feed.map((item) => (
                            <div
                                key={item.id}
                                className="border-l-2 border-[var(--border-default)] pl-3 py-1 hover:bg-[var(--bg-hover)] transition-colors group"
                            >
                                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                                    <span className="flex items-center gap-1">
                                        {item.source === 'twitter' && <Twitter size={12} />}
                                        {item.source === 'linkedin' && <Linkedin size={12} />}
                                        <span className="text-[var(--accent-info)]">{item.author}</span>
                                    </span>
                                    <span>{item.timestamp}</span>
                                </div>
                                <div className="text-[var(--text-primary)] transition-colors">{item.content}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

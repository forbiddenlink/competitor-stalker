
import React, { useState, useContext, useEffect } from 'react';
import { CompetitorContext } from '../../../context/CompetitorContext';
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

const MOCK_FEED: FeedItem[] = [
    { id: '1', source: 'twitter', author: '@tech_insider', content: 'Rumors swirling about a new pricing tier from Rival Corp...', timestamp: '2m ago', sentiment: 'neutral' },
    { id: '2', source: 'linkedin', author: 'John Doe (VP Eng)', content: 'Excited to announce our Series B funding! We are hiring aggressive sales teams.', timestamp: '15m ago', sentiment: 'negative' },
    { id: '3', source: 'news', author: 'TechCrunch', content: 'Market shifting towards AI-driven analytics. Who will win?', timestamp: '1h ago', sentiment: 'neutral' },
    { id: '4', source: 'twitter', author: '@angry_user', content: 'Why is Feature X so buggy? Switching to competitor...', timestamp: '2h ago', sentiment: 'positive' },
];

export const SocialSurveillance: React.FC = () => {
    const context = useContext(CompetitorContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [feed, setFeed] = useState<FeedItem[]>([]);

    // Handle missing context gracefully
    const { competitors, updateCompetitor } = context || { competitors: [], updateCompetitor: () => { } };

    const filteredCompetitors = competitors.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.socialHandles?.twitter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.socialHandles?.linkedin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Simulate "scanning" effect
    useEffect(() => {
        if (isScanning) {
            const timer = setTimeout(() => {
                setFeed(MOCK_FEED);
                setIsScanning(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isScanning]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsScanning(true);
        setFeed([]); // Clear feed to simulate new search
    };

    const updateHandle = (id: string, platform: 'twitter' | 'linkedin' | 'instagram', value: string) => {
        const competitor = competitors.find(c => c.id === id);
        if (!competitor) return;

        const currentHandles = competitor.socialHandles || {};
        updateCompetitor(id, {
            socialHandles: {
                ...currentHandles,
                [platform]: value
            }
        });
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-mono text-accent-cyan tracking-widest uppercase flex items-center gap-2">
                        <Wifi className="animate-pulse" /> Signal Intercept
                    </h2>
                    <p className="text-sm text-text-muted">Monitor competitor chatter and social signals.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 w-96">
                    <Input
                        placeholder="Enter keywords (e.g. 'pricing', 'launch')..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/50 font-mono"
                    />
                    <Button type="submit" disabled={isScanning}>
                        {isScanning ? 'SCANNING...' : <Search size={18} />}
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 bg-transparent">
                {/* Competitor Handles Column */}
                <Card className="col-span-1 flex flex-col gap-4 overflow-y-auto bg-black/40">
                    <h3 className="font-mono text-accent-pink border-b border-border-dim pb-2">Target Links</h3>

                    {filteredCompetitors.length === 0 && <p className="text-text-muted text-sm italic">No targets found.</p>}

                    {filteredCompetitors.map(comp => (
                        <div key={comp.id} className="p-3 border border-border-dim rounded bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-2 h-2 rounded-full ${comp.threatLevel === 'High' ? 'bg-accent-red' : comp.threatLevel === 'Medium' ? 'bg-accent-amber' : 'bg-accent-green'}`} />
                                <span className="font-bold text-sm tracking-wide">{comp.name}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Twitter size={14} className="text-cyan-400" />
                                    <input
                                        className="bg-black/30 border border-border-dim rounded px-2 py-1 text-xs text-text-primary w-full focus:border-accent-cyan outline-none font-mono"
                                        placeholder="@handle"
                                        value={comp.socialHandles?.twitter || ''}
                                        onChange={(e) => updateHandle(comp.id, 'twitter', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Linkedin size={14} className="text-blue-500" />
                                    <input
                                        className="bg-black/30 border border-border-dim rounded px-2 py-1 text-xs text-text-primary w-full focus:border-accent-cyan outline-none font-mono"
                                        placeholder="/in/company"
                                        value={comp.socialHandles?.linkedin || ''}
                                        onChange={(e) => updateHandle(comp.id, 'linkedin', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </Card>

                {/* Feed Column */}
                <Card className="col-span-1 lg:col-span-2 flex flex-col relative overflow-hidden bg-black/80 font-mono text-sm leading-relaxed border-accent-cyan/30">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-accent-cyan/50 animate-scanline" />

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!isScanning && feed.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-accent-cyan/30">
                                <Wifi size={64} className="mb-4 opacity-50" />
                                <p>AWAITING INPUT SEQUENCE...</p>
                            </div>
                        )}

                        {isScanning && (
                            <div className="space-y-1">
                                <div className="text-accent-green">{'>'} INITIALIZING SEARCH PROTOCOLS...</div>
                                <div className="text-accent-green">{'>'} CONNECTING TO NODE 64.23.1...</div>
                                <div className="text-accent-green animate-pulse">{'>'} INTERCEPTING PACKETS...</div>
                            </div>
                        )}

                        {feed.map(item => (
                            <div key={item.id} className="border-l-2 border-border-dim pl-3 py-1 hover:bg-white/5 transition-colors group">
                                <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                                    <span className="flex items-center gap-1">
                                        {item.source === 'twitter' && <Twitter size={12} />}
                                        {item.source === 'linkedin' && <Linkedin size={12} />}
                                        <span className="text-accent-cyan">{item.author}</span>
                                    </span>
                                    <span>{item.timestamp}</span>
                                </div>
                                <div className="text-text-primary group-hover:text-white transition-colors">
                                    {item.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

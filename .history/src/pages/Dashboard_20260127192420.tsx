import React from 'react';
import { Card } from '../components/common/Card';
const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div className="overflow-hidden">
                    <h1 className="text-3xl font-mono text-text-primary capitalize tracking-tight animate-typewriter border-r-4 border-accent-cyan pr-2">
                        Dashboard Overview
                    </h1>
                    <p className="text-text-muted mt-2 font-mono text-sm opacity-0 animate-fade-in-delay">Situation Report // {new Date().toLocaleDateString()}</p>
                </div>
                <button className="px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/20 transition-colors rounded-sm font-mono text-sm uppercase tracking-wide flex items-center gap-2 group">
                    <span className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse group-hover:bg-white transition-colors"></span>
                    Refresh Intel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Metric Card 1 */}
                <Card className="border-l-4 border-l-accent-red">
                    <h3 className="text-muted text-xs uppercase tracking-wider font-mono mb-2">Active Threats</h3>
                    <div className="text-4xl font-bold text-accent-red drop-shadow-[0_0_8px_rgba(255,51,51,0.5)]">3</div>
                    <div className="mt-4 text-xs text-text-muted">High priority targets identified</div>
                </Card>

                {/* Metric Card 2 */}
                <Card className="border-l-4 border-l-accent-amber">
                    <h3 className="text-muted text-xs uppercase tracking-wider font-mono mb-2">Market Shifts</h3>
                    <div className="text-4xl font-bold text-accent-amber drop-shadow-[0_0_8px_rgba(255,204,0,0.5)]">12</div>
                    <div className="mt-4 text-xs text-text-muted">Detected in last 24 hours</div>
                </Card>

                {/* Metric Card 3 */}
                <Card className="border-l-4 border-l-accent-green">
                    <h3 className="text-muted text-xs uppercase tracking-wider font-mono mb-2">Intel Collected</h3>
                    <div className="text-4xl font-bold text-accent-green drop-shadow-[0_0_8px_rgba(51,255,51,0.5)]">89%</div>
                    <div className="mt-4 text-xs text-text-muted">Database integrity optimal</div>
                </Card>
            </div>

            <Card className="min-h-[400px]">
                <h3 className="font-mono text-lg mb-4 border-b border-border-dim pb-2 flex items-center justify-between">
                    <span>LIVE FEEDS</span>
                    <span className="text-xs bg-accent-red/20 text-accent-red px-2 py-1 rounded animate-pulse">RECORDING</span>
                </h3>
                <div className="flex items-center justify-center h-64 text-text-muted font-mono text-sm border-2 border-dashed border-border-dim rounded bg-black/20 relative overflow-hidden group">
                    {/* Scanning Effect */}
                    <div className="animate-scan"></div>
                    [ AWAITING SATELLITE UPLINK... ]
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;

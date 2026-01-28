import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Map as MapIcon,
    Table2,
    DollarSign,
    Radar,
    Search,
    ShieldAlert,
    Menu,
    X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      relative w-full flex items-center space-x-3 px-4 py-3 mx-2
      rounded-lg transition-all duration-300 group no-underline
      ${isActive
                ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-blue/10 text-accent-cyan border-l-2 border-accent-cyan shadow-glow-cyan'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border-l-2 border-transparent'
            }
    `}
    >
        {({ isActive }) => (
            <>
                <Icon 
                    size={20} 
                    className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'drop-shadow-glow-cyan' : 'group-hover:drop-shadow-glow'}`} 
                />
                <span className="font-sans text-sm font-medium tracking-wide">{label}</span>
                {isActive && <div className="absolute right-2 w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />}
            </>
        )}
    </NavLink>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`
          flex flex-col bg-gradient-to-b from-bg-secondary to-bg-tertiary border-r border-border-dim w-64
          transition-all duration-300 ease-in-out relative
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full w-0 opacity-0'}
        `}
            >
                {/* Sidebar Header */}
                <div className="px-6 py-8 border-b border-border-bright/30 flex items-center justify-between backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-accent-red/30 to-accent-amber/20 border border-accent-red/50">
                            <Radar className="text-accent-red animate-pulse" size={24} />
                        </div>
                        <div>
                            <span className="font-display font-bold text-lg tracking-tight text-text-primary">
                                STALKER
                            </span>
                            <p className="text-xs text-text-muted font-mono">Intelligence Platform</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close sidebar"
                        title="Close sidebar"
                        className="p-1.5 text-text-muted hover:text-accent-red hover:bg-white/5 rounded-lg transition-all duration-200 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sidebar Metadata */}
                <div className="px-6 py-4 bg-white/[0.02] border-b border-border-dim/30">
                    <div className="text-xs text-text-muted font-mono space-y-2 tracking-wide">
                        <div className="flex justify-between">
                            <span>STATUS:</span>
                            <span className="text-accent-green">ACTIVE</span>
                        </div>
                        <div className="flex justify-between">
                            <span>CLEARANCE:</span>
                            <span className="text-accent-cyan">LEVEL 5</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-2 overflow-y-auto space-y-1">
                    <div className="text-xs uppercase tracking-widest text-text-muted font-mono px-4 py-3 mb-3">Analysis</div>
                    <SidebarItem icon={LayoutDashboard} label="Overview" to="/" />
                    <SidebarItem icon={Users} label="Targets" to="/dossier" />
                    <SidebarItem icon={MapIcon} label="Positioning" to="/positioning" />
                    <SidebarItem icon={Table2} label="Matrix" to="/matrix" />
                    
                    <div className="text-xs uppercase tracking-widest text-text-muted font-mono px-4 py-3 mt-6 mb-3">Intelligence</div>
                    <SidebarItem icon={DollarSign} label="Pricing" to="/pricing" />
                    <SidebarItem icon={Search} label="Social" to="/social" />
                    <SidebarItem icon={ShieldAlert} label="Weaknesses" to="/weaknesses" />
                    <SidebarItem icon={ShieldAlert} label="Alerts" to="/alerts" />
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-border-dim/30 bg-white/[0.02]">
                    <div className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors duration-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan/30 to-accent-blue/20 border border-accent-cyan/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-sans font-bold text-accent-cyan">OP</span>
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <div className="text-sm font-sans font-medium truncate">Operator</div>
                            <div className="text-xs text-text-muted truncate">Active Session</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-bg-primary relative">
                {/* Header */}
                <header className="h-16 border-b border-border-bright/20 flex items-center justify-between px-6 bg-gradient-to-r from-bg-secondary/80 to-bg-tertiary/50 backdrop-blur-lg glass-card">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open sidebar"
                        title="Open sidebar"
                        className={`p-2 hover:bg-accent-cyan/10 rounded-lg text-text-muted hover:text-accent-cyan transition-all duration-200 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-amber/20 bg-accent-amber/5 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-accent-amber rounded-full animate-pulse" />
                            <span className="font-mono text-xs text-accent-amber/80 tracking-wide">INTELLIGENCE ACTIVE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="stamp top-secret text-xs transform rotate-0 border-2 px-2 py-1 animate-pulse-slow">
                            TOP SECRET
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <div className="flex-1 overflow-auto p-6 relative">
                    {/* Subtle Grid Background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none grid-background" />
                    <div className="relative z-10 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

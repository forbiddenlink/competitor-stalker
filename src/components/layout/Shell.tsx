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
      w-full flex items-center space-x-3 px-4 py-3 
      transition-all duration-200 border-l-4
      ${isActive
                ? 'border-accent-cyan bg-white/5 text-cyan'
                : 'border-transparent text-muted hover:text-primary hover:bg-white/5'
            }
    `}
    >
        {({ isActive }) => (
            <>
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_5px_rgba(0,204,255,0.5)]' : ''} />
                <span className="font-mono text-sm tracking-wider uppercase">{label}</span>
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
          flex flex-col bg-bg-secondary border-r border-border-dim w-64
          transition-all duration-300 ease-in-out relative
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full w-0 opacity-0'}
        `}
            >
                <div className="p-6 border-b border-border-dim flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radar className="text-accent-red animate-pulse" />
                        <span className="font-mono font-bold text-xl tracking-widest text-accent-red drop-shadow-[0_0_8px_rgba(255,51,51,0.6)]">
                            STALKER
                        </span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-muted hover:text-accent-red transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="px-6 py-2 text-xs text-muted font-mono border-b border-border-dim/50 bg-black/40">
                    v2.0.4.RC // CLASSIFIED
                </div>

                <nav className="flex-1 py-4 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Overview" to="/" />
                    <SidebarItem icon={Users} label="Targets" to="/dossier" />
                    <SidebarItem icon={MapIcon} label="Positioning" to="/positioning" />
                    <SidebarItem icon={Table2} label="Matrix" to="/matrix" />
                    <SidebarItem icon={DollarSign} label="Pricing" to="/pricing" />
                    <SidebarItem icon={Search} label="Social" to="/social" />
                    <SidebarItem icon={ShieldAlert} label="Weaknesses" to="/weaknesses" />
                    <SidebarItem icon={ShieldAlert} label="Alerts" to="/alerts" />
                </nav>

                <div className="p-4 border-t border-border-dim bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-cyan/20 border border-accent-cyan/50 flex items-center justify-center">
                            <span className="text-xs font-mono text-accent-cyan">OP</span>
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold truncate">Operator</div>
                            <div className="text-xs text-muted truncate">Level 5 Clearance</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-bg-primary relative">
                {/* Header */}
                <header className="h-16 border-b border-border-dim flex items-center justify-between px-6 bg-bg-tertiary/50 backdrop-blur-sm">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`p-2 hover:bg-white/5 rounded text-muted hover:text-primary transition-colors ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1 text-center">
                        <span className="inline-block font-mono text-xs text-accent-amber/70 border border-accent-amber/30 px-2 py-1 rounded animate-typewriter overflow-hidden whitespace-nowrap">
                            ⚠️ SYSTEM MONITORING ACTIVE
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="stamp top-secret text-xs transform rotate-0 border-2 px-2 py-1 animate-pulse" style={{ animationDuration: '3s' }}>
                            TOP SECRET
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <div className="flex-1 overflow-auto p-6 relative">
                    {/* Subtle Grid Background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(var(--border-dim) 1px, transparent 1px), linear-gradient(90deg, var(--border-dim) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />
                    <div className="relative z-10 max-w-7xl w-full" style={{ margin: '0 auto' }}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Map as MapIcon,
    Table2,
    DollarSign,
    Globe,
    Target,
    Bell,
    Menu,
    X,
    ChevronRight,
    Activity,
    Shield,
    Crosshair
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, badge }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-150 ease-out
            ${isActive
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }
        `}
    >
        {({ isActive }) => (
            <>
                <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.5}
                    className="flex-shrink-0 transition-all duration-150"
                />
                <span className="text-sm font-medium">{label}</span>
                {badge !== undefined && badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-danger)] px-1.5 text-[10px] font-semibold text-white">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
                {isActive && (
                    <ChevronRight
                        size={14}
                        className="ml-auto text-[var(--text-muted)]"
                    />
                )}
            </>
        )}
    </NavLink>
);

interface NavGroupProps {
    label: string;
    children: React.ReactNode;
}

const NavGroup: React.FC<NavGroupProps> = ({ label, children }) => (
    <div className="mb-6">
        <div className="section-label px-3 mb-2">{label}</div>
        <div className="space-y-0.5">{children}</div>
    </div>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`
                    flex flex-col bg-[var(--bg-primary)] border-r border-[var(--border-default)]
                    transition-all duration-300 ease-out
                    ${isSidebarOpen ? 'w-60' : 'w-0 -ml-60 lg:ml-0 lg:w-0'}
                `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-brand)] to-[var(--accent-info)] shadow-glow-brand">
                        <Target className="text-white" size={16} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-tight">Stalker</span>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Intelligence</span>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="status-dot status-dot-success animate-pulse-soft" />
                            <span className="text-xs text-[var(--text-secondary)]">System Active</span>
                        </div>
                        <span className="badge badge-brand">
                            <Shield size={10} />
                            L5
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <NavGroup label="Overview">
                        <NavItem icon={LayoutDashboard} label="Dashboard" to="/" />
                        <NavItem icon={Bell} label="Alerts" to="/alerts" />
                    </NavGroup>

                    <NavGroup label="Intelligence">
                        <NavItem icon={Users} label="Competitors" to="/dossier" />
                        <NavItem icon={MapIcon} label="Positioning" to="/positioning" />
                        <NavItem icon={Table2} label="Feature Matrix" to="/matrix" />
                    </NavGroup>

                    <NavGroup label="Analysis">
                        <NavItem icon={DollarSign} label="Pricing Intel" to="/pricing" />
                        <NavItem icon={Globe} label="Social Monitor" to="/social" />
                        <NavItem icon={Target} label="Weaknesses" to="/weaknesses" />
                        <NavItem icon={Crosshair} label="Strategy" to="/strategy" />
                    </NavGroup>
                </nav>

                {/* User Profile */}
                <div className="p-3 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
                            <span className="text-xs font-semibold text-[var(--text-secondary)]">OP</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">Operator</div>
                            <div className="text-xs text-[var(--text-muted)] truncate">Active Session</div>
                        </div>
                        <Activity size={14} className="text-[var(--accent-success)] animate-pulse-soft" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-lg">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                        >
                            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-success)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-success)]"></span>
                            </span>
                            <span className="text-xs font-medium text-[var(--text-secondary)]">Monitoring</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    {/* Subtle gradient overlay */}
                    <div className="fixed inset-0 pointer-events-none bg-gradient-radial opacity-50" />

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

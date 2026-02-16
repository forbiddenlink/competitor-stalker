import { useState, useEffect, useCallback, useRef } from 'react';
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
    Crosshair,
    Search,
    Settings,
    SquareStack,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SearchCommand } from '../common/SearchCommand';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    badge?: number;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, badge, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
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
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-danger)] px-1.5 text-[10px] font-semibold text-[var(--text-primary)]">
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    const prevPathnameRef = useRef(location.pathname);

    // Close sidebar on route change (mobile only, skip initial mount)
    // This is a standard React Router pattern for mobile navigation menus
    useEffect(() => {
        if (prevPathnameRef.current !== location.pathname) {
            prevPathnameRef.current = location.pathname;
            if (window.innerWidth < 1024) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsSidebarOpen(false);
            }
        }
    }, [location.pathname]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Cmd/Ctrl + K to open search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsSearchOpen(true);
        }
        // Escape to close search
        if (e.key === 'Escape' && isSearchOpen) {
            setIsSearchOpen(false);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Check if on mobile
    const closeSidebarOnMobile = () => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:relative inset-y-0 left-0 z-50
                    flex flex-col bg-[var(--bg-primary)] border-r border-[var(--border-default)]
                    transition-transform duration-300 ease-out
                    w-60
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-brand)] to-[var(--accent-info)] shadow-lg">
                        <Crosshair className="text-[var(--text-primary)]" size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-semibold tracking-tight">Stalker</span>
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
                <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
                    <NavGroup label="Overview">
                        <NavItem icon={LayoutDashboard} label="Dashboard" to="/" onClick={closeSidebarOnMobile} />
                        <NavItem icon={Bell} label="Alerts" to="/alerts" onClick={closeSidebarOnMobile} />
                    </NavGroup>

                    <NavGroup label="Intelligence">
                        <NavItem icon={Users} label="Competitors" to="/dossier" onClick={closeSidebarOnMobile} />
                        <NavItem icon={MapIcon} label="Positioning" to="/positioning" onClick={closeSidebarOnMobile} />
                        <NavItem icon={Table2} label="Feature Matrix" to="/matrix" onClick={closeSidebarOnMobile} />
                    </NavGroup>

                    <NavGroup label="Analysis">
                        <NavItem icon={DollarSign} label="Pricing Intel" to="/pricing" onClick={closeSidebarOnMobile} />
                        <NavItem icon={Globe} label="Social Monitor" to="/social" onClick={closeSidebarOnMobile} />
                        <NavItem icon={Target} label="Weaknesses" to="/weaknesses" onClick={closeSidebarOnMobile} />
                        <NavItem icon={Crosshair} label="Strategy" to="/strategy" onClick={closeSidebarOnMobile} />
                        <NavItem icon={SquareStack} label="SWOT Analysis" to="/swot" onClick={closeSidebarOnMobile} />
                    </NavGroup>

                    <NavGroup label="Settings">
                        <NavItem icon={Settings} label="Settings" to="/settings" onClick={closeSidebarOnMobile} />
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
            <div className="flex-1 flex flex-col min-w-0 relative lg:ml-0">
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
                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <Search className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="hidden sm:inline text-sm text-[var(--text-muted)]">Search...</span>
                            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] text-[var(--text-subtle)] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded">
                                ⌘K
                            </kbd>
                        </button>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-success)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-success)]"></span>
                            </span>
                            <span className="hidden sm:inline text-xs font-medium text-[var(--text-secondary)]">Monitoring</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    {/* Subtle gradient overlay */}
                    <div className="fixed inset-0 pointer-events-none bg-gradient-radial opacity-50" />

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
                        {children}
                    </div>
                </div>

                <footer className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
                        <span>Competitor Stalker</span>
                        <Link className="hover:text-[var(--text-secondary)]" to="/about">About</Link>
                        <Link className="hover:text-[var(--text-secondary)]" to="/contact">Contact</Link>
                        <Link className="hover:text-[var(--text-secondary)]" to="/privacy-policy">Privacy Policy</Link>
                    </div>
                </footer>
            </div>

            {/* Search Command Palette */}
            <SearchCommand isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
};

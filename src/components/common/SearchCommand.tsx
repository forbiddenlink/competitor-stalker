import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCompetitors } from '../../hooks/useCompetitors';

interface SearchCommandProps {
    isOpen: boolean;
    onClose: () => void;
}

// Inner component that mounts fresh each time search opens (state resets automatically)
const SearchCommandContent: React.FC<Omit<SearchCommandProps, 'isOpen'>> = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { competitors } = useCompetitors();

    // Filter competitors based on query
    const filteredCompetitors = query.trim()
        ? competitors.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.website.toLowerCase().includes(query.toLowerCase()) ||
            c.notes?.toLowerCase().includes(query.toLowerCase()) ||
            c.oneLiner?.toLowerCase().includes(query.toLowerCase())
        )
        : competitors.slice(0, 5);

    // Quick actions
    const quickActions = [
        { id: 'dashboard', label: 'Go to Dashboard', action: () => navigate('/') },
        { id: 'competitors', label: 'View All Competitors', action: () => navigate('/dossier') },
        { id: 'positioning', label: 'Positioning Map', action: () => navigate('/positioning') },
        { id: 'matrix', label: 'Feature Matrix', action: () => navigate('/matrix') },
        { id: 'swot', label: 'SWOT Analysis', action: () => navigate('/swot') },
        { id: 'settings', label: 'Settings & Export', action: () => navigate('/settings') },
        { id: 'about', label: 'About', action: () => navigate('/about') },
        { id: 'contact', label: 'Contact', action: () => navigate('/contact') },
        { id: 'privacy', label: 'Privacy Policy', action: () => navigate('/privacy-policy') },
    ];

    const filteredActions = query.trim()
        ? quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
        : quickActions.slice(0, 3);

    const totalResults = filteredCompetitors.length + filteredActions.length;

    // Focus input on mount
    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(timer);
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, totalResults - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex < filteredCompetitors.length) {
                navigate('/dossier');
                onClose();
            } else {
                const actionIndex = selectedIndex - filteredCompetitors.length;
                if (filteredActions[actionIndex]) {
                    filteredActions[actionIndex].action();
                    onClose();
                }
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [selectedIndex, filteredCompetitors.length, filteredActions, totalResults, onClose, navigate]);

    // Keep focus inside the palette (Tab trap) and close on Escape regardless of
    // which element currently has focus.
    const handleContainerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        if (e.key !== 'Tab') return;
        const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center pt-[15vh]"
            onKeyDown={handleContainerKeyDown}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                className="relative w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border-muted)] rounded-[var(--radius-modal)] shadow-2xl overflow-hidden animate-scale-in"
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)]">
                    <Search className="w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search competitors, pages..."
                        aria-label="Search competitors and pages"
                        className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-control)]">
                        ESC
                    </kbd>
                    <button
                        onClick={onClose}
                        className="sm:hidden p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {/* Competitors */}
                    {filteredCompetitors.length > 0 && (
                        <div className="p-2">
                            <div className="section-label px-2 mb-1">Competitors</div>
                            {filteredCompetitors.map((competitor, index) => (
                                <button
                                    key={competitor.id}
                                    onClick={() => { navigate('/dossier'); onClose(); }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-control)] text-left
                                        transition-colors
                                        ${selectedIndex === index
                                            ? 'bg-[var(--accent-brand-muted)] text-[var(--text-primary)]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-control)] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{competitor.name}</div>
                                        <div className="text-xs text-[var(--text-muted)] truncate">
                                            {competitor.oneLiner || competitor.website}
                                        </div>
                                    </div>
                                    <span className={`
                                        badge text-[10px]
                                        ${competitor.threatLevel === 'High' ? 'badge-danger' :
                                          competitor.threatLevel === 'Medium' ? 'badge-warning' : 'badge-success'}
                                    `}>
                                        {competitor.threatLevel}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    {filteredActions.length > 0 && (
                        <div className="p-2 border-t border-[var(--border-subtle)]">
                            <div className="section-label px-2 mb-1">Quick Actions</div>
                            {filteredActions.map((action, index) => {
                                const resultIndex = filteredCompetitors.length + index;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => {
                                            action.action();
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-control)] text-left
                                            transition-colors
                                            ${selectedIndex === resultIndex
                                                ? 'bg-[var(--accent-brand-muted)] text-[var(--text-primary)]'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                            }
                                        `}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty State */}
                    {totalResults === 0 && (
                        <div className="p-8 text-center text-[var(--text-muted)]">
                            No results found for "{query}"
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-control)] text-[10px]">↑↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-control)] text-[10px]">↵</kbd>
                            Select
                        </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                        {totalResults} results
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrapper that conditionally renders content (remounts on open for fresh state)
export const SearchCommand: React.FC<SearchCommandProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return <SearchCommandContent onClose={onClose} />;
};

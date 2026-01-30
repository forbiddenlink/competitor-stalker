/**
 * Application constants
 */

// Storage keys
export const STORAGE_KEYS = {
    COMPETITORS: 'stalker_competitors',
    PROFILE: 'stalker_profile',
    THEME: 'stalker_theme',
    SIDEBAR_COLLAPSED: 'stalker_sidebar_collapsed',
    SNAPSHOTS: 'stalker_snapshots',
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
    SEARCH: { key: 'k', meta: true, label: '⌘K' },
    NEW_COMPETITOR: { key: 'n', meta: true, label: '⌘N' },
    CLOSE_MODAL: { key: 'Escape', meta: false, label: 'Esc' },
} as const;

// Positioning map axes
export const POSITIONING_AXES = {
    X: { label: 'Price Point', low: 'Budget', high: 'Enterprise' },
    Y: { label: 'Product Maturity', low: 'Early Stage', high: 'Established' },
} as const;

// Feature status options
export const FEATURE_STATUS_OPTIONS = [
    { value: 'Have', label: 'Have', color: 'success' },
    { value: 'DontHave', label: "Don't Have", color: 'danger' },
    { value: 'Better', label: 'Better', color: 'info' },
    { value: 'Worse', label: 'Worse', color: 'warning' },
] as const;

// Threat level options
export const THREAT_LEVELS = [
    { value: 'Low', label: 'Low Threat', color: 'success' },
    { value: 'Medium', label: 'Medium Threat', color: 'warning' },
    { value: 'High', label: 'High Threat', color: 'danger' },
] as const;

// Weakness severity options
export const WEAKNESS_SEVERITIES = [
    { value: 'Low', label: 'Low', color: 'success' },
    { value: 'Medium', label: 'Medium', color: 'warning' },
    { value: 'Critical', label: 'Critical', color: 'danger' },
] as const;

// Strategy status options
export const STRATEGY_STATUSES = [
    { value: 'Planned', label: 'Planned', color: 'default' },
    { value: 'Active', label: 'Active', color: 'info' },
    { value: 'Completed', label: 'Completed', color: 'success' },
] as const;

// Alert types
export const ALERT_TYPES = [
    { value: 'Pricing', label: 'Pricing Change' },
    { value: 'Feature', label: 'New Feature' },
    { value: 'Marketing', label: 'Marketing Move' },
    { value: 'Personnel', label: 'Personnel Change' },
] as const;

// Navigation items
export const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/competitors', label: 'Dossiers', icon: 'Users' },
    { path: '/positioning', label: 'Positioning', icon: 'Crosshair' },
    { path: '/matrix', label: 'Feature Matrix', icon: 'Grid3X3' },
    { path: '/pricing', label: 'Pricing Intel', icon: 'DollarSign' },
    { path: '/social', label: 'Social', icon: 'Share2' },
    { path: '/weaknesses', label: 'Weaknesses', icon: 'Target' },
    { path: '/strategy', label: 'Strategy', icon: 'Swords' },
    { path: '/swot', label: 'SWOT Analysis', icon: 'SquareStack' },
    { path: '/alerts', label: 'Alerts', icon: 'Bell' },
] as const;

// Common feature list for dev tools
export const DEFAULT_FEATURES = [
    'Edge Functions',
    'Managed Database',
    'Preview Deploys',
    'Auto-scaling',
    'Custom Domains',
    'SSL Certificates',
    'CI/CD Pipeline',
    'Docker Support',
    'Background Workers',
    'Cron Jobs',
    'WebSockets',
    'Static Hosting',
    'Serverless Functions',
    'Team Collaboration',
    'Analytics Dashboard',
] as const;

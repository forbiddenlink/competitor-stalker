import React from 'react';

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: React.ReactNode;
    dot?: boolean;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    icon,
    dot = false,
    className = '',
}) => {
    const baseStyles = `
        inline-flex items-center justify-center gap-1.5
        font-medium uppercase tracking-wide
        rounded-full whitespace-nowrap
    `;

    const variants: Record<BadgeVariant, string> = {
        default: `
            bg-[var(--bg-surface)]
            text-[var(--text-secondary)]
            border border-[var(--border-default)]
        `,
        brand: `
            bg-[var(--accent-brand-muted)]
            text-[var(--accent-brand-soft)]
            border border-[rgba(59,130,246,0.3)]
        `,
        success: `
            bg-[var(--accent-success-muted)]
            text-[var(--accent-success-soft)]
            border border-[rgba(34,197,94,0.3)]
        `,
        warning: `
            bg-[var(--accent-warning-muted)]
            text-[var(--accent-warning-soft)]
            border border-[rgba(245,158,11,0.3)]
        `,
        danger: `
            bg-[var(--accent-danger-muted)]
            text-[var(--accent-danger-soft)]
            border border-[rgba(239,68,68,0.3)]
        `,
        info: `
            bg-[var(--accent-info-muted)]
            text-[var(--accent-info-soft)]
            border border-[rgba(6,182,212,0.3)]
        `,
        purple: `
            bg-[var(--accent-purple-muted)]
            text-[var(--accent-purple-soft)]
            border border-[rgba(168,85,247,0.3)]
        `,
    };

    const sizes: Record<BadgeSize, string> = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-[11px]',
    };

    const dotColors: Record<BadgeVariant, string> = {
        default: 'bg-[var(--text-muted)]',
        brand: 'bg-[var(--accent-brand)]',
        success: 'bg-[var(--accent-success)]',
        warning: 'bg-[var(--accent-warning)]',
        danger: 'bg-[var(--accent-danger)]',
        info: 'bg-[var(--accent-info)]',
        purple: 'bg-[var(--accent-purple)]',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {icon}
            {children}
        </span>
    );
};

// Threat level badge with predefined styling
interface ThreatBadgeProps {
    level: 'Low' | 'Medium' | 'High';
    size?: BadgeSize;
    className?: string;
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({ level, size = 'md', className = '' }) => {
    const levelVariants: Record<ThreatBadgeProps['level'], BadgeVariant> = {
        Low: 'success',
        Medium: 'warning',
        High: 'danger',
    };

    return (
        <Badge variant={levelVariants[level]} size={size} dot className={className}>
            {level}
        </Badge>
    );
};

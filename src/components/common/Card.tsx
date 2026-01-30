import React from 'react';

type CardVariant = 'default' | 'surface' | 'elevated' | 'glass' | 'outline';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: CardVariant;
    interactive?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    as?: 'div' | 'article' | 'section';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    interactive = false,
    padding = 'md',
    as: Component = 'div',
    onClick,
}) => {
    const baseStyles = 'relative rounded-lg overflow-hidden';

    const variants: Record<CardVariant, string> = {
        default: `
            bg-[var(--bg-secondary)]
            border border-[var(--border-default)]
        `,
        surface: `
            bg-[var(--bg-tertiary)]
            border border-[var(--border-muted)]
        `,
        elevated: `
            bg-gradient-to-b from-[var(--bg-tertiary)] to-[var(--bg-secondary)]
            border border-[var(--border-muted)]
            shadow-lg
        `,
        glass: `
            glass-card
        `,
        outline: `
            bg-transparent
            border border-[var(--border-muted)]
        `,
    };

    const paddings: Record<typeof padding, string> = {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
    };

    const interactiveStyles = interactive
        ? `
            cursor-pointer
            transition-all duration-150 ease-out
            hover:border-[var(--border-emphasis)]
            hover:shadow-md
            hover:-translate-y-0.5
            active:translate-y-0
        `
        : '';

    return (
        <Component
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${interactiveStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </Component>
    );
};

// Sub-components for structured cards
interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', actions }) => (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
        <div>{children}</div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
);

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
    subtitle?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', subtitle }) => (
    <div className={className}>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{children}</h3>
        {subtitle && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        )}
    </div>
);

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
    <div className={className}>{children}</div>
);

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-[var(--border-subtle)] ${className}`}>
        {children}
    </div>
);

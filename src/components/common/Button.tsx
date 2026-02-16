import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = `
        inline-flex items-center justify-center gap-2
        font-medium tracking-tight
        transition-all duration-150 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
    `;

    const variants: Record<ButtonVariant, string> = {
        primary: `
            bg-[var(--accent-brand)] text-[var(--text-primary)]
            hover:bg-[var(--accent-brand-soft)]
            focus-visible:ring-[var(--accent-brand)]
            shadow-sm hover:shadow-md
        `,
        secondary: `
            bg-[var(--bg-surface)] text-[var(--text-primary)]
            border border-[var(--border-muted)]
            hover:bg-[var(--bg-elevated)] hover:border-[var(--border-emphasis)]
            focus-visible:ring-[var(--border-strong)]
        `,
        outline: `
            bg-transparent text-[var(--accent-brand-soft)]
            border border-[var(--accent-brand)]
            hover:bg-[var(--accent-brand-muted)]
            focus-visible:ring-[var(--accent-brand)]
        `,
        ghost: `
            bg-transparent text-[var(--text-secondary)]
            hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]
            focus-visible:ring-[var(--border-muted)]
        `,
        danger: `
            bg-[var(--accent-danger)] text-[var(--text-primary)]
            hover:bg-[var(--accent-danger-soft)]
            focus-visible:ring-[var(--accent-danger)]
            shadow-sm hover:shadow-md
        `,
        success: `
            bg-[var(--accent-success)] text-[var(--text-primary)]
            hover:bg-[var(--accent-success-soft)]
            focus-visible:ring-[var(--accent-success)]
            shadow-sm hover:shadow-md
        `,
    };

    const sizes: Record<ButtonSize, string> = {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-4 text-sm rounded-lg',
        lg: 'h-11 px-6 text-base rounded-lg',
    };

    return (
        <button
            type="button"
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
};

import React from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    inputSize?: InputSize;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    inputSize = 'md',
    leftElement,
    rightElement,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const sizes: Record<InputSize, string> = {
        sm: 'h-8 text-xs px-3',
        md: 'h-9 text-sm px-3',
        lg: 'h-11 text-base px-4',
    };

    const baseInputStyles = `
        w-full
        bg-[var(--bg-secondary)]
        border border-[var(--border-default)]
        rounded-lg
        text-[var(--text-primary)]
        placeholder:text-[var(--text-subtle)]
        transition-all duration-150 ease-out
        hover:border-[var(--border-muted)]
        focus:outline-none focus:border-[var(--accent-brand)] focus:ring-2 focus:ring-[var(--accent-brand)]/20
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--border-default)]
    `;

    const errorStyles = error
        ? 'border-[var(--accent-danger)] hover:border-[var(--accent-danger)] focus:border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]/20'
        : '';

    const paddingWithElements = `
        ${leftElement ? 'pl-10' : ''}
        ${rightElement ? 'pr-10' : ''}
    `;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftElement && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {leftElement}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`${baseInputStyles} ${sizes[inputSize]} ${errorStyles} ${paddingWithElements} ${className}`}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {rightElement}
                    </div>
                )}
            </div>
            {(error || hint) && (
                <p className={`text-xs ${error ? 'text-[var(--accent-danger)]' : 'text-[var(--text-muted)]'}`}>
                    {error || hint}
                </p>
            )}
        </div>
    );
};

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    hint,
    className = '',
    id,
    ...props
}) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseStyles = `
        w-full
        bg-[var(--bg-secondary)]
        border border-[var(--border-default)]
        rounded-lg
        text-[var(--text-primary)]
        placeholder:text-[var(--text-subtle)]
        transition-all duration-150 ease-out
        hover:border-[var(--border-muted)]
        focus:outline-none focus:border-[var(--accent-brand)] focus:ring-2 focus:ring-[var(--accent-brand)]/20
        disabled:opacity-50 disabled:cursor-not-allowed
        resize-none
        p-3 text-sm
    `;

    const errorStyles = error
        ? 'border-[var(--accent-danger)] focus:border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]/20'
        : '';

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label
                    htmlFor={textareaId}
                    className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
                >
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={`${baseStyles} ${errorStyles} ${className}`}
                {...props}
            />
            {(error || hint) && (
                <p className={`text-xs ${error ? 'text-[var(--accent-danger)]' : 'text-[var(--text-muted)]'}`}>
                    {error || hint}
                </p>
            )}
        </div>
    );
};

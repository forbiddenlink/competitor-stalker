
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    variant?: 'default' | 'glass';
}

export const Input: React.FC<InputProps> = ({ label, className = '', variant = 'default', ...props }) => {
    const baseStyles = `
        px-3 py-2.5 text-text-primary placeholder-text-muted
        transition-all duration-200 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary
    `;

    const variants = {
        default: `
            bg-bg-secondary border border-border-dim 
            focus:border-accent-cyan focus:ring-accent-cyan/50
            hover:border-border-bright
        `,
        glass: `
            glass-card
            focus:border-accent-cyan focus:ring-accent-cyan/50
        `
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="text-xs font-sans font-medium text-text-secondary uppercase tracking-wide">
                    {label}
                </label>
            )}
            <input
                className={`${baseStyles} ${variants[variant]} ${className}`}
                {...props}
            />
        </div>
    );
};


import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-xs font-mono text-text-muted uppercase tracking-wider">{label}</label>}
            <input
                className={`
                    bg-black/30 border border-border-dim px-3 py-2 text-text-primary 
                    focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/50
                    transition-all duration-200
                    ${className}
                `}
                {...props}
            />
        </div>
    );
};


import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80 shadow-[0_0_10px_rgba(0,204,255,0.3)]",
        secondary: "bg-accent-pink text-bg-primary hover:bg-accent-pink/80 shadow-[0_0_10px_rgba(255,51,153,0.3)]",
        outline: "border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10",
        ghost: "text-text-muted hover:text-text-primary hover:bg-white/5"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

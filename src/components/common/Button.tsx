
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-sans font-medium tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary";

    const variants = {
        primary: "bg-gradient-to-r from-accent-cyan to-accent-blue text-bg-primary hover:shadow-glow active:scale-95",
        secondary: "bg-gradient-to-r from-accent-blue to-accent-purple text-text-primary hover:shadow-glow active:scale-95",
        outline: "border-2 border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 hover:shadow-glow-cyan",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95",
        danger: "bg-gradient-to-r from-accent-red to-accent-amber text-text-primary hover:shadow-glow-red active:scale-95",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs rounded-md",
        md: "px-4 py-2 text-sm rounded-lg",
        lg: "px-6 py-3 text-base rounded-lg"
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

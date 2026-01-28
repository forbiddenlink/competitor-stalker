
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated';
    interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
    children, 
    className = '', 
    variant = 'default',
    interactive = false 
}) => {
    const baseStyles = "relative overflow-hidden rounded-lg";
    
    const variants = {
        default: "bg-bg-secondary border border-border-dim",
        glass: "glass-card",
        elevated: "bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border-bright shadow-lg",
    };

    const interactiveStyles = interactive 
        ? "group transition-all duration-300 hover:shadow-glow hover:border-border-active cursor-pointer"
        : "";

    return (
        <div className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}>
            {interactive && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />}
            {children}
        </div>
    );
};


import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-bg-secondary border border-border-dim p-4 relative overflow-hidden backdrop-blur-sm ${className}`}>
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent-cyan/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-accent-cyan/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-accent-cyan/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent-cyan/50" />

            {children}
        </div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Target, Move } from 'lucide-react';

export const PositioningMap: React.FC = () => {
    const { competitors, userProfile, updateCompetitor, updateUserProfile } = useCompetitors();
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [isDraggingUser, setIsDraggingUser] = useState(false);

    const handleMouseDown = (e: React.MouseEvent, id: string | 'USER') => {
        e.preventDefault();
        e.stopPropagation();
        if (id === 'USER') {
            setIsDraggingUser(true);
        } else {
            setDraggingId(id);
        }
    };

    const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
        if (!draggingId && !isDraggingUser) return;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

        // Invert Y because in cartesian charts bottom is 0, but in CSS top is 0.
        // Actually for simplicity let's keep Top-Left as 0,0 for internal storage, but visualize axes properly.
        // Let's standard: 0,0 is Top-Left in CSS.
        // So Y=0 is High (if Quality is Y-axis and Top is High).
        // Let's define axes:
        // X: Price (Left=Low, Right=High)
        // Y: Quality (Top=High, Bottom=Low) -> This is natural CSS (0=Top=High Quality).

        if (isDraggingUser) {
            updateUserProfile({ positionX: x, positionY: y });
        } else if (draggingId) {
            updateCompetitor(draggingId, { positionX: x, positionY: y });
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        setIsDraggingUser(false);
    };

    // Global event listeners for dragging outside container
    useEffect(() => {
        if (draggingId || isDraggingUser) {
            window.addEventListener('mousemove', handleMouseMove as any);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove as any);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove as any);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, isDraggingUser]);

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-mono text-text-primary">Market Positioning</h2>
                    <p className="text-sm text-text-muted">Drag targets to adjust intelligence status.</p>
                </div>
            </div>

            <div className="flex-1 min-h-[500px] relative bg-bg-secondary border border-border-dim rounded overflow-hidden select-none" ref={containerRef}>

                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(var(--border-dim) 1px, transparent 1px), linear-gradient(90deg, var(--border-dim) 1px, transparent 1px)',
                        backgroundSize: '10% 10%'
                    }}
                />

                {/* Axes */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-border-active opacity-50"></div>
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border-active opacity-50"></div>

                {/* Labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono text-text-muted uppercase tracking-wider bg-bg-secondary px-2">High Quality</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono text-text-muted uppercase tracking-wider bg-bg-secondary px-2">Low Quality</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted uppercase tracking-wider bg-bg-secondary px-2 [writing-mode:vertical-lr] rotate-180">Low Price</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted uppercase tracking-wider bg-bg-secondary px-2 [writing-mode:vertical-lr] rotate-180">High Price</div>

                {/* Competitor Markers */}
                {competitors.map((comp) => (
                    <div
                        key={comp.id}
                        className={`
                            absolute flex flex-col items-center cursor-move group
                            ${draggingId === comp.id ? 'z-50 scale-110' : 'z-10 hover:z-40'}
                            transition-transform duration-100
                        `}
                        style={{
                            left: `${comp.positionX ?? 50}%`,
                            top: `${comp.positionY ?? 50}%`,
                            transform: 'translate(-50%, -50%)' // Center the dot
                        }}
                        onMouseDown={(e) => handleMouseDown(e, comp.id)}
                    >
                        <div className={`
                            w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]
                            ${comp.threatLevel === 'High' ? 'bg-accent-red/20 border-accent-red text-accent-red' :
                                comp.threatLevel === 'Medium' ? 'bg-accent-amber/20 border-accent-amber text-accent-amber' :
                                    'bg-accent-green/20 border-accent-green text-accent-green'}
                            ${draggingId === comp.id ? 'animate-pulse' : ''}
                        `}>
                            {comp.logo ? (
                                <img src={comp.logo} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <Target size={16} />
                            )}
                        </div>
                        <span className={`
                            mt-2 text-xs font-bold font-mono px-2 py-0.5 rounded bg-black/80 border border-border-dim whitespace-nowrap
                            ${comp.threatLevel === 'High' ? 'text-accent-red' : 'text-text-primary'}
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                            ${draggingId === comp.id ? 'opacity-100' : ''}
                        `}>
                            {comp.name}
                        </span>
                    </div>
                ))}

                {/* Users Business Marker */}
                <div
                    className={`
                        absolute flex flex-col items-center cursor-move z-20 hover:z-50
                        ${isDraggingUser ? 'scale-110 z-50' : ''}
                        transition-transform duration-100
                    `}
                    style={{
                        left: `${userProfile.positionX}%`,
                        top: `${userProfile.positionY}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'USER')}
                >
                    <div className="w-10 h-10 rounded-full bg-accent-cyan/20 border-2 border-accent-cyan flex items-center justify-center text-accent-cyan shadow-[0_0_15px_rgba(0,204,255,0.4)]">
                        <Move size={20} />
                    </div>
                    <span className="mt-2 text-xs font-bold font-mono text-accent-cyan bg-black/80 px-2 py-0.5 rounded border border-accent-cyan/50">
                        YOU
                    </span>
                </div>

            </div>
        </div>
    );
};

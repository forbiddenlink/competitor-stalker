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

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!draggingId && !isDraggingUser) return;
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

            if (isDraggingUser) {
                updateUserProfile({ positionX: x, positionY: y });
            } else if (draggingId) {
                updateCompetitor(draggingId, { positionX: x, positionY: y });
            }
        };

        const onMouseUp = () => {
            setDraggingId(null);
            setIsDraggingUser(false);
        };

        if (draggingId || isDraggingUser) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [draggingId, isDraggingUser, updateCompetitor, updateUserProfile]);

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Market Positioning</h2>
                    <p className="text-sm text-[var(--text-muted)]">Drag targets to adjust intelligence status.</p>
                </div>
            </div>

            <div
                className="flex-1 min-h-[500px] relative bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-card)] overflow-hidden select-none"
                ref={containerRef}
            >
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
                        backgroundSize: '10% 10%',
                    }}
                />

                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border-emphasis)] opacity-50" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border-emphasis)] opacity-50" />

                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide bg-[var(--bg-secondary)] px-2 rounded-[var(--radius-control)]">High Quality</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide bg-[var(--bg-secondary)] px-2 rounded-[var(--radius-control)]">Low Quality</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide bg-[var(--bg-secondary)] px-2 rounded-[var(--radius-control)] [writing-mode:vertical-lr] rotate-180">Low Price</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide bg-[var(--bg-secondary)] px-2 rounded-[var(--radius-control)] [writing-mode:vertical-lr] rotate-180">High Price</div>

                {competitors.map((comp) => (
                    <div
                        key={comp.id}
                        className={`
                            absolute flex flex-col items-center cursor-move group
                            ${draggingId === comp.id ? 'z-50 scale-110' : 'z-10 hover:z-40'}
                            transition-transform duration-fast
                        `}
                        style={{
                            left: `${comp.positionX ?? 50}%`,
                            top: `${comp.positionY ?? 50}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, comp.id)}
                    >
                        <div
                            className={`
                                w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm
                                ${
                                    comp.threatLevel === 'High'
                                        ? 'bg-[var(--accent-danger-muted)] border-[var(--accent-danger)] text-[var(--accent-danger)]'
                                        : comp.threatLevel === 'Medium'
                                            ? 'bg-[var(--accent-warning-muted)] border-[var(--accent-warning)] text-[var(--accent-warning)]'
                                            : 'bg-[var(--accent-success-muted)] border-[var(--accent-success)] text-[var(--accent-success)]'
                                }
                            `}
                        >
                            {comp.logo ? (
                                <img src={comp.logo} alt={comp.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <Target size={16} />
                            )}
                        </div>
                        <span
                            className={`
                                mt-2 text-xs font-semibold font-mono px-2 py-0.5 rounded-[var(--radius-control)] bg-[var(--bg-primary)] border border-[var(--border-default)] whitespace-nowrap
                                ${comp.threatLevel === 'High' ? 'text-[var(--accent-danger)]' : 'text-[var(--text-primary)]'}
                                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                ${draggingId === comp.id ? 'opacity-100' : ''}
                            `}
                        >
                            {comp.name}
                        </span>
                    </div>
                ))}

                <div
                    className={`
                        absolute flex flex-col items-center cursor-move z-20 hover:z-50
                        ${isDraggingUser ? 'scale-110 z-50' : ''}
                        transition-transform duration-fast
                    `}
                    style={{
                        left: `${userProfile.positionX}%`,
                        top: `${userProfile.positionY}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'USER')}
                >
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-info-muted)] border-2 border-[var(--accent-info)] flex items-center justify-center text-[var(--accent-info)] shadow-sm">
                        <Move size={20} />
                    </div>
                    <span className="mt-2 text-xs font-semibold font-mono text-[var(--accent-info)] bg-[var(--bg-primary)] px-2 py-0.5 rounded-[var(--radius-control)] border border-[var(--accent-info)]/50">
                        YOU
                    </span>
                </div>
            </div>
        </div>
    );
};

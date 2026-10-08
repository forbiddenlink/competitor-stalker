import React, { useState, useRef, useEffect } from 'react';
import { useCompetitors } from '../../../hooks/useCompetitors';
import { Target, Move } from 'lucide-react';

export const PositioningMap: React.FC = () => {
    const { competitors, userProfile, updateCompetitor, updateUserProfile } = useCompetitors();
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [isDraggingUser, setIsDraggingUser] = useState(false);
    // Live position during a drag. Kept in local state (visual only) and a ref
    // (for the commit) so we persist to context ONCE on drag-end instead of on
    // every mousemove — a per-pixel write previously flooded the snapshot history
    // and caused jank.
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
    const dragPosRef = useRef<{ x: number; y: number } | null>(null);

    const pointerIdRef = useRef<number | null>(null);
    const keyboardRef = useRef<{ id: string; x: number; y: number } | null>(null);
    const [keyboardPos, setKeyboardPos] = useState<{ id: string; x: number; y: number } | null>(null);
    const handlePointerDown = (e: React.PointerEvent, id: string | 'USER') => {
        if (pointerIdRef.current !== null) return;
        pointerIdRef.current = e.pointerId;
        e.preventDefault();
        e.stopPropagation();
        dragPosRef.current = null;
        setDragPos(null);
        if (id === 'USER') {
            setIsDraggingUser(true);
        } else {
            setDraggingId(id);
        }
    };

    useEffect(() => {
        if (!draggingId && !isDraggingUser) return;

        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerId !== pointerIdRef.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

            const next = { x, y };
            dragPosRef.current = next;
            setDragPos(next); // visual only — no persistence mid-drag
        };

        const onPointerUp = (e: PointerEvent) => {
            if (e.pointerId !== pointerIdRef.current) return;
            pointerIdRef.current = null;
            const pos = dragPosRef.current;
            if (pos) {
                if (isDraggingUser) {
                    updateUserProfile({ positionX: pos.x, positionY: pos.y });
                } else if (draggingId) {
                    updateCompetitor(draggingId, { positionX: pos.x, positionY: pos.y });
                }
            }
            setDraggingId(null);
            setIsDraggingUser(false);
            setDragPos(null);
            dragPosRef.current = null;
        };

        const onPointerCancel = (e: PointerEvent): void => {
            if (e.pointerId !== pointerIdRef.current) return;
            pointerIdRef.current = null;
            dragPosRef.current = null;
            setDraggingId(null); setIsDraggingUser(false); setDragPos(null);
        };
        window.addEventListener('pointercancel', onPointerCancel);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointercancel', onPointerCancel);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [draggingId, isDraggingUser, updateCompetitor, updateUserProfile]);

    const commitKeyboard = (): void => {
        const position = keyboardRef.current;
        if (!position) return;
        keyboardRef.current = null;
        setKeyboardPos(null);
        if (position.id === 'USER') updateUserProfile({ positionX: position.x, positionY: position.y });
        else updateCompetitor(position.id, { positionX: position.x, positionY: position.y });
    };
    const moveByKeyboard = (e: React.KeyboardEvent, id: string, x: number, y: number): void => {
        const delta: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (!delta[e.key]) return;
        e.preventDefault();
        const current = keyboardRef.current?.id === id ? keyboardRef.current : { id, x, y };
        const [dx, dy] = delta[e.key];
        const next = { id, x: Math.max(0, Math.min(100, current.x + dx)), y: Math.max(0, Math.min(100, current.y + dy)) };
        if (next.x === current.x && next.y === current.y) return;
        keyboardRef.current = next;
        setKeyboardPos(next);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="workspace-title text-[var(--text-primary)]">Market Positioning</h1>
                    <p className="text-sm text-[var(--text-muted)]">Drag with mouse or touch. Focus a marker and use arrow keys to move one point. Coordinates are your research estimates.</p>
                </div>
            </div>

            <div
                className="flex-1 min-h-[360px] sm:min-h-[500px] relative bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-card)] overflow-hidden select-none"
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
                        role="button"
                        onKeyUp={e => { if (e.key.startsWith('Arrow')) commitKeyboard(); }}
                        onBlur={commitKeyboard}
                        tabIndex={0}
                        aria-label={`Position ${comp.name}: price ${Math.round(comp.positionX ?? 50)}, quality ${Math.round(100 - (comp.positionY ?? 50))}`}
                        onKeyDown={e => moveByKeyboard(e, comp.id, comp.positionX ?? 50, comp.positionY ?? 50)}
                        className={`
                            absolute flex flex-col items-center cursor-move touch-none group
                            ${draggingId === comp.id ? 'z-50 scale-110' : 'z-10 hover:z-40'}
                            transition-transform duration-fast
                        `}
                        style={{
                            left: `${draggingId === comp.id && dragPos ? dragPos.x : keyboardPos?.id === comp.id ? keyboardPos.x : comp.positionX ?? 50}%`,
                            top: `${draggingId === comp.id && dragPos ? dragPos.y : keyboardPos?.id === comp.id ? keyboardPos.y : comp.positionY ?? 50}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        onPointerDown={(e) => handlePointerDown(e, comp.id)}
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
                                opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none
                                ${draggingId === comp.id ? 'opacity-100' : ''}
                            `}
                        >
                            {comp.name}
                        </span>
                    </div>
                ))}

                <div
                    role="button"
                    tabIndex={0}
                    onKeyUp={e => { if (e.key.startsWith('Arrow')) commitKeyboard(); }}
                    onBlur={commitKeyboard}
                    aria-label={`Position your business: price ${Math.round(userProfile.positionX)}, quality ${Math.round(100 - userProfile.positionY)}`}
                    onKeyDown={e => moveByKeyboard(e, 'USER', userProfile.positionX, userProfile.positionY)}
                    className={`
                        absolute flex flex-col items-center cursor-move touch-none z-20 hover:z-50
                        ${isDraggingUser ? 'scale-110 z-50' : ''}
                        transition-transform duration-fast
                    `}
                    style={{
                        left: `${isDraggingUser && dragPos ? dragPos.x : keyboardPos?.id === 'USER' ? keyboardPos.x : userProfile.positionX}%`,
                        top: `${isDraggingUser && dragPos ? dragPos.y : keyboardPos?.id === 'USER' ? keyboardPos.y : userProfile.positionY}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    onPointerDown={(e) => handlePointerDown(e, 'USER')}
                >
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-info-muted)] border-2 border-[var(--accent-info)] flex items-center justify-center text-[var(--accent-info)] shadow-sm">
                        <Move size={20} />
                    </div>
                    <span className="mt-2 text-xs font-semibold font-mono text-[var(--accent-info)] bg-[var(--bg-primary)] px-2 py-0.5 rounded-[var(--radius-control)] border border-[var(--accent-info)]/50">
                        YOU
                    </span>
                </div>
            </div>
            <div className="panel p-4 mt-5"><h3 className="section-label mb-3">Recorded coordinates / Price · Quality</h3><p className="text-xs text-[var(--text-muted)] mb-4">Enter 0–100. Changes save when you leave the field or press Enter.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">{[...competitors, { id: 'USER', name: userProfile.name || 'Your business', positionX: userProfile.positionX, positionY: userProfile.positionY, threatLevel: undefined }].map(c => <div key={c.id} className="border-t border-[var(--border-subtle)] pt-3"><strong>{c.name}</strong>{c.threatLevel && <span className="text-xs text-[var(--text-muted)]"> · {c.threatLevel} threat</span>}<div className="flex gap-3 mt-2">{(['Price', 'Quality'] as const).map(axis => {
                const value = axis === 'Price' ? c.positionX ?? 50 : 100 - (c.positionY ?? 50);
                return <label key={`${axis}-${value}`} className="flex-1 text-xs text-[var(--text-muted)]">{axis}<input type="number" min={0} max={100} step={1} defaultValue={value} aria-label={`${axis} coordinate for ${c.name}`} className="block w-full px-3 h-10 mt-1" onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }} onBlur={e => {
                    const number = e.currentTarget.valueAsNumber;
                    if (!Number.isFinite(number)) { e.currentTarget.value = String(value); return; }
                    const next = Math.max(0, Math.min(100, number));
                    e.currentTarget.value = String(next);
                    if (next === value) return;
                    const updates = axis === 'Price' ? { positionX: next } : { positionY: 100 - next };
                    if (c.id === 'USER') updateUserProfile(updates); else updateCompetitor(c.id, updates);
                }} /></label>;
            })}</div></div>)}</div></div>
        </div>
    );
};

import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast, type ToastType } from '../../context/ToastContext';

const iconMap: Record<ToastType, React.ElementType> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap: Record<ToastType, string> = {
    success: 'border-l-[var(--accent-success)] bg-[var(--accent-success-muted)]',
    error: 'border-l-[var(--accent-danger)] bg-[var(--accent-danger-muted)]',
    warning: 'border-l-[var(--accent-warning)] bg-[var(--accent-warning-muted)]',
    info: 'border-l-[var(--accent-info)] bg-[var(--accent-info-muted)]',
};

const iconColorMap: Record<ToastType, string> = {
    success: 'text-[var(--accent-success)]',
    error: 'text-[var(--accent-danger)]',
    warning: 'text-[var(--accent-warning)]',
    info: 'text-[var(--accent-info)]',
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm">
            {toasts.map(toast => {
                const Icon = iconMap[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`
                            flex items-start gap-3 p-4 rounded-lg border-l-4
                            bg-[var(--bg-elevated)] border border-[var(--border-default)]
                            ${colorMap[toast.type]}
                            animate-slide-in-right shadow-lg
                        `}
                        role="alert"
                    >
                        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorMap[toast.type]}`} />
                        <p className="text-sm text-[var(--text-primary)] flex-1">
                            {toast.message}
                        </p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

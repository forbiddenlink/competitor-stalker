import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log to error reporting service in production
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--accent-danger-muted)] flex items-center justify-center mb-6">
                        <AlertTriangle size={32} className="text-[var(--accent-danger)]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] max-w-md mb-6">
                        An unexpected error occurred. Try refreshing the page or contact support if the problem persists.
                    </p>
                    {import.meta.env.DEV && this.state.error && (
                        <details className="mb-6 text-left max-w-lg w-full">
                            <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]">
                                Error details (development only)
                            </summary>
                            <pre className="mt-2 p-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--accent-danger)] overflow-auto">
                                {this.state.error.message}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={this.handleReset}>
                            Try Again
                        </Button>
                        <Button variant="primary" leftIcon={<RefreshCw size={14} />} onClick={this.handleReload}>
                            Refresh Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

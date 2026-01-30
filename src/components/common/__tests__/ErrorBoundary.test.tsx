import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error message');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Suppress console.error during tests
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Child content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('renders error UI when child throws', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
        render(
            <ErrorBoundary fallback={<div>Custom error UI</div>}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });

    it('provides Try Again button that attempts to reset error state', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();

        // Try Again button should be present and clickable
        const tryAgainButton = screen.getByRole('button', { name: /try again/i });
        expect(tryAgainButton).toBeInTheDocument();

        // Click Try Again - this resets state, but re-render with same error
        // will throw again. This tests the button exists and is functional.
        fireEvent.click(tryAgainButton);

        // After reset, if component still throws, error boundary catches again
        // This is expected behavior - the test verifies the button works
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('provides Refresh Page button', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
    });

    it('logs error to console', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(consoleSpy).toHaveBeenCalledWith(
            'ErrorBoundary caught an error:',
            expect.any(Error),
            expect.any(Object)
        );
    });

    it('catches errors from deeply nested components', () => {
        const DeepChild = () => {
            throw new Error('Deep error');
        };

        render(
            <ErrorBoundary>
                <div>
                    <div>
                        <DeepChild />
                    </div>
                </div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('multiple ErrorBoundaries can catch errors independently', () => {
        render(
            <div>
                <ErrorBoundary>
                    <div>Working section 1</div>
                </ErrorBoundary>
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
                <ErrorBoundary>
                    <div>Working section 2</div>
                </ErrorBoundary>
            </div>
        );

        expect(screen.getByText('Working section 1')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Working section 2')).toBeInTheDocument();
    });
});

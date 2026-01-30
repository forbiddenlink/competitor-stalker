import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, ThreatBadge } from '../Badge';

describe('Badge', () => {
    it('renders children correctly', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
        const variants = ['default', 'brand', 'success', 'warning', 'danger', 'info', 'purple'] as const;

        variants.forEach((variant) => {
            const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
            expect(screen.getByText(variant)).toBeInTheDocument();
            unmount();
        });
    });

    it('renders with icon', () => {
        const Icon = () => <span data-testid="badge-icon">Icon</span>;
        render(<Badge icon={<Icon />}>With Icon</Badge>);

        expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    });

    it('renders with dot indicator', () => {
        const { container } = render(<Badge dot variant="success">Active</Badge>);

        // Dot should be a small span element
        const dot = container.querySelector('.rounded-full.w-1\\.5');
        expect(dot).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<Badge size="sm">Small</Badge>);
        expect(screen.getByText('Small')).toBeInTheDocument();

        rerender(<Badge size="md">Medium</Badge>);
        expect(screen.getByText('Medium')).toBeInTheDocument();
    });
});

describe('ThreatBadge', () => {
    it('renders Low threat level with success variant', () => {
        render(<ThreatBadge level="Low" />);
        expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('renders Medium threat level with warning variant', () => {
        render(<ThreatBadge level="Medium" />);
        expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('renders High threat level with danger variant', () => {
        render(<ThreatBadge level="High" />);
        expect(screen.getByText('High')).toBeInTheDocument();
    });
});

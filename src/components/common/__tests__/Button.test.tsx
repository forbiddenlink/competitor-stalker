import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders with different variants', () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<Button size="md">Medium</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        render(<Button isLoading>Loading</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        // Loading spinner should be present (svg element)
        expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders with left icon', () => {
        const Icon = () => <span data-testid="left-icon">Icon</span>;
        render(<Button leftIcon={<Icon />}>With Icon</Button>);

        expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
        const Icon = () => <span data-testid="right-icon">Icon</span>;
        render(<Button rightIcon={<Icon />}>With Icon</Button>);

        expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('has type="button" by default', () => {
        render(<Button>Default Type</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('can override button type', () => {
        render(<Button type="submit">Submit</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompetitorForm } from '../CompetitorForm';
import type { Competitor } from '../../../../types';

const mockCompetitor: Competitor = {
    id: 'test-id-123',
    name: 'Test Corp',
    website: 'https://testcorp.com',
    threatLevel: 'Medium',
    oneLiner: 'A test company',
    size: '50-100',
    estimatedRevenue: '$5M',
    notes: 'Some notes',
    features: {},
    pricingModels: [],
};

describe('CompetitorForm', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Add mode (no competitor)', () => {
        it('renders with "Add Competitor" title', () => {
            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Use getByRole to find the heading specifically
            expect(screen.getByRole('heading', { name: 'Add Competitor' })).toBeInTheDocument();
        });

        it('renders empty form fields', () => {
            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByPlaceholderText('e.g. Acme Corp');
            expect(nameInput).toHaveValue('');
        });

        it('disables submit when name is empty', () => {
            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const submitButton = screen.getByRole('button', { name: /add competitor/i });
            expect(submitButton).toBeDisabled();
        });

        it('enables submit when name is entered', async () => {
            const user = userEvent.setup();

            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByPlaceholderText('e.g. Acme Corp');
            await user.type(nameInput, 'New Company');

            const submitButton = screen.getByRole('button', { name: /add competitor/i });
            expect(submitButton).not.toBeDisabled();
        });

        it('does not show delete button', () => {
            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
        });
    });

    describe('Edit mode (with competitor)', () => {
        it('renders with "Edit Competitor" title', () => {
            render(
                <CompetitorForm
                    competitor={mockCompetitor}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByText('Edit Competitor')).toBeInTheDocument();
        });

        it('pre-fills form with competitor data', () => {
            render(
                <CompetitorForm
                    competitor={mockCompetitor}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByPlaceholderText('e.g. Acme Corp')).toHaveValue('Test Corp');
            expect(screen.getByPlaceholderText('https://example.com')).toHaveValue('https://testcorp.com');
        });

        it('shows delete button when onDelete is provided', () => {
            render(
                <CompetitorForm
                    competitor={mockCompetitor}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });

        it('calls onDelete when delete is clicked', async () => {
            const user = userEvent.setup();

            render(
                <CompetitorForm
                    competitor={mockCompetitor}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                    onDelete={mockOnDelete}
                />
            );

            await user.click(screen.getByRole('button', { name: /delete/i }));
            expect(mockOnDelete).toHaveBeenCalledWith('test-id-123');
        });
    });

    describe('Form interactions', () => {
        it('calls onCancel when cancel button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            await user.click(screen.getByRole('button', { name: /cancel/i }));
            expect(mockOnCancel).toHaveBeenCalled();
        });

        it('calls onCancel when close button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Find the X button by its position (first button in header)
            const closeButton = screen.getByRole('button', { name: '' });
            await user.click(closeButton);
            expect(mockOnCancel).toHaveBeenCalled();
        });

        it('submits form with entered data', async () => {
            const user = userEvent.setup();

            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            await user.type(screen.getByPlaceholderText('e.g. Acme Corp'), 'New Corp');
            await user.type(screen.getByPlaceholderText('https://example.com'), 'https://newcorp.com');

            await user.click(screen.getByRole('button', { name: /add competitor/i }));

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Corp',
                    website: 'https://newcorp.com',
                    threatLevel: 'Medium', // default
                })
            );
        });

        it('trims whitespace from name', async () => {
            const user = userEvent.setup();

            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            await user.type(screen.getByPlaceholderText('e.g. Acme Corp'), '  Trimmed Name  ');
            await user.click(screen.getByRole('button', { name: /add competitor/i }));

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Trimmed Name',
                })
            );
        });

        it('allows changing threat level', async () => {
            const user = userEvent.setup();

            render(
                <CompetitorForm
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            await user.type(screen.getByPlaceholderText('e.g. Acme Corp'), 'High Threat Corp');

            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'High');

            await user.click(screen.getByRole('button', { name: /add competitor/i }));

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    threatLevel: 'High',
                })
            );
        });

        it('preserves existing competitor data when editing', async () => {
            const user = userEvent.setup();
            const competitorWithData = {
                ...mockCompetitor,
                features: { 'Feature 1': 'Have' as const },
                weaknesses: [{ id: '1', text: 'Weakness', source: 'Review', severity: 'Low' as const, date: '2024-01-01' }],
            };

            render(
                <CompetitorForm
                    competitor={competitorWithData}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Just submit without changes
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    features: { 'Feature 1': 'Have' },
                    weaknesses: competitorWithData.weaknesses,
                })
            );
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '../SettingsPage';
import { CompetitorContext } from '../../context/CompetitorContext';
import type { Competitor, BusinessProfile, Snapshot } from '../../types';

// Mock useToast hook
const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    toasts: [],
    addToast: vi.fn(),
    removeToast: vi.fn(),
};

vi.mock('../../context/ToastContext', () => ({
    useToast: () => mockToast,
    ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockCompetitors: Competitor[] = [
    {
        id: 'existing-1',
        name: 'Existing Competitor',
        website: 'https://existing.com',
        threatLevel: 'Medium',
        features: {},
        pricingModels: [],
        notes: 'Existing notes',
    },
];

const mockUserProfile: BusinessProfile = {
    name: 'My Company',
    positionX: 50,
    positionY: 50,
    features: {},
    pricingModels: [],
};

const createMockContext = (overrides = {}) => ({
    competitors: mockCompetitors,
    userProfile: mockUserProfile,
    addCompetitor: vi.fn(),
    updateCompetitor: vi.fn(),
    removeCompetitor: vi.fn(),
    updateUserProfile: vi.fn(),
    resetToSeedData: vi.fn(),
    clearAllData: vi.fn(),
    importData: vi.fn(), // New method to test
    snapshots: [] as Snapshot[],
    getSnapshots: vi.fn(() => []),
    addMilestone: vi.fn(),
    deleteSnapshot: vi.fn(),
    ...overrides,
});

const renderWithProviders = (contextValue = createMockContext()) => {
    return render(
        <BrowserRouter>
            <CompetitorContext.Provider value={contextValue}>
                <SettingsPage />
            </CompetitorContext.Provider>
        </BrowserRouter>
    );
};

describe('SettingsPage Import Functionality', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders import section with file input', () => {
        renderWithProviders();
        expect(screen.getByText('Import Data')).toBeInTheDocument();
        expect(screen.getByText('Choose JSON File')).toBeInTheDocument();
    });

    it('calls importData when valid JSON file is uploaded', async () => {
        const importData = vi.fn();
        const context = createMockContext({ importData });
        renderWithProviders(context);

        const validExport = {
            version: '1.0',
            exportedAt: '2024-01-01T00:00:00.000Z',
            competitors: [
                {
                    id: 'imported-1',
                    name: 'Imported Company',
                    website: 'https://imported.com',
                    threatLevel: 'High',
                    features: {},
                    pricingModels: [],
                    notes: 'Imported notes',
                },
            ],
            userProfile: {
                name: 'Imported Profile',
                positionX: 60,
                positionY: 70,
                features: {},
                pricingModels: [],
            },
        };

        const file = new File([JSON.stringify(validExport)], 'export.json', {
            type: 'application/json',
        });

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(importData).toHaveBeenCalledWith(
                validExport.competitors,
                validExport.userProfile
            );
        });

        expect(mockToast.success).toHaveBeenCalledWith(
            expect.stringContaining('Imported')
        );
    });

    it('shows error toast for invalid JSON', async () => {
        const context = createMockContext();
        renderWithProviders(context);

        const file = new File(['not valid json'], 'bad.json', {
            type: 'application/json',
        });

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith(
                expect.stringContaining('Invalid')
            );
        });
    });

    it('shows error toast for JSON without competitors array', async () => {
        const context = createMockContext();
        renderWithProviders(context);

        const invalidExport = {
            version: '1.0',
            userProfile: mockUserProfile,
            // Missing competitors array
        };

        const file = new File([JSON.stringify(invalidExport)], 'export.json', {
            type: 'application/json',
        });

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith(
                expect.stringContaining('Invalid')
            );
        });
    });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    exportToJson,
    exportToCsv,
    parseImportedJson,
    downloadFile,
    readFileAsText,
} from '../export';
import type { Competitor, BusinessProfile } from '../../types';

const mockCompetitor: Competitor = {
    id: '1',
    name: 'Acme Corp',
    website: 'https://acme.com',
    threatLevel: 'High',
    founded: '2020',
    size: '50-200',
    location: 'San Francisco, CA',
    oneLiner: 'Cloud solutions provider',
    targetAudience: 'SMBs',
    estimatedRevenue: '$10M',
    positionX: 0.5,
    positionY: 0.7,
    features: {},
    pricingModels: [],
    socialHandles: { twitter: '@acme', linkedin: 'acme-corp' },
    notes: 'Key competitor',
    createdAt: '2025-01-01T00:00:00.000Z',
};

const mockProfile: BusinessProfile = {
    name: 'My Company',
    positionX: 50,
    positionY: 50,
    features: {},
    pricingModels: [],
};

describe('exportToJson', () => {
    it('produces valid JSON with expected fields', () => {
        const json = exportToJson([mockCompetitor], mockProfile);
        const parsed = JSON.parse(json);
        expect(parsed.version).toBe('1.0');
        expect(parsed.exportedAt).toBeTruthy();
        expect(parsed.competitors).toHaveLength(1);
        expect(parsed.competitors[0].name).toBe('Acme Corp');
        expect(parsed.userProfile.name).toBe('My Company');
    });

    it('handles empty competitors array', () => {
        const json = exportToJson([], mockProfile);
        const parsed = JSON.parse(json);
        expect(parsed.competitors).toEqual([]);
    });
});

describe('exportToCsv', () => {
    it('produces CSV with header row and data row', () => {
        const csv = exportToCsv([mockCompetitor]);
        const lines = csv.split('\n');
        expect(lines).toHaveLength(2);
        expect(lines[0]).toContain('Name');
        expect(lines[0]).toContain('Website');
        expect(lines[0]).toContain('Threat Level');
        expect(lines[1]).toContain('Acme Corp');
        expect(lines[1]).toContain('https://acme.com');
    });

    it('returns only header for empty array', () => {
        const csv = exportToCsv([]);
        const lines = csv.split('\n');
        expect(lines).toHaveLength(1);
        expect(lines[0]).toContain('Name');
    });

    it('escapes fields containing commas', () => {
        const comp = {
            ...mockCompetitor,
            oneLiner: 'Fast, cheap, good',
        };
        const csv = exportToCsv([comp]);
        expect(csv).toContain('"Fast, cheap, good"');
    });

    it('escapes fields containing double quotes', () => {
        const comp = {
            ...mockCompetitor,
            notes: 'They say "hello"',
        };
        const csv = exportToCsv([comp]);
        expect(csv).toContain('"They say ""hello"""');
    });

    it('handles missing optional fields', () => {
        const comp: Competitor = {
            id: '2',
            name: 'Minimal',
            website: 'https://min.com',
            threatLevel: 'Low',
            features: {},
            pricingModels: [],
            notes: '',
            createdAt: '2025-01-01T00:00:00.000Z',
        };
        const csv = exportToCsv([comp]);
        const lines = csv.split('\n');
        expect(lines).toHaveLength(2);
        expect(lines[1]).toContain('Minimal');
    });
});

describe('parseImportedJson', () => {
    it('parses valid export data', () => {
        const json = JSON.stringify({
            version: '1.0',
            exportedAt: '2025-01-01T00:00:00.000Z',
            competitors: [{ id: '1', name: 'Test' }],
            userProfile: { companyName: 'Mine' },
        });
        const result = parseImportedJson(json);
        expect(result).not.toBeNull();
        expect(result!.competitors).toHaveLength(1);
    });

    it('returns null for invalid JSON', () => {
        expect(parseImportedJson('not-json')).toBeNull();
    });

    it('returns null when competitors is missing', () => {
        const json = JSON.stringify({ userProfile: {} });
        expect(parseImportedJson(json)).toBeNull();
    });

    it('returns null when competitors is not an array', () => {
        const json = JSON.stringify({ competitors: 'oops', userProfile: {} });
        expect(parseImportedJson(json)).toBeNull();
    });

    it('returns null when userProfile is missing', () => {
        const json = JSON.stringify({ competitors: [{ id: '1', name: 'X' }] });
        expect(parseImportedJson(json)).toBeNull();
    });

    it('returns null when a competitor is missing id', () => {
        const json = JSON.stringify({
            competitors: [{ name: 'NoId' }],
            userProfile: { companyName: 'X' },
        });
        expect(parseImportedJson(json)).toBeNull();
    });

    it('returns null when a competitor is missing name', () => {
        const json = JSON.stringify({
            competitors: [{ id: '1' }],
            userProfile: { companyName: 'X' },
        });
        expect(parseImportedJson(json)).toBeNull();
    });
});

describe('downloadFile', () => {
    let appendSpy: ReturnType<typeof vi.spyOn>;
    let removeSpy: ReturnType<typeof vi.spyOn>;
    let clickSpy: ReturnType<typeof vi.fn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        clickSpy = vi.fn();
        appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
        removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
        revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
        vi.spyOn(document, 'createElement').mockReturnValue({
            set href(_: string) {},
            set download(_: string) {},
            click: clickSpy,
        } as unknown as HTMLAnchorElement);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('creates a blob, clicks link, and cleans up', () => {
        downloadFile('content', 'test.json', 'application/json');
        expect(appendSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:fake-url');
    });
});

describe('readFileAsText', () => {
    it('resolves with file content', async () => {
        const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
        const result = await readFileAsText(file);
        expect(result).toBe('hello world');
    });
});

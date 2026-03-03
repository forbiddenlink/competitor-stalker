import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    formatDate,
    formatRelativeTime,
    formatNumber,
    truncate,
    extractDomain,
    getInitials,
    getThreatColor,
    pluralize,
} from '../format';

describe('formatDate', () => {
    it('formats an ISO date string', () => {
        const result = formatDate('2024-06-15T12:00:00.000Z');
        expect(result).toContain('Jun');
        expect(result).toContain('15');
        expect(result).toContain('2024');
    });

    it('returns empty string for empty input', () => {
        expect(formatDate('')).toBe('');
    });
});

describe('formatRelativeTime', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns empty string for empty input', () => {
        expect(formatRelativeTime('')).toBe('');
    });

    it('returns "Today" for current date', () => {
        const now = new Date().toISOString();
        expect(formatRelativeTime(now)).toBe('Today');
    });

    it('returns "Yesterday" for one day ago', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
        expect(formatRelativeTime('2025-06-14T12:00:00Z')).toBe('Yesterday');
    });

    it('returns days ago for recent dates', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
        expect(formatRelativeTime('2025-06-12T12:00:00Z')).toBe('3 days ago');
    });

    it('returns weeks ago', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
        expect(formatRelativeTime('2025-06-01T12:00:00Z')).toBe('2 weeks ago');
    });

    it('returns months ago', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
        expect(formatRelativeTime('2025-03-01T12:00:00Z')).toBe('3 months ago');
    });

    it('returns years ago', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
        expect(formatRelativeTime('2023-01-01T12:00:00Z')).toBe('2 years ago');
    });
});

describe('formatNumber', () => {
    it('formats small numbers', () => {
        expect(formatNumber(42)).toBe('42');
    });

    it('formats large numbers with commas', () => {
        expect(formatNumber(1234567)).toBe('1,234,567');
    });
});

describe('truncate', () => {
    it('returns text unchanged if shorter than max', () => {
        expect(truncate('short', 10)).toBe('short');
    });

    it('truncates with ellipsis', () => {
        expect(truncate('This is a long string', 10)).toBe('This is...');
    });

    it('handles empty/null text', () => {
        expect(truncate('', 10)).toBe('');
    });

    it('handles exact length', () => {
        expect(truncate('12345', 5)).toBe('12345');
    });
});

describe('extractDomain', () => {
    it('extracts domain from URL', () => {
        expect(extractDomain('https://www.example.com/path')).toBe('example.com');
    });

    it('removes www prefix', () => {
        expect(extractDomain('https://www.test.io')).toBe('test.io');
    });

    it('handles URL without www', () => {
        expect(extractDomain('https://api.example.com')).toBe('api.example.com');
    });

    it('returns empty for empty input', () => {
        expect(extractDomain('')).toBe('');
    });

    it('returns original string for invalid URL', () => {
        expect(extractDomain('not-a-url')).toBe('not-a-url');
    });
});

describe('getInitials', () => {
    it('returns two-letter initials for multi-word name', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns first two characters for single word', () => {
        expect(getInitials('Vercel')).toBe('VE');
    });

    it('returns empty for empty input', () => {
        expect(getInitials('')).toBe('');
    });

    it('handles three-word names (uses first two)', () => {
        expect(getInitials('San Francisco Bay')).toBe('SF');
    });

    it('uppercases initials', () => {
        expect(getInitials('lower case')).toBe('LC');
    });
});

describe('getThreatColor', () => {
    it('returns danger for High', () => {
        expect(getThreatColor('High')).toBe('danger');
    });

    it('returns warning for Medium', () => {
        expect(getThreatColor('Medium')).toBe('warning');
    });

    it('returns success for Low', () => {
        expect(getThreatColor('Low')).toBe('success');
    });
});

describe('pluralize', () => {
    it('returns singular for count of 1', () => {
        expect(pluralize(1, 'item')).toBe('item');
    });

    it('returns default plural for count > 1', () => {
        expect(pluralize(2, 'item')).toBe('items');
    });

    it('returns custom plural', () => {
        expect(pluralize(5, 'person', 'people')).toBe('people');
    });

    it('returns plural for count of 0', () => {
        expect(pluralize(0, 'item')).toBe('items');
    });
});

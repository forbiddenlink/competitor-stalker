import { describe, it, expect } from 'vitest';
import {
    isValidUrl,
    isValidSocialHandle,
    isNotEmpty,
    isUniqueName,
    validateCompetitor,
    hasErrors,
} from '../validation';

describe('isValidUrl', () => {
    it('returns true for valid https URL', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('returns true for valid http URL', () => {
        expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('returns false for empty string', () => {
        expect(isValidUrl('')).toBe(false);
    });

    it('returns false for non-URL string', () => {
        expect(isValidUrl('not a url')).toBe(false);
    });

    it('returns false for ftp protocol', () => {
        expect(isValidUrl('ftp://example.com')).toBe(false);
    });

    it('returns true for URL with path', () => {
        expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('returns true for URL with query params', () => {
        expect(isValidUrl('https://example.com?q=test')).toBe(true);
    });
});

describe('isValidSocialHandle', () => {
    it('returns true for empty string (optional field)', () => {
        expect(isValidSocialHandle('')).toBe(true);
    });

    it('returns true for alphanumeric handle', () => {
        expect(isValidSocialHandle('myhandle123')).toBe(true);
    });

    it('returns true for handle with underscores', () => {
        expect(isValidSocialHandle('my_handle')).toBe(true);
    });

    it('returns true for handle with hyphens', () => {
        expect(isValidSocialHandle('my-handle')).toBe(true);
    });

    it('returns false for handle with spaces', () => {
        expect(isValidSocialHandle('my handle')).toBe(false);
    });

    it('returns false for handle with special characters', () => {
        expect(isValidSocialHandle('@myhandle')).toBe(false);
    });
});

describe('isNotEmpty', () => {
    it('returns true for non-empty string', () => {
        expect(isNotEmpty('hello')).toBe(true);
    });

    it('returns false for empty string', () => {
        expect(isNotEmpty('')).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
        expect(isNotEmpty('   ')).toBe(false);
    });
});

describe('isUniqueName', () => {
    const existing = ['Alpha', 'Beta', 'Gamma'];

    it('returns true when name is unique', () => {
        expect(isUniqueName('Delta', existing)).toBe(true);
    });

    it('returns false when name already exists', () => {
        expect(isUniqueName('Alpha', existing)).toBe(false);
    });

    it('is case-insensitive', () => {
        expect(isUniqueName('alpha', existing)).toBe(false);
    });

    it('trims whitespace', () => {
        expect(isUniqueName('  Alpha  ', existing)).toBe(false);
    });

    it('allows the excluded name (for editing)', () => {
        expect(isUniqueName('Alpha', existing, 'Alpha')).toBe(true);
    });

    it('excludes name case-insensitively', () => {
        expect(isUniqueName('alpha', existing, 'Alpha')).toBe(true);
    });
});

describe('validateCompetitor', () => {
    it('returns empty errors for valid data', () => {
        const errors = validateCompetitor({
            name: 'Test Corp',
            website: 'https://test.com',
        });
        expect(hasErrors(errors)).toBe(false);
    });

    it('returns name error when name is empty', () => {
        const errors = validateCompetitor({ name: '', website: '' });
        expect(errors.name).toBe('Name is required');
    });

    it('returns name error for duplicate name', () => {
        const errors = validateCompetitor(
            { name: 'Existing', website: '' },
            ['Existing'],
        );
        expect(errors.name).toBe('A competitor with this name already exists');
    });

    it('returns website error for invalid URL', () => {
        const errors = validateCompetitor({
            name: 'Test',
            website: 'not-a-url',
        });
        expect(errors.website).toBeDefined();
    });

    it('allows empty website', () => {
        const errors = validateCompetitor({ name: 'Test', website: '' });
        expect(errors.website).toBeUndefined();
    });

    it('returns social handle errors for invalid handles', () => {
        const errors = validateCompetitor({
            name: 'Test',
            website: '',
            socialHandles: {
                twitter: '@bad',
                linkedin: 'good_handle',
                instagram: 'has spaces',
            },
        });
        expect(errors.twitter).toBeDefined();
        expect(errors.linkedin).toBeUndefined();
        expect(errors.instagram).toBeDefined();
    });
});

describe('hasErrors', () => {
    it('returns false for empty errors object', () => {
        expect(hasErrors({})).toBe(false);
    });

    it('returns true when errors are present', () => {
        expect(hasErrors({ name: 'Required' })).toBe(true);
    });
});

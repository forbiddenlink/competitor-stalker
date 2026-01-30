/**
 * Validation utilities for competitor data
 */

/**
 * Validates a URL string
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Validates a social media handle (alphanumeric + underscores)
 */
export function isValidSocialHandle(handle: string): boolean {
    if (!handle) return true; // Optional field
    return /^[a-zA-Z0-9_-]+$/.test(handle);
}

/**
 * Validates that a required string is not empty
 */
export function isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
}

/**
 * Validates a competitor name for uniqueness
 */
export function isUniqueName(
    name: string,
    existingNames: string[],
    currentId?: string
): boolean {
    const normalizedName = name.toLowerCase().trim();
    return !existingNames.some(
        (existing) =>
            existing.toLowerCase().trim() === normalizedName &&
            existing !== currentId
    );
}

/**
 * Validates competitor data and returns errors
 */
export interface ValidationErrors {
    name?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
}

export function validateCompetitor(
    data: {
        name: string;
        website: string;
        socialHandles?: {
            twitter?: string;
            linkedin?: string;
            instagram?: string;
        };
    },
    existingNames: string[] = [],
    currentId?: string
): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!isNotEmpty(data.name)) {
        errors.name = 'Name is required';
    } else if (!isUniqueName(data.name, existingNames, currentId)) {
        errors.name = 'A competitor with this name already exists';
    }

    if (data.website && !isValidUrl(data.website)) {
        errors.website = 'Please enter a valid URL (e.g., https://example.com)';
    }

    if (data.socialHandles?.twitter && !isValidSocialHandle(data.socialHandles.twitter)) {
        errors.twitter = 'Invalid Twitter handle';
    }

    if (data.socialHandles?.linkedin && !isValidSocialHandle(data.socialHandles.linkedin)) {
        errors.linkedin = 'Invalid LinkedIn handle';
    }

    if (data.socialHandles?.instagram && !isValidSocialHandle(data.socialHandles.instagram)) {
        errors.instagram = 'Invalid Instagram handle';
    }

    return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}

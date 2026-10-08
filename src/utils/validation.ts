import type { BusinessProfile, Competitor, FeatureStatus, Snapshot } from '../types';

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
    excludeName?: string
): boolean {
    const normalizedName = name.toLowerCase().trim();
    const normalizedExclude = excludeName?.toLowerCase().trim();
    return !existingNames.some(
        (existing) =>
            existing.toLowerCase().trim() === normalizedName &&
            existing.toLowerCase().trim() !== normalizedExclude
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


type JsonRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is JsonRecord => value !== null && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
const uniqueIds = (value: unknown): value is JsonRecord[] => {
    if (!Array.isArray(value)) return false;
    const ids = new Set<string>();
    return value.every(item => {
        if (!isRecord(item) || typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id)) return false;
        ids.add(item.id);
        return true;
    });
};
const optionalStrings = (value: JsonRecord, fields: string[]): boolean => fields.every(field => value[field] === undefined || typeof value[field] === 'string');
const coordinate = (value: unknown): boolean => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
const plans = (value: unknown): boolean => Array.isArray(value) && value.every(plan => isRecord(plan) && ['name', 'price', 'description'].every(key => typeof plan[key] === 'string'));
const features = (value: unknown): Record<string, FeatureStatus> | null => {
    if (strings(value)) return Object.fromEntries(value.map(name => [name, 'Have' as FeatureStatus]));
    if (!isRecord(value) || !Object.values(value).every(status => ['Have', 'DontHave', 'Better', 'Worse'].includes(String(status)) && typeof status === 'string')) return null;
    return value as Record<string, FeatureStatus>;
};

/** Validate untrusted imported or stored records before any page consumes them. */
export function normalizeCompetitors(value: unknown): Competitor[] | null {
    if (!Array.isArray(value)) return null;
    const ids = new Set<string>();
    const result: Competitor[] = [];
    for (const item of value) {
        if (!isRecord(item) || typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id) || typeof item.name !== 'string' || !item.name.trim()) return null;
        ids.add(item.id);
        if (!optionalStrings(item, ['website', 'notes', 'logo', 'founded', 'size', 'location', 'oneLiner', 'targetAudience', 'estimatedRevenue', 'lastReviewed', 'createdAt', 'updatedAt'])) return null;
        if (item.website && !isValidUrl(item.website as string)) return null;
        if (item.logo && !isValidUrl(item.logo as string)) return null;
        if (item.threatLevel !== undefined && (typeof item.threatLevel !== 'string' || !['Low', 'Medium', 'High'].includes(item.threatLevel))) return null;
        if (['positionX', 'positionY'].some(key => item[key] !== undefined && !coordinate(item[key]))) return null;
        if (['keyPeople', 'strengths', 'opportunities', 'threats'].some(key => item[key] !== undefined && !strings(item[key]))) return null;
        const featureMap = features(item.features === undefined ? {} : item.features);
        if (!featureMap || (item.pricingModels !== undefined && !plans(item.pricingModels))) return null;
        if (item.socialHandles !== undefined && (!isRecord(item.socialHandles) || !Object.values(item.socialHandles).every(handle => typeof handle === 'string'))) return null;
        if (item.weaknesses !== undefined && (!uniqueIds(item.weaknesses) || !item.weaknesses.every(w => isRecord(w) && ['id', 'text', 'source', 'date'].every(key => typeof w[key] === 'string') && typeof w.severity === 'string' && ['Low', 'Medium', 'Critical'].includes(w.severity)))) return null;
        if (item.strategies !== undefined && (!uniqueIds(item.strategies) || !item.strategies.every(s => isRecord(s) && ['id', 'title', 'description', 'targetCompetitorId'].every(key => typeof s[key] === 'string') && s.targetCompetitorId === item.id && optionalStrings(s, ['deadline']) && typeof s.status === 'string' && ['Planned', 'Active', 'Completed'].includes(s.status)))) return null;
        if (item.sources !== undefined && (!uniqueIds(item.sources) || !item.sources.every(s => isRecord(s) && ['id', 'url', 'label', 'addedAt'].every(key => typeof s[key] === 'string') && isValidUrl(s.url as string)))) return null;
        result.push({ ...item, website: item.website ?? '', notes: item.notes ?? '', threatLevel: item.threatLevel ?? 'Medium', features: featureMap, pricingModels: item.pricingModels ?? [] } as Competitor);
    }
    return result;
}

export function normalizeProfile(value: unknown): BusinessProfile | null {
    if (!isRecord(value) || !optionalStrings(value, ['name', 'companyName'])) return null;
    if (['positionX', 'positionY'].some(key => value[key] !== undefined && !coordinate(value[key]))) return null;
    const featureMap = features(value.features === undefined ? {} : value.features);
    if (!featureMap || (value.pricingModels !== undefined && !plans(value.pricingModels))) return null;
    return { ...value, name: value.name ?? value.companyName ?? '', positionX: value.positionX ?? 50, positionY: value.positionY ?? 50, features: featureMap, pricingModels: value.pricingModels ?? [] } as BusinessProfile;
}

export function normalizeSnapshots(value: unknown): Snapshot[] | null {
    if (!Array.isArray(value)) return null;
    const ids = new Set<string>();
    const result: Snapshot[] = [];
    for (const snapshot of value) {
        if (!isRecord(snapshot) || typeof snapshot.id !== 'string' || !snapshot.id || ids.has(snapshot.id) || typeof snapshot.competitorId !== 'string' || typeof snapshot.timestamp !== 'string' || !Number.isFinite(Date.parse(snapshot.timestamp)) || typeof snapshot.type !== 'string' || !['auto', 'milestone'].includes(snapshot.type) || !optionalStrings(snapshot, ['label'])) return null;
        const data = normalizeCompetitors([snapshot.data]);
        if (!data || data[0].id !== snapshot.competitorId) return null;
        ids.add(snapshot.id);
        result.push({ ...snapshot, data: data[0] } as Snapshot);
    }
    return result;
}

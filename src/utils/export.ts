/**
 * Import/Export utilities for competitor data
 */

import type { Competitor, BusinessProfile } from '../types';

export interface ExportData {
    version: string;
    exportedAt: string;
    competitors: Competitor[];
    userProfile: BusinessProfile;
}

/**
 * Export all data as JSON
 */
export function exportToJson(
    competitors: Competitor[],
    userProfile: BusinessProfile
): string {
    const data: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        competitors,
        userProfile,
    };
    return JSON.stringify(data, null, 2);
}

/**
 * Export competitors as CSV
 */
export function exportToCsv(competitors: Competitor[]): string {
    const headers = [
        'Name',
        'Website',
        'Threat Level',
        'Founded',
        'Size',
        'Location',
        'One Liner',
        'Target Audience',
        'Estimated Revenue',
        'Position X',
        'Position Y',
        'Twitter',
        'LinkedIn',
        'Notes',
    ];

    const rows = competitors.map(c => [
        c.name,
        c.website,
        c.threatLevel,
        c.founded || '',
        c.size || '',
        c.location || '',
        c.oneLiner || '',
        c.targetAudience || '',
        c.estimatedRevenue || '',
        c.positionX?.toString() || '',
        c.positionY?.toString() || '',
        c.socialHandles?.twitter || '',
        c.socialHandles?.linkedin || '',
        c.notes || '',
    ]);

    const escapeCsv = (field: string) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    };

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCsv).join(',')),
    ].join('\n');

    return csvContent;
}

/**
 * Download content as a file
 */
export function downloadFile(
    content: string,
    filename: string,
    mimeType: string
): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Parse imported JSON data
 */
export function parseImportedJson(content: string): ExportData | null {
    try {
        const data = JSON.parse(content);

        // Validate structure
        if (!data.competitors || !Array.isArray(data.competitors)) {
            console.error('Invalid import: missing competitors array');
            return null;
        }

        if (!data.userProfile || typeof data.userProfile !== 'object') {
            console.error('Invalid import: missing userProfile');
            return null;
        }

        // Validate each competitor has required fields
        for (const comp of data.competitors) {
            if (!comp.id || !comp.name) {
                console.error('Invalid import: competitor missing id or name');
                return null;
            }
        }

        return data as ExportData;
    } catch (error) {
        console.error('Failed to parse import data:', error);
        return null;
    }
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

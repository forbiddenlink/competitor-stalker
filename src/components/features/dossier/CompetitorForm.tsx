import React, { useState } from 'react';
import { X, Scan, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { useScraper, type CompetitorPageData } from '../../../hooks/useScraper';
import type { Competitor, ThreatLevel } from '../../../types';

interface CompetitorFormProps {
    competitor?: Competitor;
    onSave: (competitor: Competitor) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}

/**
 * Displays extracted intel from a scraped competitor page
 */
const ScrapedIntelSection: React.FC<{ data: CompetitorPageData }> = ({ data }) => {
    const [expanded, setExpanded] = useState(false);

    const hasPricing = data.pricing && data.pricing.length > 0;
    const hasFeatures = data.features && data.features.length > 0;
    const hasTechStack = data.techStack && data.techStack.length > 0;
    const hasSocial = Object.values(data.socialLinks).some(Boolean);
    const hasContent = hasPricing || hasFeatures || hasTechStack || hasSocial;

    if (!hasContent) return null;

    return (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
                <span>Extracted Intel</span>
                <span className="text-[var(--text-muted)] text-xs">
                    {expanded ? 'Hide' : 'Show'}
                </span>
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-[var(--border-subtle)]">
                    {/* Pricing */}
                    {hasPricing && (
                        <div className="pt-3">
                            <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                                Pricing Found
                            </h4>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
                                {data.pricing}
                            </p>
                        </div>
                    )}

                    {/* Features */}
                    {hasFeatures && (
                        <div>
                            <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                                Features ({data.features.length})
                            </h4>
                            <ul className="text-sm text-[var(--text-secondary)] space-y-1 max-h-32 overflow-y-auto">
                                {data.features.slice(0, 10).map((feature, i) => (
                                    <li key={i} className="truncate">• {feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Tech Stack */}
                    {hasTechStack && (
                        <div>
                            <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                                Tech Stack
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {data.techStack.map((tech, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {hasSocial && (
                        <div>
                            <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                                Social Links
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {data.socialLinks.twitter && (
                                    <a
                                        href={data.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent-brand)] hover:underline"
                                    >
                                        Twitter/X
                                    </a>
                                )}
                                {data.socialLinks.linkedin && (
                                    <a
                                        href={data.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent-brand)] hover:underline"
                                    >
                                        LinkedIn
                                    </a>
                                )}
                                {data.socialLinks.github && (
                                    <a
                                        href={data.socialLinks.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent-brand)] hover:underline"
                                    >
                                        GitHub
                                    </a>
                                )}
                                {data.socialLinks.youtube && (
                                    <a
                                        href={data.socialLinks.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent-brand)] hover:underline"
                                    >
                                        YouTube
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const CompetitorForm: React.FC<CompetitorFormProps> = ({
    competitor,
    onSave,
    onCancel,
    onDelete
}) => {
    const isNew = !competitor;
    const [form, setForm] = useState<Partial<Competitor>>({
        name: competitor?.name || '',
        website: competitor?.website || '',
        threatLevel: competitor?.threatLevel || 'Medium',
        oneLiner: competitor?.oneLiner || '',
        size: competitor?.size || '',
        estimatedRevenue: competitor?.estimatedRevenue || '',
        notes: competitor?.notes || '',
    });
    const [scrapedData, setScrapedData] = useState<CompetitorPageData | null>(null);
    const { scrape, loading: scraping, error: scrapeError } = useScraper();

    const handleScrape = async () => {
        if (!form.website) return;
        const data = await scrape(form.website);
        if (data) {
            setScrapedData(data);
            // Auto-fill empty fields with scraped data
            setForm(prev => ({
                ...prev,
                name: prev.name || data.openGraph?.siteName || data.title?.split(' - ')[0]?.split(' | ')[0] || '',
                oneLiner: prev.oneLiner || data.description || '',
                socialHandles: {
                    ...prev.socialHandles,
                    twitter: prev.socialHandles?.twitter || data.socialLinks.twitter?.match(/twitter\.com\/([^/?]+)/)?.[1] || data.socialLinks.twitter?.match(/x\.com\/([^/?]+)/)?.[1] || '',
                    linkedin: prev.socialHandles?.linkedin || data.socialLinks.linkedin || '',
                },
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name?.trim()) return;

        const saved: Competitor = {
            id: competitor?.id || crypto.randomUUID(),
            name: form.name.trim(),
            website: form.website || '',
            threatLevel: form.threatLevel as ThreatLevel,
            oneLiner: form.oneLiner || '',
            size: form.size || '',
            estimatedRevenue: form.estimatedRevenue || '',
            notes: form.notes || '',
            features: competitor?.features || {},
            pricingModels: competitor?.pricingModels || [],
            weaknesses: competitor?.weaknesses || [],
            strategies: competitor?.strategies || [],
            socialHandles: competitor?.socialHandles || {},
            positionX: competitor?.positionX,
            positionY: competitor?.positionY,
        };
        onSave(saved);
    };

    const updateField = (field: keyof Competitor, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-xl overflow-hidden animate-fade-in"
                style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        {isNew ? 'Add Competitor' : 'Edit Competitor'}
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Company Name *
                        </label>
                        <Input
                            value={form.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="e.g. Acme Corp"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Website
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={form.website || ''}
                                onChange={(e) => updateField('website', e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleScrape}
                                disabled={!form.website || scraping}
                                leftIcon={scraping ? <Loader2 size={14} className="animate-spin" /> : <Scan size={14} />}
                            >
                                {scraping ? 'Scanning...' : 'Scan'}
                            </Button>
                        </div>
                        {scrapeError && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--accent-danger)]">
                                <AlertCircle size={12} />
                                {scrapeError}
                            </div>
                        )}
                        {scrapedData && !scrapeError && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--accent-success)]">
                                <CheckCircle size={12} />
                                Data extracted successfully
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Threat Level
                        </label>
                        <select
                            value={form.threatLevel}
                            onChange={(e) => updateField('threatLevel', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                                Company Size
                            </label>
                            <Input
                                value={form.size || ''}
                                onChange={(e) => updateField('size', e.target.value)}
                                placeholder="e.g. 50-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                                Est. Revenue
                            </label>
                            <Input
                                value={form.estimatedRevenue || ''}
                                onChange={(e) => updateField('estimatedRevenue', e.target.value)}
                                placeholder="e.g. $5M - $10M"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            One-liner Description
                        </label>
                        <Input
                            value={form.oneLiner || ''}
                            onChange={(e) => updateField('oneLiner', e.target.value)}
                            placeholder="What do they do?"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Notes
                        </label>
                        <textarea
                            value={form.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value)}
                            placeholder="Additional notes..."
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)] resize-none"
                        />
                    </div>

                    {/* Scraped Intel */}
                    {scrapedData && (
                        <ScrapedIntelSection data={scrapedData} />
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                        <div>
                            {!isNew && onDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onDelete(competitor.id)}
                                    className="text-[var(--accent-danger)] hover:bg-[var(--accent-danger-muted)]"
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!form.name?.trim()}>
                                {isNew ? 'Add Competitor' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

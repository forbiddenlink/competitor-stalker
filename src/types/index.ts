export type ThreatLevel = 'Low' | 'Medium' | 'High';

export interface Competitor {
    id: string;
    name: string;
    logo?: string;
    website: string;
    founded?: string;
    size?: string;
    location?: string;
    oneLiner?: string;
    targetAudience?: string;
    estimatedRevenue?: string;
    keyPeople?: string[];
    threatLevel: ThreatLevel;

    // Positioning (0-100)
    positionX?: number; // Marketing/Brand Strength (or Price)
    positionY?: number; // Product Quality/Features

    // Feature Analysis
    features: Record<string, FeatureStatus>;

    // Pricing
    pricingModels: PricingPlan[];

    // Social
    socialHandles?: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };

    // Weaknesses
    weaknesses?: Weakness[];

    // Counter-Strategies
    strategies?: Strategy[];

    // Notes
    notes: string;

    // SWOT Analysis
    strengths?: string[];
    opportunities?: string[];
    threats?: string[];

    // Evidence & Sources
    sources?: Source[];

    // Tracking
    lastReviewed?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Source {
    id: string;
    url: string;
    label: string;
    addedAt: string;
}

export type FeatureStatus = 'Have' | 'DontHave' | 'Better' | 'Worse';

export interface PricingPlan {
    name: string;
    price: string;
    description: string;
}

export interface Weakness {
    id: string;
    text: string;
    source: string; // e.g., "G2 Review", "Twitter"
    severity: 'Low' | 'Medium' | 'Critical';
    date: string;
}

export interface Alert {
    id: string;
    title: string;
    description: string;
    competitorId: string;
    type: 'Pricing' | 'Feature' | 'Marketing' | 'Personnel';
    date: string;
    isRead: boolean;
}

export interface Strategy {
    id: string;
    title: string;
    description: string;
    status: 'Planned' | 'Active' | 'Completed';
    targetCompetitorId: string;
    deadline?: string;
    competitorName?: string;
    competitorColor?: ThreatLevel;
}

export interface BusinessProfile {
    name: string;
    positionX: number; // Price
    positionY: number; // Quality
    features: Record<string, FeatureStatus>; // Feature map
    pricingModels: PricingPlan[];
}

export interface AppState {
    competitors: Competitor[];
    userProfile: BusinessProfile;
}

// Historical Tracking
export interface Snapshot {
    id: string;
    competitorId: string;
    timestamp: string;        // ISO date
    type: 'auto' | 'milestone';
    label?: string;           // For milestones: "Q1 pricing change"
    data: Competitor;         // Full competitor state at that moment
}

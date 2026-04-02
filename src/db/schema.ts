import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Competitors table - core competitor tracking
 */
export const competitors = sqliteTable('competitors', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    logo: text('logo'),
    website: text('website').notNull(),
    founded: text('founded'),
    size: text('size'),
    location: text('location'),
    oneLiner: text('one_liner'),
    targetAudience: text('target_audience'),
    estimatedRevenue: text('estimated_revenue'),
    keyPeople: text('key_people', { mode: 'json' }).$type<string[]>(),
    threatLevel: text('threat_level').$type<'Low' | 'Medium' | 'High'>().notNull().default('Low'),

    // Positioning (0-100)
    positionX: real('position_x'),
    positionY: real('position_y'),

    // Feature map stored as JSON
    features: text('features', { mode: 'json' }).$type<Record<string, 'Have' | 'DontHave' | 'Better' | 'Worse'>>().default({}),

    // Pricing plans stored as JSON
    pricingModels: text('pricing_models', { mode: 'json' }).$type<Array<{
        name: string
        price: string
        description: string
    }>>().default([]),

    // Social handles
    socialHandles: text('social_handles', { mode: 'json' }).$type<{
        twitter?: string
        linkedin?: string
        instagram?: string
    }>(),

    // Weaknesses stored as JSON array
    weaknesses: text('weaknesses', { mode: 'json' }).$type<Array<{
        id: string
        text: string
        source: string
        severity: 'Low' | 'Medium' | 'Critical'
        date: string
    }>>().default([]),

    // Counter-strategies
    strategies: text('strategies', { mode: 'json' }).$type<Array<{
        id: string
        title: string
        description: string
        status: 'Planned' | 'Active' | 'Completed'
        targetCompetitorId: string
        deadline?: string
    }>>().default([]),

    // SWOT
    strengths: text('strengths', { mode: 'json' }).$type<string[]>().default([]),
    opportunities: text('opportunities', { mode: 'json' }).$type<string[]>().default([]),
    threats: text('threats', { mode: 'json' }).$type<string[]>().default([]),

    // Sources
    sources: text('sources', { mode: 'json' }).$type<Array<{
        id: string
        url: string
        label: string
        addedAt: string
    }>>().default([]),

    // Notes
    notes: text('notes').default(''),

    // Timestamps
    lastReviewed: text('last_reviewed'),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

/**
 * Scrape results - raw data from competitor page scrapes
 */
export const scrapeResults = sqliteTable('scrape_results', {
    id: text('id').primaryKey(),
    competitorId: text('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),

    // Scraped data
    title: text('title'),
    description: text('description'),
    pricing: text('pricing'),
    features: text('features', { mode: 'json' }).$type<string[]>(),
    h1: text('h1'),
    h2s: text('h2s', { mode: 'json' }).$type<string[]>(),
    socialLinks: text('social_links', { mode: 'json' }).$type<{
        twitter?: string
        linkedin?: string
        facebook?: string
        github?: string
        youtube?: string
    }>(),
    techStack: text('tech_stack', { mode: 'json' }).$type<string[]>(),
    ctaButtons: text('cta_buttons', { mode: 'json' }).$type<string[]>(),
    openGraph: text('open_graph', { mode: 'json' }).$type<Record<string, string | undefined>>(),

    // Metadata
    scrapedAt: text('scraped_at').notNull().default(sql`(datetime('now'))`),
    httpStatus: integer('http_status'),
    errorMessage: text('error_message'),
})

/**
 * Snapshots - historical competitor state for trend tracking
 */
export const snapshots = sqliteTable('snapshots', {
    id: text('id').primaryKey(),
    competitorId: text('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
    type: text('type').$type<'auto' | 'milestone'>().notNull().default('auto'),
    label: text('label'),

    // Full competitor state at snapshot time (stored as JSON)
    data: text('data', { mode: 'json' }).notNull(),

    // Timestamp
    timestamp: text('timestamp').notNull().default(sql`(datetime('now'))`),
})

/**
 * Alerts - notifications about competitor changes
 */
export const alerts = sqliteTable('alerts', {
    id: text('id').primaryKey(),
    competitorId: text('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    type: text('type').$type<'Pricing' | 'Feature' | 'Marketing' | 'Personnel'>().notNull(),
    isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),

    // Timestamp
    date: text('date').notNull().default(sql`(datetime('now'))`),
})

/**
 * User profile/settings
 */
export const userProfile = sqliteTable('user_profile', {
    id: text('id').primaryKey().default('default'),
    name: text('name').notNull().default('My Company'),
    positionX: real('position_x').default(50),
    positionY: real('position_y').default(50),
    features: text('features', { mode: 'json' }).$type<Record<string, 'Have' | 'DontHave' | 'Better' | 'Worse'>>().default({}),
    pricingModels: text('pricing_models', { mode: 'json' }).$type<Array<{
        name: string
        price: string
        description: string
    }>>().default([]),

    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

/**
 * Scrape schedule - for cron job tracking
 */
export const scrapeSchedule = sqliteTable('scrape_schedule', {
    id: text('id').primaryKey(),
    competitorId: text('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    frequency: text('frequency').$type<'daily' | 'weekly' | 'monthly'>().notNull().default('weekly'),
    lastRun: text('last_run'),
    nextRun: text('next_run'),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),

    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Type exports for use in application code
export type Competitor = typeof competitors.$inferSelect
export type NewCompetitor = typeof competitors.$inferInsert
export type ScrapeResult = typeof scrapeResults.$inferSelect
export type NewScrapeResult = typeof scrapeResults.$inferInsert
export type Snapshot = typeof snapshots.$inferSelect
export type NewSnapshot = typeof snapshots.$inferInsert
export type Alert = typeof alerts.$inferSelect
export type NewAlert = typeof alerts.$inferInsert
export type UserProfile = typeof userProfile.$inferSelect
export type ScrapeSchedule = typeof scrapeSchedule.$inferSelect

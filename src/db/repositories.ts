import { eq, desc, and, sql } from 'drizzle-orm'
import type { Database } from './client'
import {
    competitors,
    scrapeResults,
    snapshots,
    alerts,
    userProfile,
    scrapeSchedule,
    type NewCompetitor,
    type NewScrapeResult,
    type NewSnapshot,
    type NewAlert,
} from './schema'

/**
 * Competitor repository - CRUD operations for competitors
 */
export const competitorRepo = {
    async findAll(db: Database) {
        return db.select().from(competitors).orderBy(desc(competitors.updatedAt))
    },

    async findById(db: Database, id: string) {
        const [result] = await db.select().from(competitors).where(eq(competitors.id, id)).limit(1)
        return result
    },

    async create(db: Database, data: NewCompetitor) {
        const [result] = await db.insert(competitors).values(data).returning()
        return result
    },

    async update(db: Database, id: string, data: Partial<NewCompetitor>) {
        const [result] = await db
            .update(competitors)
            .set({ ...data, updatedAt: sql`datetime('now')` })
            .where(eq(competitors.id, id))
            .returning()
        return result
    },

    async delete(db: Database, id: string) {
        await db.delete(competitors).where(eq(competitors.id, id))
    },

    async findByThreatLevel(db: Database, level: 'Low' | 'Medium' | 'High') {
        return db.select().from(competitors).where(eq(competitors.threatLevel, level))
    },
}

/**
 * Scrape results repository
 */
export const scrapeRepo = {
    async findByCompetitor(db: Database, competitorId: string, limit = 10) {
        return db
            .select()
            .from(scrapeResults)
            .where(eq(scrapeResults.competitorId, competitorId))
            .orderBy(desc(scrapeResults.scrapedAt))
            .limit(limit)
    },

    async findLatest(db: Database, competitorId: string) {
        const [result] = await db
            .select()
            .from(scrapeResults)
            .where(eq(scrapeResults.competitorId, competitorId))
            .orderBy(desc(scrapeResults.scrapedAt))
            .limit(1)
        return result
    },

    async create(db: Database, data: NewScrapeResult) {
        const [result] = await db.insert(scrapeResults).values(data).returning()
        return result
    },

    async getHistory(db: Database, competitorId: string, days = 30) {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)

        return db
            .select()
            .from(scrapeResults)
            .where(
                and(
                    eq(scrapeResults.competitorId, competitorId),
                    sql`scraped_at >= ${cutoff.toISOString()}`
                )
            )
            .orderBy(desc(scrapeResults.scrapedAt))
    },
}

/**
 * Snapshot repository - historical competitor states
 */
export const snapshotRepo = {
    async findByCompetitor(db: Database, competitorId: string, limit = 20) {
        return db
            .select()
            .from(snapshots)
            .where(eq(snapshots.competitorId, competitorId))
            .orderBy(desc(snapshots.timestamp))
            .limit(limit)
    },

    async create(db: Database, data: NewSnapshot) {
        const [result] = await db.insert(snapshots).values(data).returning()
        return result
    },

    async createMilestone(db: Database, competitorId: string, label: string, competitorData: unknown) {
        return db.insert(snapshots).values({
            id: crypto.randomUUID(),
            competitorId,
            type: 'milestone',
            label,
            data: competitorData,
        }).returning()
    },

    async findMilestones(db: Database, competitorId: string) {
        return db
            .select()
            .from(snapshots)
            .where(
                and(
                    eq(snapshots.competitorId, competitorId),
                    eq(snapshots.type, 'milestone')
                )
            )
            .orderBy(desc(snapshots.timestamp))
    },
}

/**
 * Alert repository
 */
export const alertRepo = {
    async findAll(db: Database, limit = 50) {
        return db
            .select()
            .from(alerts)
            .orderBy(desc(alerts.date))
            .limit(limit)
    },

    async findUnread(db: Database) {
        return db
            .select()
            .from(alerts)
            .where(eq(alerts.isRead, false))
            .orderBy(desc(alerts.date))
    },

    async findByCompetitor(db: Database, competitorId: string) {
        return db
            .select()
            .from(alerts)
            .where(eq(alerts.competitorId, competitorId))
            .orderBy(desc(alerts.date))
    },

    async create(db: Database, data: NewAlert) {
        const [result] = await db.insert(alerts).values(data).returning()
        return result
    },

    async markAsRead(db: Database, id: string) {
        await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id))
    },

    async markAllAsRead(db: Database) {
        await db.update(alerts).set({ isRead: true }).where(eq(alerts.isRead, false))
    },

    async getUnreadCount(db: Database) {
        const [result] = await db
            .select({ count: sql<number>`count(*)` })
            .from(alerts)
            .where(eq(alerts.isRead, false))
        return result?.count ?? 0
    },
}

/**
 * User profile repository
 */
export const profileRepo = {
    async get(db: Database) {
        const [result] = await db.select().from(userProfile).where(eq(userProfile.id, 'default')).limit(1)
        return result
    },

    async update(db: Database, data: Partial<typeof userProfile.$inferInsert>) {
        const [result] = await db
            .update(userProfile)
            .set({ ...data, updatedAt: sql`datetime('now')` })
            .where(eq(userProfile.id, 'default'))
            .returning()
        return result
    },
}

/**
 * Scrape schedule repository
 */
export const scheduleRepo = {
    async findByCompetitor(db: Database, competitorId: string) {
        return db
            .select()
            .from(scrapeSchedule)
            .where(eq(scrapeSchedule.competitorId, competitorId))
    },

    async create(db: Database, competitorId: string, url: string, frequency: 'daily' | 'weekly' | 'monthly' = 'weekly') {
        const nextRun = new Date()
        nextRun.setDate(nextRun.getDate() + (frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30))

        const [result] = await db.insert(scrapeSchedule).values({
            id: crypto.randomUUID(),
            competitorId,
            url,
            frequency,
            nextRun: nextRun.toISOString(),
        }).returning()
        return result
    },

    async update(db: Database, id: string, data: Partial<typeof scrapeSchedule.$inferInsert>) {
        const [result] = await db
            .update(scrapeSchedule)
            .set(data)
            .where(eq(scrapeSchedule.id, id))
            .returning()
        return result
    },

    async delete(db: Database, id: string) {
        await db.delete(scrapeSchedule).where(eq(scrapeSchedule.id, id))
    },

    async enable(db: Database, id: string) {
        await db.update(scrapeSchedule).set({ enabled: true }).where(eq(scrapeSchedule.id, id))
    },

    async disable(db: Database, id: string) {
        await db.update(scrapeSchedule).set({ enabled: false }).where(eq(scrapeSchedule.id, id))
    },
}

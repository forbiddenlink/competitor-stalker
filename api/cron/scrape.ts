import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { eq, lte, and, sql } from 'drizzle-orm'
import * as cheerio from 'cheerio'
import {
    scrapeSchedule,
    scrapeResults,
    competitors,
    alerts,
    snapshots,
} from '../../src/db/schema'

/**
 * Vercel Cron handler for scheduled competitor scraping
 *
 * This endpoint is triggered by Vercel Cron to:
 * 1. Find competitors due for scraping
 * 2. Scrape their pages
 * 3. Store results and detect changes
 * 4. Create alerts for significant changes
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify cron secret for security
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url) {
        return res.status(500).json({ error: 'Database not configured' })
    }

    const client = createClient({ url, authToken })
    const db = drizzle(client)

    try {
        const now = new Date().toISOString()

        // Find schedules that are due
        const dueSchedules = await db
            .select()
            .from(scrapeSchedule)
            .where(
                and(
                    eq(scrapeSchedule.enabled, true),
                    lte(scrapeSchedule.nextRun, now)
                )
            )
            .limit(10) // Process max 10 per invocation to stay within limits

        console.log(`Found ${dueSchedules.length} competitors to scrape`)

        const results: Array<{ competitorId: string; success: boolean; error?: string }> = []

        for (const schedule of dueSchedules) {
            try {
                // Fetch the page
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 15000)

                const response = await fetch(schedule.url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorStalker/1.0)',
                        'Accept': 'text/html,application/xhtml+xml',
                    },
                })

                clearTimeout(timeoutId)

                const html = await response.text()
                const $ = cheerio.load(html)

                // Extract data
                const scrapeData = {
                    title: $('title').text().trim(),
                    description: $('meta[name="description"]').attr('content')?.trim(),
                    pricing: extractPricing($),
                    features: extractFeatures($),
                    h1: $('h1').first().text().trim(),
                    h2s: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
                    socialLinks: extractSocialLinks($),
                    techStack: extractTechStack($),
                    ctaButtons: extractCTAs($),
                }

                // Get previous scrape for comparison
                const [previousScrape] = await db
                    .select()
                    .from(scrapeResults)
                    .where(eq(scrapeResults.competitorId, schedule.competitorId))
                    .orderBy(sql`scraped_at DESC`)
                    .limit(1)

                // Store new scrape result
                const scrapeId = crypto.randomUUID()
                await db.insert(scrapeResults).values({
                    id: scrapeId,
                    competitorId: schedule.competitorId,
                    url: schedule.url,
                    title: scrapeData.title,
                    description: scrapeData.description,
                    pricing: scrapeData.pricing,
                    features: scrapeData.features,
                    h1: scrapeData.h1,
                    h2s: scrapeData.h2s,
                    socialLinks: scrapeData.socialLinks,
                    techStack: scrapeData.techStack,
                    ctaButtons: scrapeData.ctaButtons,
                    httpStatus: response.status,
                })

                // Detect changes and create alerts
                if (previousScrape) {
                    const changes = detectChanges(previousScrape, scrapeData)
                    for (const change of changes) {
                        await db.insert(alerts).values({
                            id: crypto.randomUUID(),
                            competitorId: schedule.competitorId,
                            title: change.title,
                            description: change.description,
                            type: change.type,
                        })
                    }

                    // If significant changes, create a snapshot
                    if (changes.length > 0) {
                        const [competitor] = await db
                            .select()
                            .from(competitors)
                            .where(eq(competitors.id, schedule.competitorId))
                            .limit(1)

                        if (competitor) {
                            await db.insert(snapshots).values({
                                id: crypto.randomUUID(),
                                competitorId: schedule.competitorId,
                                type: 'auto',
                                label: `Auto-snapshot: ${changes.length} change(s) detected`,
                                data: competitor,
                            })
                        }
                    }
                }

                // Update schedule with next run time
                const nextRun = calculateNextRun(schedule.frequency)
                await db
                    .update(scrapeSchedule)
                    .set({ lastRun: now, nextRun })
                    .where(eq(scrapeSchedule.id, schedule.id))

                results.push({ competitorId: schedule.competitorId, success: true })
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                console.error(`Failed to scrape ${schedule.url}:`, errorMessage)

                // Store error result
                await db.insert(scrapeResults).values({
                    id: crypto.randomUUID(),
                    competitorId: schedule.competitorId,
                    url: schedule.url,
                    errorMessage,
                })

                results.push({
                    competitorId: schedule.competitorId,
                    success: false,
                    error: errorMessage,
                })
            }
        }

        client.close()
        return res.status(200).json({
            processed: results.length,
            results,
        })
    } catch (err) {
        client.close()
        console.error('Cron job failed:', err)
        return res.status(500).json({
            error: err instanceof Error ? err.message : 'Cron job failed',
        })
    }
}

function calculateNextRun(frequency: string): string {
    const now = new Date()
    switch (frequency) {
        case 'daily':
            now.setDate(now.getDate() + 1)
            break
        case 'weekly':
            now.setDate(now.getDate() + 7)
            break
        case 'monthly':
            now.setMonth(now.getMonth() + 1)
            break
        default:
            now.setDate(now.getDate() + 7)
    }
    return now.toISOString()
}

interface ChangeAlert {
    title: string
    description: string
    type: 'Pricing' | 'Feature' | 'Marketing' | 'Personnel'
}

function detectChanges(
    previous: typeof scrapeResults.$inferSelect,
    current: {
        title: string
        description?: string
        pricing: string
        features: string[]
        h1: string
        h2s: string[]
        socialLinks: Record<string, string | undefined>
        techStack: string[]
        ctaButtons: string[]
    }
): ChangeAlert[] {
    const changes: ChangeAlert[] = []

    // Check pricing changes
    if (previous.pricing !== current.pricing && current.pricing) {
        changes.push({
            title: 'Pricing Change Detected',
            description: `Previous: "${previous.pricing?.substring(0, 100) || 'N/A'}" | New: "${current.pricing.substring(0, 100)}"`,
            type: 'Pricing',
        })
    }

    // Check title/tagline changes (marketing)
    if (previous.title !== current.title) {
        changes.push({
            title: 'Website Title Changed',
            description: `From "${previous.title}" to "${current.title}"`,
            type: 'Marketing',
        })
    }

    if (previous.h1 !== current.h1 && current.h1) {
        changes.push({
            title: 'Main Headline Changed',
            description: `New headline: "${current.h1}"`,
            type: 'Marketing',
        })
    }

    // Check for new features
    const previousFeatures = new Set(previous.features || [])
    const newFeatures = current.features.filter((f) => !previousFeatures.has(f))
    if (newFeatures.length > 0) {
        changes.push({
            title: 'New Features Detected',
            description: newFeatures.slice(0, 3).join(', '),
            type: 'Feature',
        })
    }

    // Check CTA changes
    const previousCTAs = new Set(previous.ctaButtons || [])
    const newCTAs = current.ctaButtons.filter((c) => !previousCTAs.has(c))
    if (newCTAs.length > 0) {
        changes.push({
            title: 'New Call-to-Action',
            description: newCTAs.join(', '),
            type: 'Marketing',
        })
    }

    return changes
}

// Helper functions (duplicated from main scraper for serverless isolation)
function extractPricing($: cheerio.CheerioAPI): string {
    const selectors = ['.pricing', '[class*="price"]', '[class*="pricing"]', '.plan']
    for (const sel of selectors) {
        const text = $(sel).text().trim()
        if (text) return text.slice(0, 500)
    }
    const matches = $('body').text().match(/\$[\d,]+(?:\.\d{2})?(?:\/\w+)?/g)
    return matches?.slice(0, 5).join(', ') || ''
}

function extractFeatures($: cheerio.CheerioAPI): string[] {
    const selectors = ['[class*="feature"] li', '[class*="features"] li', '.feature-list li']
    for (const sel of selectors) {
        const features = $(sel).map((_, el) => $(el).text().trim()).get().filter(Boolean)
        if (features.length > 0) return features.slice(0, 20)
    }
    return []
}

function extractSocialLinks($: cheerio.CheerioAPI): Record<string, string | undefined> {
    return {
        twitter: $('a[href*="twitter.com"], a[href*="x.com"]').first().attr('href'),
        linkedin: $('a[href*="linkedin.com"]').first().attr('href'),
        facebook: $('a[href*="facebook.com"]').first().attr('href'),
        github: $('a[href*="github.com"]').first().attr('href'),
        youtube: $('a[href*="youtube.com"]').first().attr('href'),
    }
}

function extractTechStack($: cheerio.CheerioAPI): string[] {
    const tech: string[] = []
    const html = $.html()
    const patterns: Array<[RegExp, string]> = [
        [/react/i, 'React'], [/vue/i, 'Vue'], [/angular/i, 'Angular'],
        [/next/i, 'Next.js'], [/stripe/i, 'Stripe'], [/intercom/i, 'Intercom'],
    ]
    for (const [pat, name] of patterns) {
        if (pat.test(html) && !tech.includes(name)) tech.push(name)
    }
    return tech
}

function extractCTAs($: cheerio.CheerioAPI): string[] {
    const ctas: string[] = []
    const selectors = ['a[class*="cta"]', 'a[href*="signup"]', 'a[href*="trial"]', 'a[href*="demo"]']
    for (const sel of selectors) {
        $(sel).each((_, el) => {
            const text = $(el).text().trim()
            if (text && text.length < 50 && !ctas.includes(text)) ctas.push(text)
        })
    }
    return ctas.slice(0, 10)
}

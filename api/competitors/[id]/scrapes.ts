import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { scrapeRepo } from '../../../src/db/repositories'
import * as schema from '../../../src/db/schema'

/**
 * GET /api/competitors/:id/scrapes - Get scrape history for a competitor
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query
    const limit = parseInt(req.query.limit as string) || 10

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid competitor ID' })
    }

    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url) {
        return res.status(500).json({ error: 'Database not configured' })
    }

    const client = createClient({ url, authToken })
    const db = drizzle(client, { schema })

    try {
        const scrapes = await scrapeRepo.findByCompetitor(db, id, limit)
        client.close()
        return res.status(200).json(scrapes)
    } catch (err) {
        client.close()
        console.error('API error:', err)
        return res.status(500).json({
            error: err instanceof Error ? err.message : 'Internal server error',
        })
    }
}

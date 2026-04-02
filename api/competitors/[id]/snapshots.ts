import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { snapshotRepo, competitorRepo } from '../../../src/db/repositories'
import * as schema from '../../../src/db/schema'

/**
 * GET /api/competitors/:id/snapshots - Get snapshots for a competitor
 * POST /api/competitors/:id/snapshots - Create a milestone snapshot
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query

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
        if (req.method === 'GET') {
            const milestones = req.query.milestones === 'true'
            const snapshots = milestones
                ? await snapshotRepo.findMilestones(db, id)
                : await snapshotRepo.findByCompetitor(db, id)

            client.close()
            return res.status(200).json(snapshots)
        }

        if (req.method === 'POST') {
            const { label } = req.body

            if (!label) {
                client.close()
                return res.status(400).json({ error: 'Label is required for milestone' })
            }

            // Get current competitor state
            const competitor = await competitorRepo.findById(db, id)

            if (!competitor) {
                client.close()
                return res.status(404).json({ error: 'Competitor not found' })
            }

            const [snapshot] = await snapshotRepo.createMilestone(db, id, label, competitor)
            client.close()
            return res.status(201).json(snapshot)
        }

        client.close()
        return res.status(405).json({ error: 'Method not allowed' })
    } catch (err) {
        client.close()
        console.error('API error:', err)
        return res.status(500).json({
            error: err instanceof Error ? err.message : 'Internal server error',
        })
    }
}

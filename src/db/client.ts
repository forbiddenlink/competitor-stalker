import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

/**
 * Create Turso/libSQL database client
 *
 * Requires environment variables:
 * - TURSO_DATABASE_URL: Your Turso database URL (e.g., libsql://your-db.turso.io)
 * - TURSO_AUTH_TOKEN: Your Turso authentication token
 */
function createDbClient() {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url) {
        throw new Error('TURSO_DATABASE_URL environment variable is required')
    }

    // Create libSQL client
    const client = createClient({
        url,
        authToken,
    })

    // Wrap with Drizzle ORM
    return drizzle(client, { schema })
}

// Singleton instance for server-side usage
let db: ReturnType<typeof createDbClient> | null = null

export function getDb() {
    if (!db) {
        db = createDbClient()
    }
    return db
}

// Direct export for convenience
export type Database = ReturnType<typeof createDbClient>

import { createClient } from '@libsql/client'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Run database migrations
 *
 * Usage:
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx src/db/migrate.ts
 */
async function migrate() {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url) {
        console.error('Error: TURSO_DATABASE_URL environment variable is required')
        process.exit(1)
    }

    console.log('Connecting to database...')
    const client = createClient({ url, authToken })

    // Create migrations tracking table
    await client.execute(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `)

    // Get applied migrations
    const result = await client.execute('SELECT name FROM _migrations ORDER BY id')
    const applied = new Set(result.rows.map((row) => row.name as string))

    // Get migration files
    const migrationsDir = join(__dirname, 'migrations')
    const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()

    console.log(`Found ${files.length} migration files`)

    // Apply pending migrations
    for (const file of files) {
        if (applied.has(file)) {
            console.log(`  [skip] ${file} (already applied)`)
            continue
        }

        console.log(`  [apply] ${file}`)
        const sql = readFileSync(join(migrationsDir, file), 'utf-8')

        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith('--'))

        for (const statement of statements) {
            try {
                await client.execute(statement)
            } catch (err) {
                console.error(`Error executing statement in ${file}:`)
                console.error(statement.substring(0, 200) + '...')
                throw err
            }
        }

        // Record migration
        await client.execute({
            sql: 'INSERT INTO _migrations (name) VALUES (?)',
            args: [file],
        })
    }

    console.log('Migrations complete!')
    client.close()
}

migrate().catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
})

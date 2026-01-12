// Disable SSL certificate verification for Supabase pooler
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import pg from 'pg'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const connectionString = process.env.POSTGRES_URL_NON_POOLING

if (!connectionString) {
  console.error('Missing POSTGRES_URL_NON_POOLING in .env.local')
  process.exit(1)
}

const { Client } = pg

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected!\n')

    console.log('1. Adding event_type column to analytics table...')
    await client.query(`
      ALTER TABLE public.analytics
      ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan'
    `)
    console.log('   ✓ Column added\n')

    console.log('2. Creating index on event_type...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_event_type
      ON public.analytics(event_type)
    `)
    console.log('   ✓ Index created\n')

    console.log('3. Verifying migration...')
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'analytics' AND column_name = 'event_type'
    `)

    if (result.rows.length > 0) {
      console.log('   ✓ Verified: event_type column exists')
      console.log(`     - Type: ${result.rows[0].data_type}`)
      console.log(`     - Default: ${result.rows[0].column_default}`)
    }

    console.log('\n✓ Migration completed successfully!')

  } catch (error) {
    console.error('Migration error:', error.message)
  } finally {
    await client.end()
  }
}

runMigration()

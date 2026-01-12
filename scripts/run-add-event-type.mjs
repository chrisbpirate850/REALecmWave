import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Adding event_type column to analytics table...\n')

  // Use raw SQL via rpc or direct REST API
  // Since Supabase JS client doesn't support ALTER TABLE directly,
  // we'll use the SQL editor approach via the admin API

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE public.analytics
      ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan';
    `
  }).catch(() => {
    // If exec_sql doesn't exist, try another approach
    return { error: { message: 'exec_sql not available' } }
  })

  if (error) {
    console.log('Note: Could not run ALTER TABLE via RPC.')
    console.log('Please run the following SQL in Supabase Dashboard SQL Editor:\n')
    console.log(`
ALTER TABLE public.analytics
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan' CHECK (event_type IN ('scan', 'conversion'));

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);

UPDATE public.analytics SET event_type = 'scan' WHERE event_type IS NULL;
    `)
    console.log('\nAlternatively, run: scripts/006_add_analytics_event_type.sql')
  } else {
    console.log('✓ Migration complete!')
  }
}

runMigration().catch(console.error)

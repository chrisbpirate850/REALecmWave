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

  // Test if the column already exists by trying to query it
  const { data: testData, error: testError } = await supabase
    .from('analytics')
    .select('event_type')
    .limit(1)

  if (!testError) {
    console.log('✓ event_type column already exists!')
    return
  }

  if (testError && testError.message.includes('event_type')) {
    console.log('Column does not exist yet. Please run this SQL in Supabase Dashboard:\n')
    console.log(`
-- Run this in Supabase Dashboard > SQL Editor:

ALTER TABLE public.analytics
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan';

-- Add check constraint
ALTER TABLE public.analytics
ADD CONSTRAINT analytics_event_type_check
CHECK (event_type IN ('scan', 'conversion'));

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
    `)
  } else {
    console.log('Unexpected error:', testError)
  }
}

runMigration().catch(console.error)

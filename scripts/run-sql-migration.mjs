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

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

async function runSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  return response
}

async function runMigration() {
  console.log('Running SQL migration to add event_type column...\n')

  // Try using the Supabase SQL API endpoint
  const sqlStatements = [
    `ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan'`,
    `CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type)`,
  ]

  // Use the query endpoint
  for (const sql of sqlStatements) {
    console.log(`Executing: ${sql.substring(0, 60)}...`)

    try {
      // Try the pg_query approach via PostgREST
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ query: sql }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.log(`  Response: ${response.status} - trying alternative method...`)
      }
    } catch (err) {
      console.log(`  Error: ${err.message}`)
    }
  }

  // Since direct SQL execution via REST isn't straightforward,
  // let's use the Supabase Management API
  console.log('\nAttempting via Supabase Management API...')

  const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

  const response = await fetch(managementUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      query: `
        ALTER TABLE public.analytics
        ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan';

        CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
      `
    }),
  })

  if (response.ok) {
    console.log('✓ Migration completed successfully!')
  } else {
    const status = response.status
    console.log(`Management API returned ${status}`)
    console.log('\nThe REST API cannot execute DDL statements directly.')
    console.log('Using Supabase CLI instead...\n')

    // Output for manual execution or CLI
    return false
  }

  return true
}

runMigration().then(async (success) => {
  if (!success) {
    // Try using supabase CLI if available
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    console.log('Attempting to run via Supabase CLI...\n')

    try {
      const sql = `ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan'; CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);`

      // Check if supabase CLI is available
      await execAsync('supabase --version')

      // Run the SQL via CLI
      const result = await execAsync(`supabase db execute --db-url "${process.env.DATABASE_URL}" "${sql}"`)
      console.log('✓ Migration completed via CLI!')
      console.log(result.stdout)
    } catch (cliError) {
      console.log('Supabase CLI not available or DATABASE_URL not set.')
      console.log('\nPlease run this SQL manually in Supabase Dashboard > SQL Editor:\n')
      console.log(`
ALTER TABLE public.analytics
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan';

CREATE INDEX IF NOT EXISTS idx_analytics_event_type
ON public.analytics(event_type);
      `)
    }
  }
}).catch(console.error)

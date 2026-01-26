import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Starting migration...\n')

  // Step 1: Update existing Niceville mailing
  console.log('1. Updating existing Niceville mailing...')
  const { error: updateError } = await supabase
    .from('mailings')
    .update({
      title: 'February 2026 - Niceville',
      zip_codes: ['32578']
    })
    .eq('id', 'a0000000-0000-0000-0000-000000000001')

  if (updateError) {
    console.log('   Note: Could not update existing mailing (may not exist):', updateError.message)
  } else {
    console.log('   ✓ Niceville mailing updated')
  }

  // Step 2: Create Navarre mailing
  console.log('\n2. Creating Navarre mailing...')
  const { error: navarreError } = await supabase
    .from('mailings')
    .upsert({
      id: 'a0000000-0000-0000-0000-000000000002',
      title: 'February 2026 - Navarre',
      scheduled_mail_date: '2026-02-07',
      zip_codes: ['32566'],
      estimated_recipients: 5000,
      status: 'active',
      price_per_spot: 675.00
    }, { onConflict: 'id' })

  if (navarreError) {
    console.error('   ✗ Error creating Navarre mailing:', navarreError.message)
  } else {
    console.log('   ✓ Navarre mailing created')
  }

  // Step 3: Create Navarre ad spots
  console.log('\n3. Creating Navarre ad spots...')
  const navarreSpots = []
  for (let i = 1; i <= 12; i++) {
    navarreSpots.push({
      mailing_id: 'a0000000-0000-0000-0000-000000000002',
      position: i,
      side: i <= 6 ? 'front' : 'back',
      grid_position: i <= 6 ? i : i - 6,
      status: 'available',
      price: 675.00
    })
  }

  // Delete existing spots first to avoid duplicates
  await supabase
    .from('ad_spots')
    .delete()
    .eq('mailing_id', 'a0000000-0000-0000-0000-000000000002')

  const { error: navSpotError } = await supabase
    .from('ad_spots')
    .insert(navarreSpots)

  if (navSpotError) {
    console.error('   ✗ Error creating Navarre ad spots:', navSpotError.message)
  } else {
    console.log('   ✓ 12 Navarre ad spots created')
  }

  // Step 4: Create Gulf Breeze mailing
  console.log('\n4. Creating Gulf Breeze mailing...')
  const { error: gulfError } = await supabase
    .from('mailings')
    .upsert({
      id: 'a0000000-0000-0000-0000-000000000003',
      title: 'February 2026 - Gulf Breeze',
      scheduled_mail_date: '2026-02-07',
      zip_codes: ['32561'],
      estimated_recipients: 5000,
      status: 'active',
      price_per_spot: 675.00
    }, { onConflict: 'id' })

  if (gulfError) {
    console.error('   ✗ Error creating Gulf Breeze mailing:', gulfError.message)
  } else {
    console.log('   ✓ Gulf Breeze mailing created')
  }

  // Step 5: Create Gulf Breeze ad spots
  console.log('\n5. Creating Gulf Breeze ad spots...')
  const gulfSpots = []
  for (let i = 1; i <= 12; i++) {
    gulfSpots.push({
      mailing_id: 'a0000000-0000-0000-0000-000000000003',
      position: i,
      side: i <= 6 ? 'front' : 'back',
      grid_position: i <= 6 ? i : i - 6,
      status: 'available',
      price: 675.00
    })
  }

  // Delete existing spots first to avoid duplicates
  await supabase
    .from('ad_spots')
    .delete()
    .eq('mailing_id', 'a0000000-0000-0000-0000-000000000003')

  const { error: gulfSpotError } = await supabase
    .from('ad_spots')
    .insert(gulfSpots)

  if (gulfSpotError) {
    console.error('   ✗ Error creating Gulf Breeze ad spots:', gulfSpotError.message)
  } else {
    console.log('   ✓ 12 Gulf Breeze ad spots created')
  }

  // Verify
  console.log('\n--- Verification ---')
  const { data: mailings } = await supabase
    .from('mailings')
    .select('id, title, zip_codes, status')
    .in('status', ['active', 'completed'])
    .order('title')

  console.log('\nActive mailings in database:')
  mailings?.forEach(m => {
    console.log(`  • ${m.title} (ZIP: ${m.zip_codes?.join(', ')}) - ${m.status}`)
  })

  console.log('\n✓ Migration complete!')
}

runMigration().catch(console.error)

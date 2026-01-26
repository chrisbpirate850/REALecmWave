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

async function addCrestviewMailing() {
  console.log('Adding Crestview, FL 32536 mailing...\n')

  const mailingId = 'a0000000-0000-0000-0000-000000000004'

  // Check if mailing already exists
  const { data: existing } = await supabase
    .from('mailings')
    .select('id')
    .eq('id', mailingId)
    .single()

  if (existing) {
    console.log('Crestview mailing already exists! Skipping...')
    return
  }

  // Create the mailing
  const { data: mailing, error: mailingError } = await supabase
    .from('mailings')
    .insert({
      id: mailingId,
      title: 'February 2026 - Crestview',
      scheduled_mail_date: '2026-02-07',
      zip_codes: ['32536'],
      estimated_recipients: 5000,
      status: 'active',
      price_per_spot: 675.00
    })
    .select()
    .single()

  if (mailingError) {
    console.error('Error creating mailing:', mailingError)
    process.exit(1)
  }

  console.log('✓ Created mailing:', mailing.title)

  // Create 12 ad spots (6 front, 6 back)
  const adSpots = []
  for (const side of ['front', 'back']) {
    for (let gridPos = 1; gridPos <= 6; gridPos++) {
      const position = side === 'front' ? gridPos : gridPos + 6
      adSpots.push({
        mailing_id: mailingId,
        position,
        side,
        grid_position: gridPos,
        status: 'available',
        price: 675.00
      })
    }
  }

  const { error: spotsError } = await supabase
    .from('ad_spots')
    .insert(adSpots)

  if (spotsError) {
    console.error('Error creating ad spots:', spotsError)
    process.exit(1)
  }

  console.log('✓ Created 12 ad spots (6 front, 6 back)')
  console.log('\n✅ Crestview mailing successfully added!')
  console.log(`   View at: https://ecmwave.com/mailings/${mailingId}`)
}

addCrestviewMailing().catch(console.error)

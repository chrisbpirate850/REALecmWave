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

async function updateMailDates() {
  console.log('Updating all mailing dates to February 7, 2026...\n')

  // Fetch current mailings
  const { data: mailings, error: fetchError } = await supabase
    .from('mailings')
    .select('id, title, scheduled_mail_date')
    .eq('scheduled_mail_date', '2026-01-25')

  if (fetchError) {
    console.error('Error fetching mailings:', fetchError.message)
    process.exit(1)
  }

  if (!mailings || mailings.length === 0) {
    console.log('No mailings found with date 2026-01-25. Checking all mailings...')
    const { data: all } = await supabase
      .from('mailings')
      .select('id, title, scheduled_mail_date')
      .order('title')
    all?.forEach(m => {
      console.log(`  • ${m.title} — ${m.scheduled_mail_date}`)
    })
    return
  }

  console.log(`Found ${mailings.length} mailing(s) to update:\n`)

  for (const mailing of mailings) {
    const newTitle = mailing.title.replace('January 2026', 'February 2026')

    const { error: updateError } = await supabase
      .from('mailings')
      .update({
        scheduled_mail_date: '2026-02-07',
        title: newTitle
      })
      .eq('id', mailing.id)

    if (updateError) {
      console.error(`  ✗ ${mailing.title}: ${updateError.message}`)
    } else {
      console.log(`  ✓ ${mailing.title} → ${newTitle} (Feb 7, 2026)`)
    }
  }

  // Verify
  console.log('\n--- Verification ---')
  const { data: updated } = await supabase
    .from('mailings')
    .select('id, title, scheduled_mail_date')
    .order('title')

  console.log('\nAll mailings:')
  updated?.forEach(m => {
    console.log(`  • ${m.title} — ${m.scheduled_mail_date}`)
  })

  console.log('\n✅ Done!')
}

updateMailDates().catch(console.error)

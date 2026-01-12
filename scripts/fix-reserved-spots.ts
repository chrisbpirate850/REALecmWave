// Fix spots that were purchased before webhook fix was deployed
// Run with: npx tsx scripts/fix-reserved-spots.ts

import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Get all reserved spots (these should be purchased but webhook didn't process)
  const { data: reservedSpots, error } = await supabase
    .from("ad_spots")
    .select("*")
    .eq("status", "reserved")

  if (error) {
    console.error("Error fetching spots:", error)
    return
  }

  console.log(`Found ${reservedSpots?.length || 0} reserved spots to fix\n`)

  if (!reservedSpots?.length) {
    console.log("No reserved spots to fix!")
    return
  }

  const baseUrl = "https://emerald-coast-marketing-wave.vercel.app"

  for (const spot of reservedSpots) {
    console.log(`Fixing spot ${spot.id} (position ${spot.position}, ${spot.side})...`)

    const mailingId = spot.mailing_id
    const slug = `${mailingId.substring(0, 8)}-${spot.id.substring(0, 8)}`
    const qrCodeUrl = `${baseUrl}/offers/${slug}`

    // Update spot to purchased with QR code data
    const { error: updateError } = await supabase
      .from("ad_spots")
      .update({
        status: "purchased",
        purchased_at: new Date().toISOString(),
        qr_code_data: qrCodeUrl,
        landing_page_slug: slug,
      })
      .eq("id", spot.id)

    if (updateError) {
      console.error(`  Error updating spot: ${updateError.message}`)
      continue
    }

    // Create landing page if it doesn't exist
    const { error: lpError } = await supabase
      .from("landing_pages")
      .upsert({
        ad_spot_id: spot.id,
        slug: slug,
        offer_description: "",
        is_published: true,
      }, { onConflict: "ad_spot_id" })

    if (lpError) {
      console.error(`  Error creating landing page: ${lpError.message}`)
    }

    // Update payment record if exists
    await supabase
      .from("payments")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
      })
      .eq("ad_spot_id", spot.id)

    console.log(`  ✓ Updated to purchased, QR: ${qrCodeUrl}`)
  }

  console.log("\nDone! All reserved spots have been fixed.")
}

main()

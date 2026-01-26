// Quick script to reset a spot for webhook testing
// Run with: npx tsx scripts/reset-spot.ts

import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load .env.local
config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // List all ad_spots
  const { data: spots, error } = await supabase
    .from("ad_spots")
    .select("id, status, position, side, advertiser_id, ad_copy_url, qr_code_data, landing_page_slug")
    .order("position")

  if (error) {
    console.error("Error fetching spots:", error)
    return
  }

  console.log("\nCurrent ad spots:")
  console.table(spots)

  // Find a purchased/reserved spot to reset
  const spotToReset = spots?.find(s => s.status === "reserved" || s.status === "purchased")

  if (!spotToReset) {
    console.log("\nNo reserved/purchased spots found to reset")
    return
  }

  console.log(`\nResetting spot ${spotToReset.id} (position ${spotToReset.position}, ${spotToReset.side}) to available...`)

  // Delete any landing pages for this spot
  const { error: lpError } = await supabase
    .from("landing_pages")
    .delete()
    .eq("ad_spot_id", spotToReset.id)

  if (lpError) {
    console.log("Note: Error deleting landing page (may not exist):", lpError.message)
  }

  // Delete any payments for this spot
  const { error: payError } = await supabase
    .from("payments")
    .delete()
    .eq("ad_spot_id", spotToReset.id)

  if (payError) {
    console.log("Note: Error deleting payment (may not exist):", payError.message)
  }

  // Reset the spot
  const { data: updated, error: updateError } = await supabase
    .from("ad_spots")
    .update({
      status: "available",
      advertiser_id: null,
      ad_copy_url: null,
      qr_code_data: null,
      landing_page_slug: null,
      purchased_at: null,
    })
    .eq("id", spotToReset.id)
    .select()
    .single()

  if (updateError) {
    console.error("Error resetting spot:", updateError)
    return
  }

  console.log("\nSpot reset successfully!")
  console.log(updated)
  console.log("\nNow go to production and purchase this spot to test the webhook.")
}

main()

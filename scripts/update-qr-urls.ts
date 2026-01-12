import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateQrCodes() {
  const { data: spots, error } = await supabase
    .from("ad_spots")
    .select("id, qr_code_data")
    .not("qr_code_data", "is", null)

  if (error) {
    console.error("Error fetching spots:", error)
    return
  }

  console.log("Found", spots?.length || 0, "spots with QR codes")

  let updated = 0
  for (const spot of spots || []) {
    if (spot.qr_code_data && spot.qr_code_data.includes("vercel.app")) {
      const newUrl = spot.qr_code_data.replace(/https:\/\/[^\/]+/, "https://ecmwave.com")
      console.log("Updating:", spot.qr_code_data)
      console.log("      ->", newUrl)

      const { error: updateError } = await supabase
        .from("ad_spots")
        .update({ qr_code_data: newUrl })
        .eq("id", spot.id)

      if (updateError) {
        console.error("Error updating spot:", updateError)
      } else {
        updated++
      }
    }
  }

  console.log("\nUpdated", updated, "spots")
}

updateQrCodes()

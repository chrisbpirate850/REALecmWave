import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  // Get ALL spots first
  const { data: allSpots } = await supabase
    .from("ad_spots")
    .select("id, status, position, side")
    .order("position")

  console.log("All spot statuses:")
  allSpots?.forEach((s) => console.log("  " + s.position + " (" + s.side + "): " + s.status))
  console.log("")

  const { data: spots } = await supabase
    .from("ad_spots")
    .select("id, status, position, side, qr_code_data, landing_page_slug, ad_copy_url")
    .not("advertiser_id", "is", null)
    .order("position")

  console.log("Your purchased spots:\n")
  spots?.forEach((s) => {
    const hasQR = s.qr_code_data ? "YES" : "NO"
    const hasLanding = s.landing_page_slug ? s.landing_page_slug : "NO"
    const hasAdCopy = s.ad_copy_url ? "YES" : "NO"
    console.log(`Position ${s.position} (${s.side}):`)
    console.log(`  Status: ${s.status}`)
    console.log(`  Ad Copy: ${hasAdCopy}`)
    console.log(`  QR Code: ${hasQR}`)
    console.log(`  Landing Page: ${hasLanding}`)
    console.log("")
  })

  const { data: pages, count } = await supabase
    .from("landing_pages")
    .select("*", { count: "exact" })

  console.log(`Total landing pages in database: ${count}`)
  pages?.forEach((p) => console.log(`  - ${p.slug}`))
}

check()

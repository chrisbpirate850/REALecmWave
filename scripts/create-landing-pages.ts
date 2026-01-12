import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Get purchased spots that need landing pages
  const { data: spots } = await supabase
    .from("ad_spots")
    .select("id, landing_page_slug")
    .eq("status", "purchased")
    .not("landing_page_slug", "is", null)

  console.log("Found", spots?.length || 0, "purchased spots with slugs")

  for (const spot of spots || []) {
    console.log("\nCreating landing page for spot:", spot.id)
    console.log("  Slug:", spot.landing_page_slug)

    const { data, error } = await supabase
      .from("landing_pages")
      .insert({
        ad_spot_id: spot.id,
        slug: spot.landing_page_slug,
        offer_description: "",
        is_published: true,
      })
      .select()

    if (error) {
      console.log("  ERROR:", error.message)
      console.log("  Details:", JSON.stringify(error, null, 2))
    } else {
      console.log("  SUCCESS:", data)
    }
  }

  // Final check
  const { data: pages, count } = await supabase
    .from("landing_pages")
    .select("*", { count: "exact" })

  console.log("\nTotal landing pages now:", count)
}

main()

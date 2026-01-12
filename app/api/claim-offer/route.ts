import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { landingPageId, adSpotId, advertiserId } = await request.json()

    if (!landingPageId || !adSpotId || !advertiserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Record the conversion in analytics
    const { error: analyticsError } = await supabase
      .from("analytics")
      .insert({
        ad_spot_id: adSpotId,
        advertiser_id: advertiserId,
        event_type: "conversion",
        scanned_at: new Date().toISOString(),
      })

    if (analyticsError) {
      console.error("[claim-offer] Analytics error:", analyticsError)
      return NextResponse.json(
        { error: "Failed to record conversion" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[claim-offer] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

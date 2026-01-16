import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { spotId, mailingId, advertiserEmail, businessName, adCopyUrl, offerText } = await request.json()

    if (!spotId || !mailingId || !advertiserEmail) {
      return NextResponse.json(
        { error: "Missing required fields: spotId, mailingId, advertiserEmail" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // Verify spot is available
    const { data: spot, error: spotError } = await adminSupabase
      .from("ad_spots")
      .select("*, mailings(id, title)")
      .eq("id", spotId)
      .eq("mailing_id", mailingId)
      .single()

    if (spotError || !spot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 })
    }

    if (spot.status !== "available") {
      return NextResponse.json({ error: "Spot is not available" }, { status: 400 })
    }

    // Check if advertiser has a profile, create one if not
    let { data: advertiserProfile } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("email", advertiserEmail)
      .single()

    let advertiserId = advertiserProfile?.id

    // If no profile exists, we'll use a placeholder ID based on email
    // The advertiser can claim this later when they sign up
    if (!advertiserId) {
      // Create a placeholder profile for the advertiser
      const { data: newProfile, error: profileError } = await adminSupabase
        .from("profiles")
        .insert({
          email: advertiserEmail,
          business_name: businessName || null,
          is_admin: false,
        })
        .select("id")
        .single()

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // If we can't create a profile, use the admin's ID as a fallback
        advertiserId = user.id
      } else {
        advertiserId = newProfile.id
      }
    }

    // Generate unique slug for landing page
    const slug = `${mailingId.substring(0, 8)}-${spotId.substring(0, 8)}`
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ecmwave.com"}/offers/${slug}`

    // Update the spot to purchased
    const { error: updateError } = await adminSupabase
      .from("ad_spots")
      .update({
        status: "purchased",
        advertiser_id: advertiserId,
        purchased_at: new Date().toISOString(),
        ad_copy_url: adCopyUrl || null,
        qr_code_data: qrCodeUrl,
        landing_page_slug: slug,
      })
      .eq("id", spotId)

    if (updateError) {
      console.error("Error updating spot:", updateError)
      return NextResponse.json({ error: "Failed to assign spot" }, { status: 500 })
    }

    // Create landing page
    const { error: landingError } = await adminSupabase
      .from("landing_pages")
      .insert({
        ad_spot_id: spotId,
        slug: slug,
        offer_description: offerText || "",
        is_published: true,
      })

    if (landingError) {
      console.error("Error creating landing page:", landingError)
      // Don't fail the whole operation if landing page creation fails
    }

    // Create a $0 payment record for tracking
    await adminSupabase
      .from("payments")
      .insert({
        advertiser_id: advertiserId,
        ad_spot_id: spotId,
        amount: 0,
        status: "completed",
        stripe_payment_id: `free_${spotId}`,
        paid_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      spotId,
      slug,
      qrCodeUrl,
      landingPageUrl: `/offers/${slug}`,
      dashboardUrl: `/dashboard/spots/${spotId}`,
    })
  } catch (error: any) {
    console.error("Assign spot error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to assign spot" },
      { status: 500 }
    )
  }
}

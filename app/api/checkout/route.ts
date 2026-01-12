import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { mailingId, spotIds, userId, offerDetails, adCopyUrl } = await request.json()

    console.log("[v0] Checkout request:", { mailingId, spotIds, userId })

    if (!mailingId || !spotIds || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", userId).single()

    // Fetch the ad spots and verify they're available
    const { data: spots, error: spotsError } = await supabase
      .from("ad_spots")
      .select("*")
      .in("id", spotIds)
      .eq("status", "available")

    if (spotsError || !spots || spots.length === 0) {
      return NextResponse.json({ error: "Invalid or unavailable spots" }, { status: 400 })
    }

    if (spots.length !== spotIds.length) {
      return NextResponse.json({ error: "Some spots are no longer available" }, { status: 400 })
    }

    // Calculate total amount
    const totalAmount = spots.reduce((sum, spot) => sum + Number.parseFloat(spot.price), 0)

    console.log("[v0] Creating Stripe session for", totalAmount, "with email:", profile?.email || session.user.email)

    const session_config: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: spots.map((spot) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Ad Spot - ${spot.side} Side, Position ${spot.grid_position}`,
            description: `Emerald Coast Marketing Wave - Mailing Campaign`,
          },
          unit_amount: Math.round(Number.parseFloat(spot.price) * 100),
        },
        quantity: 1,
      })),
      mode: "payment",
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/mailings/${mailingId}`,
      metadata: {
        userId,
        mailingId,
        spotIds: spotIds.join(","),
        offerDetails: offerDetails || "",
        adCopyUrl: adCopyUrl || "",
      },
      customer_email: profile?.email || session.user.email,
    }

    const stripeSession = await stripe.checkout.sessions.create(session_config)

    console.log("[v0] Stripe session created:", stripeSession.id, stripeSession.url)

    const updateData: any = {
      status: "reserved",
      advertiser_id: userId,
    }

    if (adCopyUrl) {
      updateData.ad_copy_url = adCopyUrl
    }

    const { error: updateError } = await supabase.from("ad_spots").update(updateData).in("id", spotIds)

    if (updateError) {
      console.error("[v0] Failed to update ad spots:", updateError)
    }

    // Create payment records
    for (const spot of spots) {
      await supabase.from("payments").insert({
        ad_spot_id: spot.id,
        advertiser_id: userId,
        stripe_payment_id: stripeSession.id,
        amount: spot.price,
        status: "pending",
      })
    }

    return NextResponse.json({
      checkoutUrl: stripeSession.url,
      spotIds: spotIds,
    })
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

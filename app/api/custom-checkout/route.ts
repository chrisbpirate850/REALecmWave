import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

export async function POST(request: Request) {
  try {
    const { spotId, mailingId, price, email } = await request.json()

    if (!spotId || !mailingId || !price || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Get the spot and mailing info
    const { data: spot, error: spotError } = await supabase
      .from("ad_spots")
      .select(`
        *,
        mailings (
          id,
          title,
          scheduled_mail_date
        )
      `)
      .eq("id", spotId)
      .eq("mailing_id", mailingId)
      .eq("status", "available")
      .single()

    if (spotError || !spot) {
      return NextResponse.json(
        { error: "Spot not found or not available" },
        { status: 404 }
      )
    }

    // Create Stripe checkout session with custom price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Ad Spot - ${spot.mailings.title}`,
              description: `Position ${spot.position} (${spot.side.toUpperCase()} - Grid ${spot.grid_position}) - Custom Price`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://ecmwave.com"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://ecmwave.com"}/mailings/${mailingId}`,
      metadata: {
        spot_id: spotId,
        mailing_id: mailingId,
        custom_price: "true",
        advertiser_email: email,
      },
    })

    // Reserve the spot
    await supabase
      .from("ad_spots")
      .update({
        status: "reserved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", spotId)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Custom checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create checkout" },
      { status: 500 }
    )
  }
}

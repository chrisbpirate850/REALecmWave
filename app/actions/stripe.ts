"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function startCheckoutSession(data: {
  spotIds: string[]
  mailingId: string
  adCopyUrl: string
  offerText: string
  userId: string
}) {
  console.log("[v0] Starting checkout session for spots:", data.spotIds)

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Verify the user matches
  if (session.user.id !== data.userId) {
    throw new Error("Unauthorized")
  }

  console.log("[v0] User authenticated:", session.user.id)

  // Get mailing details
  const { data: mailing } = await supabase
    .from("mailings")
    .select("title, scheduled_mail_date")
    .eq("id", data.mailingId)
    .single()

  if (!mailing) {
    throw new Error("Mailing not found")
  }

  console.log("[v0] Mailing found:", mailing.title)

  // Get all selected spots
  const { data: spots, error: spotsError } = await supabase
    .from("ad_spots")
    .select("*")
    .in("id", data.spotIds)
    .eq("status", "available")

  console.log("[v0] Spots query result:", { spots, spotsError })

  if (spotsError || !spots || spots.length === 0) {
    throw new Error("Invalid or unavailable spots")
  }

  if (spots.length !== data.spotIds.length) {
    throw new Error("Some spots are no longer available")
  }

  // Create line items for each spot
  const lineItems = spots.map((spot) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: `Ad Spot - ${spot.side === "front" ? "Front" : "Back"} Side, Position ${spot.grid_position}`,
        description: `${mailing.title} - Mailing on ${new Date(mailing.scheduled_mail_date).toLocaleDateString()}`,
      },
      unit_amount: Math.round(Number.parseFloat(spot.price) * 100),
    },
    quantity: 1,
  }))

  console.log("[v0] Creating Stripe checkout session...")

  // Create Stripe checkout session with embedded mode
  const checkoutSession = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    customer_email: session.user.email,
    line_items: lineItems,
    mode: "payment",
    metadata: {
      spotIds: data.spotIds.join(","),
      mailingId: data.mailingId,
      advertiserId: session.user.id,
      adCopyUrl: data.adCopyUrl,
      offerText: data.offerText,
    },
  })

  console.log("[v0] Stripe session created:", checkoutSession.id)
  console.log("[v0] Reserving spots for user:", session.user.id)

  // Reserve the spots
  const { data: updatedSpots, error: updateError } = await supabase
    .from("ad_spots")
    .update({
      status: "reserved",
      advertiser_id: session.user.id,
      ad_copy_url: data.adCopyUrl || null,
    })
    .in("id", data.spotIds)
    .select()

  console.log("[v0] Spot update result:", { updatedSpots, updateError })

  if (updateError) {
    console.error("[v0] Failed to reserve spots:", updateError)
    throw new Error(`Failed to reserve spots: ${updateError.message}`)
  }

  console.log("[v0] Creating payment records...")

  // Create payment records
  for (const spot of spots) {
    const { error: paymentError } = await supabase.from("payments").insert({
      ad_spot_id: spot.id,
      advertiser_id: session.user.id,
      stripe_payment_id: checkoutSession.id,
      amount: spot.price,
      status: "pending",
    })

    if (paymentError) {
      console.error("[v0] Failed to create payment record:", paymentError)
    }
  }

  console.log("[v0] Checkout session complete, returning client secret")

  return checkoutSession.client_secret
}

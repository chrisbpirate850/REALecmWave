import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendPurchaseConfirmationEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("[v0] Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Use admin client to bypass RLS - webhooks don't have user context
    const supabase = createAdminClient()
    console.log("[v0] Webhook received event:", event.type)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const { spotIds, mailingId, advertiserId, adCopyUrl, offerText } = session.metadata || {}

      if (!advertiserId || !spotIds || !mailingId) {
        console.error("[v0] Missing metadata in checkout session:", session.metadata)
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
      }

      const spotIdArray = spotIds.split(",")
      console.log("[v0] Processing checkout for spots:", spotIdArray)
      console.log("[v0] Metadata:", { mailingId, advertiserId, adCopyUrl, offerText })

      // Update all ad spots to purchased status
      const { data: updatedSpots, error: spotsError } = await supabase
        .from("ad_spots")
        .update({
          status: "purchased",
          advertiser_id: advertiserId,
          purchased_at: new Date().toISOString(),
          ad_copy_url: adCopyUrl || null,
        })
        .in("id", spotIdArray)
        .select()

      if (spotsError) {
        console.error("[v0] Failed to update ad spots:", spotsError)
      } else {
        console.log("[v0] Updated ad spots:", updatedSpots)
      }

      // Update payment records to completed
      const { data: updatedPayments, error: paymentsError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          paid_at: new Date().toISOString(),
        })
        .eq("stripe_payment_id", session.id)
        .eq("advertiser_id", advertiserId)
        .select()

      if (paymentsError) {
        console.error("[v0] Failed to update payments:", paymentsError)
      } else {
        console.log("[v0] Updated payments:", updatedPayments)
      }

      // Generate unique landing page and QR code for each spot
      for (const spotId of spotIdArray) {
        const slug = `${mailingId.substring(0, 8)}-${spotId.substring(0, 8)}`
        const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"}/offers/${slug}`

        // Create landing page
        const { data: landingPage, error: landingError } = await supabase
          .from("landing_pages")
          .insert({
            ad_spot_id: spotId,
            slug: slug,
            offer_description: offerText || "",
            is_published: true,
          })
          .select()
          .single()

        if (landingError) {
          console.error("[v0] Failed to create landing page for spot", spotId, ":", landingError)
        } else {
          console.log("[v0] Created landing page:", landingPage)
        }

        // Update ad spot with QR code and landing page data
        const { error: qrError } = await supabase
          .from("ad_spots")
          .update({
            qr_code_data: qrCodeUrl,
            landing_page_slug: slug,
          })
          .eq("id", spotId)

        if (qrError) {
          console.error("[v0] Failed to update QR code for spot", spotId, ":", qrError)
        } else {
          console.log("[v0] Updated QR code for spot:", spotId, "->", qrCodeUrl)
        }
      }

      console.log("[v0] Successfully processed payment for spots:", spotIdArray)

      // Send purchase confirmation email
      try {
        // Get advertiser profile and mailing details for the email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, business_name")
          .eq("id", advertiserId)
          .single()

        const { data: mailing } = await supabase
          .from("mailings")
          .select("title, scheduled_mail_date, zip_codes, estimated_recipients, price_per_spot")
          .eq("id", mailingId)
          .single()

        if (profile?.email && mailing) {
          const totalAmount = spotIdArray.length * (mailing.price_per_spot || 0)
          const mailDate = new Date(mailing.scheduled_mail_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })

          await sendPurchaseConfirmationEmail(profile.email, {
            businessName: profile.business_name || "Valued Customer",
            mailingTitle: mailing.title,
            spotCount: spotIdArray.length,
            totalAmount,
            mailDate,
            zipCodes: mailing.zip_codes || [],
            estimatedReach: mailing.estimated_recipients || 0,
            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://ecmwave.com"}/dashboard`,
          })

          console.log("[v0] Purchase confirmation email sent to:", profile.email)
        }
      } catch (emailError) {
        // Don't fail the webhook if email fails
        console.error("[v0] Failed to send purchase confirmation email:", emailError)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

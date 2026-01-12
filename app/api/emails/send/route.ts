import { NextResponse } from "next/server"
import { resend, FROM_EMAIL } from "@/lib/resend"
import PurchaseConfirmationEmail from "@/emails/purchase-confirmation"
import WelcomeEmail from "@/emails/welcome"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    if (!type || !to) {
      return NextResponse.json(
        { error: "Missing required fields: type, to" },
        { status: 400 }
      )
    }

    let emailContent
    let subject

    switch (type) {
      case "purchase_confirmation":
        subject = `Your Ad Spot is Confirmed - ${data.mailingTitle}`
        emailContent = PurchaseConfirmationEmail({
          businessName: data.businessName,
          mailingTitle: data.mailingTitle,
          spotCount: data.spotCount,
          totalAmount: data.totalAmount,
          mailDate: data.mailDate,
          zipCodes: data.zipCodes,
          estimatedReach: data.estimatedReach,
          dashboardUrl: data.dashboardUrl || "https://ecmwave.com/dashboard",
        })
        break

      case "welcome":
        subject = "Welcome to Emerald Coast Marketing Wave!"
        emailContent = WelcomeEmail({
          businessName: data.businessName,
          dashboardUrl: data.dashboardUrl || "https://ecmwave.com/dashboard",
          mailingsUrl: data.mailingsUrl || "https://ecmwave.com/mailings",
        })
        break

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      react: emailContent,
    })

    if (error) {
      console.error("[Email] Failed to send:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[Email] Sent successfully:", result?.id)
    return NextResponse.json({ success: true, id: result?.id })
  } catch (error) {
    console.error("[Email] Error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}

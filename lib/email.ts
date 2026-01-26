import { resend, FROM_EMAIL } from "./resend"
import PurchaseConfirmationEmail from "@/emails/purchase-confirmation"
import WelcomeEmail from "@/emails/welcome"

type PurchaseConfirmationData = {
  businessName: string
  mailingTitle: string
  spotCount: number
  totalAmount: number
  mailDate: string
  zipCodes: string[]
  estimatedReach: number
  dashboardUrl?: string
}

type WelcomeData = {
  businessName?: string
  dashboardUrl?: string
  mailingsUrl?: string
}

export async function sendPurchaseConfirmationEmail(
  to: string,
  data: PurchaseConfirmationData
) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Your Ad Spot is Confirmed - ${data.mailingTitle}`,
      react: PurchaseConfirmationEmail({
        businessName: data.businessName,
        mailingTitle: data.mailingTitle,
        spotCount: data.spotCount,
        totalAmount: data.totalAmount,
        mailDate: data.mailDate,
        zipCodes: data.zipCodes,
        estimatedReach: data.estimatedReach,
        dashboardUrl: data.dashboardUrl || "https://ecmwave.com/dashboard",
      }),
    })

    if (error) {
      console.error("[Email] Failed to send purchase confirmation:", error)
      return { success: false, error }
    }

    console.log("[Email] Purchase confirmation sent:", result?.id)
    return { success: true, id: result?.id }
  } catch (error) {
    console.error("[Email] Error sending purchase confirmation:", error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(to: string, data: WelcomeData = {}) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Welcome to Emerald Coast Marketing Wave!",
      react: WelcomeEmail({
        businessName: data.businessName,
        dashboardUrl: data.dashboardUrl || "https://ecmwave.com/dashboard",
        mailingsUrl: data.mailingsUrl || "https://ecmwave.com/mailings",
      }),
    })

    if (error) {
      console.error("[Email] Failed to send welcome email:", error)
      return { success: false, error }
    }

    console.log("[Email] Welcome email sent:", result?.id)
    return { success: true, id: result?.id }
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error)
    return { success: false, error }
  }
}

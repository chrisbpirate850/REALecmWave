import { resend, FROM_EMAIL } from "@/lib/resend"
import ContactFormEmail from "@/emails/contact-form"
import { NextResponse } from "next/server"

const CONTACT_EMAIL = "chris@libertysprinciples.com"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, businessName, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [CONTACT_EMAIL],
      replyTo: email,
      subject: `ECMWave Contact: ${name}${businessName ? ` - ${businessName}` : ""}`,
      react: ContactFormEmail({
        name,
        email,
        phone,
        businessName,
        message,
      }),
    })

    if (error) {
      console.error("[Contact] Failed to send email:", error)
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      )
    }

    console.log("[Contact] Email sent:", data?.id)
    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error("[Contact] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

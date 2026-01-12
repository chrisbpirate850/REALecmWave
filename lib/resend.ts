import { Resend } from "resend"

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// From address - using verified domain
export const FROM_EMAIL = "Emerald Coast Marketing Wave <noreply@ecmwave.com>"

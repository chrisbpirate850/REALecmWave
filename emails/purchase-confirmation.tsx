import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface PurchaseConfirmationEmailProps {
  businessName: string
  mailingTitle: string
  spotCount: number
  totalAmount: number
  mailDate: string
  zipCodes: string[]
  estimatedReach: number
  dashboardUrl: string
}

export default function PurchaseConfirmationEmail({
  businessName = "Your Business",
  mailingTitle = "January 2025 Mailing",
  spotCount = 1,
  totalAmount = 675,
  mailDate = "January 15, 2025",
  zipCodes = ["32578", "32541"],
  estimatedReach = 5000,
  dashboardUrl = "https://ecmwave.com/dashboard",
}: PurchaseConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your ad spot has been reserved for {mailingTitle}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Emerald Coast Marketing Wave</Text>
            <Text style={tagline}>
              Reach 5,000 Local Customers with Every Mailing
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Payment Confirmed!</Heading>

            <Text style={paragraph}>Hi {businessName},</Text>

            <Text style={paragraph}>
              Great news! Your ad spot{spotCount > 1 ? "s have" : " has"} been
              successfully reserved. You're on your way to reaching thousands of
              local customers!
            </Text>

            {/* Order Summary */}
            <Section style={orderBox}>
              <Text style={orderTitle}>Order Summary</Text>
              <Hr style={divider} />
              <table style={orderTable}>
                <tr>
                  <td style={orderLabel}>Mailing:</td>
                  <td style={orderValue}>{mailingTitle}</td>
                </tr>
                <tr>
                  <td style={orderLabel}>Ad Spots:</td>
                  <td style={orderValue}>{spotCount}</td>
                </tr>
                <tr>
                  <td style={orderLabel}>Mail Date:</td>
                  <td style={orderValue}>{mailDate}</td>
                </tr>
                <tr>
                  <td style={orderLabel}>Target Areas:</td>
                  <td style={orderValue}>{zipCodes.join(", ")}</td>
                </tr>
                <tr>
                  <td style={orderLabel}>Estimated Reach:</td>
                  <td style={orderValue}>
                    {estimatedReach.toLocaleString()} homes
                  </td>
                </tr>
                <tr>
                  <td style={{ ...orderLabel, paddingTop: "12px" }}>
                    <strong>Total Paid:</strong>
                  </td>
                  <td style={{ ...orderValue, paddingTop: "12px" }}>
                    <strong>${totalAmount.toFixed(2)}</strong>
                  </td>
                </tr>
              </table>
            </Section>

            {/* What's Next */}
            <Section style={infoBox}>
              <Text style={infoTitle}>What happens next?</Text>
              <Text style={infoText}>
                1. Your unique QR code and landing page have been created
                <br />
                2. Visit your dashboard to view analytics and download your QR
                code
                <br />
                3. If you uploaded ad copy, we'll review and finalize it
                <br />
                4. Your postcard will be printed and mailed on {mailDate}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                View Your Dashboard
              </Button>
            </Section>

            <Text style={paragraph}>
              Questions? Reply to this email or contact us at{" "}
              <Link href="mailto:support@ecmwave.com" style={link}>
                support@ecmwave.com
              </Link>
            </Text>

            <Text style={signature}>
              Thank you for choosing Emerald Coast Marketing Wave!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Emerald Coast Marketing Wave</strong>
            </Text>
            <Text style={footerText}>
              Serving Niceville, Navarre, and Gulf Breeze
            </Text>
            <Text style={footerLinks}>
              <Link href="https://ecmwave.com" style={footerLink}>
                Website
              </Link>
              {" | "}
              <Link href="https://ecmwave.com/dashboard" style={footerLink}>
                Dashboard
              </Link>
              {" | "}
              <Link href="mailto:support@ecmwave.com" style={footerLink}>
                Support
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  maxWidth: "600px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
}

const header = {
  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  padding: "40px 20px",
  textAlign: "center" as const,
}

const logo = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0 0 8px 0",
}

const tagline = {
  fontSize: "14px",
  color: "#ffffff",
  opacity: 0.95,
  margin: 0,
}

const content = {
  padding: "40px 30px",
}

const h1 = {
  color: "#059669",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 24px 0",
}

const paragraph = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
}

const orderBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
}

const orderTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 12px 0",
}

const divider = {
  borderColor: "#e2e8f0",
  margin: "12px 0",
}

const orderTable = {
  width: "100%",
}

const orderLabel = {
  color: "#64748b",
  fontSize: "14px",
  padding: "4px 0",
  verticalAlign: "top" as const,
}

const orderValue = {
  color: "#1e293b",
  fontSize: "14px",
  padding: "4px 0",
  textAlign: "right" as const,
}

const infoBox = {
  backgroundColor: "#ecfdf5",
  borderLeft: "4px solid #059669",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
}

const infoTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#059669",
  margin: "0 0 8px 0",
}

const infoText = {
  color: "#065f46",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: 0,
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#059669",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "14px 32px",
  display: "inline-block",
}

const link = {
  color: "#059669",
  textDecoration: "underline",
}

const signature = {
  color: "#4a4a4a",
  fontSize: "16px",
  marginTop: "32px",
}

const footer = {
  backgroundColor: "#fafafa",
  padding: "30px",
  textAlign: "center" as const,
  borderTop: "1px solid #ebebeb",
}

const footerText = {
  color: "#8e8e8e",
  fontSize: "14px",
  margin: "4px 0",
}

const footerLinks = {
  color: "#8e8e8e",
  fontSize: "14px",
  marginTop: "16px",
}

const footerLink = {
  color: "#059669",
  textDecoration: "none",
}

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface WelcomeEmailProps {
  businessName?: string
  dashboardUrl?: string
  mailingsUrl?: string
}

export default function WelcomeEmail({
  businessName = "there",
  dashboardUrl = "https://ecmwave.com/dashboard",
  mailingsUrl = "https://ecmwave.com/mailings",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to Emerald Coast Marketing Wave - Start reaching local customers
        today!
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
            <Heading style={h1}>Welcome to ECM Wave!</Heading>

            <Text style={paragraph}>Hi {businessName},</Text>

            <Text style={paragraph}>
              Thank you for joining Emerald Coast Marketing Wave! You've taken
              the first step toward reaching thousands of local customers in
              Niceville, Navarre, and Gulf Breeze.
            </Text>

            {/* Benefits */}
            <Section style={benefitsBox}>
              <Text style={benefitsTitle}>What you get with ECM Wave:</Text>
              <Hr style={divider} />
              <Text style={benefitItem}>
                <strong>Premium 9x12 Postcards</strong> - Impossible to ignore,
                these large-format postcards demand attention
              </Text>
              <Text style={benefitItem}>
                <strong>Shared Cost, Maximum Reach</strong> - Share postcard
                space with other businesses at a fraction of solo mailing costs
              </Text>
              <Text style={benefitItem}>
                <strong>Trackable QR Codes</strong> - Every ad includes a unique
                QR code so you can measure engagement
              </Text>
              <Text style={benefitItem}>
                <strong>Real-Time Analytics</strong> - See how many people scan
                your code and visit your landing page
              </Text>
            </Section>

            {/* CTA */}
            <Section style={ctaBox}>
              <Text style={ctaTitle}>Ready to get started?</Text>
              <Text style={ctaText}>
                Browse our upcoming mailings and reserve your ad spot today.
                Spots fill up fast!
              </Text>
              <Section style={buttonContainer}>
                <Button style={button} href={mailingsUrl}>
                  Browse Available Mailings
                </Button>
              </Section>
            </Section>

            <Text style={paragraph}>
              Have questions? We're here to help! Reply to this email or visit
              your{" "}
              <Link href={dashboardUrl} style={link}>
                dashboard
              </Link>{" "}
              to manage your account.
            </Text>

            <Text style={signature}>
              Welcome aboard!
              <br />
              The ECM Wave Team
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
              <Link href="https://ecmwave.com/mailings" style={footerLink}>
                Mailings
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

const benefitsBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
}

const benefitsTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 12px 0",
}

const divider = {
  borderColor: "#e2e8f0",
  margin: "12px 0",
}

const benefitItem = {
  color: "#4a4a4a",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "12px 0",
  paddingLeft: "8px",
  borderLeft: "3px solid #059669",
}

const ctaBox = {
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
}

const ctaTitle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#059669",
  margin: "0 0 8px 0",
}

const ctaText = {
  color: "#065f46",
  fontSize: "14px",
  margin: "0 0 16px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
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
  lineHeight: "1.6",
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

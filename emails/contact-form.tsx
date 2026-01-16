import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface ContactFormEmailProps {
  name: string
  email: string
  phone?: string
  businessName?: string
  message: string
}

export default function ContactFormEmail({
  name,
  email,
  phone,
  businessName,
  message,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Contact Form Submission</Heading>
          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Name</Text>
            <Text style={value}>{name}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Email</Text>
            <Text style={value}>{email}</Text>
          </Section>

          {phone && (
            <Section style={section}>
              <Text style={label}>Phone</Text>
              <Text style={value}>{phone}</Text>
            </Section>
          )}

          {businessName && (
            <Section style={section}>
              <Text style={label}>Business Name</Text>
              <Text style={value}>{businessName}</Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Message</Text>
            <Text style={messageStyle}>{message}</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            This message was sent via the ECMWave contact form.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  maxWidth: "600px",
}

const heading = {
  color: "#059669",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 20px",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const section = {
  marginBottom: "16px",
}

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
}

const value = {
  color: "#1f2937",
  fontSize: "16px",
  margin: "0",
}

const messageStyle = {
  color: "#1f2937",
  fontSize: "16px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "6px",
}

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "20px 0 0",
}

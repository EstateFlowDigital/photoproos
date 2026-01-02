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
} from "@react-email/components";

interface ClientMagicLinkEmailProps {
  clientName: string;
  magicLinkUrl: string;
  expiresInMinutes?: number;
}

export function ClientMagicLinkEmail({
  clientName,
  magicLinkUrl,
  expiresInMinutes = 15,
}: ClientMagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your secure login link for the client portal</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <div style={logoContainer}>
              <div style={logoIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span style={logoText}>PhotoProOS</span>
            </div>
          </Section>

          <Heading style={heading}>Sign in to your Client Portal</Heading>

          <Text style={paragraph}>Hi {clientName},</Text>

          <Text style={paragraph}>
            Click the button below to securely access your client portal. You'll be
            able to view your galleries, download photos, and access all your
            property websites.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={magicLinkUrl}>
              Access Client Portal
            </Button>
          </Section>

          <Text style={secondaryText}>
            This link will expire in {expiresInMinutes} minutes. If you didn't
            request this login link, you can safely ignore this email.
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            If the button above doesn't work, copy and paste this URL into your
            browser:
          </Text>
          <Text style={linkText}>
            <Link href={magicLinkUrl} style={link}>
              {magicLinkUrl}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Powered by{" "}
            <Link href="https://photoproos.com" style={footerLink}>
              PhotoProOS
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ClientMagicLinkEmail;

// Styles
const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#141414",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "16px",
  maxWidth: "560px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoContainer = {
  display: "inline-flex",
  alignItems: "center",
  gap: "12px",
};

const logoIcon = {
  backgroundColor: "#3b82f6",
  borderRadius: "12px",
  padding: "10px",
  display: "inline-flex",
};

const logoText = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const paragraph = {
  color: "#a7a7a7",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const secondaryText = {
  color: "#7c7c7c",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#262626",
  margin: "24px 0",
};

const footerText = {
  color: "#7c7c7c",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const linkText = {
  margin: "0 0 16px",
};

const link = {
  color: "#3b82f6",
  fontSize: "12px",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#7c7c7c",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};

const footerLink = {
  color: "#3b82f6",
  textDecoration: "none",
};

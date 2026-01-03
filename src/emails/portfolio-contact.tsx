import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PortfolioContactEmailProps {
  photographerName: string;
  portfolioName: string;
  portfolioUrl: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
}

export function PortfolioContactEmail({
  photographerName = "Photographer",
  portfolioName = "My Portfolio",
  portfolioUrl = "https://app.photoproos.com/portfolio/example",
  senderName = "John Doe",
  senderEmail = "john@example.com",
  senderPhone,
  message = "I'm interested in your work!",
}: PortfolioContactEmailProps) {
  const previewText = `New inquiry from ${senderName} via your portfolio "${portfolioName}"`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>New Portfolio Inquiry!</Heading>

            <Text style={paragraph}>Hi {photographerName},</Text>

            <Text style={paragraph}>
              Someone has reached out through your portfolio{" "}
              <strong>&quot;{portfolioName}&quot;</strong>. Here are their
              details:
            </Text>

            {/* Contact Info Box */}
            <Section style={contactBox}>
              <Text style={contactBoxTitle}>Contact Information</Text>
              <Text style={contactDetail}>
                <strong>Name:</strong> {senderName}
              </Text>
              <Text style={contactDetail}>
                <strong>Email:</strong>{" "}
                <Link href={`mailto:${senderEmail}`} style={emailLink}>
                  {senderEmail}
                </Link>
              </Text>
              {senderPhone && (
                <Text style={contactDetail}>
                  <strong>Phone:</strong>{" "}
                  <Link href={`tel:${senderPhone}`} style={emailLink}>
                    {senderPhone}
                  </Link>
                </Text>
              )}
            </Section>

            {/* Message Section */}
            <Section style={messageSection}>
              <Text style={contactBoxTitle}>Message</Text>
              <Text style={messageText}>&quot;{message}&quot;</Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={`mailto:${senderEmail}`}>
                Reply to {senderName}
              </Button>
            </Section>

            <Section style={buttonSection}>
              <Button style={secondaryButton} href={portfolioUrl}>
                View Portfolio
              </Button>
            </Section>

            <Text style={tipText}>
              Tip: Respond quickly to inquiries for the best chance of booking!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              The Business OS for Professional Photographers
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PortfolioContactEmail;

// Styles
const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const contentSection = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  padding: "40px 32px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const heading = {
  color: "#8b5cf6",
  fontSize: "28px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const paragraph = {
  color: "#a7a7a7",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const contactBox = {
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const contactBoxTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 12px 0",
};

const contactDetail = {
  color: "#a7a7a7",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 8px 0",
};

const emailLink = {
  color: "#8b5cf6",
  textDecoration: "none",
};

const messageSection = {
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const messageText = {
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "24px",
  fontStyle: "italic",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "16px 0",
};

const button = {
  backgroundColor: "#8b5cf6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const secondaryButton = {
  backgroundColor: "transparent",
  borderRadius: "8px",
  color: "#8b5cf6",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 24px",
  border: "1px solid #8b5cf6",
};

const tipText = {
  color: "#7c7c7c",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "24px 0 0 0",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
};

const footerText = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "4px 0",
};

const footerLink = {
  color: "#8b5cf6",
  textDecoration: "none",
};

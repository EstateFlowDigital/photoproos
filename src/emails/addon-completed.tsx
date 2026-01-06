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

interface AddonCompletedEmailProps {
  clientName: string;
  photographerName: string;
  galleryName: string;
  addonName: string;
  deliveryNote?: string | null;
  galleryUrl: string;
}

export function AddonCompletedEmail({
  clientName = "Client",
  photographerName = "Photographer",
  galleryName = "Photo Gallery",
  addonName = "Virtual Staging",
  deliveryNote,
  galleryUrl = "https://app.photoproos.com",
}: AddonCompletedEmailProps) {
  const previewText = `Your ${addonName} request is complete!`;

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
            {/* Success Icon */}
            <div style={iconWrapper}>
              <div style={checkIcon}>✓</div>
            </div>

            <Heading style={heading}>Request Complete!</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Great news! <strong>{photographerName}</strong> has completed your{" "}
              <strong>{addonName}</strong> request for <strong>{galleryName}</strong>.
            </Text>

            {deliveryNote && (
              <Section style={noteBox}>
                <Text style={noteBoxTitle}>Message from {photographerName}</Text>
                <Text style={noteText}>&quot;{deliveryNote}&quot;</Text>
              </Section>
            )}

            <Text style={paragraph}>
              Visit your gallery to view the completed work.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={galleryUrl}>
                View Gallery
              </Button>
            </Section>

            <Text style={tipText}>
              We hope you love the results! If you have any questions, feel free to reach out.
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

export default AddonCompletedEmail;

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

const iconWrapper = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const checkIcon = {
  display: "inline-block",
  width: "56px",
  height: "56px",
  lineHeight: "56px",
  borderRadius: "50%",
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  color: "#22c55e",
  fontSize: "28px",
  fontWeight: "700",
};

const heading = {
  color: "#22c55e", // Green for completion
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

const noteBox = {
  backgroundColor: "#1e1e1e",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid rgba(34, 197, 94, 0.2)", // Green tint
};

const noteBoxTitle = {
  color: "#7c7c7c",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 12px 0",
};

const noteText = {
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "24px",
  fontStyle: "italic",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
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
  color: "#3b82f6",
  textDecoration: "none",
};

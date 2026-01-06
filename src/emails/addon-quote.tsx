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

interface AddonQuoteEmailProps {
  clientName: string;
  photographerName: string;
  galleryName: string;
  addonName: string;
  quoteCents: number;
  quoteDescription?: string | null;
  galleryUrl: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function AddonQuoteEmail({
  clientName = "Client",
  photographerName = "Photographer",
  galleryName = "Photo Gallery",
  addonName = "Virtual Staging",
  quoteCents = 9900,
  quoteDescription,
  galleryUrl = "https://app.photoproos.com",
}: AddonQuoteEmailProps) {
  const previewText = `Quote received: ${formatCurrency(quoteCents)} for ${addonName}`;

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
            <Heading style={heading}>Quote Received!</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Great news! <strong>{photographerName}</strong> has sent you a quote for your{" "}
              <strong>{addonName}</strong> request on <strong>{galleryName}</strong>.
            </Text>

            {/* Quote Box */}
            <Section style={quoteBox}>
              <Text style={quoteBoxTitle}>Quote Details</Text>
              <Text style={addonNameText}>{addonName}</Text>
              <Text style={priceText}>{formatCurrency(quoteCents)}</Text>
              {quoteDescription && (
                <Text style={descriptionText}>{quoteDescription}</Text>
              )}
            </Section>

            <Text style={paragraph}>
              To approve or decline this quote, please visit your gallery.
            </Text>

            <Section style={buttonSection}>
              <Button style={approveButton} href={galleryUrl}>
                View Quote & Respond
              </Button>
            </Section>

            <Text style={tipText}>
              Once approved, {photographerName} will begin working on your request.
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

export default AddonQuoteEmail;

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
  color: "#3b82f6", // Blue for quotes
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

const quoteBox = {
  backgroundColor: "#1e1e1e",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(59, 130, 246, 0.3)", // Blue tint
  textAlign: "center" as const,
};

const quoteBoxTitle = {
  color: "#7c7c7c",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 12px 0",
};

const addonNameText = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const priceText = {
  color: "#3b82f6",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0 0 12px 0",
};

const descriptionText = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const approveButton = {
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

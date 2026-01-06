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

interface AddonRequestEmailProps {
  photographerName: string;
  clientName: string;
  clientEmail: string;
  galleryName: string;
  addonName: string;
  addonCategory: string;
  priceCents?: number | null;
  selectedPhotoCount?: number;
  notes?: string | null;
  galleryUrl: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function AddonRequestEmail({
  photographerName = "Photographer",
  clientName = "Client",
  clientEmail = "client@example.com",
  galleryName = "Photo Gallery",
  addonName = "Virtual Staging",
  addonCategory = "virtual_staging",
  priceCents,
  selectedPhotoCount = 0,
  notes,
  galleryUrl = "https://app.photoproos.com",
}: AddonRequestEmailProps) {
  const previewText = `New add-on request: ${addonName} for ${galleryName}`;

  const categoryLabels: Record<string, string> = {
    enhancement: "Photo Enhancement",
    virtual_staging: "Virtual Staging",
    marketing: "Marketing Materials",
    video: "Video Production",
    print: "Print Products",
    editing: "Photo Editing",
    removal: "Object Removal",
    other: "Other Service",
  };

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
            <Heading style={heading}>New Add-on Request!</Heading>

            <Text style={paragraph}>Hi {photographerName},</Text>

            <Text style={paragraph}>
              <strong>{clientName}</strong> has requested an add-on service for their gallery{" "}
              <strong>{galleryName}</strong>.
            </Text>

            {/* Request Info Box */}
            <Section style={requestBox}>
              <Text style={requestBoxTitle}>Request Details</Text>
              <Text style={requestDetail}>
                <strong>Service:</strong> {addonName}
              </Text>
              <Text style={requestDetail}>
                <strong>Category:</strong> {categoryLabels[addonCategory] || addonCategory}
              </Text>
              {priceCents ? (
                <Text style={requestDetail}>
                  <strong>Listed Price:</strong> {formatCurrency(priceCents)}
                </Text>
              ) : (
                <Text style={requestDetail}>
                  <strong>Pricing:</strong> Quote required
                </Text>
              )}
              {selectedPhotoCount > 0 && (
                <Text style={requestDetail}>
                  <strong>Photos Selected:</strong> {selectedPhotoCount}
                </Text>
              )}
            </Section>

            {/* Client Info */}
            <Section style={clientBox}>
              <Text style={requestBoxTitle}>Client Information</Text>
              <Text style={requestDetail}>
                <strong>Name:</strong> {clientName}
              </Text>
              <Text style={requestDetail}>
                <strong>Email:</strong>{" "}
                <Link href={`mailto:${clientEmail}`} style={emailLink}>
                  {clientEmail}
                </Link>
              </Text>
            </Section>

            {notes && (
              <Section style={messageSection}>
                <Text style={requestBoxTitle}>Client Notes</Text>
                <Text style={messageText}>&quot;{notes}&quot;</Text>
              </Section>
            )}

            <Section style={buttonSection}>
              <Button style={button} href={galleryUrl}>
                View Gallery & Respond
              </Button>
            </Section>

            <Text style={tipText}>
              {priceCents
                ? "The client is waiting for your confirmation to proceed."
                : "Send a quote to the client to proceed with this request."}
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

export default AddonRequestEmail;

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
  color: "#8b5cf6", // Purple for add-ons/AI color
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

const requestBox = {
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid rgba(139, 92, 246, 0.2)", // Purple tint
};

const clientBox = {
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const requestBoxTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 12px 0",
};

const requestDetail = {
  color: "#a7a7a7",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 8px 0",
};

const emailLink = {
  color: "#3b82f6",
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
  margin: "24px 0",
};

const button = {
  backgroundColor: "#8b5cf6", // Purple for add-ons
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

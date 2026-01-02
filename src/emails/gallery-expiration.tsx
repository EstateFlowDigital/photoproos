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

interface GalleryExpirationEmailProps {
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  daysRemaining: number;
  photographerName: string;
  urgency: "reminder" | "warning" | "urgent";
}

export function GalleryExpirationEmail({
  clientName = "there",
  galleryName = "Your Gallery",
  galleryUrl = "https://app.photoproos.com",
  daysRemaining = 7,
  photographerName = "Your Photographer",
  urgency = "reminder",
}: GalleryExpirationEmailProps) {
  const previewText =
    daysRemaining <= 1
      ? `Last chance to download your photos from ${galleryName}!`
      : `Your gallery "${galleryName}" expires in ${daysRemaining} days`;

  const headingText =
    daysRemaining <= 1
      ? "Final Reminder!"
      : daysRemaining <= 3
        ? "Your Gallery Expires Soon"
        : "Gallery Expiration Reminder";

  const urgencyColors = {
    reminder: "#3b82f6", // Blue
    warning: "#f97316", // Orange
    urgent: "#ef4444", // Red
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

          {/* Urgency Banner */}
          {urgency !== "reminder" && (
            <Section
              style={{
                ...urgencyBanner,
                backgroundColor:
                  urgency === "urgent"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(249, 115, 22, 0.1)",
                borderColor: urgencyColors[urgency],
              }}
            >
              <Text
                style={{
                  ...urgencyText,
                  color: urgencyColors[urgency],
                }}
              >
                {urgency === "urgent"
                  ? "⚠️ FINAL NOTICE - Downloads expire tomorrow!"
                  : `⏰ Only ${daysRemaining} days left to download your photos`}
              </Text>
            </Section>
          )}

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>{headingText}</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              {daysRemaining <= 1
                ? `This is your final reminder that your gallery "${galleryName}" will expire tomorrow. After expiration, you will no longer be able to view or download your photos.`
                : daysRemaining <= 3
                  ? `Your gallery "${galleryName}" will expire in ${daysRemaining} days. Please make sure to download your photos before then.`
                  : `Just a friendly reminder that your gallery "${galleryName}" will expire in ${daysRemaining} days. Make sure to download all your favorite photos before then!`}
            </Text>

            <Section style={buttonSection}>
              <Button
                style={{
                  ...button,
                  backgroundColor: urgencyColors[urgency],
                }}
                href={galleryUrl}
              >
                {daysRemaining <= 1
                  ? "Download Now Before It's Too Late"
                  : "View & Download Photos"}
              </Button>
            </Section>

            {/* Quick Tips */}
            <Section style={tipsSection}>
              <Text style={tipsHeading}>Quick Tips:</Text>
              <Text style={tipItem}>
                • Use the "Download All" button to get all photos at once
              </Text>
              <Text style={tipItem}>
                • Favorite your must-have photos for quick access
              </Text>
              <Text style={tipItem}>
                • Need more time? Reply to request an extension
              </Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions or need an extension, please don&apos;t
              hesitate to reach out.
            </Text>

            <Text style={signoff}>
              Best regards,
              <br />
              {photographerName}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by {photographerName} via{" "}
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

export default GalleryExpirationEmail;

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

const urgencyBanner = {
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "24px",
  border: "1px solid",
};

const urgencyText = {
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "0",
};

const contentSection = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  padding: "40px 32px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const heading = {
  color: "#ffffff",
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

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const tipsSection = {
  backgroundColor: "rgba(59, 130, 246, 0.05)",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
  border: "1px solid rgba(59, 130, 246, 0.1)",
};

const tipsHeading = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const tipItem = {
  color: "#7c7c7c",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
};

const signoff = {
  color: "#a7a7a7",
  fontSize: "16px",
  lineHeight: "24px",
  marginTop: "32px",
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

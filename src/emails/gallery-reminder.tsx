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

interface GalleryReminderEmailProps {
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  photographerName: string;
  photoCount?: number;
  priceCents?: number;
  reminderType: "not_viewed" | "not_paid";
  daysSinceDelivery: number;
}

export function GalleryReminderEmail({
  clientName = "there",
  galleryName = "Your Gallery",
  galleryUrl = "https://app.photoproos.com",
  photographerName = "Your Photographer",
  photoCount = 0,
  priceCents = 0,
  reminderType = "not_viewed",
  daysSinceDelivery = 3,
}: GalleryReminderEmailProps) {
  const isPaymentReminder = reminderType === "not_paid";
  const formattedPrice = priceCents
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(priceCents / 100)
    : "";

  const previewText = isPaymentReminder
    ? `Complete your purchase to download photos from ${galleryName}`
    : `Your photos are waiting! View your gallery "${galleryName}"`;

  const headingText = isPaymentReminder
    ? "Complete Your Purchase"
    : "Your Photos Are Ready!";

  const mainMessage = isPaymentReminder
    ? `Your gallery "${galleryName}" is ready for purchase. Complete your payment to download all ${photoCount} high-resolution photos.`
    : `We noticed you haven't had a chance to view your gallery "${galleryName}" yet. Your ${photoCount} photos are ready and waiting for you!`;

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
            <Heading style={heading}>{headingText}</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>{mainMessage}</Text>

            {/* Gallery Preview */}
            <Section style={galleryPreview}>
              <Text style={galleryLabel}>Gallery</Text>
              <Text style={galleryTitle}>{galleryName}</Text>
              <Text style={galleryMeta}>
                {photoCount} photos
                {priceCents > 0 && ` • ${formattedPrice}`}
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={galleryUrl}>
                {isPaymentReminder ? "Complete Purchase" : "View Gallery"}
              </Button>
            </Section>

            {/* Benefits */}
            <Section style={benefitsSection}>
              <Text style={benefitsHeading}>What you&apos;ll get:</Text>
              <Text style={benefitItem}>
                • High-resolution photos ready for download
              </Text>
              <Text style={benefitItem}>
                • Easy-to-use gallery with favorites & sharing
              </Text>
              <Text style={benefitItem}>
                • Secure, private access to your photos
              </Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions, please don&apos;t hesitate to reach
              out. We&apos;re here to help!
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

export default GalleryReminderEmail;

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

const galleryPreview = {
  backgroundColor: "rgba(59, 130, 246, 0.05)",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid rgba(59, 130, 246, 0.1)",
  textAlign: "center" as const,
};

const galleryLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px 0",
};

const galleryTitle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const galleryMeta = {
  color: "#a7a7a7",
  fontSize: "14px",
  margin: "0",
};

const buttonSection = {
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

const benefitsSection = {
  backgroundColor: "rgba(34, 197, 94, 0.05)",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
  border: "1px solid rgba(34, 197, 94, 0.1)",
};

const benefitsHeading = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const benefitItem = {
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

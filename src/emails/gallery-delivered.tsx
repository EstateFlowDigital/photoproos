import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface GalleryDeliveredEmailProps {
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  photographerName: string;
  photographerLogo?: string | null;
  photoCount?: number;
  expiresAt?: string;
  // Review gate integration
  reviewUrl?: string;
  showReviewCta?: boolean;
  primaryColor?: string;
}

export function GalleryDeliveredEmail({
  clientName = "there",
  galleryName = "Your Gallery",
  galleryUrl = "https://app.photoproos.com",
  photographerName = "Your Photographer",
  photographerLogo,
  photoCount,
  expiresAt,
  reviewUrl,
  showReviewCta = false,
  primaryColor = "#3b82f6",
}: GalleryDeliveredEmailProps) {
  const previewText = `Your photos from ${galleryName} are ready to view`;
  const expiresDate = expiresAt ? new Date(expiresAt) : null;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            {photographerLogo ? (
              <Img
                src={photographerLogo}
                alt={photographerName}
                width={180}
                height={60}
                style={logoImage}
              />
            ) : (
              <Heading style={logoText}>{photographerName}</Heading>
            )}
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>Your Photos Are Ready!</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Great news! Your photos from <strong>{galleryName}</strong> are now
              available for viewing and download.
            </Text>

            {photoCount && (
              <Text style={paragraph}>
                There are <strong>{photoCount} photos</strong> waiting for you.
              </Text>
            )}

            <Section style={buttonSection}>
              <Button style={button} href={galleryUrl}>
                View Your Gallery
              </Button>
            </Section>

            {expiresDate && (
              <Text style={expiryNote}>
                Note: This gallery will be available until{" "}
                {expiresDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            )}

            <Text style={paragraph}>
              If you have any questions about your photos, please don&apos;t hesitate
              to reach out.
            </Text>

            <Text style={signoff}>
              Best regards,
              <br />
              {photographerName}
            </Text>
          </Section>

          {/* Review CTA - Optional */}
          {showReviewCta && reviewUrl && (
            <Section style={reviewSection}>
              <div style={reviewIconSection}>
                <Text style={reviewStarIcon}>
                  <span style={{ fontSize: "32px" }}>&#9733;</span>
                </Text>
              </div>
              <Text style={reviewHeading}>Enjoyed your photos?</Text>
              <Text style={reviewText}>
                We&apos;d love to hear about your experience! Your feedback helps us improve
                and helps others find great photography.
              </Text>
              <Section style={{ textAlign: "center" as const, margin: "20px 0" }}>
                <Button style={{ ...reviewButton, backgroundColor: primaryColor }} href={reviewUrl}>
                  Share Your Feedback
                </Button>
              </Section>
            </Section>
          )}

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

export default GalleryDeliveredEmail;

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

const expiryNote = {
  color: "#7c7c7c",
  fontSize: "14px",
  fontStyle: "italic",
  textAlign: "center" as const,
  margin: "16px 0",
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

const logoImage = {
  margin: "0 auto",
  maxWidth: "180px",
  height: "auto",
};

// Review CTA styles
const reviewSection = {
  backgroundColor: "rgba(251, 191, 36, 0.05)",
  borderRadius: "12px",
  padding: "32px 24px",
  marginTop: "24px",
  border: "1px solid rgba(251, 191, 36, 0.15)",
  textAlign: "center" as const,
};

const reviewIconSection = {
  textAlign: "center" as const,
  marginBottom: "12px",
};

const reviewStarIcon = {
  color: "#fbbf24",
  fontSize: "32px",
  margin: "0",
  lineHeight: "1",
};

const reviewHeading = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
};

const reviewText = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  textAlign: "center" as const,
};

const reviewButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

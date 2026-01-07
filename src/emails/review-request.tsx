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

interface ReviewRequestEmailProps {
  clientName: string;
  photographerName: string;
  photographerLogo?: string | null;
  reviewUrl: string;
  projectName?: string;
  primaryColor?: string;
}

export function ReviewRequestEmail({
  clientName = "there",
  photographerName = "Your Photographer",
  photographerLogo,
  reviewUrl = "https://app.photoproos.com/review/token",
  projectName,
  primaryColor = "#3b82f6",
}: ReviewRequestEmailProps) {
  const previewText = `${photographerName} would love to hear about your experience`;

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
            {/* Star Icon */}
            <Section style={iconSection}>
              <Text style={starIcon}>
                <span style={{ fontSize: "48px" }}>&#9733;</span>
              </Text>
            </Section>

            <Heading style={heading}>How did we do?</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Thank you for choosing {photographerName}
              {projectName ? ` for ${projectName}` : ""}! We hope you loved your
              photos.
            </Text>

            <Text style={paragraph}>
              We&apos;d really appreciate if you could take a moment to share
              your experience. Your feedback helps us improve and helps other
              clients find us.
            </Text>

            {/* Stars Preview */}
            <Section style={starsSection}>
              <Text style={starsText}>&#9733; &#9733; &#9733; &#9733; &#9733;</Text>
              <Text style={starsLabel}>Click below to rate your experience</Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={{ ...button, backgroundColor: primaryColor }} href={reviewUrl}>
                Share Your Feedback
              </Button>
            </Section>

            <Text style={noteText}>
              It only takes about 30 seconds and your feedback means the world
              to us!
            </Text>

            <Text style={signoff}>
              Thank you so much,
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

export default ReviewRequestEmail;

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

const logoImage = {
  margin: "0 auto",
  maxWidth: "180px",
  height: "auto",
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

const iconSection = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const starIcon = {
  color: "#fbbf24",
  fontSize: "48px",
  margin: "0",
  lineHeight: "1",
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

const starsSection = {
  backgroundColor: "rgba(251, 191, 36, 0.05)",
  borderRadius: "8px",
  padding: "24px 20px",
  margin: "24px 0",
  border: "1px solid rgba(251, 191, 36, 0.1)",
  textAlign: "center" as const,
};

const starsText = {
  color: "#fbbf24",
  fontSize: "32px",
  letterSpacing: "8px",
  margin: "0 0 8px 0",
};

const starsLabel = {
  color: "#7c7c7c",
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

const noteText = {
  color: "#7c7c7c",
  fontSize: "14px",
  textAlign: "center" as const,
  fontStyle: "italic" as const,
  margin: "0 0 24px 0",
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

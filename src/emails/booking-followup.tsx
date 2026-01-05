"use client";

import {
  Body,
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

interface BookingFollowupEmailProps {
  clientName: string;
  bookingTitle: string;
  bookingDate: string;
  serviceName?: string;
  photographerName: string;
  photographerEmail?: string;
  reviewUrl?: string;
  rebookUrl?: string;
  galleryUrl?: string;
  followupType: "thank_you" | "review_request" | "rebook_reminder";
}

export function BookingFollowupEmail({
  clientName,
  bookingTitle,
  bookingDate,
  serviceName,
  photographerName,
  photographerEmail,
  reviewUrl,
  rebookUrl,
  galleryUrl,
  followupType,
}: BookingFollowupEmailProps) {
  const getSubjectContent = () => {
    switch (followupType) {
      case "thank_you":
        return {
          preview: `Thank you for choosing ${photographerName}!`,
          heading: "Thank You for Your Business!",
          message: `We hope you had a wonderful experience during your ${serviceName || "session"}. It was a pleasure working with you!`,
        };
      case "review_request":
        return {
          preview: `How was your experience with ${photographerName}?`,
          heading: "We'd Love Your Feedback",
          message: `Your opinion matters to us! If you enjoyed your ${serviceName || "session"}, we'd be grateful if you could take a moment to share your experience.`,
        };
      case "rebook_reminder":
        return {
          preview: `Ready for your next session with ${photographerName}?`,
          heading: "Time to Book Your Next Session?",
          message: `It's been a while since your last ${serviceName || "session"}. We'd love to work with you again!`,
        };
    }
  };

  const content = getSubjectContent();

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>{photographerName}</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={heading}>{content.heading}</Heading>

            <Text style={greeting}>Hi {clientName},</Text>

            <Text style={paragraph}>{content.message}</Text>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Session Details</Text>
              <Text style={detailsText}>
                <strong>Session:</strong> {bookingTitle}
              </Text>
              <Text style={detailsText}>
                <strong>Date:</strong> {bookingDate}
              </Text>
              {serviceName && (
                <Text style={detailsText}>
                  <strong>Service:</strong> {serviceName}
                </Text>
              )}
            </Section>

            {followupType === "thank_you" && galleryUrl && (
              <Section style={ctaSection}>
                <Link href={galleryUrl} style={ctaButton}>
                  View Your Gallery
                </Link>
              </Section>
            )}

            {followupType === "review_request" && reviewUrl && (
              <Section style={ctaSection}>
                <Link href={reviewUrl} style={ctaButton}>
                  Leave a Review
                </Link>
                <Text style={smallText}>
                  Your feedback helps other clients find us and helps us improve our services.
                </Text>
              </Section>
            )}

            {followupType === "rebook_reminder" && rebookUrl && (
              <Section style={ctaSection}>
                <Link href={rebookUrl} style={ctaButton}>
                  Book Your Next Session
                </Link>
              </Section>
            )}

            <Hr style={divider} />

            <Text style={paragraph}>
              If you have any questions or feedback, feel free to reach out.
              We're always here to help!
            </Text>

            <Text style={signature}>
              Best regards,
              <br />
              {photographerName}
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              {photographerEmail && (
                <>
                  Questions? Reply to{" "}
                  <Link href={`mailto:${photographerEmail}`} style={footerLink}>
                    {photographerEmail}
                  </Link>
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Email styles - Dovetail-inspired dark theme
const main = {
  backgroundColor: "#0A0A0A",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0",
};

const contentSection = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  padding: "32px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const greeting = {
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const paragraph = {
  color: "#A7A7A7",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const detailsBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const detailsTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const detailsText = {
  color: "#A7A7A7",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px 0",
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "24px",
};

const ctaButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 32px",
  textDecoration: "none",
};

const smallText = {
  color: "#7C7C7C",
  fontSize: "13px",
  lineHeight: "20px",
  marginTop: "12px",
};

const divider = {
  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  margin: "24px 0",
};

const signature = {
  color: "#A7A7A7",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const footerText = {
  color: "#7C7C7C",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
};

const footerLink = {
  color: "#3b82f6",
  textDecoration: "none",
};

export default BookingFollowupEmail;

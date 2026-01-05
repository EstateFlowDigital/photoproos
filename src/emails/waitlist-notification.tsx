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

interface WaitlistNotificationEmailProps {
  clientName: string;
  serviceName?: string;
  preferredDate: string;
  expiresAt: string;
  bookingUrl: string;
  photographerName: string;
  photographerEmail?: string;
}

export function WaitlistNotificationEmail({
  clientName = "there",
  serviceName,
  preferredDate = new Date().toISOString(),
  expiresAt = new Date().toISOString(),
  bookingUrl = "#",
  photographerName = "Your Photographer",
  photographerEmail,
}: WaitlistNotificationEmailProps) {
  const previewText = `A spot is now available${serviceName ? ` for ${serviceName}` : ""}!`;
  const formattedPreferredDate = new Date(preferredDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedExpiresAt = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

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
            <Section style={urgentBadge}>
              <Text style={bellIcon}>🔔</Text>
              <Text style={urgentText}>Spot Available!</Text>
            </Section>

            <Heading style={heading}>
              {serviceName ? `${serviceName} Availability` : "Booking Availability"}
            </Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Great news! A spot has opened up with {photographerName} and you&apos;re
              at the top of our waitlist.
            </Text>

            {/* Booking Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Waitlist Details</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailIcon}>📆</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Your Preferred Date</Text>
                  <Text style={detailValue}>{formattedPreferredDate}</Text>
                </Section>
              </Section>

              {serviceName && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📷</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Service</Text>
                    <Text style={detailValue}>{serviceName}</Text>
                  </Section>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailIcon}>⏰</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Respond By</Text>
                  <Text style={detailValueUrgent}>{formattedExpiresAt}</Text>
                </Section>
              </Section>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button href={bookingUrl} style={ctaButton}>
                Book Your Spot Now
              </Button>
            </Section>

            <Section style={warningSection}>
              <Text style={warningText}>
                ⚠️ This spot will be offered to the next person on the waitlist if
                we don&apos;t hear from you by {formattedExpiresAt}.
              </Text>
            </Section>

            <Text style={paragraph}>
              If you&apos;re no longer interested or have any questions, please
              contact {photographerName} directly
              {photographerEmail && (
                <>
                  {" "}
                  at{" "}
                  <Link href={`mailto:${photographerEmail}`} style={link}>
                    {photographerEmail}
                  </Link>
                </>
              )}
              .
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This notification was sent by {photographerName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              You&apos;re receiving this because you joined the waitlist.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WaitlistNotificationEmail;

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

const urgentBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const bellIcon = {
  fontSize: "48px",
  margin: "0",
};

const urgentText = {
  color: "#f97316",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "8px 0 0 0",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
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

const detailsBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const detailsTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
};

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "16px 0",
};

const detailRow = {
  display: "flex",
  marginBottom: "16px",
};

const detailIcon = {
  fontSize: "20px",
  marginRight: "12px",
  width: "24px",
};

const detailContent = {
  flex: "1",
};

const detailLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const detailValue = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
};

const detailValueUrgent = {
  color: "#f97316",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const ctaButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const warningSection = {
  backgroundColor: "rgba(249, 115, 22, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  borderLeft: "3px solid #f97316",
};

const warningText = {
  color: "#f97316",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "none",
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

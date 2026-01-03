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

interface BookingFormSubmittedEmailProps {
  clientName: string;
  serviceName?: string;
  preferredDate?: string;
  preferredTime?: string;
  photographerName: string;
  photographerEmail?: string;
  photographerPhone?: string;
  formName?: string;
  notes?: string;
}

export function BookingFormSubmittedEmail({
  clientName = "there",
  serviceName,
  preferredDate,
  preferredTime,
  photographerName = "Your Photographer",
  photographerEmail,
  photographerPhone,
  formName = "Booking Request",
  notes,
}: BookingFormSubmittedEmailProps) {
  const previewText = `Your booking request has been received`;
  const formattedDate = preferredDate
    ? new Date(preferredDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

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
            <Section style={receivedBadge}>
              <Text style={checkIcon}>✓</Text>
              <Text style={receivedText}>Request Received</Text>
            </Section>

            <Heading style={heading}>{formName}</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Thank you for your booking request! {photographerName} has
              received your submission and will be in touch with you shortly to
              confirm your session.
            </Text>

            {/* Request Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Request Details</Text>
              <Hr style={divider} />

              {serviceName && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📷</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Service</Text>
                    <Text style={detailValue}>{serviceName}</Text>
                  </Section>
                </Section>
              )}

              {formattedDate && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📆</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Preferred Date</Text>
                    <Text style={detailValue}>{formattedDate}</Text>
                  </Section>
                </Section>
              )}

              {preferredTime && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>🕐</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Preferred Time</Text>
                    <Text style={detailValue}>{preferredTime}</Text>
                  </Section>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailIcon}>👤</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Photographer</Text>
                  <Text style={detailValue}>{photographerName}</Text>
                  {photographerEmail && (
                    <Text style={detailSubValue}>{photographerEmail}</Text>
                  )}
                  {photographerPhone && (
                    <Text style={detailSubValue}>{photographerPhone}</Text>
                  )}
                </Section>
              </Section>
            </Section>

            {notes && (
              <Section style={notesSection}>
                <Text style={notesTitle}>Your Notes</Text>
                <Text style={notesContent}>{notes}</Text>
              </Section>
            )}

            <Section style={nextStepsSection}>
              <Text style={nextStepsTitle}>What&apos;s Next?</Text>
              <Text style={nextStepItem}>
                1. {photographerName} will review your request
              </Text>
              <Text style={nextStepItem}>
                2. You&apos;ll receive a confirmation email once your session is
                scheduled
              </Text>
              <Text style={nextStepItem}>
                3. Any questions? Feel free to reach out directly
              </Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions in the meantime, please contact{" "}
              {photographerName}
              {photographerEmail && ` at ${photographerEmail}`}.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This confirmation was sent by {photographerName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              Keep this email for your records.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingFormSubmittedEmail;

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

const receivedBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const checkIcon = {
  fontSize: "48px",
  color: "#22c55e",
  margin: "0",
};

const receivedText = {
  color: "#22c55e",
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

const detailSubValue = {
  color: "#a7a7a7",
  fontSize: "14px",
  margin: "4px 0 0 0",
};

const notesSection = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const notesTitle = {
  color: "#7c7c7c",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px 0",
};

const notesContent = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  fontStyle: "italic",
};

const nextStepsSection = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  borderLeft: "3px solid #3b82f6",
};

const nextStepsTitle = {
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const nextStepItem = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
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

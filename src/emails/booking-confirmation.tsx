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

interface BookingConfirmationEmailProps {
  clientName: string;
  bookingTitle: string;
  bookingDate: string;
  bookingTime: string;
  location?: string;
  photographerName: string;
  photographerPhone?: string;
  notes?: string;
}

export function BookingConfirmationEmail({
  clientName = "there",
  bookingTitle = "Photography Session",
  bookingDate = new Date().toISOString(),
  bookingTime = "10:00 AM",
  location,
  photographerName = "Your Photographer",
  photographerPhone,
  notes,
}: BookingConfirmationEmailProps) {
  const previewText = `Your booking for ${bookingTitle} is confirmed`;
  const formattedDate = new Date(bookingDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
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
            <Section style={confirmBadge}>
              <Text style={calendarIcon}>📅</Text>
              <Text style={confirmText}>Booking Confirmed</Text>
            </Section>

            <Heading style={heading}>{bookingTitle}</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Great news! Your photography session with {photographerName} has
              been confirmed. We&apos;re looking forward to working with you!
            </Text>

            {/* Booking Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Session Details</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailIcon}>📆</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Date</Text>
                  <Text style={detailValue}>{formattedDate}</Text>
                </Section>
              </Section>

              <Section style={detailRow}>
                <Text style={detailIcon}>🕐</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Time</Text>
                  <Text style={detailValue}>{bookingTime}</Text>
                </Section>
              </Section>

              {location && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📍</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Location</Text>
                    <Text style={detailValue}>{location}</Text>
                  </Section>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailIcon}>📷</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Photographer</Text>
                  <Text style={detailValue}>{photographerName}</Text>
                  {photographerPhone && (
                    <Text style={detailSubValue}>{photographerPhone}</Text>
                  )}
                </Section>
              </Section>
            </Section>

            {notes && (
              <Section style={notesSection}>
                <Text style={notesTitle}>Notes</Text>
                <Text style={notesContent}>{notes}</Text>
              </Section>
            )}

            <Section style={tipsSection}>
              <Text style={tipsTitle}>Helpful Tips</Text>
              <Text style={tipItem}>• Wear solid colors for best results</Text>
              <Text style={tipItem}>• Arrive 10 minutes early</Text>
              <Text style={tipItem}>• Bring any props or accessories you&apos;d like to include</Text>
              <Text style={tipItem}>• Don&apos;t hesitate to ask questions during the session</Text>
            </Section>

            <Text style={paragraph}>
              If you need to reschedule or have any questions, please contact{" "}
              {photographerName} directly.
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
              Add this event to your calendar so you don&apos;t forget!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingConfirmationEmail;

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

const confirmBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const calendarIcon = {
  fontSize: "48px",
  margin: "0",
};

const confirmText = {
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

const tipsSection = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  borderLeft: "3px solid #3b82f6",
};

const tipsTitle = {
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const tipItem = {
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

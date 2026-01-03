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

interface BookingReminderEmailProps {
  clientName: string;
  bookingTitle: string;
  bookingDate: string;
  bookingTime: string;
  location?: string;
  photographerName: string;
  photographerPhone?: string;
  notes?: string;
  reminderType: "24h" | "1h";
  organizationName: string;
}

export function BookingReminderEmail({
  clientName = "there",
  bookingTitle = "Photography Session",
  bookingDate = new Date().toISOString(),
  bookingTime = "10:00 AM",
  location,
  photographerName = "Your Photographer",
  photographerPhone,
  notes,
  reminderType = "24h",
  organizationName = "PhotoProOS",
}: BookingReminderEmailProps) {
  const timeLabel = reminderType === "24h" ? "tomorrow" : "in 1 hour";
  const previewText = `Reminder: Your session ${timeLabel} - ${bookingTitle}`;
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
            <Heading style={logoText}>{organizationName}</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Section style={reminderBadge}>
              <Text style={bellIcon}>🔔</Text>
              <Text style={reminderText}>
                {reminderType === "24h" ? "Tomorrow" : "Starting Soon"}
              </Text>
            </Section>

            <Heading style={heading}>{bookingTitle}</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              {reminderType === "24h" ? (
                <>
                  Just a friendly reminder that your photography session with{" "}
                  {photographerName} is scheduled for <strong>tomorrow</strong>.
                </>
              ) : (
                <>
                  Your photography session with {photographerName} starts{" "}
                  <strong>in about 1 hour</strong>. We hope you&apos;re ready!
                </>
              )}
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

            {reminderType === "24h" && (
              <Section style={checklistSection}>
                <Text style={checklistTitle}>Quick Checklist</Text>
                <Text style={checklistItem}>✓ Confirm the address and plan your route</Text>
                <Text style={checklistItem}>✓ Prepare any props or outfits you want to include</Text>
                <Text style={checklistItem}>✓ Get a good night&apos;s rest</Text>
                <Text style={checklistItem}>✓ Save the photographer&apos;s contact info</Text>
              </Section>
            )}

            {reminderType === "1h" && (
              <Section style={urgentSection}>
                <Text style={urgentTitle}>Almost Time!</Text>
                <Text style={urgentText}>
                  Make sure you have everything you need and head out soon to
                  arrive on time. We&apos;re excited to see you!
                </Text>
              </Section>
            )}

            <Text style={paragraph}>
              If you need to make any last-minute changes, please contact{" "}
              {photographerName} directly
              {photographerPhone && ` at ${photographerPhone}`}.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This reminder was sent by {organizationName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingReminderEmail;

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

const reminderBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const bellIcon = {
  fontSize: "48px",
  margin: "0",
};

const reminderText = {
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

const checklistSection = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  borderLeft: "3px solid #3b82f6",
};

const checklistTitle = {
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const checklistItem = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
};

const urgentSection = {
  backgroundColor: "rgba(249, 115, 22, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  borderLeft: "3px solid #f97316",
};

const urgentTitle = {
  color: "#f97316",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const urgentText = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "20px",
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

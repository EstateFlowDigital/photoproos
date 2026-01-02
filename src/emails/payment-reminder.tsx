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

interface PaymentReminderEmailProps {
  clientName: string;
  galleryName: string;
  paymentUrl: string;
  amountCents: number;
  currency: string;
  photographerName: string;
  dueDate?: string;
  isOverdue?: boolean;
}

export function PaymentReminderEmail({
  clientName = "there",
  galleryName = "Your Gallery",
  paymentUrl = "https://app.photoproos.com",
  amountCents = 0,
  currency = "USD",
  photographerName = "Your Photographer",
  dueDate,
  isOverdue = false,
}: PaymentReminderEmailProps) {
  const previewText = isOverdue
    ? `Overdue payment reminder for ${galleryName}`
    : `Payment reminder for ${galleryName}`;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amountCents / 100);

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
            <Section style={isOverdue ? overdueBadge : reminderBadge}>
              <Text style={badgeIcon}>{isOverdue ? "!" : "$"}</Text>
              <Text style={isOverdue ? overdueText : reminderText}>
                {isOverdue ? "Payment Overdue" : "Payment Reminder"}
              </Text>
            </Section>

            <Heading style={heading}>
              {isOverdue ? "Your Payment is Overdue" : "Payment Reminder"}
            </Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              {isOverdue
                ? `Your payment for ${galleryName} is overdue. Please complete your payment to access your photos.`
                : `This is a friendly reminder that your payment for ${galleryName} is due${dueDate ? ` by ${dueDate}` : ""}.`}
            </Text>

            {/* Payment Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Payment Details</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailLabel}>Gallery</Text>
                <Text style={detailValue}>{galleryName}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Amount Due</Text>
                <Text style={detailValueBold}>{formattedAmount}</Text>
              </Section>

              {dueDate && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Due Date</Text>
                  <Text style={isOverdue ? detailValueOverdue : detailValue}>
                    {dueDate}
                  </Text>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailLabel}>Photographer</Text>
                <Text style={detailValue}>{photographerName}</Text>
              </Section>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={paymentUrl}>
                Pay Now
              </Button>
            </Section>

            <Text style={paragraph}>
              Once your payment is complete, you&apos;ll have full access to view and
              download your photos.
            </Text>

            <Text style={paragraph}>
              If you have any questions or need assistance, please contact{" "}
              {photographerName} directly.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This reminder was sent by {photographerName} via{" "}
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

export default PaymentReminderEmail;

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

const overdueBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const badgeIcon = {
  color: "#f97316",
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

const overdueText = {
  color: "#ef4444",
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
  marginBottom: "12px",
};

const detailLabel = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "0 0 4px 0",
};

const detailValue = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
};

const detailValueBold = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const detailValueOverdue = {
  color: "#ef4444",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
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

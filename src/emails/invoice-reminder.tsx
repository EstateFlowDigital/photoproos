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

interface InvoiceReminderEmailProps {
  clientName: string;
  invoiceNumber: string;
  paymentUrl: string;
  amountCents: number;
  currency: string;
  photographerName: string;
  dueDate: string;
  isOverdue: boolean;
  daysOverdue?: number;
  reminderCount?: number;
}

export function InvoiceReminderEmail({
  clientName = "there",
  invoiceNumber = "INV-0001",
  paymentUrl = "https://app.photoproos.com",
  amountCents = 0,
  currency = "USD",
  photographerName = "Your Photographer",
  dueDate = "",
  isOverdue = false,
  daysOverdue = 0,
  reminderCount = 1,
}: InvoiceReminderEmailProps) {
  const previewText = isOverdue
    ? `Payment Overdue: Invoice ${invoiceNumber} is ${daysOverdue} days past due`
    : `Payment Reminder: Invoice ${invoiceNumber} is due soon`;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amountCents / 100);

  const getUrgencyMessage = () => {
    if (!isOverdue) {
      return `This is a friendly reminder that Invoice ${invoiceNumber} is due on ${dueDate}.`;
    }
    if (daysOverdue <= 7) {
      return `Invoice ${invoiceNumber} is ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue. Please arrange payment as soon as possible.`;
    }
    if (daysOverdue <= 14) {
      return `Invoice ${invoiceNumber} is now ${daysOverdue} days overdue. Immediate payment is required to avoid service interruption.`;
    }
    return `Invoice ${invoiceNumber} is significantly overdue (${daysOverdue} days). Please contact us immediately to arrange payment.`;
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
          </Section>

          <Section style={contentSection}>
            <Section style={isOverdue ? overdueBadge : reminderBadge}>
              <Text style={badgeIcon}>{isOverdue ? "!" : "$"}</Text>
              <Text style={isOverdue ? overdueText : reminderText}>
                {isOverdue ? "Payment Overdue" : "Payment Reminder"}
              </Text>
            </Section>

            <Heading style={heading}>
              {isOverdue ? "Invoice Payment Overdue" : "Invoice Payment Reminder"}
            </Heading>

            <Text style={paragraph}>Hi {clientName},</Text>
            <Text style={paragraph}>{getUrgencyMessage()}</Text>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Invoice Details</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailLabel}>Invoice Number</Text>
                <Text style={detailValue}>{invoiceNumber}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Amount Due</Text>
                <Text style={detailValueBold}>{formattedAmount}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Due Date</Text>
                <Text style={isOverdue ? detailValueOverdue : detailValue}>
                  {dueDate}
                  {isOverdue && ` (${daysOverdue} days overdue)`}
                </Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>From</Text>
                <Text style={detailValue}>{photographerName}</Text>
              </Section>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={paymentUrl}>
                View Invoice & Pay Now
              </Button>
            </Section>

            <Text style={paragraph}>
              Click the button above to view your invoice and complete payment securely online.
            </Text>

            {reminderCount > 1 && (
              <Text style={reminderNote}>
                This is reminder #{reminderCount} for this invoice.
              </Text>
            )}

            <Text style={paragraph}>
              If you have any questions about this invoice or need to discuss payment
              options, please contact {photographerName} directly.
            </Text>

            {isOverdue && daysOverdue > 14 && (
              <Section style={warningBox}>
                <Text style={warningText}>
                  This invoice is significantly overdue. Continued non-payment may result
                  in service suspension or additional late fees.
                </Text>
              </Section>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This reminder was sent by {photographerName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              If you believe you received this email in error, please contact the sender.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default InvoiceReminderEmail;

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

const reminderNote = {
  color: "#7c7c7c",
  fontSize: "14px",
  fontStyle: "italic" as const,
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

const warningBox = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  border: "1px solid rgba(239, 68, 68, 0.3)",
};

const warningText = {
  color: "#ef4444",
  fontSize: "14px",
  margin: "0",
  textAlign: "center" as const,
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

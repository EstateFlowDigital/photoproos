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

interface InvoiceSentEmailProps {
  clientName: string;
  invoiceNumber: string;
  paymentUrl: string;
  amountCents: number;
  currency: string;
  photographerName: string;
  dueDate: string;
  lineItemsSummary?: string;
  hasPdfAttachment?: boolean;
}

export function InvoiceSentEmail({
  clientName = "there",
  invoiceNumber = "INV-0001",
  paymentUrl = "https://app.photoproos.com",
  amountCents = 0,
  currency = "USD",
  photographerName = "Your Photographer",
  dueDate = "",
  lineItemsSummary = "",
  hasPdfAttachment = false,
}: InvoiceSentEmailProps) {
  const previewText = `Invoice ${invoiceNumber} from ${photographerName} - ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountCents / 100)}`;

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
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
          </Section>

          <Section style={contentSection}>
            <Section style={invoiceBadge}>
              <Text style={badgeIcon}>📄</Text>
              <Text style={invoiceLabel}>New Invoice</Text>
            </Section>

            <Heading style={heading}>
              You&apos;ve received an invoice
            </Heading>

            <Text style={paragraph}>Hi {clientName},</Text>
            <Text style={paragraph}>
              {photographerName} has sent you an invoice. Please review the details below
              and complete your payment by {dueDate}.
            </Text>

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
                <Text style={detailValue}>{dueDate}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>From</Text>
                <Text style={detailValue}>{photographerName}</Text>
              </Section>

              {lineItemsSummary && (
                <>
                  <Hr style={divider} />
                  <Section style={detailRow}>
                    <Text style={detailLabel}>Services</Text>
                    <Text style={detailValue}>{lineItemsSummary}</Text>
                  </Section>
                </>
              )}
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={paymentUrl}>
                View Invoice & Pay Now
              </Button>
            </Section>

            <Text style={paragraph}>
              Click the button above to view your complete invoice and pay securely online.
            </Text>

            {hasPdfAttachment && (
              <Text style={attachmentNote}>
                📎 A PDF copy of this invoice is attached to this email for your records.
              </Text>
            )}

            <Text style={paragraph}>
              If you have any questions about this invoice, please contact {photographerName} directly.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This invoice was sent by {photographerName} via{" "}
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

export default InvoiceSentEmail;

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

const invoiceBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const badgeIcon = {
  fontSize: "48px",
  margin: "0",
};

const invoiceLabel = {
  color: "#3b82f6",
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

const attachmentNote = {
  color: "#22c55e",
  fontSize: "14px",
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  padding: "12px 16px",
  borderRadius: "8px",
  margin: "16px 0",
  textAlign: "center" as const,
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

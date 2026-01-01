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

interface PaymentReceiptEmailProps {
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  amountCents: number;
  currency: string;
  photographerName: string;
  transactionId?: string;
}

export function PaymentReceiptEmail({
  clientName = "there",
  galleryName = "Your Gallery",
  galleryUrl = "https://app.photoproos.com",
  amountCents = 0,
  currency = "USD",
  photographerName = "Your Photographer",
  transactionId,
}: PaymentReceiptEmailProps) {
  const previewText = `Payment receipt for ${galleryName}`;
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
            <Section style={successBadge}>
              <Text style={checkmark}>✓</Text>
              <Text style={successText}>Payment Successful</Text>
            </Section>

            <Heading style={heading}>Thank You for Your Payment!</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              We&apos;ve received your payment for <strong>{galleryName}</strong>.
              Your gallery is now unlocked and ready to view.
            </Text>

            {/* Receipt Details */}
            <Section style={receiptBox}>
              <Text style={receiptTitle}>Payment Receipt</Text>
              <Hr style={divider} />

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Gallery</Text>
                <Text style={receiptValue}>{galleryName}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Amount</Text>
                <Text style={receiptValueBold}>{formattedAmount}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Date</Text>
                <Text style={receiptValue}>
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </Section>

              {transactionId && (
                <Section style={receiptRow}>
                  <Text style={receiptLabel}>Transaction ID</Text>
                  <Text style={receiptValueSmall}>{transactionId}</Text>
                </Section>
              )}

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Photographer</Text>
                <Text style={receiptValue}>{photographerName}</Text>
              </Section>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={galleryUrl}>
                View Your Gallery
              </Button>
            </Section>

            <Text style={paragraph}>
              If you have any questions about your payment or photos, please
              contact {photographerName} directly.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This receipt was sent by {photographerName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              Please keep this email for your records.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PaymentReceiptEmail;

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

const successBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const checkmark = {
  color: "#22c55e",
  fontSize: "48px",
  margin: "0",
};

const successText = {
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

const receiptBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const receiptTitle = {
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

const receiptRow = {
  marginBottom: "12px",
};

const receiptLabel = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "0 0 4px 0",
};

const receiptValue = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
};

const receiptValueBold = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const receiptValueSmall = {
  color: "#a7a7a7",
  fontSize: "12px",
  fontFamily: "monospace",
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

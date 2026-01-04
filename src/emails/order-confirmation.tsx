/**
 * Order Confirmation Email Template
 *
 * Sent to customers after they complete a purchase through an order page.
 * Includes order details, items purchased, and next steps.
 *
 * Triggered by: Stripe webhook (checkout.session.completed) for orders
 * File: src/app/api/webhooks/stripe/route.ts
 */

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

interface OrderItem {
  name: string;
  itemType: "bundle" | "service";
  quantity: number;
  totalCents: number;
  sqft?: number | null;
  pricingTierName?: string | null;
}

interface OrderConfirmationEmailProps {
  clientName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  photographerName: string;
  photographerEmail?: string;
  photographerPhone?: string;
  preferredTime?: string | null;
  clientNotes?: string | null;
}

export function OrderConfirmationEmail({
  clientName = "there",
  orderNumber = "ORD-2025-0001",
  items = [],
  subtotalCents = 0,
  taxCents = 0,
  totalCents = 0,
  photographerName = "Your Photographer",
  photographerEmail,
  photographerPhone,
  preferredTime,
  clientNotes,
}: OrderConfirmationEmailProps) {
  const previewText = `Order ${orderNumber} confirmed - Thank you for your purchase!`;

  // Helper to format price
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  // Format preferred time for display
  const formatPreferredTime = (time: string) => {
    const timeMap: Record<string, string> = {
      morning: "Morning (8am - 12pm)",
      afternoon: "Afternoon (12pm - 5pm)",
      evening: "Evening (5pm - 8pm)",
    };
    return timeMap[time] || time;
  };

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
            {/* Success Badge */}
            <Section style={confirmBadge}>
              <Text style={checkIcon}>&#10004;</Text>
              <Text style={confirmText}>Payment Confirmed</Text>
            </Section>

            <Heading style={heading}>Thank You for Your Order!</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              Your order has been received and payment confirmed. {photographerName} will
              be in touch soon to schedule your session.
            </Text>

            {/* Order Number */}
            <Section style={orderNumberBox}>
              <Text style={orderNumberLabel}>Order Number</Text>
              <Text style={orderNumberValue}>{orderNumber}</Text>
            </Section>

            {/* Order Items */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Order Summary</Text>
              <Hr style={divider} />

              {items.map((item, index) => (
                <Section key={index} style={itemRow}>
                  <Section style={itemInfo}>
                    <Text style={itemName}>
                      {item.name}
                      {item.itemType === "bundle" && (
                        <span style={bundleBadge}> Bundle</span>
                      )}
                    </Text>
                    {item.quantity > 1 && (
                      <Text style={itemQuantity}>Qty: {item.quantity}</Text>
                    )}
                    {item.sqft && (
                      <Text style={itemQuantity}>
                        {item.sqft.toLocaleString()} sqft
                        {item.pricingTierName && ` • ${item.pricingTierName}`}
                      </Text>
                    )}
                  </Section>
                  <Text style={itemPrice}>{formatPrice(item.totalCents)}</Text>
                </Section>
              ))}

              <Hr style={divider} />

              {/* Totals */}
              <Section style={totalsSection}>
                <Section style={totalRow}>
                  <Text style={totalLabel}>Subtotal</Text>
                  <Text style={totalValue}>{formatPrice(subtotalCents)}</Text>
                </Section>
                {taxCents > 0 && (
                  <Section style={totalRow}>
                    <Text style={totalLabel}>Tax</Text>
                    <Text style={totalValue}>{formatPrice(taxCents)}</Text>
                  </Section>
                )}
                <Section style={totalRowFinal}>
                  <Text style={totalLabelFinal}>Total Paid</Text>
                  <Text style={totalValueFinal}>{formatPrice(totalCents)}</Text>
                </Section>
              </Section>
            </Section>

            {/* Scheduling Preference */}
            {preferredTime && (
              <Section style={preferenceBox}>
                <Text style={preferenceIcon}>&#128337;</Text>
                <Section style={preferenceContent}>
                  <Text style={preferenceLabel}>Preferred Time</Text>
                  <Text style={preferenceValue}>{formatPreferredTime(preferredTime)}</Text>
                </Section>
              </Section>
            )}

            {/* Client Notes */}
            {clientNotes && (
              <Section style={notesSection}>
                <Text style={notesTitle}>Your Notes</Text>
                <Text style={notesContent}>{clientNotes}</Text>
              </Section>
            )}

            {/* What's Next */}
            <Section style={nextStepsSection}>
              <Text style={nextStepsTitle}>What Happens Next?</Text>
              <Section style={stepRow}>
                <Text style={stepNumber}>1</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Scheduling</Text>
                  <Text style={stepDescription}>
                    {photographerName} will contact you to confirm the date and time
                    for your session.
                  </Text>
                </Section>
              </Section>
              <Section style={stepRow}>
                <Text style={stepNumber}>2</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Photo Session</Text>
                  <Text style={stepDescription}>
                    Meet at the agreed location for your professional photography session.
                  </Text>
                </Section>
              </Section>
              <Section style={stepRow}>
                <Text style={stepNumber}>3</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Delivery</Text>
                  <Text style={stepDescription}>
                    Your photos will be delivered to a private online gallery.
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* Contact Info */}
            <Section style={contactBox}>
              <Text style={contactTitle}>Questions?</Text>
              <Text style={contactText}>
                Contact {photographerName}:
              </Text>
              {photographerEmail && (
                <Link href={`mailto:${photographerEmail}`} style={contactLink}>
                  {photographerEmail}
                </Link>
              )}
              {photographerPhone && (
                <Text style={contactPhone}>{photographerPhone}</Text>
              )}
            </Section>
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

export default OrderConfirmationEmail;

// =============================================================================
// Styles
// Following the dark theme design system used across all email templates
// =============================================================================

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

const checkIcon = {
  fontSize: "48px",
  color: "#22c55e",
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

const orderNumberBox = {
  textAlign: "center" as const,
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const orderNumberLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const orderNumberValue = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  fontFamily: "monospace",
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

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "12px",
};

const itemInfo = {
  flex: "1",
};

const itemName = {
  color: "#ffffff",
  fontSize: "14px",
  margin: "0",
};

const bundleBadge = {
  color: "#3b82f6",
  fontSize: "10px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  backgroundColor: "rgba(59, 130, 246, 0.2)",
  padding: "2px 6px",
  borderRadius: "4px",
  marginLeft: "8px",
};

const itemQuantity = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "4px 0 0 0",
};

const itemPrice = {
  color: "#a7a7a7",
  fontSize: "14px",
  margin: "0",
  textAlign: "right" as const,
};

const totalsSection = {
  marginTop: "8px",
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const totalLabel = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "0",
};

const totalValue = {
  color: "#a7a7a7",
  fontSize: "14px",
  margin: "0",
};

const totalRowFinal = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
};

const totalLabelFinal = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const totalValueFinal = {
  color: "#22c55e",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
};

const preferenceBox = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const preferenceIcon = {
  fontSize: "24px",
  marginRight: "12px",
  width: "32px",
};

const preferenceContent = {
  flex: "1",
};

const preferenceLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const preferenceValue = {
  color: "#ffffff",
  fontSize: "14px",
  margin: "0",
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
  padding: "24px",
  marginBottom: "24px",
  borderLeft: "3px solid #3b82f6",
};

const nextStepsTitle = {
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const stepRow = {
  display: "flex",
  marginBottom: "16px",
};

const stepNumber = {
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  width: "24px",
  height: "24px",
  lineHeight: "24px",
  textAlign: "center" as const,
  backgroundColor: "#3b82f6",
  borderRadius: "50%",
  marginRight: "12px",
  flexShrink: 0,
};

const stepContent = {
  flex: "1",
};

const stepTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const stepDescription = {
  color: "#a7a7a7",
  fontSize: "13px",
  lineHeight: "18px",
  margin: "0",
};

const contactBox = {
  textAlign: "center" as const,
  marginTop: "24px",
};

const contactTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const contactText = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "0 0 4px 0",
};

const contactLink = {
  color: "#3b82f6",
  fontSize: "14px",
  textDecoration: "none",
};

const contactPhone = {
  color: "#a7a7a7",
  fontSize: "14px",
  margin: "4px 0 0 0",
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

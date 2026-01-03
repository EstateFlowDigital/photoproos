/**
 * Contract Signing Invitation Email Template
 *
 * Sent to signers when a contract is ready for their signature.
 * Includes contract details, signing link, and expiration info.
 *
 * Triggered by: sendContractToSigners() action in contracts.ts
 * File: src/lib/actions/contracts.ts
 */

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

interface ContractSigningEmailProps {
  signerName: string;
  contractName: string;
  signingUrl: string;
  photographerName: string;
  photographerEmail?: string;
  expiresAt?: string;
  isReminder?: boolean;
}

export function ContractSigningEmail({
  signerName = "there",
  contractName = "Photography Services Agreement",
  signingUrl = "https://app.photoproos.com/sign/abc123",
  photographerName = "Your Photographer",
  photographerEmail,
  expiresAt,
  isReminder = false,
}: ContractSigningEmailProps) {
  const previewText = isReminder
    ? `Reminder: Please sign "${contractName}"`
    : `${photographerName} has sent you a contract to sign`;

  // Format expiration date if provided
  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
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
            {/* Icon Badge */}
            <Section style={iconBadge}>
              <Text style={documentIcon}>&#128196;</Text>
              <Text style={badgeText}>
                {isReminder ? "Reminder" : "Contract Ready"}
              </Text>
            </Section>

            <Heading style={heading}>
              {isReminder
                ? "Don't Forget to Sign"
                : "Your Signature is Requested"}
            </Heading>

            <Text style={paragraph}>Hi {signerName},</Text>

            {isReminder ? (
              <Text style={paragraph}>
                This is a friendly reminder that {photographerName} is waiting
                for your signature on the following contract. Please take a
                moment to review and sign it.
              </Text>
            ) : (
              <Text style={paragraph}>
                {photographerName} has sent you a contract for your review and
                signature. Please read through the agreement carefully before
                signing.
              </Text>
            )}

            {/* Contract Details Box */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Contract Details</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailIcon}>&#128196;</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Document</Text>
                  <Text style={detailValue}>{contractName}</Text>
                </Section>
              </Section>

              <Section style={detailRow}>
                <Text style={detailIcon}>&#128100;</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>From</Text>
                  <Text style={detailValue}>{photographerName}</Text>
                </Section>
              </Section>

              {formattedExpiry && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>&#9200;</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Expires</Text>
                    <Text style={detailValue}>{formattedExpiry}</Text>
                  </Section>
                </Section>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={signingUrl}>
                Review & Sign Contract
              </Button>
            </Section>

            {/* Security Info */}
            <Section style={securityBox}>
              <Text style={securityIcon}>&#128274;</Text>
              <Section style={securityContent}>
                <Text style={securityTitle}>Secure Signing</Text>
                <Text style={securityText}>
                  Your signature is legally binding and securely stored. We
                  track IP addresses and timestamps for all signatures.
                </Text>
              </Section>
            </Section>

            {/* Link Fallback */}
            <Section style={fallbackSection}>
              <Text style={fallbackText}>
                If the button doesn&apos;t work, copy and paste this link into your browser:
              </Text>
              <Link href={signingUrl} style={fallbackLink}>
                {signingUrl}
              </Link>
            </Section>

            {/* What to Expect */}
            <Section style={infoBox}>
              <Text style={infoTitle}>What to Expect</Text>
              <Text style={infoItem}>&#10003; Review the full contract terms</Text>
              <Text style={infoItem}>&#10003; Add your signature (draw, type, or upload)</Text>
              <Text style={infoItem}>&#10003; Receive a signed copy via email</Text>
            </Section>

            {/* Contact */}
            <Text style={contactText}>
              Questions about this contract? Contact {photographerName}
              {photographerEmail && (
                <>
                  {" at "}
                  <Link href={`mailto:${photographerEmail}`} style={contactLink}>
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
              This contract was sent by {photographerName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              This is an automated message. Do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContractSigningEmail;

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

const iconBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const documentIcon = {
  fontSize: "48px",
  margin: "0",
};

const badgeText = {
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

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const ctaButton = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  borderRadius: "8px",
  padding: "16px 32px",
  display: "inline-block",
};

const securityBox = {
  display: "flex",
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: "3px solid #22c55e",
};

const securityIcon = {
  fontSize: "24px",
  marginRight: "12px",
  width: "32px",
};

const securityContent = {
  flex: "1",
};

const securityTitle = {
  color: "#22c55e",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const securityText = {
  color: "#a7a7a7",
  fontSize: "13px",
  lineHeight: "18px",
  margin: "0",
};

const fallbackSection = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const fallbackText = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "0 0 8px 0",
};

const fallbackLink = {
  color: "#3b82f6",
  fontSize: "12px",
  wordBreak: "break-all" as const,
  textDecoration: "none",
};

const infoBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const infoTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const infoItem = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
};

const contactText = {
  color: "#7c7c7c",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0",
};

const contactLink = {
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

const footerDisclaimer = {
  color: "#454545",
  fontSize: "11px",
  margin: "8px 0 0 0",
};

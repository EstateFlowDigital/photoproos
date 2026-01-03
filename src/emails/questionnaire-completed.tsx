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

interface QuestionnaireCompletedEmailProps {
  photographerName: string;
  clientName: string;
  clientEmail: string;
  questionnaireName: string;
  responseCount: number;
  agreementCount: number;
  viewResponsesUrl: string;
  organizationName: string;
  bookingTitle?: string;
  bookingDate?: string;
  completedAt: string;
}

export function QuestionnaireCompletedEmail({
  photographerName = "there",
  clientName = "Client",
  clientEmail = "client@example.com",
  questionnaireName = "Client Information",
  responseCount = 0,
  agreementCount = 0,
  viewResponsesUrl = "https://example.com/questionnaires",
  organizationName = "PhotoProOS",
  bookingTitle,
  bookingDate,
  completedAt = new Date().toISOString(),
}: QuestionnaireCompletedEmailProps) {
  const previewText = `${clientName} has completed the ${questionnaireName} questionnaire`;
  const formattedCompletedAt = new Date(completedAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
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
            <Heading style={logoText}>{organizationName}</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Section style={iconBadge}>
              <Text style={checkIcon}>✅</Text>
              <Text style={badgeText}>Completed</Text>
            </Section>

            <Heading style={heading}>Questionnaire Submitted</Heading>

            <Text style={paragraph}>Hi {photographerName},</Text>

            <Text style={paragraph}>
              Great news! <strong>{clientName}</strong> has completed the{" "}
              <strong>{questionnaireName}</strong> questionnaire. You can now
              review their responses and prepare for the session.
            </Text>

            {/* Summary Box */}
            <Section style={summaryBox}>
              <Text style={summaryTitle}>Submission Summary</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailIcon}>👤</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Client</Text>
                  <Text style={detailValue}>{clientName}</Text>
                  <Text style={detailSubValue}>{clientEmail}</Text>
                </Section>
              </Section>

              <Section style={detailRow}>
                <Text style={detailIcon}>📋</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Questionnaire</Text>
                  <Text style={detailValue}>{questionnaireName}</Text>
                </Section>
              </Section>

              <Section style={detailRow}>
                <Text style={detailIcon}>📝</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Responses</Text>
                  <Text style={detailValue}>
                    {responseCount} field{responseCount !== 1 ? "s" : ""} completed
                  </Text>
                </Section>
              </Section>

              {agreementCount > 0 && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>✍️</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Agreements Signed</Text>
                    <Text style={detailValue}>
                      {agreementCount} agreement{agreementCount !== 1 ? "s" : ""}
                    </Text>
                  </Section>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailIcon}>🕐</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Submitted</Text>
                  <Text style={detailValue}>{formattedCompletedAt}</Text>
                </Section>
              </Section>

              {bookingTitle && (
                <>
                  <Hr style={divider} />
                  <Section style={detailRow}>
                    <Text style={detailIcon}>📷</Text>
                    <Section style={detailContent}>
                      <Text style={detailLabel}>Related Session</Text>
                      <Text style={detailValue}>{bookingTitle}</Text>
                      {bookingDate && (
                        <Text style={detailSubValue}>
                          {new Date(bookingDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      )}
                    </Section>
                  </Section>
                </>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={viewResponsesUrl}>
                View Responses
              </Button>
            </Section>

            <Section style={tipSection}>
              <Text style={tipTitle}>Next Steps</Text>
              <Text style={tipItem}>• Review the client&apos;s responses</Text>
              <Text style={tipItem}>• Check any signed agreements</Text>
              <Text style={tipItem}>• Approve the questionnaire when ready</Text>
              <Text style={tipItem}>• Use the information to prepare for the session</Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This notification was sent by {organizationName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href={viewResponsesUrl} style={footerLink}>
                View in Dashboard
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default QuestionnaireCompletedEmail;

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

const iconBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const checkIcon = {
  fontSize: "48px",
  margin: "0",
};

const badgeText = {
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

const summaryBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(34, 197, 94, 0.3)",
};

const summaryTitle = {
  color: "#22c55e",
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

const buttonContainer = {
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

const tipSection = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  borderLeft: "3px solid #3b82f6",
};

const tipTitle = {
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

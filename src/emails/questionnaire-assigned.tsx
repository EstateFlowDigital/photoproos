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

interface QuestionnaireAssignedEmailProps {
  clientName: string;
  questionnaireName: string;
  questionnaireDescription?: string;
  personalNote?: string;
  dueDate?: string;
  portalUrl: string;
  photographerName: string;
  organizationName: string;
  bookingTitle?: string;
  bookingDate?: string;
  unsubscribeUrl?: string;
}

export function QuestionnaireAssignedEmail({
  clientName = "there",
  questionnaireName = "Client Information",
  questionnaireDescription,
  personalNote,
  dueDate,
  portalUrl = "https://example.com/portal",
  photographerName = "Your Photographer",
  organizationName = "PhotoProOS",
  bookingTitle,
  bookingDate,
  unsubscribeUrl,
}: QuestionnaireAssignedEmailProps) {
  const previewText = `${photographerName} has sent you a questionnaire to complete`;
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
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
            <Heading style={logoText}>{organizationName}</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Section style={iconBadge}>
              <Text style={clipboardIcon}>📋</Text>
              <Text style={badgeText}>Questionnaire</Text>
            </Section>

            <Heading style={heading}>{questionnaireName}</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              {photographerName} has sent you a questionnaire to help prepare for your
              upcoming session. Please take a few minutes to complete it.
            </Text>

            {questionnaireDescription && (
              <Section style={descriptionBox}>
                <Text style={descriptionText}>{questionnaireDescription}</Text>
              </Section>
            )}

            {personalNote && (
              <Section style={personalNoteBox}>
                <Text style={personalNoteLabel}>A note from {photographerName}:</Text>
                <Text style={personalNoteText}>{personalNote}</Text>
              </Section>
            )}

            {/* Details Box */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Details</Text>
              <Hr style={divider} />

              {bookingTitle && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📷</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Session</Text>
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
              )}

              <Section style={detailRow}>
                <Text style={detailIcon}>👤</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>From</Text>
                  <Text style={detailValue}>{photographerName}</Text>
                </Section>
              </Section>

              {formattedDueDate && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📅</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Due By</Text>
                    <Text style={detailValue}>{formattedDueDate}</Text>
                  </Section>
                </Section>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={portalUrl}>
                Complete Questionnaire
              </Button>
            </Section>

            <Text style={helpText}>
              You can save your progress and return to complete it later. Your
              responses help us prepare for a great session!
            </Text>

            <Section style={tipSection}>
              <Text style={tipTitle}>Why This Matters</Text>
              <Text style={tipText}>
                Your responses help {photographerName} understand your needs,
                prepare the right equipment, and deliver exactly what you&apos;re
                looking for.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This questionnaire was sent by {organizationName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href={portalUrl} style={footerLink}>
                View in Portal
              </Link>
              {unsubscribeUrl && (
                <>
                  {" | "}
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Manage Email Preferences
                  </Link>
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default QuestionnaireAssignedEmail;

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

const clipboardIcon = {
  fontSize: "48px",
  margin: "0",
};

const badgeText = {
  color: "#8b5cf6",
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

const descriptionBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  borderLeft: "3px solid #8b5cf6",
};

const descriptionText = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  fontStyle: "italic",
};

const personalNoteBox = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  borderLeft: "3px solid #3b82f6",
};

const personalNoteLabel = {
  color: "#3b82f6",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px 0",
};

const personalNoteText = {
  color: "#ffffff",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0",
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#8b5cf6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const helpText = {
  color: "#7c7c7c",
  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const tipSection = {
  backgroundColor: "rgba(139, 92, 246, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  borderLeft: "3px solid #8b5cf6",
};

const tipTitle = {
  color: "#8b5cf6",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const tipText = {
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

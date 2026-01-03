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

interface QuestionnaireReminderEmailProps {
  clientName: string;
  questionnaireName: string;
  dueDate?: string;
  isOverdue: boolean;
  portalUrl: string;
  photographerName: string;
  organizationName: string;
  bookingTitle?: string;
  bookingDate?: string;
  reminderCount: number;
  unsubscribeUrl?: string;
}

export function QuestionnaireReminderEmail({
  clientName = "there",
  questionnaireName = "Client Information",
  dueDate,
  isOverdue = false,
  portalUrl = "https://example.com/portal",
  photographerName = "Your Photographer",
  organizationName = "PhotoProOS",
  bookingTitle,
  bookingDate,
  reminderCount = 1,
  unsubscribeUrl,
}: QuestionnaireReminderEmailProps) {
  const previewText = isOverdue
    ? `Overdue: Please complete your questionnaire for ${photographerName}`
    : `Reminder: Please complete your questionnaire for ${photographerName}`;

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
              <Text style={isOverdue ? overdueIcon : reminderIcon}>
                {isOverdue ? "⚠️" : "🔔"}
              </Text>
              <Text style={isOverdue ? overdueBadgeText : reminderBadgeText}>
                {isOverdue ? "Overdue" : "Reminder"}
              </Text>
            </Section>

            <Heading style={heading}>{questionnaireName}</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            {isOverdue ? (
              <Text style={paragraph}>
                This is a friendly reminder that your questionnaire from{" "}
                {photographerName} was due on <strong>{formattedDueDate}</strong>.
                Please complete it as soon as possible so we can prepare for your
                session.
              </Text>
            ) : (
              <Text style={paragraph}>
                {reminderCount === 1 ? (
                  <>
                    Just a friendly reminder that you have a questionnaire from{" "}
                    {photographerName} waiting to be completed.
                  </>
                ) : (
                  <>
                    We noticed you haven&apos;t completed your questionnaire yet.
                    Please take a few minutes to fill it out so {photographerName} can
                    prepare for your session.
                  </>
                )}
              </Text>
            )}

            {/* Status Box */}
            <Section style={isOverdue ? overdueBox : statusBox}>
              <Text style={isOverdue ? overdueTitle : statusTitle}>
                {isOverdue ? "Action Required" : "Status"}
              </Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailIcon}>📋</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Questionnaire</Text>
                  <Text style={detailValue}>{questionnaireName}</Text>
                </Section>
              </Section>

              {formattedDueDate && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>{isOverdue ? "⏰" : "📅"}</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>
                      {isOverdue ? "Was Due" : "Due By"}
                    </Text>
                    <Text style={isOverdue ? overdueValue : detailValue}>
                      {formattedDueDate}
                    </Text>
                  </Section>
                </Section>
              )}

              {bookingTitle && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📷</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>For Session</Text>
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
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={isOverdue ? overdueButton : button} href={portalUrl}>
                Complete Now
              </Button>
            </Section>

            <Text style={helpText}>
              It only takes a few minutes. Your responses help ensure a smooth
              and successful session!
            </Text>

            {isOverdue && (
              <Section style={urgentSection}>
                <Text style={urgentTitle}>Please Complete ASAP</Text>
                <Text style={urgentText}>
                  Completing this questionnaire helps {photographerName} prepare
                  the right equipment and plan for your session. Without this
                  information, there may be delays or missed opportunities.
                </Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This reminder was sent by {organizationName} via{" "}
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

export default QuestionnaireReminderEmail;

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

const reminderIcon = {
  fontSize: "48px",
  margin: "0",
};

const overdueIcon = {
  fontSize: "48px",
  margin: "0",
};

const reminderBadgeText = {
  color: "#f97316",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "8px 0 0 0",
};

const overdueBadgeText = {
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

const statusBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const overdueBox = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(239, 68, 68, 0.3)",
};

const statusTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
};

const overdueTitle = {
  color: "#ef4444",
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

const overdueValue = {
  color: "#ef4444",
  fontSize: "16px",
  margin: "0",
  fontWeight: "600",
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
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const overdueButton = {
  backgroundColor: "#ef4444",
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

const urgentSection = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  borderLeft: "3px solid #ef4444",
};

const urgentTitle = {
  color: "#ef4444",
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

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

interface QuestionnaireItem {
  id: string;
  clientName: string;
  questionnaireName: string;
  dueDate?: string;
  status: "pending" | "in_progress" | "overdue";
  bookingTitle?: string;
}

interface PhotographerDigestEmailProps {
  photographerName: string;
  organizationName: string;
  dashboardUrl: string;
  date: string;
  pendingCount: number;
  inProgressCount: number;
  overdueCount: number;
  completedTodayCount: number;
  questionnaires: QuestionnaireItem[];
}

export function PhotographerDigestEmail({
  photographerName = "there",
  organizationName = "PhotoProOS",
  dashboardUrl = "https://example.com/questionnaires",
  date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
  pendingCount = 0,
  inProgressCount = 0,
  overdueCount = 0,
  completedTodayCount = 0,
  questionnaires = [],
}: PhotographerDigestEmailProps) {
  const previewText = `Daily digest: ${overdueCount > 0 ? `${overdueCount} overdue, ` : ""}${pendingCount} pending questionnaires`;

  const hasItems = questionnaires.length > 0;
  const needsAttention = overdueCount > 0 || pendingCount > 0;

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
              <Text style={calendarIcon}>📊</Text>
              <Text style={badgeText}>Daily Digest</Text>
            </Section>

            <Heading style={heading}>Questionnaire Summary</Heading>

            <Text style={dateText}>{date}</Text>

            <Text style={paragraph}>Hi {photographerName},</Text>

            <Text style={paragraph}>
              {needsAttention
                ? "Here's your daily summary of client questionnaires that need attention."
                : "Great news! All your questionnaires are up to date."}
            </Text>

            {/* Stats Grid */}
            <Section style={statsGrid}>
              <Section style={statBox}>
                <Text style={statNumber}>{overdueCount}</Text>
                <Text style={overdueCount > 0 ? overdueStatLabel : statLabel}>
                  Overdue
                </Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{pendingCount}</Text>
                <Text style={statLabel}>Pending</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{inProgressCount}</Text>
                <Text style={statLabel}>In Progress</Text>
              </Section>
              <Section style={statBox}>
                <Text style={successNumber}>{completedTodayCount}</Text>
                <Text style={statLabel}>Completed Today</Text>
              </Section>
            </Section>

            {/* Questionnaire List */}
            {hasItems && (
              <>
                <Hr style={divider} />
                <Text style={sectionTitle}>Needs Attention</Text>

                {questionnaires.slice(0, 5).map((q) => (
                  <Section key={q.id} style={questionnaireItem}>
                    <Section style={questionnaireHeader}>
                      <Text style={questionnaireStatus(q.status)}>
                        {q.status === "overdue"
                          ? "⚠️"
                          : q.status === "in_progress"
                            ? "✏️"
                            : "📋"}
                      </Text>
                      <Section style={questionnaireInfo}>
                        <Text style={clientName}>{q.clientName}</Text>
                        <Text style={questionnaireName}>
                          {q.questionnaireName}
                        </Text>
                        {q.dueDate && (
                          <Text
                            style={
                              q.status === "overdue" ? overdueDate : dueDate
                            }
                          >
                            {q.status === "overdue" ? "Was due: " : "Due: "}
                            {new Date(q.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        )}
                        {q.bookingTitle && (
                          <Text style={bookingInfo}>📷 {q.bookingTitle}</Text>
                        )}
                      </Section>
                    </Section>
                  </Section>
                ))}

                {questionnaires.length > 5 && (
                  <Text style={moreItems}>
                    +{questionnaires.length - 5} more questionnaires...
                  </Text>
                )}
              </>
            )}

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                View All Questionnaires
              </Button>
            </Section>

            {overdueCount > 0 && (
              <Section style={urgentSection}>
                <Text style={urgentTitle}>Action Required</Text>
                <Text style={urgentText}>
                  You have {overdueCount} overdue questionnaire
                  {overdueCount > 1 ? "s" : ""}. Consider sending reminders to
                  these clients to ensure you have the information needed for
                  their sessions.
                </Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This digest was sent by {organizationName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href={dashboardUrl} style={footerLink}>
                Manage notification preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PhotographerDigestEmail;

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

const calendarIcon = {
  fontSize: "48px",
  margin: "0",
};

const badgeText = {
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
  margin: "0 0 8px 0",
};

const dateText = {
  color: "#7c7c7c",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const paragraph = {
  color: "#a7a7a7",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const statsGrid = {
  display: "flex",
  justifyContent: "space-between",
  margin: "24px 0",
};

const statBox = {
  textAlign: "center" as const,
  flex: "1",
  padding: "16px 8px",
  backgroundColor: "#191919",
  borderRadius: "8px",
  marginRight: "8px",
};

const statNumber = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
};

const successNumber = {
  color: "#22c55e",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
};

const statLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "4px 0 0 0",
};

const overdueStatLabel = {
  color: "#ef4444",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "4px 0 0 0",
};

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "24px 0",
};

const sectionTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 16px 0",
};

const questionnaireItem = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const questionnaireHeader = {
  display: "flex",
};

const questionnaireStatus = (status: string) => ({
  fontSize: "20px",
  marginRight: "12px",
  width: "24px",
});

const questionnaireInfo = {
  flex: "1",
};

const clientName = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const questionnaireName = {
  color: "#a7a7a7",
  fontSize: "14px",
  margin: "0 0 4px 0",
};

const dueDate = {
  color: "#f97316",
  fontSize: "12px",
  margin: "0",
};

const overdueDate = {
  color: "#ef4444",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
};

const bookingInfo = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "4px 0 0 0",
};

const moreItems = {
  color: "#7c7c7c",
  fontSize: "14px",
  fontStyle: "italic",
  textAlign: "center" as const,
  margin: "8px 0 0 0",
};

const buttonContainer = {
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

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

interface FormField {
  label: string;
  value: string;
}

interface FormSubmissionNotificationEmailProps {
  formName: string;
  formUrl?: string;
  submittedAt: string;
  fields: FormField[];
  submitterInfo?: {
    ipAddress?: string;
    country?: string;
    city?: string;
  };
  dashboardUrl: string;
}

export function FormSubmissionNotificationEmail({
  formName = "Contact Form",
  formUrl,
  submittedAt = new Date().toLocaleString(),
  fields = [],
  submitterInfo,
  dashboardUrl = "https://app.photoproos.com",
}: FormSubmissionNotificationEmailProps) {
  const previewText = `New submission received for ${formName}`;

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
            <Section style={alertBadge}>
              <Text style={bellIcon}>🔔</Text>
              <Text style={alertText}>New Submission</Text>
            </Section>

            <Heading style={heading}>{formName}</Heading>

            <Text style={paragraph}>
              You have received a new form submission. Here are the details:
            </Text>

            {/* Submission Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Submission Details</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailIcon}>📅</Text>
                <Section style={detailContent}>
                  <Text style={detailLabel}>Submitted</Text>
                  <Text style={detailValue}>{submittedAt}</Text>
                </Section>
              </Section>

              {submitterInfo?.city && submitterInfo?.country && (
                <Section style={detailRow}>
                  <Text style={detailIcon}>📍</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Location</Text>
                    <Text style={detailValue}>
                      {submitterInfo.city}, {submitterInfo.country}
                    </Text>
                  </Section>
                </Section>
              )}
            </Section>

            {/* Form Fields */}
            <Section style={fieldsBox}>
              <Text style={detailsTitle}>Form Responses</Text>
              <Hr style={divider} />

              {fields.map((field, index) => (
                <Section key={index} style={fieldRow}>
                  <Text style={fieldLabel}>{field.label}</Text>
                  <Text style={fieldValue}>{field.value || "—"}</Text>
                </Section>
              ))}
            </Section>

            {/* Action Button */}
            <Section style={buttonSection}>
              <Link href={dashboardUrl} style={button}>
                View in Dashboard
              </Link>
            </Section>

            {formUrl && (
              <Text style={formLinkText}>
                Form URL:{" "}
                <Link href={formUrl} style={formLink}>
                  {formUrl}
                </Link>
              </Text>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This notification was sent by{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              You can manage notification settings in your dashboard.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default FormSubmissionNotificationEmail;

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

const alertBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const bellIcon = {
  fontSize: "48px",
  margin: "0",
};

const alertText = {
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

const detailsBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const fieldsBox = {
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

const fieldRow = {
  marginBottom: "16px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
};

const fieldLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const fieldValue = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0 16px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "600",
  display: "inline-block",
};

const formLinkText = {
  color: "#7c7c7c",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};

const formLink = {
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

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

interface OnboardingReminderEmailProps {
  userName: string;
  organizationName: string;
  completedCount: number;
  totalCount: number;
  incompleteSteps: Array<{
    label: string;
    description: string;
    href: string;
  }>;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
}

export function OnboardingReminderEmail({
  userName = "there",
  organizationName = "Your Studio",
  completedCount = 2,
  totalCount = 8,
  incompleteSteps = [
    {
      label: "Connect Stripe",
      description: "Accept payments from your clients",
      href: "/settings/payments",
    },
    {
      label: "Create your first gallery",
      description: "Deliver photos to your clients",
      href: "/galleries/new",
    },
  ],
  dashboardUrl = "https://app.photoproos.com/dashboard",
  unsubscribeUrl = "https://app.photoproos.com/settings/notifications",
}: OnboardingReminderEmailProps) {
  const progress = Math.round((completedCount / totalCount) * 100);
  const remainingCount = totalCount - completedCount;
  const previewText = `You're ${progress}% done setting up ${organizationName} - just ${remainingCount} step${remainingCount === 1 ? "" : "s"} left!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
            <Text style={tagline}>The Business OS for Professional Photographers</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={welcomeEmoji}>🚀</Text>
            <Heading style={heading}>You&apos;re Almost There!</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              You&apos;ve made great progress setting up{" "}
              <strong>{organizationName}</strong>! You&apos;re{" "}
              <strong>{progress}%</strong> complete - just{" "}
              <strong>{remainingCount} step{remainingCount === 1 ? "" : "s"}</strong> left
              to unlock the full power of PhotoProOS.
            </Text>

            {/* Progress Bar */}
            <Section style={progressContainer}>
              <Section style={progressBar}>
                <Section style={{ ...progressFill, width: `${progress}%` }} />
              </Section>
              <Text style={progressText}>
                {completedCount} of {totalCount} completed
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={sectionTitle}>Complete These Steps</Text>

            <Section style={stepsContainer}>
              {incompleteSteps.slice(0, 3).map((step, index) => (
                <Section key={index} style={stepRow}>
                  <Section style={stepNumber}>{index + 1}</Section>
                  <Section style={stepContent}>
                    <Text style={stepTitle}>{step.label}</Text>
                    <Text style={stepDescription}>{step.description}</Text>
                  </Section>
                </Section>
              ))}
              {incompleteSteps.length > 3 && (
                <Text style={moreSteps}>
                  + {incompleteSteps.length - 3} more step
                  {incompleteSteps.length - 3 === 1 ? "" : "s"}
                </Text>
              )}
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                Continue Setup
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={sectionTitle}>Why Complete Setup?</Text>

            <Section style={benefitsList}>
              <Text style={benefitItem}>
                ✨ <strong>Get paid faster</strong> - Accept payments directly
                from galleries
              </Text>
              <Text style={benefitItem}>
                📸 <strong>Impress clients</strong> - Deliver stunning branded
                galleries
              </Text>
              <Text style={benefitItem}>
                📊 <strong>Track everything</strong> - See your business
                performance at a glance
              </Text>
              <Text style={benefitItem}>
                ⏰ <strong>Save time</strong> - Automate bookings, contracts, and
                invoicing
              </Text>
            </Section>

            <Text style={paragraph}>
              Need help? Reply to this email or visit our{" "}
              <Link href="https://photoproos.com/help" style={link}>
                Help Center
              </Link>
              .
            </Text>

            <Text style={signoff}>
              Cheers,
              <br />
              The PhotoProOS Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href="https://photoproos.com/help" style={footerLink}>
                Help Center
              </Link>
              {" · "}
              <Link href="https://photoproos.com/guides" style={footerLink}>
                Guides
              </Link>
              {" · "}
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe from reminders
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} PhotoProOS. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OnboardingReminderEmail;

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
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
};

const tagline = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "8px 0 0 0",
};

const contentSection = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  padding: "40px 32px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const welcomeEmoji = {
  fontSize: "48px",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const heading = {
  color: "#ffffff",
  fontSize: "28px",
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

const progressContainer = {
  marginBottom: "16px",
};

const progressBar = {
  backgroundColor: "#262626",
  borderRadius: "8px",
  height: "12px",
  overflow: "hidden" as const,
};

const progressFill = {
  backgroundColor: "#3b82f6",
  height: "12px",
  borderRadius: "8px",
  transition: "width 0.5s ease",
};

const progressText = {
  color: "#7c7c7c",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "8px 0 0 0",
};

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "32px 0",
};

const sectionTitle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const stepsContainer = {
  marginBottom: "24px",
};

const stepRow = {
  display: "flex",
  marginBottom: "16px",
  alignItems: "flex-start",
};

const stepNumber = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "28px",
  fontSize: "14px",
  fontWeight: "600",
  marginRight: "12px",
  flexShrink: 0,
};

const stepContent = {
  flex: "1",
};

const stepTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const stepDescription = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "0",
};

const moreSteps = {
  color: "#7c7c7c",
  fontSize: "14px",
  fontStyle: "italic" as const,
  margin: "8px 0 0 40px",
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

const benefitsList = {
  marginBottom: "24px",
};

const benefitItem = {
  color: "#a7a7a7",
  fontSize: "15px",
  lineHeight: "28px",
  margin: "0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "none",
};

const signoff = {
  color: "#a7a7a7",
  fontSize: "16px",
  lineHeight: "24px",
  marginTop: "32px",
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

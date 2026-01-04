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

interface ReferralSignupNotificationEmailProps {
  referrerName: string;
  referredName: string;
  referredEmail: string;
  referralDashboardUrl?: string;
  rewardAmount?: number;
}

export function ReferralSignupNotificationEmail({
  referrerName = "there",
  referredName = "Someone",
  referredEmail = "user@example.com",
  referralDashboardUrl = "https://app.listinglens.com/settings/my-referrals",
  rewardAmount = 25,
}: ReferralSignupNotificationEmailProps) {
  const previewText = `${referredName || referredEmail} just signed up using your referral link!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            <Heading style={logoText}>ListingLens</Heading>
            <Text style={tagline}>The Business OS for Professional Photographers</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={celebrationEmoji}>🎉</Text>
            <Heading style={heading}>Great News!</Heading>

            <Text style={paragraph}>Hi {referrerName},</Text>

            <Text style={paragraph}>
              <strong>{referredName || referredEmail}</strong> just signed up for
              ListingLens using your referral link!
            </Text>

            {/* Progress Box */}
            <Section style={progressBox}>
              <Section style={progressSteps}>
                <Section style={stepCompleted}>
                  <Text style={stepIcon}>✓</Text>
                  <Text style={stepLabel}>Clicked Link</Text>
                </Section>
                <Section style={stepConnector} />
                <Section style={stepCompleted}>
                  <Text style={stepIcon}>✓</Text>
                  <Text style={stepLabel}>Signed Up</Text>
                </Section>
                <Section style={stepConnector} />
                <Section style={stepPending}>
                  <Text style={stepIconPending}>3</Text>
                  <Text style={stepLabelPending}>Subscribes</Text>
                </Section>
              </Section>
              <Text style={progressNote}>
                You&apos;ll earn <strong style={{ color: "#22c55e" }}>${rewardAmount}</strong> when they subscribe!
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={referralDashboardUrl}>
                View Your Referrals
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={tipTitle}>💡 Pro Tip</Text>
            <Text style={tipText}>
              Following up with a quick message can help your referrals understand the
              value of ListingLens and increase your chances of earning the reward!
            </Text>

            <Hr style={divider} />

            <Text style={smallText}>
              Keep sharing your referral link to earn more rewards. Every successful
              referral means ${rewardAmount} in account credit for you.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={referralDashboardUrl} style={footerLink}>
                My Referrals
              </Link>
              {" · "}
              <Link href="https://listinglens.com/help" style={footerLink}>
                Help Center
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} ListingLens. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ReferralSignupNotificationEmail;

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

const celebrationEmoji = {
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

const progressBox = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  border: "1px solid rgba(59, 130, 246, 0.2)",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const progressSteps = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "16px",
};

const stepCompleted = {
  textAlign: "center" as const,
};

const stepIcon = {
  backgroundColor: "#22c55e",
  color: "#ffffff",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const stepLabel = {
  color: "#22c55e",
  fontSize: "12px",
  fontWeight: "500",
  margin: "0",
};

const stepPending = {
  textAlign: "center" as const,
};

const stepIconPending = {
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "#7c7c7c",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
  border: "2px dashed rgba(255, 255, 255, 0.2)",
};

const stepLabelPending = {
  color: "#7c7c7c",
  fontSize: "12px",
  fontWeight: "500",
  margin: "0",
};

const stepConnector = {
  width: "40px",
  height: "2px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  margin: "0 8px 20px 8px",
};

const progressNote = {
  color: "#a7a7a7",
  fontSize: "14px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0 16px 0",
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

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "24px 0",
};

const tipTitle = {
  color: "#f97316",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const tipText = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const smallText = {
  color: "#7c7c7c",
  fontSize: "13px",
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

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

interface ReferralInviteEmailProps {
  inviteeName: string;
  referrerName: string;
  referralUrl: string;
  trialDays?: number;
  discountPercent?: number;
}

export function ReferralInviteEmail({
  inviteeName = "there",
  referrerName = "A fellow photographer",
  referralUrl = "https://photoproos.com/r/LENS-ABC123",
  trialDays = 21,
  discountPercent = 20,
}: ReferralInviteEmailProps) {
  const previewText = `${referrerName} thinks you'd love PhotoProOS - Get an extended trial + ${discountPercent}% off!`;

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
            <Text style={referralEmoji}>🎁</Text>
            <Heading style={heading}>You&apos;ve Been Invited!</Heading>

            <Text style={paragraph}>Hi {inviteeName},</Text>

            <Text style={paragraph}>
              <strong>{referrerName}</strong> thinks you&apos;d love PhotoProOS and
              wants to give you an exclusive offer to try it out!
            </Text>

            {/* Exclusive Offer Box */}
            <Section style={offerBox}>
              <Text style={offerTitle}>Your Exclusive Offer</Text>
              <Section style={offerBenefits}>
                <Text style={offerItem}>
                  <span style={offerIcon}>✨</span>
                  <strong>{trialDays}-day extended trial</strong> (vs 14 days standard)
                </Text>
                <Text style={offerItem}>
                  <span style={offerIcon}>💰</span>
                  <strong>{discountPercent}% off</strong> your first month
                </Text>
                <Text style={offerItem}>
                  <span style={offerIcon}>🚀</span>
                  <strong>Full access</strong> to all Pro features
                </Text>
              </Section>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={referralUrl}>
                Claim Your Offer
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={sectionTitle}>What you get with PhotoProOS</Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                📸 <strong>Stunning Galleries</strong> - Deliver photos with pay-to-unlock
              </Text>
              <Text style={featureItem}>
                💳 <strong>Get Paid Faster</strong> - Integrated invoicing & payments
              </Text>
              <Text style={featureItem}>
                📅 <strong>Smart Scheduling</strong> - Booking calendar & automation
              </Text>
              <Text style={featureItem}>
                👥 <strong>Client Portal</strong> - Professional client experience
              </Text>
              <Text style={featureItem}>
                📊 <strong>Analytics</strong> - Track your business growth
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={smallText}>
              No credit card required to start. Cancel anytime during your trial.
            </Text>

            <Text style={smallText}>
              Button not working? Copy and paste this link:
              <br />
              <Link href={referralUrl} style={linkStyle}>
                {referralUrl}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href="https://photoproos.com/features" style={footerLink}>
                Features
              </Link>
              {" · "}
              <Link href="https://photoproos.com/pricing" style={footerLink}>
                Pricing
              </Link>
              {" · "}
              <Link href="https://photoproos.com/help" style={footerLink}>
                Help
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

export default ReferralInviteEmail;

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

const referralEmoji = {
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

const offerBox = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  border: "1px solid rgba(59, 130, 246, 0.3)",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const offerTitle = {
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const offerBenefits = {
  margin: "0",
};

const offerItem = {
  color: "#ffffff",
  fontSize: "15px",
  lineHeight: "28px",
  margin: "0",
};

const offerIcon = {
  marginRight: "8px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0 16px 0",
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

const sectionTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const featureList = {
  marginBottom: "16px",
};

const featureItem = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "28px",
  margin: "0",
};

const smallText = {
  color: "#7c7c7c",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
};

const linkStyle = {
  color: "#3b82f6",
  textDecoration: "none",
  wordBreak: "break-all" as const,
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

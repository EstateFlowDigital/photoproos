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

interface ReferralRewardEarnedEmailProps {
  referrerName: string;
  referredName: string;
  rewardAmount: number;
  totalEarned: number;
  totalReferrals: number;
  referralDashboardUrl?: string;
}

export function ReferralRewardEarnedEmail({
  referrerName = "there",
  referredName = "A photographer",
  rewardAmount = 25,
  totalEarned = 25,
  totalReferrals = 1,
  referralDashboardUrl = "https://app.photoproos.com/settings/my-referrals",
}: ReferralRewardEarnedEmailProps) {
  const previewText = `You just earned $${rewardAmount}! ${referredName} subscribed to PhotoProOS.`;

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
            <Text style={moneyEmoji}>💸</Text>
            <Heading style={heading}>You Earned ${rewardAmount}!</Heading>

            <Text style={paragraph}>Hi {referrerName},</Text>

            <Text style={paragraph}>
              Awesome news! <strong>{referredName}</strong> just subscribed to PhotoProOS,
              and you&apos;ve earned <strong style={{ color: "#22c55e" }}>${rewardAmount}</strong> in
              account credit!
            </Text>

            {/* Reward Card */}
            <Section style={rewardCard}>
              <Text style={rewardLabel}>Account Credit Earned</Text>
              <Text style={rewardAmount_style}>${rewardAmount}.00</Text>
              <Text style={rewardNote}>Applied to your next invoice</Text>
            </Section>

            {/* Stats Row */}
            <Section style={statsRow}>
              <Section style={statBox}>
                <Text style={statValue}>{totalReferrals}</Text>
                <Text style={statLabel}>Successful Referrals</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statValue}>${totalEarned}</Text>
                <Text style={statLabel}>Total Earned</Text>
              </Section>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={referralDashboardUrl}>
                View Your Rewards
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Next Milestone */}
            {totalReferrals < 5 && (
              <>
                <Text style={milestoneTitle}>🏆 Next Milestone</Text>
                <Section style={milestoneBox}>
                  <Text style={milestoneText}>
                    Refer <strong>{5 - totalReferrals} more</strong> photographers to reach
                    <strong> 5 successful referrals</strong> and earn a bonus month free!
                  </Text>
                  <Section style={progressBarContainer}>
                    <Section
                      style={{
                        ...progressBar,
                        width: `${(totalReferrals / 5) * 100}%`,
                      }}
                    />
                  </Section>
                  <Text style={progressText}>{totalReferrals}/5 referrals</Text>
                </Section>
                <Hr style={divider} />
              </>
            )}

            <Text style={keepGoing}>
              Keep sharing your referral link to earn more rewards!
            </Text>

            <Section style={buttonSectionSecondary}>
              <Button style={buttonSecondary} href={referralDashboardUrl}>
                Get Your Referral Link
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={referralDashboardUrl} style={footerLink}>
                My Referrals
              </Link>
              {" · "}
              <Link href="https://photoproos.com/help" style={footerLink}>
                Help Center
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

export default ReferralRewardEarnedEmail;

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

const moneyEmoji = {
  fontSize: "48px",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const heading = {
  color: "#22c55e",
  fontSize: "32px",
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

const rewardCard = {
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  border: "1px solid rgba(34, 197, 94, 0.3)",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const rewardLabel = {
  color: "#22c55e",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px 0",
};

const rewardAmount_style = {
  color: "#ffffff",
  fontSize: "48px",
  fontWeight: "700",
  margin: "0 0 8px 0",
};

const rewardNote = {
  color: "#7c7c7c",
  fontSize: "13px",
  margin: "0",
};

const statsRow = {
  display: "flex",
  gap: "16px",
  margin: "24px 0",
};

const statBox = {
  flex: "1",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
};

const statValue = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 4px 0",
};

const statLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0 16px 0",
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

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "24px 0",
};

const milestoneTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const milestoneBox = {
  backgroundColor: "rgba(249, 115, 22, 0.1)",
  border: "1px solid rgba(249, 115, 22, 0.2)",
  borderRadius: "8px",
  padding: "16px",
};

const milestoneText = {
  color: "#a7a7a7",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px 0",
};

const progressBarContainer = {
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: "4px",
  height: "8px",
  overflow: "hidden",
  marginBottom: "8px",
};

const progressBar = {
  backgroundColor: "#f97316",
  height: "8px",
  borderRadius: "4px",
  transition: "width 0.3s ease",
};

const progressText = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "0",
  textAlign: "right" as const,
};

const keepGoing = {
  color: "#a7a7a7",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const buttonSectionSecondary = {
  textAlign: "center" as const,
  margin: "0",
};

const buttonSecondary = {
  backgroundColor: "transparent",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 24px",
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

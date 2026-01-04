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

interface PortfolioStats {
  name: string;
  slug: string;
  views: number;
  uniqueVisitors: number;
  inquiries: number;
  topCountry?: string;
}

interface PortfolioWeeklyDigestEmailProps {
  userName: string;
  portfolios: PortfolioStats[];
  totalViews: number;
  totalVisitors: number;
  totalInquiries: number;
  weekStartDate: string;
  weekEndDate: string;
  dashboardUrl?: string;
}

export function PortfolioWeeklyDigestEmail({
  userName = "there",
  portfolios = [],
  totalViews = 0,
  totalVisitors = 0,
  totalInquiries = 0,
  weekStartDate = "Jan 1",
  weekEndDate = "Jan 7",
  dashboardUrl = "https://photoproos.com/portfolios",
}: PortfolioWeeklyDigestEmailProps) {
  const previewText = `Your portfolio stats for ${weekStartDate} - ${weekEndDate}: ${totalViews} views`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
            <Text style={tagline}>Weekly Portfolio Analytics</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>Your Weekly Digest</Heading>
            <Text style={dateRange}>{weekStartDate} - {weekEndDate}</Text>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              Here&apos;s how your portfolios performed this week:
            </Text>

            {/* Summary Stats */}
            <Section style={statsGrid}>
              <Section style={statBox}>
                <Text style={statNumber}>{totalViews.toLocaleString()}</Text>
                <Text style={statLabel}>Total Views</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{totalVisitors.toLocaleString()}</Text>
                <Text style={statLabel}>Unique Visitors</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{totalInquiries}</Text>
                <Text style={statLabel}>Inquiries</Text>
              </Section>
            </Section>

            {/* Portfolio Breakdown */}
            {portfolios.length > 0 && (
              <>
                <Hr style={divider} />
                <Text style={sectionTitle}>Portfolio Breakdown</Text>

                {portfolios.map((portfolio, index) => (
                  <Section key={index} style={portfolioRow}>
                    <Text style={portfolioName}>{portfolio.name}</Text>
                    <Section style={portfolioStats}>
                      <Text style={portfolioStat}>
                        {portfolio.views} views
                      </Text>
                      <Text style={portfolioStat}>
                        {portfolio.uniqueVisitors} visitors
                      </Text>
                      {portfolio.inquiries > 0 && (
                        <Text style={portfolioStatHighlight}>
                          {portfolio.inquiries} inquiries
                        </Text>
                      )}
                    </Section>
                    {portfolio.topCountry && (
                      <Text style={portfolioMeta}>
                        Top location: {portfolio.topCountry}
                      </Text>
                    )}
                  </Section>
                ))}
              </>
            )}

            <Hr style={divider} />

            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                View Full Analytics
              </Button>
            </Section>

            <Text style={tipText}>
              Tip: Share your portfolio on social media to increase visibility
              and attract more potential clients.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={dashboardUrl} style={footerLink}>
                Dashboard
              </Link>
              {" · "}
              <Link href="https://photoproos.com/help" style={footerLink}>
                Help Center
              </Link>
            </Text>
            <Text style={footerText}>
              You&apos;re receiving this because you have weekly digest enabled.
            </Text>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} PhotoProOS. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PortfolioWeeklyDigestEmail;

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

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 8px 0",
};

const dateRange = {
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
  padding: "16px",
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "8px",
  margin: "0 4px",
};

const statNumber = {
  color: "#3b82f6",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
};

const statLabel = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "4px 0 0 0",
  textTransform: "uppercase" as const,
};

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "24px 0",
};

const sectionTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const portfolioRow = {
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
};

const portfolioName = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const portfolioStats = {
  display: "flex",
  gap: "16px",
};

const portfolioStat = {
  color: "#a7a7a7",
  fontSize: "13px",
  margin: "0",
};

const portfolioStatHighlight = {
  color: "#22c55e",
  fontSize: "13px",
  fontWeight: "500",
  margin: "0",
};

const portfolioMeta = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "8px 0 0 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
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

const tipText = {
  color: "#7c7c7c",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
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

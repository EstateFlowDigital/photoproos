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

interface PropertyStats {
  id: string;
  address: string;
  city: string;
  state: string;
  views: number;
  uniqueVisitors: number;
  leads: number;
  topReferrer?: string;
}

interface PropertyWeeklyDigestEmailProps {
  userName: string;
  properties: PropertyStats[];
  totalViews: number;
  totalVisitors: number;
  totalLeads: number;
  viewsChange: number; // percentage change from previous week
  weekStartDate: string;
  weekEndDate: string;
  dashboardUrl?: string;
}

export function PropertyWeeklyDigestEmail({
  userName = "there",
  properties = [],
  totalViews = 0,
  totalVisitors = 0,
  totalLeads = 0,
  viewsChange = 0,
  weekStartDate = "Jan 1",
  weekEndDate = "Jan 7",
  dashboardUrl = "https://photoproos.com/properties",
}: PropertyWeeklyDigestEmailProps) {
  const previewText = `Your property website stats for ${weekStartDate} - ${weekEndDate}: ${totalViews} views`;
  const changeText = viewsChange >= 0 ? `+${viewsChange}%` : `${viewsChange}%`;
  const changeColor = viewsChange >= 0 ? "#22c55e" : "#ef4444";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
            <Text style={tagline}>Weekly Property Analytics</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>Your Weekly Digest</Heading>
            <Text style={dateRange}>{weekStartDate} - {weekEndDate}</Text>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              Here&apos;s how your property websites performed this week:
            </Text>

            {/* Summary Stats */}
            <Section style={statsGrid}>
              <Section style={statBox}>
                <Text style={statNumber}>{totalViews.toLocaleString()}</Text>
                <Text style={statLabel}>Total Views</Text>
                <Text style={{ ...statChange, color: changeColor }}>{changeText} vs last week</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{totalVisitors.toLocaleString()}</Text>
                <Text style={statLabel}>Unique Visitors</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{totalLeads}</Text>
                <Text style={statLabel}>New Leads</Text>
              </Section>
            </Section>

            {/* Property Breakdown */}
            {properties.length > 0 && (
              <>
                <Hr style={divider} />
                <Text style={sectionTitle}>Property Breakdown</Text>

                {properties.map((property, index) => (
                  <Section key={index} style={propertyRow}>
                    <Text style={propertyAddress}>{property.address}</Text>
                    <Text style={propertyLocation}>
                      {property.city}, {property.state}
                    </Text>
                    <Section style={propertyStats}>
                      <Text style={propertyStat}>
                        {property.views} views
                      </Text>
                      <Text style={propertyStat}>
                        {property.uniqueVisitors} visitors
                      </Text>
                      {property.leads > 0 && (
                        <Text style={propertyStatHighlight}>
                          {property.leads} leads
                        </Text>
                      )}
                    </Section>
                    {property.topReferrer && (
                      <Text style={propertyMeta}>
                        Top referrer: {property.topReferrer}
                      </Text>
                    )}
                  </Section>
                ))}
              </>
            )}

            {/* No properties message */}
            {properties.length === 0 && (
              <>
                <Hr style={divider} />
                <Text style={noDataText}>
                  No property website activity this week. Create a property website to start tracking analytics.
                </Text>
              </>
            )}

            <Hr style={divider} />

            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                View Full Analytics
              </Button>
            </Section>

            <Text style={tipText}>
              Tip: Share your property websites on social media and MLS listings
              to drive more traffic and generate leads.
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

export default PropertyWeeklyDigestEmail;

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

const statChange = {
  fontSize: "11px",
  margin: "4px 0 0 0",
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

const propertyRow = {
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
};

const propertyAddress = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const propertyLocation = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "2px 0 8px 0",
};

const propertyStats = {
  display: "flex",
  gap: "16px",
};

const propertyStat = {
  color: "#a7a7a7",
  fontSize: "13px",
  margin: "0",
};

const propertyStatHighlight = {
  color: "#22c55e",
  fontSize: "13px",
  fontWeight: "500",
  margin: "0",
};

const propertyMeta = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "8px 0 0 0",
};

const noDataText = {
  color: "#7c7c7c",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "16px 0",
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

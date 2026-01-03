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

interface TeamInvitationEmailProps {
  inviteeName: string;
  organizationName: string;
  inviterName: string;
  role: "admin" | "member";
  inviteUrl: string;
  expiresInDays?: number;
}

export function TeamInvitationEmail({
  inviteeName = "there",
  organizationName = "The Studio",
  inviterName = "A team member",
  role = "member",
  inviteUrl = "https://app.photoproos.com/invite/abc123",
  expiresInDays = 7,
}: TeamInvitationEmailProps) {
  const previewText = `${inviterName} has invited you to join ${organizationName} on PhotoProOS`;
  const roleLabel = role === "admin" ? "Admin" : "Team Member";

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
            <Text style={inviteEmoji}>👋</Text>
            <Heading style={heading}>You&apos;re Invited!</Heading>

            <Text style={paragraph}>Hi {inviteeName},</Text>

            <Text style={paragraph}>
              <strong>{inviterName}</strong> has invited you to join{" "}
              <strong>{organizationName}</strong> on PhotoProOS as a{" "}
              <span style={roleBadge}>{roleLabel}</span>.
            </Text>

            <Text style={paragraph}>
              PhotoProOS is a powerful platform for professional photographers to
              manage galleries, bookings, clients, and payments all in one place.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={inviteUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={expiryNote}>
              This invitation expires in {expiresInDays} days.
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>What you&apos;ll be able to do</Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                ✓ <strong>Manage Galleries</strong> - Create and deliver photo
                galleries to clients
              </Text>
              <Text style={featureItem}>
                ✓ <strong>Handle Bookings</strong> - Manage your schedule and
                client sessions
              </Text>
              <Text style={featureItem}>
                ✓ <strong>Client Management</strong> - Keep track of clients and
                communications
              </Text>
              {role === "admin" && (
                <Text style={featureItem}>
                  ✓ <strong>Admin Access</strong> - Manage team settings and
                  permissions
                </Text>
              )}
            </Section>

            <Hr style={divider} />

            <Text style={smallText}>
              If you weren&apos;t expecting this invitation, you can safely ignore
              this email. If you have any questions, please contact{" "}
              {inviterName} directly.
            </Text>

            <Text style={smallText}>
              Button not working? Copy and paste this link into your browser:
              <br />
              <Link href={inviteUrl} style={linkStyle}>
                {inviteUrl}
              </Link>
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

export default TeamInvitationEmail;

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

const inviteEmoji = {
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

const roleBadge = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: "600",
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

const expiryNote = {
  color: "#7c7c7c",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
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
  lineHeight: "24px",
  margin: "0 0 4px 0",
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

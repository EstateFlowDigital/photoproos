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

interface WelcomeEmailProps {
  userName: string;
  organizationName: string;
}

export function WelcomeEmail({
  userName = "there",
  organizationName = "Your Studio",
}: WelcomeEmailProps) {
  const previewText = `Welcome to PhotoProOS, ${userName}!`;

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
            <Text style={welcomeEmoji}>🎉</Text>
            <Heading style={heading}>Welcome to PhotoProOS!</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              Thank you for joining PhotoProOS! We&apos;re thrilled to have{" "}
              <strong>{organizationName}</strong> on board.
            </Text>

            <Text style={paragraph}>
              PhotoProOS is designed to help you deliver stunning galleries,
              collect payments automatically, and run your entire photography
              business from one platform.
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Get Started in 3 Easy Steps</Text>

            <Section style={stepContainer}>
              <Section style={step}>
                <Text style={stepNumber}>1</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Set Up Your Brand</Text>
                  <Text style={stepDescription}>
                    Add your logo and customize your gallery appearance
                  </Text>
                </Section>
              </Section>

              <Section style={step}>
                <Text style={stepNumber}>2</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Connect Stripe</Text>
                  <Text style={stepDescription}>
                    Start accepting payments from your clients instantly
                  </Text>
                </Section>
              </Section>

              <Section style={step}>
                <Text style={stepNumber}>3</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Create Your First Gallery</Text>
                  <Text style={stepDescription}>
                    Upload photos and share with your clients
                  </Text>
                </Section>
              </Section>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href="https://app.photoproos.com/dashboard">
                Go to Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={sectionTitle}>What You Can Do</Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                ✓ <strong>Deliver Galleries</strong> - Beautiful, branded photo
                galleries for your clients
              </Text>
              <Text style={featureItem}>
                ✓ <strong>Accept Payments</strong> - Pay-to-unlock galleries with
                Stripe
              </Text>
              <Text style={featureItem}>
                ✓ <strong>Manage Clients</strong> - Keep track of all your
                clients in one place
              </Text>
              <Text style={featureItem}>
                ✓ <strong>Schedule Bookings</strong> - Organize your calendar and
                sessions
              </Text>
              <Text style={featureItem}>
                ✓ <strong>Track Payments</strong> - See all your revenue at a
                glance
              </Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions, our support team is here to help. Just
              reply to this email!
            </Text>

            <Text style={signoff}>
              Welcome aboard,
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
              <Link href="https://photoproos.com/blog" style={footerLink}>
                Blog
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

export default WelcomeEmail;

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

const stepContainer = {
  marginBottom: "24px",
};

const step = {
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

const featureList = {
  marginBottom: "24px",
};

const featureItem = {
  color: "#a7a7a7",
  fontSize: "15px",
  lineHeight: "28px",
  margin: "0",
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

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface LeadMessageNotificationEmailProps {
  recipientName: string;
  senderName: string;
  senderCompany: string;
  messagePreview: string;
  magicLinkUrl: string;
  logoUrl?: string;
  brandColor?: string;
}

export function LeadMessageNotificationEmail({
  recipientName = "there",
  senderName = "Your Photographer",
  senderCompany = "Photo Studio",
  messagePreview = "You have a new message...",
  magicLinkUrl = "https://app.photoproos.com",
  logoUrl,
  brandColor = "#3b82f6",
}: LeadMessageNotificationEmailProps) {
  const previewText = `New message from ${senderName} at ${senderCompany}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            {logoUrl ? (
              <Img
                src={logoUrl}
                alt={senderCompany}
                height="40"
                style={{ margin: "0 auto" }}
              />
            ) : (
              <Heading style={logoText}>{senderCompany}</Heading>
            )}
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>You have a new message</Heading>

            <Text style={paragraph}>Hi {recipientName},</Text>

            <Text style={paragraph}>
              {senderName} from <strong>{senderCompany}</strong> has sent you a message:
            </Text>

            {/* Message Preview Box */}
            <Section style={messageBox}>
              <Text style={messageText}>{messagePreview}</Text>
            </Section>

            <Text style={paragraph}>
              Click the button below to view and reply to this message in your secure client portal:
            </Text>

            <Section style={buttonSection}>
              <Button style={{ ...button, backgroundColor: brandColor }} href={magicLinkUrl}>
                View Message &amp; Reply
              </Button>
            </Section>

            <Text style={securityNote}>
              This is a secure link that will log you into your client portal. The link expires in 24 hours for your security.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Response Options */}
          <Section style={optionsSection}>
            <Heading style={optionsHeading}>Other ways to respond:</Heading>
            <Text style={optionText}>
              Reply directly to this email and we&apos;ll receive your message.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by {senderCompany} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              The Business OS for Professional Photographers
            </Text>
            <Text style={footerDisclaimer}>
              If you didn&apos;t expect this message, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default LeadMessageNotificationEmail;

// Styles
const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700" as const,
  margin: "0",
};

const contentSection = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  border: "1px solid #262626",
  padding: "32px",
};

const heading = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "600" as const,
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const paragraph = {
  color: "#a7a7a7",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const messageBox = {
  backgroundColor: "#0a0a0a",
  borderRadius: "8px",
  border: "1px solid #313131",
  padding: "16px 20px",
  margin: "20px 0",
};

const messageText = {
  color: "#ffffff",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
  fontStyle: "italic" as const,
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "28px 0 20px",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 28px",
  display: "inline-block",
};

const securityNote = {
  color: "#7c7c7c",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0",
};

const hr = {
  borderColor: "#262626",
  margin: "24px 0",
};

const optionsSection = {
  padding: "0 20px",
};

const optionsHeading = {
  color: "#a7a7a7",
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0 0 8px",
};

const optionText = {
  color: "#7c7c7c",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const footerText = {
  color: "#7c7c7c",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 4px",
};

const footerLink = {
  color: "#3b82f6",
  textDecoration: "none",
};

const footerDisclaimer = {
  color: "#4a4a4a",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "12px 0 0",
};

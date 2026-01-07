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

interface NewMessageNotificationEmailProps {
  recipientName: string;
  senderName: string;
  conversationName?: string;
  messagePreview: string;
  messageUrl: string;
  isGroupConversation?: boolean;
  unreadCount?: number;
}

export function NewMessageNotificationEmail({
  recipientName = "there",
  senderName = "Someone",
  conversationName,
  messagePreview = "You have a new message...",
  messageUrl = "https://app.photoproos.com/messages",
  isGroupConversation = false,
  unreadCount = 1,
}: NewMessageNotificationEmailProps) {
  const previewText = isGroupConversation
    ? `${senderName} in ${conversationName}: ${messagePreview}`
    : `New message from ${senderName}`;

  const heading = isGroupConversation
    ? `New message in ${conversationName}`
    : `New message from ${senderName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={headingStyle}>{heading}</Heading>

            <Text style={paragraph}>Hi {recipientName},</Text>

            {isGroupConversation ? (
              <Text style={paragraph}>
                <strong>{senderName}</strong> sent a message in{" "}
                <strong>{conversationName}</strong>:
              </Text>
            ) : (
              <Text style={paragraph}>
                <strong>{senderName}</strong> sent you a message:
              </Text>
            )}

            {/* Message Preview Box */}
            <Section style={messageBox}>
              <Text style={messageText}>&ldquo;{messagePreview}&rdquo;</Text>
            </Section>

            {unreadCount > 1 && (
              <Text style={unreadBadge}>
                +{unreadCount - 1} more unread message{unreadCount > 2 ? "s" : ""}
              </Text>
            )}

            <Section style={buttonSection}>
              <Button style={button} href={messageUrl}>
                View Conversation
              </Button>
            </Section>

            <Text style={securityNote}>
              Click the button above to view and reply to this message.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              The Business OS for Professional Photographers
            </Text>
            <Text style={footerDisclaimer}>
              You received this email because you have message notifications enabled.
              <br />
              <Link href={`${messageUrl}?settings=notifications`} style={footerLink}>
                Manage notification preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NewMessageNotificationEmail;

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

const headingStyle = {
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

const unreadBadge = {
  color: "#3b82f6",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0 0 16px",
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

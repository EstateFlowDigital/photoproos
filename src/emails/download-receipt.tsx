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

interface DownloadReceiptEmailProps {
  clientName: string;
  galleryName: string;
  galleryUrl: string;
  photographerName: string;
  downloadedPhotos: {
    filename: string;
    format: string;
  }[];
  totalFileCount: number;
  downloadedAt: string;
  receiptId?: string;
}

export function DownloadReceiptEmail({
  clientName = "there",
  galleryName = "Your Gallery",
  galleryUrl = "https://app.photoproos.com",
  photographerName = "Your Photographer",
  downloadedPhotos = [],
  totalFileCount = 0,
  downloadedAt = new Date().toISOString(),
  receiptId,
}: DownloadReceiptEmailProps) {
  const previewText = `Download receipt for ${galleryName}`;
  const formattedDate = new Date(downloadedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const formatLabel = {
    original: "Original",
    web_size: "Web Size",
    high_res: "High Resolution",
    zip_all: "Full Gallery (ZIP)",
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={logoSection}>
            <Heading style={logoText}>PhotoProOS</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Section style={iconBadge}>
              <Text style={downloadIcon}>&#8595;</Text>
            </Section>

            <Heading style={heading}>Download Receipt</Heading>

            <Text style={paragraph}>Hi {clientName},</Text>

            <Text style={paragraph}>
              This is a confirmation of your recent download from{" "}
              <strong>{galleryName}</strong>. We&apos;ve included the details
              below for your records.
            </Text>

            {/* Download Details */}
            <Section style={receiptBox}>
              <Text style={receiptTitle}>Download Details</Text>
              <Hr style={divider} />

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Gallery</Text>
                <Text style={receiptValue}>{galleryName}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Downloaded</Text>
                <Text style={receiptValue}>{formattedDate}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Total Files</Text>
                <Text style={receiptValueBold}>
                  {totalFileCount} {totalFileCount === 1 ? "photo" : "photos"}
                </Text>
              </Section>

              {receiptId && (
                <Section style={receiptRow}>
                  <Text style={receiptLabel}>Receipt ID</Text>
                  <Text style={receiptValueSmall}>{receiptId}</Text>
                </Section>
              )}

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Photographer</Text>
                <Text style={receiptValue}>{photographerName}</Text>
              </Section>
            </Section>

            {/* Downloaded Files List */}
            {downloadedPhotos.length > 0 && downloadedPhotos.length <= 10 && (
              <Section style={fileListBox}>
                <Text style={fileListTitle}>Downloaded Files</Text>
                <Hr style={divider} />
                {downloadedPhotos.map((photo, index) => (
                  <Section key={index} style={fileRow}>
                    <Text style={fileName}>{photo.filename}</Text>
                    <Text style={fileFormat}>
                      {formatLabel[photo.format as keyof typeof formatLabel] ||
                        photo.format}
                    </Text>
                  </Section>
                ))}
              </Section>
            )}

            {downloadedPhotos.length > 10 && (
              <Section style={fileListBox}>
                <Text style={fileListTitle}>Downloaded Files</Text>
                <Hr style={divider} />
                <Text style={moreFilesText}>
                  {downloadedPhotos.length} files downloaded
                </Text>
              </Section>
            )}

            <Section style={buttonSection}>
              <Button style={button} href={galleryUrl}>
                View Gallery
              </Button>
            </Section>

            <Text style={tipText}>
              <strong>Tip:</strong> Keep this email for your records. If you
              need to download your photos again, simply visit the gallery using
              the button above.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This receipt was sent by {photographerName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              If you have any questions about your photos, please contact{" "}
              {photographerName} directly.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DownloadReceiptEmail;

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
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const contentSection = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  padding: "40px 32px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const iconBadge = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const downloadIcon = {
  color: "#3b82f6",
  fontSize: "48px",
  fontWeight: "700",
  margin: "0",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
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

const receiptBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const receiptTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
};

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "16px 0",
};

const receiptRow = {
  marginBottom: "12px",
};

const receiptLabel = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "0 0 4px 0",
};

const receiptValue = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
};

const receiptValueBold = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const receiptValueSmall = {
  color: "#a7a7a7",
  fontSize: "12px",
  fontFamily: "monospace",
  margin: "0",
};

const fileListBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0 0 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const fileListTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
};

const fileRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
  paddingBottom: "8px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
};

const fileName = {
  color: "#ffffff",
  fontSize: "14px",
  margin: "0",
};

const fileFormat = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "0",
};

const moreFilesText = {
  color: "#a7a7a7",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0",
};

const tipText = {
  color: "#7c7c7c",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "16px 0 0 0",
  padding: "16px",
  backgroundColor: "#191919",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
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

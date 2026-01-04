import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Inter font
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
    padding: 50,
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#0a0a0a",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0a0a0a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  partiesSection: {
    marginBottom: 30,
    flexDirection: "row",
    gap: 40,
  },
  partyBlock: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 2,
  },
  partyDetail: {
    fontSize: 10,
    color: "#4b5563",
  },
  contentSection: {
    marginBottom: 40,
  },
  contentText: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.6,
    textAlign: "justify",
  },
  signaturesSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  signaturesTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0a0a0a",
    marginBottom: 20,
  },
  signaturesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  signatureBox: {
    width: "45%",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 20,
  },
  signatureBoxSigned: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 4,
  },
  signatureEmail: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 8,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    borderStyle: "dashed",
    paddingBottom: 30,
    marginBottom: 8,
  },
  signatureLineText: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 4,
  },
  signedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  signedText: {
    fontSize: 10,
    color: "#16a34a",
    fontWeight: 600,
  },
  signedDate: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  pageNumber: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

interface ContractSigner {
  name: string | null;
  email: string;
  signedAt: Date | null;
}

export interface ContractPdfProps {
  contractName: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  signedAt: string | null;
  businessName: string;
  businessEmail: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientCompany: string | null;
  content: string;
  signers: ContractSigner[];
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case "signed":
      return { bg: "#dcfce7", text: "#166534" };
    case "sent":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "expired":
    case "cancelled":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
}

function formatStatusLabel(status: string): string {
  if (status === "sent") return "Awaiting Signature";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Strip HTML tags for PDF rendering
function stripHtml(html: string): string {
  // Replace common HTML entities
  let text = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Replace block elements with newlines
  text = text
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n");

  // Add bullet points for list items
  text = text.replace(/<li[^>]*>/gi, "• ");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Clean up whitespace
  text = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/gm, "")
    .trim();

  return text;
}

export function ContractPdf({
  contractName,
  status,
  createdAt,
  sentAt,
  signedAt,
  businessName,
  businessEmail,
  clientName,
  clientEmail,
  clientCompany,
  content,
  signers,
}: ContractPdfProps) {
  const statusColors = getStatusColor(status);
  const plainContent = stripHtml(content);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{contractName}</Text>
          <Text style={styles.subtitle}>
            Created: {createdAt}
            {sentAt && ` • Sent: ${sentAt}`}
            {signedAt && ` • Fully Signed: ${signedAt}`}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.bg },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {formatStatusLabel(status)}
            </Text>
          </View>
        </View>

        {/* Parties Section */}
        <View style={styles.partiesSection}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{businessName}</Text>
            {businessEmail && (
              <Text style={styles.partyDetail}>{businessEmail}</Text>
            )}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>To</Text>
            <Text style={styles.partyName}>
              {clientName || clientCompany || "Client"}
            </Text>
            {clientCompany && clientName && (
              <Text style={styles.partyDetail}>{clientCompany}</Text>
            )}
            {clientEmail && (
              <Text style={styles.partyDetail}>{clientEmail}</Text>
            )}
          </View>
        </View>

        {/* Contract Content */}
        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{plainContent}</Text>
        </View>

        {/* Signatures Section */}
        {signers.length > 0 && (
          <View style={styles.signaturesSection}>
            <Text style={styles.signaturesTitle}>Signatures</Text>
            <View style={styles.signaturesGrid}>
              {signers.map((signer, index) => (
                <View
                  key={index}
                  style={[
                    styles.signatureBox,
                    signer.signedAt ? styles.signatureBoxSigned : {},
                  ]}
                >
                  <Text style={styles.signatureName}>
                    {signer.name || signer.email}
                  </Text>
                  {signer.name && (
                    <Text style={styles.signatureEmail}>{signer.email}</Text>
                  )}
                  {signer.signedAt ? (
                    <View style={styles.signedIndicator}>
                      <Text style={styles.signedText}>Signed electronically</Text>
                      <Text style={styles.signedDate}>
                        {new Date(signer.signedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.signatureLine} />
                      <Text style={styles.signatureLineText}>
                        Signature pending
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This document was generated electronically.
          </Text>
          <Text style={styles.footerText}>
            Generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default ContractPdf;

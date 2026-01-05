import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
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
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#22c55e",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  logo: {
    width: 120,
    maxHeight: 60,
    objectFit: "contain",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#22c55e",
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 12,
    color: "#7c7c7c",
  },
  paidBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  paidText: {
    fontSize: 12,
    fontWeight: 700,
    color: "#166534",
    textTransform: "uppercase",
  },
  infoSection: {
    flexDirection: "row",
    marginBottom: 40,
    gap: 40,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: "#7c7c7c",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 11,
    color: "#0a0a0a",
    lineHeight: 1.5,
  },
  infoTextBold: {
    fontSize: 11,
    color: "#0a0a0a",
    fontWeight: 600,
    marginBottom: 2,
  },
  detailsBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 11,
    color: "#0a0a0a",
    fontWeight: 600,
  },
  totalSection: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    padding: 20,
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: 600,
  },
  totalAmount: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: 700,
  },
  thankYouSection: {
    textAlign: "center",
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 8,
  },
  thankYouSubtext: {
    fontSize: 11,
    color: "#6b7280",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: "#7c7c7c",
  },
  transactionId: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
  },
  transactionLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  transactionValue: {
    fontSize: 10,
    color: "#374151",
    fontFamily: "Courier",
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  watermark: {
    fontSize: 72,
    fontWeight: 700,
    color: "#22c55e",
    opacity: 0.08,
    transform: "rotate(-45deg)",
    textTransform: "uppercase",
  },
});

export interface ReceiptPdfProps {
  receiptNumber: string;
  paidDate: string;
  clientName: string;
  clientEmail: string | null;
  clientCompany: string | null;
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  logoUrl: string | null;
  description: string;
  amountCents: number;
  transactionId: string | null;
  accentColor: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function ReceiptPdf({
  receiptNumber,
  paidDate,
  clientName,
  clientEmail,
  clientCompany,
  businessName,
  businessEmail,
  businessPhone,
  logoUrl,
  description,
  amountCents,
  transactionId,
  accentColor,
}: ReceiptPdfProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Paid Watermark */}
        <View style={styles.watermarkContainer}>
          <Text style={[styles.watermark, { color: accentColor }]}>PAID</Text>
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: accentColor }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: accentColor }]}>RECEIPT</Text>
            <Text style={styles.receiptNumber}>{receiptNumber}</Text>
          </View>
          <View style={styles.headerRight}>
            {logoUrl && (
              <Image src={logoUrl} style={styles.logo} />
            )}
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a" }}>
              {businessName}
            </Text>
            {businessEmail && (
              <Text style={styles.receiptNumber}>{businessEmail}</Text>
            )}
            {businessPhone && (
              <Text style={styles.receiptNumber}>{businessPhone}</Text>
            )}
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Received From</Text>
            <Text style={styles.infoTextBold}>{clientName}</Text>
            {clientCompany && (
              <Text style={styles.infoText}>{clientCompany}</Text>
            )}
            {clientEmail && <Text style={styles.infoText}>{clientEmail}</Text>}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Payment Date</Text>
            <Text style={styles.infoTextBold}>{paidDate}</Text>
          </View>
        </View>

        {/* Payment Details Box */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {transactionId ? "Credit Card" : "Other"}
            </Text>
          </View>
          <View style={styles.detailRowLast}>
            <Text style={styles.detailLabel}>Receipt Number</Text>
            <Text style={styles.detailValue}>{receiptNumber}</Text>
          </View>
        </View>

        {/* Total Amount */}
        <View style={[styles.totalSection, { backgroundColor: accentColor }]}>
          <Text style={styles.totalLabel}>Amount Paid</Text>
          <Text style={styles.totalAmount}>{formatCurrency(amountCents)}</Text>
        </View>

        {/* Transaction ID */}
        {transactionId && (
          <View style={styles.transactionId}>
            <Text style={styles.transactionLabel}>Transaction ID</Text>
            <Text style={styles.transactionValue}>{transactionId}</Text>
          </View>
        )}

        {/* Thank You Section */}
        <View style={styles.thankYouSection}>
          <Text style={styles.thankYouText}>Thank you for your payment!</Text>
          <Text style={styles.thankYouSubtext}>
            This receipt confirms your payment has been received and processed.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Payment processed securely
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

export default ReceiptPdf;

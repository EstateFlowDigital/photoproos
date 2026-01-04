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
    color: "#0a0a0a",
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#7c7c7c",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  infoSection: {
    flexDirection: "row",
    marginBottom: 30,
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
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 600,
    color: "#454545",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    width: 60,
    textAlign: "center",
  },
  colRate: {
    width: 80,
    textAlign: "right",
  },
  colAmount: {
    width: 100,
    textAlign: "right",
  },
  cellText: {
    fontSize: 10,
    color: "#0a0a0a",
  },
  cellTextMuted: {
    fontSize: 9,
    color: "#7c7c7c",
    marginTop: 2,
  },
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  totalsBox: {
    width: 250,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: "#0a0a0a",
    marginTop: 6,
  },
  totalsLabel: {
    fontSize: 11,
    color: "#7c7c7c",
  },
  totalsValue: {
    fontSize: 11,
    color: "#0a0a0a",
  },
  totalsLabelFinal: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0a0a0a",
  },
  totalsValueFinal: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0a0a0a",
  },
  notesSection: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#454545",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 10,
    color: "#454545",
    lineHeight: 1.5,
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
  paymentInfo: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  paymentLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#1e40af",
    marginBottom: 6,
  },
  paymentText: {
    fontSize: 10,
    color: "#1e40af",
  },
  qrCodeSection: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  qrCodeTextContainer: {
    flex: 1,
  },
  qrCodeTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#166534",
    marginBottom: 4,
  },
  qrCodeSubtitle: {
    fontSize: 10,
    color: "#15803d",
    marginBottom: 2,
  },
  qrCodeUrl: {
    fontSize: 8,
    color: "#6b7280",
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
    opacity: 0.08,
    transform: "rotate(-45deg)",
    textTransform: "uppercase",
  },
});

interface InvoiceLineItem {
  description: string;
  itemType: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
}

export interface InvoicePdfProps {
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  businessAddress: string | null;
  logoUrl: string | null;
  lineItems: InvoiceLineItem[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  notes: string | null;
  terms: string | null;
  paymentUrl: string | null;
  qrCodeDataUrl: string | null;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case "paid":
      return { bg: "#dcfce7", text: "#166534" };
    case "sent":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "overdue":
      return { bg: "#fee2e2", text: "#991b1b" };
    case "cancelled":
      return { bg: "#f3f4f6", text: "#6b7280" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
}

function getWatermarkConfig(status: string): { text: string; color: string } | null {
  switch (status.toLowerCase()) {
    case "paid":
      return { text: "PAID", color: "#22c55e" };
    case "overdue":
      return { text: "OVERDUE", color: "#ef4444" };
    case "cancelled":
      return { text: "CANCELLED", color: "#6b7280" };
    default:
      return null; // No watermark for draft/sent status
  }
}

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const lineItemTypeLabels: Record<string, string> = {
  service: "Service",
  travel: "Travel",
  custom: "Custom",
  discount: "Discount",
  tax: "Tax",
};

export function InvoicePdf({
  invoiceNumber,
  status,
  issueDate,
  dueDate,
  clientName,
  clientEmail,
  clientAddress,
  businessName,
  businessEmail,
  businessPhone,
  businessAddress,
  logoUrl,
  lineItems,
  subtotalCents,
  discountCents,
  taxCents,
  totalCents,
  notes,
  terms,
  paymentUrl,
  qrCodeDataUrl,
}: InvoicePdfProps) {
  const statusColors = getStatusColor(status);
  const watermarkConfig = getWatermarkConfig(status);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Status Watermark */}
        {watermarkConfig && (
          <View style={styles.watermarkContainer}>
            <Text style={[styles.watermark, { color: watermarkConfig.color }]}>
              {watermarkConfig.text}
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          </View>
          <View style={styles.headerRight}>
            {logoUrl && (
              <Image src={logoUrl} style={styles.logo} />
            )}
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a" }}>
              {businessName}
            </Text>
            {businessEmail && (
              <Text style={styles.invoiceNumber}>{businessEmail}</Text>
            )}
            {businessPhone && (
              <Text style={styles.invoiceNumber}>{businessPhone}</Text>
            )}
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
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.infoTextBold}>{clientName}</Text>
            {clientEmail && <Text style={styles.infoText}>{clientEmail}</Text>}
            {clientAddress && (
              <Text style={styles.infoText}>{clientAddress}</Text>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Invoice Details</Text>
            <Text style={styles.infoText}>Issue Date: {issueDate}</Text>
            <Text style={styles.infoText}>Due Date: {dueDate}</Text>
          </View>
          {businessAddress && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.infoText}>{businessAddress}</Text>
            </View>
          )}
        </View>

        {/* QR Code Payment Section (if QR code exists and not paid) */}
        {qrCodeDataUrl && paymentUrl && status !== "paid" && status !== "cancelled" && (
          <View style={styles.qrCodeSection}>
            <Image src={qrCodeDataUrl} style={styles.qrCode} />
            <View style={styles.qrCodeTextContainer}>
              <Text style={styles.qrCodeTitle}>Scan to Pay</Text>
              <Text style={styles.qrCodeSubtitle}>
                Use your phone camera to scan and pay instantly
              </Text>
              <Text style={styles.qrCodeUrl}>{paymentUrl}</Text>
            </View>
          </View>
        )}

        {/* Fallback Payment Info (if no QR code but URL exists) */}
        {!qrCodeDataUrl && paymentUrl && status !== "paid" && status !== "cancelled" && (
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Pay Online</Text>
            <Text style={styles.paymentText}>{paymentUrl}</Text>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDescription}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={styles.colRate}>
              <Text style={styles.tableHeaderText}>Rate</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {lineItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>{item.description}</Text>
                <Text style={styles.cellTextMuted}>
                  {lineItemTypeLabels[item.itemType] || item.itemType}
                </Text>
              </View>
              <View style={styles.colQty}>
                <Text style={styles.cellText}>{item.quantity}</Text>
              </View>
              <View style={styles.colRate}>
                <Text style={styles.cellText}>
                  {formatCurrency(item.unitCents)}
                </Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.cellText}>
                  {formatCurrency(item.totalCents)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(subtotalCents)}
              </Text>
            </View>
            {discountCents > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={[styles.totalsValue, { color: "#16a34a" }]}>
                  -{formatCurrency(discountCents)}
                </Text>
              </View>
            )}
            {taxCents > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrency(taxCents)}
                </Text>
              </View>
            )}
            <View style={styles.totalsRowFinal}>
              <Text style={styles.totalsLabelFinal}>Total Due</Text>
              <Text style={styles.totalsValueFinal}>
                {formatCurrency(totalCents)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Terms */}
        {terms && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!
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

export default InvoicePdf;

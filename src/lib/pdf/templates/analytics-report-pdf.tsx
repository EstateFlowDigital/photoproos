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
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0a0a0a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#7c7c7c",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 8,
  },
  metricCard: {
    width: "30%",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  metricLabel: {
    fontSize: 10,
    color: "#7c7c7c",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0a0a0a",
  },
  metricChange: {
    fontSize: 10,
    marginTop: 4,
  },
  metricChangePositive: {
    color: "#16a34a",
  },
  metricChangeNegative: {
    color: "#dc2626",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 600,
    color: "#7c7c7c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 11,
    color: "#0a0a0a",
  },
  tableCellMuted: {
    fontSize: 11,
    color: "#7c7c7c",
  },
  col1: { width: "40%" },
  col2: { width: "30%" },
  col3: { width: "30%", textAlign: "right" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  chartContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: 8,
    paddingTop: 20,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    width: "80%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 8,
    color: "#7c7c7c",
    marginTop: 6,
  },
  barValue: {
    fontSize: 8,
    color: "#0a0a0a",
    fontWeight: 600,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#7c7c7c",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 600,
    color: "#0a0a0a",
  },
  footer: {
    position: "absolute",
    bottom: 30,
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
  pageNumber: {
    fontSize: 9,
    color: "#7c7c7c",
  },
});

// Helper to format currency
function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Helper to format percentage change
function formatChange(current: number, previous: number): { text: string; positive: boolean } {
  if (previous === 0) {
    return { text: current > 0 ? "+100%" : "0%", positive: current >= 0 };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    text: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
    positive: change >= 0,
  };
}

export interface AnalyticsReportProps {
  // Business info
  businessName: string;
  reportDate: string;
  periodLabel: string;

  // Revenue metrics
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  ytdRevenue: number;
  currency?: string;

  // Project/Client metrics
  thisMonthProjects: number;
  lastMonthProjects: number;
  newClients: number;
  totalClients: number;

  // Invoice metrics
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: number;
  paidInvoicesCount: number;
  paidInvoicesAmount: number;

  // Monthly revenue data for chart
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;

  // Top clients
  topClients: Array<{
    name: string;
    totalRevenue: number;
    projectCount: number;
  }>;

  // Accent color
  accentColor?: string;
}

export function AnalyticsReportPdf({
  businessName,
  reportDate,
  periodLabel,
  thisMonthRevenue,
  lastMonthRevenue,
  ytdRevenue,
  currency = "USD",
  thisMonthProjects,
  lastMonthProjects,
  newClients,
  totalClients,
  pendingInvoicesCount,
  pendingInvoicesAmount,
  overdueInvoicesCount,
  overdueInvoicesAmount,
  paidInvoicesCount,
  paidInvoicesAmount,
  monthlyRevenue,
  topClients,
  accentColor = "#3b82f6",
}: AnalyticsReportProps) {
  const revenueChange = formatChange(thisMonthRevenue, lastMonthRevenue);
  const projectsChange = formatChange(thisMonthProjects, lastMonthProjects);

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: accentColor }]}>
          <Text style={styles.title}>Business Analytics Report</Text>
          <Text style={styles.subtitle}>
            {businessName} • {periodLabel} • Generated {reportDate}
          </Text>
        </View>

        {/* Revenue Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Summary</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>This Month</Text>
              <Text style={styles.metricValue}>{formatCurrency(thisMonthRevenue, currency)}</Text>
              <Text
                style={[
                  styles.metricChange,
                  revenueChange.positive ? styles.metricChangePositive : styles.metricChangeNegative,
                ]}
              >
                {revenueChange.text} vs last month
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Last Month</Text>
              <Text style={styles.metricValue}>{formatCurrency(lastMonthRevenue, currency)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Year to Date</Text>
              <Text style={styles.metricValue}>{formatCurrency(ytdRevenue, currency)}</Text>
            </View>
          </View>
        </View>

        {/* Monthly Revenue Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Revenue Trend</Text>
          <View style={styles.chartContainer}>
            <View style={styles.barChart}>
              {monthlyRevenue.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barValue}>
                    {formatCurrency(item.revenue, currency)}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max((item.revenue / maxRevenue) * 80, 4),
                        backgroundColor: accentColor,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Business Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Projects This Month</Text>
              <Text style={styles.metricValue}>{thisMonthProjects}</Text>
              <Text
                style={[
                  styles.metricChange,
                  projectsChange.positive ? styles.metricChangePositive : styles.metricChangeNegative,
                ]}
              >
                {projectsChange.text} vs last month
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>New Clients</Text>
              <Text style={styles.metricValue}>{newClients}</Text>
              <Text style={[styles.metricChange, { color: "#7c7c7c" }]}>this month</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Clients</Text>
              <Text style={styles.metricValue}>{totalClients}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Status</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Status</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Count</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.col1}>
                <View style={[styles.statusBadge, { backgroundColor: "#fef3c7" }]}>
                  <Text style={[styles.statusText, { color: "#d97706" }]}>Pending</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, styles.col2]}>{pendingInvoicesCount} invoices</Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {formatCurrency(pendingInvoicesAmount, currency)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.col1}>
                <View style={[styles.statusBadge, { backgroundColor: "#fee2e2" }]}>
                  <Text style={[styles.statusText, { color: "#dc2626" }]}>Overdue</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, styles.col2]}>{overdueInvoicesCount} invoices</Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {formatCurrency(overdueInvoicesAmount, currency)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <View style={styles.col1}>
                <View style={[styles.statusBadge, { backgroundColor: "#dcfce7" }]}>
                  <Text style={[styles.statusText, { color: "#16a34a" }]}>Paid</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, styles.col2]}>{paidInvoicesCount} invoices</Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {formatCurrency(paidInvoicesAmount, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Confidential - {businessName}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* Page 2: Top Clients */}
      {topClients.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Clients by Revenue</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "50%" }]}>Client</Text>
                <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Projects</Text>
                <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "right" }]}>
                  Revenue
                </Text>
              </View>
              {topClients.map((client, index) => (
                <View
                  key={index}
                  style={
                    index === topClients.length - 1
                      ? [styles.tableRow, styles.tableRowLast]
                      : styles.tableRow
                  }
                >
                  <Text style={[styles.tableCell, { width: "50%" }]}>{client.name}</Text>
                  <Text style={[styles.tableCellMuted, { width: "25%" }]}>
                    {client.projectCount} project{client.projectCount !== 1 ? "s" : ""}
                  </Text>
                  <Text style={[styles.tableCell, { width: "25%", textAlign: "right" }]}>
                    {formatCurrency(client.totalRevenue, currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Confidential - {businessName}</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </Page>
      )}
    </Document>
  );
}

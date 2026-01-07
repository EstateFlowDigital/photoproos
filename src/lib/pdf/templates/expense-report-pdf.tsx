import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ExpenseReportData } from "@/lib/actions/project-expenses";

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
  dateRange: {
    fontSize: 11,
    color: "#7c7c7c",
    marginTop: 8,
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
    gap: 12,
    marginBottom: 8,
  },
  metricCard: {
    width: "23%",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  metricLabel: {
    fontSize: 9,
    color: "#7c7c7c",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0a0a0a",
  },
  metricValueSmall: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0a0a0a",
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
    fontSize: 9,
    fontWeight: 600,
    color: "#7c7c7c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 10,
    color: "#0a0a0a",
  },
  tableCellMuted: {
    fontSize: 10,
    color: "#7c7c7c",
  },
  // Table column widths for expense list
  colDate: { width: "12%" },
  colDescription: { width: "28%" },
  colCategory: { width: "15%" },
  colVendor: { width: "15%" },
  colAmount: { width: "15%", textAlign: "right" },
  colStatus: { width: "15%", textAlign: "center" },
  // Table column widths for category breakdown
  colCatName: { width: "40%" },
  colCatCount: { width: "20%", textAlign: "center" },
  colCatAmount: { width: "20%", textAlign: "right" },
  colCatPercent: { width: "20%", textAlign: "right" },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "center",
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
  },
  statusUnpaid: {
    backgroundColor: "#fef3c7",
  },
  statusApproved: {
    backgroundColor: "#dbeafe",
  },
  statusPending: {
    backgroundColor: "#f3e8ff",
  },
  statusRejected: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 8,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  chartContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 12,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    gap: 6,
    paddingTop: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    width: "70%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 7,
    color: "#7c7c7c",
    marginTop: 4,
    textAlign: "center",
  },
  barValue: {
    fontSize: 7,
    color: "#0a0a0a",
    fontWeight: 600,
    marginBottom: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 4,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    borderRadius: 4,
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
  summaryValueTotal: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0a0a0a",
  },
  budgetSection: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginTop: 16,
  },
  budgetTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 12,
  },
  budgetBar: {
    height: 12,
    backgroundColor: "#e5e5e5",
    borderRadius: 6,
    overflow: "hidden",
    marginVertical: 8,
  },
  budgetProgress: {
    height: "100%",
    borderRadius: 6,
  },
  budgetProgressOk: {
    backgroundColor: "#22c55e",
  },
  budgetProgressWarning: {
    backgroundColor: "#f97316",
  },
  budgetProgressCritical: {
    backgroundColor: "#ef4444",
  },
  budgetStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetStat: {
    alignItems: "center",
  },
  budgetStatLabel: {
    fontSize: 9,
    color: "#7c7c7c",
    marginBottom: 2,
  },
  budgetStatValue: {
    fontSize: 12,
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
    paddingTop: 10,
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

const categoryLabels: Record<string, string> = {
  labor: "Labor",
  travel: "Travel",
  equipment: "Equipment",
  software: "Software",
  materials: "Materials",
  marketing: "Marketing",
  fees: "Fees & Permits",
  insurance: "Insurance",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  labor: "#3b82f6",
  travel: "#22c55e",
  equipment: "#f97316",
  software: "#8b5cf6",
  materials: "#ec4899",
  marketing: "#06b6d4",
  fees: "#eab308",
  insurance: "#6366f1",
  other: "#7c7c7c",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ExpenseReportPDFProps {
  data: ExpenseReportData;
  organizationName?: string;
  logoUrl?: string;
}

export function ExpenseReportPDF({ data, organizationName }: ExpenseReportPDFProps) {
  const maxCategoryAmount = Math.max(
    ...data.summary.byCategory.map((c) => c.amount),
    1
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Expense Report</Text>
          <Text style={styles.subtitle}>
            {data.projectName} {organizationName ? `- ${organizationName}` : ""}
          </Text>
          <Text style={styles.dateRange}>
            {formatDate(data.dateRange.from)} - {formatDate(data.dateRange.to)}
          </Text>
        </View>

        {/* Summary Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Expenses</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(data.summary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Paid</Text>
              <Text style={[styles.metricValueSmall, { color: "#22c55e" }]}>
                {formatCurrency(data.summary.totalPaid)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Unpaid</Text>
              <Text style={[styles.metricValueSmall, { color: "#f97316" }]}>
                {formatCurrency(data.summary.totalUnpaid)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Expense Count</Text>
              <Text style={styles.metricValueSmall}>{data.summary.expenseCount}</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown Chart */}
        {data.summary.byCategory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expenses by Category</Text>
            <View style={styles.chartContainer}>
              <View style={styles.barChart}>
                {data.summary.byCategory.slice(0, 9).map((cat) => {
                  const barHeight = (cat.amount / maxCategoryAmount) * 80;
                  return (
                    <View key={cat.category} style={styles.barColumn}>
                      <Text style={styles.barValue}>
                        {formatCurrency(cat.amount)}
                      </Text>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(barHeight, 4),
                            backgroundColor:
                              categoryColors[cat.category] || "#7c7c7c",
                          },
                        ]}
                      />
                      <Text style={styles.barLabel}>
                        {categoryLabels[cat.category] || cat.category}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Category Table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colCatName]}>
                  Category
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colCatCount]}>
                  Count
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colCatAmount]}>
                  Amount
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colCatPercent]}>
                  % of Total
                </Text>
              </View>
              {data.summary.byCategory.map((cat, index) => (
                <View
                  key={cat.category}
                  style={[
                    styles.tableRow,
                    index === data.summary.byCategory.length - 1 &&
                      styles.tableRowLast,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colCatName]}>
                    {categoryLabels[cat.category] || cat.category}
                  </Text>
                  <Text style={[styles.tableCellMuted, styles.colCatCount]}>
                    {cat.count}
                  </Text>
                  <Text style={[styles.tableCell, styles.colCatAmount]}>
                    {formatCurrency(cat.amount)}
                  </Text>
                  <Text style={[styles.tableCellMuted, styles.colCatPercent]}>
                    {cat.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Budget Status */}
        {data.budget && (
          <View style={styles.budgetSection}>
            <Text style={styles.budgetTitle}>Budget Status</Text>
            <View style={styles.budgetBar}>
              <View
                style={[
                  styles.budgetProgress,
                  { width: `${Math.min(data.budget.percentUsed || 0, 100)}%` },
                  data.budget.status === "ok" && styles.budgetProgressOk,
                  data.budget.status === "warning" && styles.budgetProgressWarning,
                  (data.budget.status === "critical" ||
                    data.budget.status === "over") &&
                    styles.budgetProgressCritical,
                ]}
              />
            </View>
            <View style={styles.budgetStats}>
              <View style={styles.budgetStat}>
                <Text style={styles.budgetStatLabel}>Budget</Text>
                <Text style={styles.budgetStatValue}>
                  {data.budget.totalBudget
                    ? formatCurrency(data.budget.totalBudget)
                    : "Not Set"}
                </Text>
              </View>
              <View style={styles.budgetStat}>
                <Text style={styles.budgetStatLabel}>Spent</Text>
                <Text style={styles.budgetStatValue}>
                  {formatCurrency(data.budget.totalSpent)}
                </Text>
              </View>
              <View style={styles.budgetStat}>
                <Text style={styles.budgetStatLabel}>Remaining</Text>
                <Text
                  style={[
                    styles.budgetStatValue,
                    {
                      color:
                        data.budget.remaining !== null && data.budget.remaining < 0
                          ? "#ef4444"
                          : "#22c55e",
                    },
                  ]}
                >
                  {data.budget.remaining !== null
                    ? formatCurrency(data.budget.remaining)
                    : "-"}
                </Text>
              </View>
              <View style={styles.budgetStat}>
                <Text style={styles.budgetStatLabel}>Used</Text>
                <Text style={styles.budgetStatValue}>
                  {data.budget.percentUsed !== null
                    ? `${data.budget.percentUsed}%`
                    : "-"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated on {new Date(data.generatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Expense Details Page */}
      {data.expenses.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expense Details</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
                <Text style={[styles.tableHeaderCell, styles.colDescription]}>
                  Description
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colCategory]}>
                  Category
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colVendor]}>
                  Vendor
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colAmount]}>
                  Amount
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colStatus]}>
                  Status
                </Text>
              </View>
              {data.expenses.map((expense, index) => (
                <View
                  key={expense.id}
                  style={[
                    styles.tableRow,
                    index === data.expenses.length - 1 && styles.tableRowLast,
                  ]}
                >
                  <Text style={[styles.tableCellMuted, styles.colDate]}>
                    {formatDate(expense.date)}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.colDescription]}
                    numberOfLines={1}
                  >
                    {expense.description}
                  </Text>
                  <Text style={[styles.tableCellMuted, styles.colCategory]}>
                    {categoryLabels[expense.category] || expense.category}
                  </Text>
                  <Text
                    style={[styles.tableCellMuted, styles.colVendor]}
                    numberOfLines={1}
                  >
                    {expense.vendor || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colAmount]}>
                    {formatCurrency(expense.amount)}
                  </Text>
                  <View style={styles.colStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        expense.isPaid ? styles.statusPaid : styles.statusUnpaid,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: expense.isPaid ? "#15803d" : "#b45309" },
                        ]}
                      >
                        {expense.isPaid ? "Paid" : "Unpaid"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Summary Total */}
            <View style={styles.summaryRowTotal}>
              <Text style={[styles.summaryLabel, { fontWeight: 600 }]}>
                Total ({data.expenses.length} expenses)
              </Text>
              <Text style={styles.summaryValueTotal}>
                {formatCurrency(data.summary.totalExpenses)}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              Generated on {new Date(data.generatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      )}
    </Document>
  );
}

export default ExpenseReportPDF;

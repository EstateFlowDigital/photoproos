export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav, DocumentIcon } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { DateRangeFilter } from "./date-range-filter";

type DateRange = "this_month" | "last_month" | "this_quarter" | "this_year" | "last_year" | "custom";

interface PageProps {
  searchParams: Promise<{
    range?: DateRange;
    start?: string;
    end?: string;
  }>;
}

function getDateRange(range: DateRange, customStart?: string, customEnd?: string): { startDate: Date; endDate: Date; label: string } {
  const now = new Date();

  switch (range) {
    case "last_month": {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate, endDate, label: "Last Month" };
    }
    case "this_quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const startDate = new Date(now.getFullYear(), quarter * 3, 1);
      const endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      return { startDate, endDate, label: "This Quarter" };
    }
    case "this_year": {
      const startDate = new Date(now.getFullYear(), 0, 1);
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate, label: "This Year" };
    }
    case "last_year": {
      const startDate = new Date(now.getFullYear() - 1, 0, 1);
      const endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { startDate, endDate, label: "Last Year" };
    }
    case "custom": {
      if (customStart && customEnd) {
        const startDate = new Date(customStart);
        const endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
        return {
          startDate,
          endDate,
          label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        };
      }
      // Fall through to default if custom dates not provided
    }
    case "this_month":
    default: {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate, label: "This Month" };
    }
  }
}

export default async function BillingAnalyticsPage({ searchParams }: PageProps) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // Get date range from params
  const params = await searchParams;
  const range = (params.range || "this_month") as DateRange;
  const { startDate: selectedStart, endDate: selectedEnd, label: rangeLabel } = getDateRange(range, params.start, params.end);

  // Get date ranges for comparison
  const now = new Date();
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  // Calculate comparison period (same duration before the selected range)
  const rangeDuration = selectedEnd.getTime() - selectedStart.getTime();
  const comparisonEnd = new Date(selectedStart.getTime() - 1);
  const comparisonStart = new Date(comparisonEnd.getTime() - rangeDuration);

  // Fetch analytics data
  const [
    selectedPeriodInvoiced,
    comparisonPeriodInvoiced,
    selectedPeriodPaid,
    comparisonPeriodPaid,
    thisYearInvoiced,
    thisYearPaid,
    agingReport,
    topClients,
    monthlyRevenue,
  ] = await Promise.all([
    // Selected period invoiced
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        issueDate: { gte: selectedStart, lte: selectedEnd },
      },
      _sum: { totalCents: true },
      _count: true,
    }),
    // Comparison period invoiced
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        issueDate: { gte: comparisonStart, lte: comparisonEnd },
      },
      _sum: { totalCents: true },
      _count: true,
    }),
    // Selected period paid
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        createdAt: { gte: selectedStart, lte: selectedEnd },
        status: "paid",
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    // Comparison period paid
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        createdAt: { gte: comparisonStart, lte: comparisonEnd },
        status: "paid",
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    // This year invoiced
    prisma.invoice.aggregate({
      where: {
        organizationId: organization.id,
        issueDate: { gte: thisYearStart },
      },
      _sum: { totalCents: true },
    }),
    // This year paid
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        createdAt: { gte: thisYearStart },
        status: "paid",
      },
      _sum: { amountCents: true },
    }),
    // Aging report
    prisma.invoice.findMany({
      where: {
        organizationId: organization.id,
        status: { in: ["sent", "overdue"] },
      },
      select: {
        id: true,
        totalCents: true,
        paidAmountCents: true,
        dueDate: true,
      },
    }),
    // Top clients by revenue
    prisma.payment.groupBy({
      by: ["clientId"],
      where: {
        organizationId: organization.id,
        status: "paid",
        clientId: { not: null },
      },
      _sum: { amountCents: true },
      orderBy: { _sum: { amountCents: "desc" } },
      take: 5,
    }),
    // Monthly revenue (last 12 months)
    prisma.$queryRaw<Array<{ month: Date; total: bigint }>>`
      SELECT DATE_TRUNC('month', "createdAt") as month, SUM("amountCents") as total
      FROM "Payment"
      WHERE "organizationId" = ${organization.id}
        AND "status" = 'paid'
        AND "createdAt" >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,
  ]);

  // Calculate aging buckets
  const agingBuckets = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    over90: 0,
  };

  for (const invoice of agingReport) {
    const balanceDue = invoice.totalCents - invoice.paidAmountCents;
    if (balanceDue <= 0 || !invoice.dueDate) continue;

    const daysOverdue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue <= 0) {
      agingBuckets.current += balanceDue;
    } else if (daysOverdue <= 30) {
      agingBuckets.days1to30 += balanceDue;
    } else if (daysOverdue <= 60) {
      agingBuckets.days31to60 += balanceDue;
    } else if (daysOverdue <= 90) {
      agingBuckets.days61to90 += balanceDue;
    } else {
      agingBuckets.over90 += balanceDue;
    }
  }

  // Fetch client names for top clients
  const clientIds = topClients.map((c) => c.clientId).filter(Boolean) as string[];
  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, fullName: true, company: true },
  });
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  // Calculate changes
  const comparisonInvoicedTotal = comparisonPeriodInvoiced._sum?.totalCents ?? 0;
  const selectedInvoicedTotal = selectedPeriodInvoiced._sum?.totalCents ?? 0;
  const comparisonPaidTotal = comparisonPeriodPaid._sum?.amountCents ?? 0;
  const selectedPaidTotal = selectedPeriodPaid._sum?.amountCents ?? 0;

  const invoicedChange =
    comparisonInvoicedTotal > 0
      ? ((selectedInvoicedTotal - comparisonInvoicedTotal) / comparisonInvoicedTotal) * 100
      : 0;

  const paidChange =
    comparisonPaidTotal > 0
      ? ((selectedPaidTotal - comparisonPaidTotal) / comparisonPaidTotal) * 100
      : 0;

  return (
    <div className="space-y-6" data-element="billing-analytics-page">
      <PageHeader
        title="Billing Analytics"
        subtitle="Revenue trends, aging reports, and financial insights"
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Billing", href: "/billing", icon: <OverviewIcon className="h-4 w-4" /> },
          { label: "Analytics", href: "/billing/analytics", icon: <ChartIcon className="h-4 w-4" /> },
          { label: "Reports", href: "/billing/reports", icon: <ReportIcon className="h-4 w-4" /> },
          { label: "Invoices", href: "/invoices", icon: <DocumentIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Date Range Filter */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <DateRangeFilter
          initialRange={range}
          initialStartDate={params.start}
          initialEndDate={params.end}
        />
      </div>

      {/* Period Stats */}
      <div className="auto-grid grid-min-220 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">{rangeLabel} Invoiced</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(selectedInvoicedTotal)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <span
              className={
                invoicedChange >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
              }
            >
              {invoicedChange >= 0 ? "+" : ""}
              {invoicedChange.toFixed(1)}%
            </span>
            <span className="text-foreground-muted">vs prior period</span>
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">{rangeLabel} Collected</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(selectedPaidTotal)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <span className={paidChange >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}>
              {paidChange >= 0 ? "+" : ""}
              {paidChange.toFixed(1)}%
            </span>
            <span className="text-foreground-muted">vs prior period</span>
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">YTD Invoiced</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(thisYearInvoiced._sum?.totalCents ?? 0)}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            {selectedPeriodInvoiced._count ?? 0} invoices in period
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">YTD Collected</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(thisYearPaid._sum?.amountCents ?? 0)}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            {selectedPeriodPaid._count ?? 0} payments in period
          </p>
        </div>
      </div>

      {/* Aging Report & Top Clients */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Aging Report */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-semibold text-foreground">Accounts Receivable Aging</h3>
          <p className="mt-1 text-sm text-foreground-muted">Outstanding invoice balances by age</p>
          <div className="mt-6 space-y-4">
            <AgingBar
              label="Current"
              amount={agingBuckets.current}
              total={
                agingBuckets.current +
                agingBuckets.days1to30 +
                agingBuckets.days31to60 +
                agingBuckets.days61to90 +
                agingBuckets.over90
              }
              color="var(--success)"
            />
            <AgingBar
              label="1-30 Days"
              amount={agingBuckets.days1to30}
              total={
                agingBuckets.current +
                agingBuckets.days1to30 +
                agingBuckets.days31to60 +
                agingBuckets.days61to90 +
                agingBuckets.over90
              }
              color="var(--primary)"
            />
            <AgingBar
              label="31-60 Days"
              amount={agingBuckets.days31to60}
              total={
                agingBuckets.current +
                agingBuckets.days1to30 +
                agingBuckets.days31to60 +
                agingBuckets.days61to90 +
                agingBuckets.over90
              }
              color="var(--warning)"
            />
            <AgingBar
              label="61-90 Days"
              amount={agingBuckets.days61to90}
              total={
                agingBuckets.current +
                agingBuckets.days1to30 +
                agingBuckets.days31to60 +
                agingBuckets.days61to90 +
                agingBuckets.over90
              }
              color="var(--error)"
            />
            <AgingBar
              label="Over 90 Days"
              amount={agingBuckets.over90}
              total={
                agingBuckets.current +
                agingBuckets.days1to30 +
                agingBuckets.days31to60 +
                agingBuckets.days61to90 +
                agingBuckets.over90
              }
              color="var(--error)"
            />
          </div>
          <div className="mt-6 border-t border-[var(--card-border)] pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Total Outstanding</span>
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(
                  agingBuckets.current +
                    agingBuckets.days1to30 +
                    agingBuckets.days31to60 +
                    agingBuckets.days61to90 +
                    agingBuckets.over90
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Top Clients */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-semibold text-foreground">Top Clients by Revenue</h3>
          <p className="mt-1 text-sm text-foreground-muted">All-time payment totals</p>
          <div className="mt-6 space-y-4">
            {topClients.length === 0 ? (
              <p className="text-sm text-foreground-muted">No payment data yet</p>
            ) : (
              topClients.map((client, index) => {
                const clientInfo = clientMap.get(client.clientId || "");
                return (
                  <div key={client.clientId} className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background-secondary)] text-sm font-medium text-foreground">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {clientInfo?.fullName || clientInfo?.company || "Unknown Client"}
                      </p>
                    </div>
                    <p className="font-semibold text-[var(--success)]">
                      {formatCurrency(Number(client._sum?.amountCents ?? 0))}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          <Link
            href="/clients"
            className="mt-6 inline-block text-sm text-[var(--primary)] hover:underline"
          >
            View all clients →
          </Link>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="text-lg font-semibold text-foreground">Monthly Revenue (Last 12 Months)</h3>
        <div className="mt-6 flex h-48 items-end gap-2">
          {monthlyRevenue.length === 0 ? (
            <p className="text-sm text-foreground-muted">No revenue data yet</p>
          ) : (
            monthlyRevenue.map((month, index) => {
              const maxRevenue = Math.max(...monthlyRevenue.map((m) => Number(m.total)));
              const height = maxRevenue > 0 ? (Number(month.total) / maxRevenue) * 100 : 0;
              const monthDate = new Date(month.month);
              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-[var(--primary)] transition-all hover:bg-[var(--primary)]/80"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={formatCurrency(Number(month.total))}
                  />
                  <span className="text-xs text-foreground-muted">
                    {monthDate.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function AgingBar({
  label,
  amount,
  total,
  color,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-medium text-foreground">{formatCurrency(amount)}</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-[var(--background-secondary)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Icons
function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function ReportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Zm10.857 5.691a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 0 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

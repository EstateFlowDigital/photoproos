import { PageHeader, PageContextNav } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import Link from "next/link";
import { ExportButtons } from "./export-buttons";

// Billing navigation items
const billingNavItems = [
  { label: "Overview", href: "/billing" },
  { label: "Invoices", href: "/invoices" },
  { label: "Estimates", href: "/billing/estimates" },
  { label: "Credit Notes", href: "/billing/credit-notes" },
  { label: "Retainers", href: "/billing/retainers" },
  { label: "Analytics", href: "/billing/analytics" },
  { label: "Reports", href: "/billing/reports" },
];

export default async function TaxReportsPage() {
  const organizationId = await requireOrganizationId();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Fetch tax summary data
  const [thisMonthTax, thisQuarterTax, ytdTax, lastMonthTax] = await Promise.all([
    // This month
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["paid"] },
        paidAt: { gte: thisMonthStart },
      },
      _sum: { taxCents: true, totalCents: true, subtotalCents: true },
    }),
    // This quarter
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["paid"] },
        paidAt: { gte: thisQuarterStart },
      },
      _sum: { taxCents: true, totalCents: true, subtotalCents: true },
    }),
    // Year to date
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["paid"] },
        paidAt: { gte: thisYearStart },
      },
      _sum: { taxCents: true, totalCents: true, subtotalCents: true },
    }),
    // Last month (for comparison)
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["paid"] },
        paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { taxCents: true, totalCents: true, subtotalCents: true },
    }),
  ]);

  // Monthly breakdown for the current year
  const monthlyBreakdown = await prisma.$queryRaw<
    Array<{
      month: Date;
      revenue: bigint;
      tax: bigint;
      count: bigint;
    }>
  >`
    SELECT
      DATE_TRUNC('month', "paidAt") as month,
      SUM("subtotalCents") as revenue,
      SUM("taxCents") as tax,
      COUNT(*) as count
    FROM "Invoice"
    WHERE "organizationId" = ${organizationId}
      AND "status" IN ('paid', 'partial')
      AND "paidAt" >= ${thisYearStart}
    GROUP BY DATE_TRUNC('month', "paidAt")
    ORDER BY month DESC
  `;

  // Tax by client
  const taxByClient = await prisma.invoice.groupBy({
    by: ["clientId"],
    where: {
      organizationId,
      status: "paid",
      paidAt: { gte: thisYearStart },
      taxCents: { gt: 0 },
    },
    _sum: { taxCents: true, totalCents: true },
    orderBy: { _sum: { taxCents: "desc" } },
    take: 10,
  });

  // Get client details
  const clientIds = taxByClient.map((t) => t.clientId).filter(Boolean) as string[];
  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, fullName: true, company: true, email: true },
  });
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthTaxCents = thisMonthTax._sum.taxCents || 0;
  const lastMonthTaxCents = lastMonthTax._sum.taxCents || 0;
  const taxChange = lastMonthTaxCents > 0
    ? ((currentMonthTaxCents - lastMonthTaxCents) / lastMonthTaxCents) * 100
    : 0;

  // Prepare export data
  const exportData = {
    monthlyBreakdown: monthlyBreakdown.map((row) => {
      const monthDate = new Date(row.month);
      const revenue = Number(row.revenue);
      const tax = Number(row.tax);
      return {
        month: `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        invoiceCount: Number(row.count),
        revenue,
        tax,
        rate: revenue > 0 ? (tax / revenue) * 100 : 0,
      };
    }),
    summary: {
      thisMonthTax: currentMonthTaxCents,
      thisQuarterTax: thisQuarterTax._sum.taxCents || 0,
      ytdTax: ytdTax._sum.taxCents || 0,
      effectiveRate: (ytdTax._sum.subtotalCents || 0) > 0
        ? ((ytdTax._sum.taxCents || 0) / (ytdTax._sum.subtotalCents || 1)) * 100
        : 0,
      year: now.getFullYear(),
    },
    taxByClient: taxByClient.map((row) => {
      const client = row.clientId ? clientMap.get(row.clientId) : null;
      return {
        clientName: client?.fullName || client?.company || "Unknown Client",
        email: client?.email || "No email",
        taxCollected: row._sum.taxCents || 0,
        totalBilled: row._sum.totalCents || 0,
      };
    }),
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-element="billing-reports-page">
      <PageHeader
        title="Tax Reports"
        subtitle="Track and export tax collected on invoices"
        actions={<ExportButtons data={exportData} />}
      />

      <PageContextNav items={billingNavItems} />

      {/* Tax Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm font-medium text-foreground-muted">This Month Tax</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(currentMonthTaxCents)}
          </p>
          <p className={`mt-1 text-sm ${taxChange >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
            {taxChange >= 0 ? "+" : ""}{taxChange.toFixed(1)}% vs last month
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm font-medium text-foreground-muted">This Quarter Tax</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(thisQuarterTax._sum.taxCents || 0)}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            Q{Math.floor(now.getMonth() / 3) + 1} {now.getFullYear()}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm font-medium text-foreground-muted">Year to Date Tax</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(ytdTax._sum.taxCents || 0)}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            Since Jan 1, {now.getFullYear()}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm font-medium text-foreground-muted">Effective Tax Rate</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {(ytdTax._sum.subtotalCents || 0) > 0
              ? (((ytdTax._sum.taxCents || 0) / (ytdTax._sum.subtotalCents || 1)) * 100).toFixed(2)
              : "0.00"}%
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            Tax / Revenue
          </p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Monthly Tax Breakdown</h2>
          <p className="text-sm text-foreground-muted">{now.getFullYear()} tax collected by month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Invoices Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Tax Collected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Effective Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {monthlyBreakdown.length > 0 ? (
                monthlyBreakdown.map((row) => {
                  const monthDate = new Date(row.month);
                  const revenue = Number(row.revenue);
                  const tax = Number(row.tax);
                  const rate = revenue > 0 ? (tax / revenue) * 100 : 0;

                  return (
                    <tr key={monthDate.toISOString()} className="transition-colors hover:bg-[var(--background-secondary)]">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {Number(row.count)}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {formatCurrency(revenue)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {formatCurrency(tax)}
                      </td>
                      <td className="px-6 py-4 text-foreground-muted">
                        {rate.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                    No tax data available for this year
                  </td>
                </tr>
              )}
            </tbody>
            {monthlyBreakdown.length > 0 && (
              <tfoot className="border-t border-[var(--card-border)] bg-[var(--background-secondary)]">
                <tr>
                  <td className="px-6 py-4 font-semibold text-foreground">Total</td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {monthlyBreakdown.reduce((sum, row) => sum + Number(row.count), 0)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {formatCurrency(monthlyBreakdown.reduce((sum, row) => sum + Number(row.revenue), 0))}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {formatCurrency(monthlyBreakdown.reduce((sum, row) => sum + Number(row.tax), 0))}
                  </td>
                  <td className="px-6 py-4 text-foreground-muted">—</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Tax by Client */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Tax by Client</h2>
          <p className="text-sm text-foreground-muted">Top clients by tax collected (YTD)</p>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {taxByClient.length > 0 ? (
            taxByClient.map((row) => {
              const client = row.clientId ? clientMap.get(row.clientId) : null;
              const taxCents = row._sum.taxCents || 0;
              const totalCents = row._sum.totalCents || 0;
              const maxTax = taxByClient[0]._sum.taxCents || 1;
              const barWidth = (taxCents / maxTax) * 100;

              return (
                <div
                  key={row.clientId || "unknown"}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--background-secondary)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {client?.fullName || client?.company || "Unknown Client"}
                    </p>
                    <p className="truncate text-sm text-foreground-muted">
                      {client?.email || "No email"}
                    </p>
                  </div>
                  <div className="hidden w-48 sm:block">
                    <div className="h-2 overflow-x-auto rounded-full bg-[var(--background-secondary)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(taxCents)}</p>
                    <p className="text-sm text-foreground-muted">
                      of {formatCurrency(totalCents)} total
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-foreground-muted">
              No tax collected from clients this year
            </div>
          )}
        </div>
      </div>

      {/* Quarterly Summary */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Quarterly Estimates</h2>
          <p className="text-sm text-foreground-muted">Use these for quarterly tax filings</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((quarter) => {
            const qStart = new Date(now.getFullYear(), quarter * 3, 1);
            const qEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
            const isPast = qEnd < now;
            const isCurrent = qStart <= now && now <= qEnd;

            const qData = monthlyBreakdown.filter((row) => {
              const rowMonth = new Date(row.month).getMonth();
              return rowMonth >= quarter * 3 && rowMonth < (quarter + 1) * 3;
            });

            const qTax = qData.reduce((sum, row) => sum + Number(row.tax), 0);
            const qRevenue = qData.reduce((sum, row) => sum + Number(row.revenue), 0);

            return (
              <div
                key={quarter}
                className={`rounded-lg border p-4 ${
                  isCurrent
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--card-border)] bg-[var(--background-secondary)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <p className="text-sm font-medium text-foreground-muted">Q{quarter + 1}</p>
                  {isCurrent && (
                    <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                      Current
                    </span>
                  )}
                  {isPast && !isCurrent && (
                    <span className="rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
                      Complete
                    </span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(qTax)}</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {qRevenue > 0 ? `${((qTax / qRevenue) * 100).toFixed(1)}% of ${formatCurrency(qRevenue)}` : "No revenue"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax Settings Link */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[var(--primary)]/10 p-3">
            <SettingsIcon className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Tax Settings</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Configure your default tax rate, tax label, and tax ID for invoices.
            </p>
            <Link
              href="/settings/billing"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Go to Settings
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

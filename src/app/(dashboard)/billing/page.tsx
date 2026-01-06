export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import Link from "next/link";

export default async function BillingOverviewPage() {
  const organizationId = await requireOrganizationId();

  // Get date ranges
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Fetch all billing metrics in parallel
  const [
    // Invoice metrics
    totalOutstanding,
    thisMonthInvoiced,
    thisMonthCollected,
    lastMonthCollected,
    overdueInvoices,
    // Estimates
    pendingEstimates,
    recentEstimates,
    // Credit Notes
    activeCreditNotes,
    // Retainers
    activeRetainers,
    lowBalanceRetainers,
    // Recent invoices
    recentInvoices,
    // Recent payments
    recentPayments,
  ] = await Promise.all([
    // Total outstanding (sent + overdue invoices)
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ["sent", "overdue"] },
      },
      _sum: { totalCents: true, paidAmountCents: true },
      _count: true,
    }),
    // This month invoiced
    prisma.invoice.aggregate({
      where: {
        organizationId,
        issueDate: { gte: thisMonthStart },
      },
      _sum: { totalCents: true },
      _count: true,
    }),
    // This month collected
    prisma.payment.aggregate({
      where: {
        organizationId,
        status: "paid",
        createdAt: { gte: thisMonthStart },
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    // Last month collected (for comparison)
    prisma.payment.aggregate({
      where: {
        organizationId,
        status: "paid",
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amountCents: true },
    }),
    // Overdue invoices count
    prisma.invoice.count({
      where: {
        organizationId,
        status: "overdue",
      },
    }),
    // Pending estimates
    prisma.estimate.count({
      where: {
        organizationId,
        status: { in: ["sent", "viewed"] },
        validUntil: { gte: now },
      },
    }),
    // Recent estimates
    prisma.estimate.findMany({
      where: { organizationId },
      select: {
        id: true,
        estimateNumber: true,
        status: true,
        totalCents: true,
        createdAt: true,
        client: { select: { fullName: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Active credit notes with available balance
    prisma.creditNote.findMany({
      where: {
        organizationId,
        status: "issued",
      },
      select: {
        id: true,
        amountCents: true,
        appliedAmountCents: true,
        refundedAmountCents: true,
      },
    }),
    // Active retainers
    prisma.clientRetainer.count({
      where: {
        organizationId,
        isActive: true,
      },
    }),
    // Low balance retainers (fetch all and filter in code)
    prisma.clientRetainer.findMany({
      where: {
        organizationId,
        isActive: true,
        lowBalanceThresholdCents: { not: null },
      },
      select: {
        balanceCents: true,
        lowBalanceThresholdCents: true,
      },
    }),
    // Recent invoices
    prisma.invoice.findMany({
      where: { organizationId },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        totalCents: true,
        dueDate: true,
        client: { select: { fullName: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent payments
    prisma.payment.findMany({
      where: {
        organizationId,
        status: "paid",
      },
      select: {
        id: true,
        amountCents: true,
        createdAt: true,
        invoice: { select: { invoiceNumber: true } },
        client: { select: { fullName: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Calculate derived metrics
  const outstandingAmount = (totalOutstanding._sum.totalCents ?? 0) - (totalOutstanding._sum.paidAmountCents ?? 0);
  const thisMonthInvoicedAmount = thisMonthInvoiced._sum.totalCents ?? 0;
  const thisMonthCollectedAmount = thisMonthCollected._sum.amountCents ?? 0;
  const lastMonthCollectedAmount = lastMonthCollected._sum.amountCents ?? 0;

  const collectionChange = lastMonthCollectedAmount > 0
    ? ((thisMonthCollectedAmount - lastMonthCollectedAmount) / lastMonthCollectedAmount) * 100
    : 0;

  const totalAvailableCredits = activeCreditNotes.reduce((sum, cn) => {
    return sum + (cn.amountCents - cn.appliedAmountCents - cn.refundedAmountCents);
  }, 0);

  // Count low balance retainers
  const lowBalanceRetainersCount = lowBalanceRetainers.filter(
    (r) => r.lowBalanceThresholdCents !== null && r.balanceCents <= r.lowBalanceThresholdCents
  ).length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
      sent: "bg-[var(--primary)]/10 text-[var(--primary)]",
      viewed: "bg-[var(--ai)]/10 text-[var(--ai)]",
      approved: "bg-[var(--success)]/10 text-[var(--success)]",
      paid: "bg-[var(--success)]/10 text-[var(--success)]",
      overdue: "bg-[var(--error)]/10 text-[var(--error)]",
      cancelled: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
    };
    return styles[status] || styles.draft;
  };

  const billingModules = [
    {
      title: "Invoices",
      href: "/invoices",
      icon: InvoiceIcon,
      description: "Create and manage invoices",
      count: totalOutstanding._count,
      countLabel: "outstanding",
    },
    {
      title: "Estimates",
      href: "/billing/estimates",
      icon: EstimateIcon,
      description: "Quotes and proposals",
      count: pendingEstimates,
      countLabel: "pending",
    },
    {
      title: "Credit Notes",
      href: "/billing/credit-notes",
      icon: CreditIcon,
      description: "Refunds and credits",
      count: activeCreditNotes.length,
      countLabel: "active",
    },
    {
      title: "Retainers",
      href: "/billing/retainers",
      icon: RetainerIcon,
      description: "Prepaid client balances",
      count: activeRetainers,
      countLabel: "active",
    },
    {
      title: "Analytics",
      href: "/billing/analytics",
      icon: ChartIcon,
      description: "Revenue trends and insights",
    },
    {
      title: "Tax Reports",
      href: "/billing/reports",
      icon: ReportIcon,
      description: "Tax summaries and exports",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Billing"
        subtitle="Manage invoices, estimates, credits, and payments"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/invoices/new"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              New Invoice
            </Link>
            <Link
              href="/billing/estimates/new"
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              New Estimate
            </Link>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground-muted">Outstanding</p>
            {overdueInvoices > 0 && (
              <span className="rounded-full bg-[var(--error)]/10 px-2 py-0.5 text-xs font-medium text-[var(--error)]">
                {overdueInvoices} overdue
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{formatCurrency(outstandingAmount)}</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {totalOutstanding._count} invoice{totalOutstanding._count !== 1 ? "s" : ""} pending
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm font-medium text-foreground-muted">This Month Invoiced</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{formatCurrency(thisMonthInvoicedAmount)}</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {thisMonthInvoiced._count} invoice{thisMonthInvoiced._count !== 1 ? "s" : ""} created
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm font-medium text-foreground-muted">This Month Collected</p>
          <p className="mt-2 text-3xl font-bold text-[var(--success)]">{formatCurrency(thisMonthCollectedAmount)}</p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <span className={collectionChange >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}>
              {collectionChange >= 0 ? "+" : ""}{collectionChange.toFixed(1)}%
            </span>
            <span className="text-foreground-muted">vs last month</span>
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm font-medium text-foreground-muted">Available Credits</p>
          <p className="mt-2 text-3xl font-bold text-[var(--ai)]">{formatCurrency(totalAvailableCredits)}</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {activeCreditNotes.length} credit note{activeCreditNotes.length !== 1 ? "s" : ""} active
          </p>
        </div>
      </div>

      {/* Billing Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {billingModules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-[var(--background-secondary)] p-3">
                <module.icon className="h-6 w-6 text-foreground" />
              </div>
              {module.count !== undefined && (
                <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                  {module.count} {module.countLabel}
                </span>
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-[var(--primary)]">
              {module.title}
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">{module.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
            <h3 className="font-semibold text-foreground">Recent Invoices</h3>
            <Link href="/invoices" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {recentInvoices.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-foreground-muted">No invoices yet</p>
              </div>
            ) : (
              recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--background-secondary)]"
                >
                  <div>
                    <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-foreground-muted">
                      {invoice.client?.fullName || invoice.client?.company || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(invoice.totalCents)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
            <h3 className="font-semibold text-foreground">Recent Payments</h3>
            <Link href="/payments" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {recentPayments.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-foreground-muted">No payments yet</p>
              </div>
            ) : (
              recentPayments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/payments/${payment.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--background-secondary)]"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {payment.client?.fullName || payment.client?.company || "Unknown"}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {payment.invoice?.invoiceNumber || "Direct payment"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--success)]">+{formatCurrency(payment.amountCents)}</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(overdueInvoices > 0 || lowBalanceRetainersCount > 0) && (
        <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-6">
          <h3 className="font-semibold text-foreground">Attention Needed</h3>
          <div className="mt-4 space-y-3">
            {overdueInvoices > 0 && (
              <Link
                href="/invoices?status=overdue"
                className="flex items-center gap-3 rounded-lg bg-[var(--card)] p-4 transition-colors hover:bg-[var(--background-hover)]"
              >
                <div className="rounded-full bg-[var(--error)]/10 p-2">
                  <AlertIcon className="h-5 w-5 text-[var(--error)]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {overdueInvoices} overdue invoice{overdueInvoices !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-foreground-muted">Review and send reminders</p>
                </div>
              </Link>
            )}
            {lowBalanceRetainersCount > 0 && (
              <Link
                href="/billing/retainers?filter=low-balance"
                className="flex items-center gap-3 rounded-lg bg-[var(--card)] p-4 transition-colors hover:bg-[var(--background-hover)]"
              >
                <div className="rounded-full bg-[var(--warning)]/10 p-2">
                  <AlertIcon className="h-5 w-5 text-[var(--warning)]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {lowBalanceRetainersCount} retainer{lowBalanceRetainersCount !== 1 ? "s" : ""} with low balance
                  </p>
                  <p className="text-sm text-foreground-muted">Request top-up from clients</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13ZM13.25 9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm4-1.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function EstimateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v13A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-13ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
    </svg>
  );
}

function CreditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function RetainerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z" clipRule="evenodd" />
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

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

export const dynamic = "force-dynamic";
import { PageHeader, StatCard } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo mode flag
const DEMO_MODE = true;

// Demo payment data
const demoPayments = [
  { id: "1", description: "Downtown Luxury Listing", clientEmail: "john@premierrealty.com", projectName: "Downtown Luxury Listing", amountCents: 425000, status: "paid", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "2", description: "Corporate Headshots Q4", clientEmail: "m.chen@techsolutions.com", projectName: "Corporate Headshots Q4", amountCents: 218000, status: "pending", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: "3", description: "Restaurant Grand Opening", clientEmail: "isabella@bellacucina.com", projectName: "Restaurant Grand Opening", amountCents: 189000, status: "paid", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  { id: "4", description: "Wedding - Sarah & Michael", clientEmail: "sarah@email.com", projectName: "Wedding - Sarah & Michael", amountCents: 350000, status: "paid", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72) },
  { id: "5", description: "Oceanfront Estate", clientEmail: "emily@berkshire.com", projectName: "Oceanfront Estate", amountCents: 580000, status: "paid", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96) },
  { id: "6", description: "Product Launch Event", clientEmail: "alex@innovatetech.io", projectName: "Product Launch Event", amountCents: 120000, status: "overdue", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168) },
  { id: "7", description: "Modern Architecture Shoot", clientEmail: "david@designstudiopro.com", projectName: "Modern Architecture Shoot", amountCents: 275000, status: "pending", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120) },
  { id: "8", description: "Executive Portraits", clientEmail: "j.wilson@portraits.com", projectName: "Executive Portraits", amountCents: 95000, status: "paid", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200) },
];

// Helper to format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type FilterTab = "all" | "paid" | "pending" | "overdue";

interface PaymentsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

const statusColors: Record<string, string> = {
  paid: "bg-[var(--success)]/10 text-[var(--success)]",
  pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
  overdue: "bg-[var(--error)]/10 text-[var(--error)]",
  failed: "bg-[var(--error)]/10 text-[var(--error)]",
  refunded: "bg-[var(--background-secondary)] text-foreground-muted",
};

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const filter = (params.filter || "all") as FilterTab;

  // Demo mode - use static data
  if (DEMO_MODE) {
    const filteredPayments = filter === "all"
      ? demoPayments
      : demoPayments.filter(p => p.status === filter);

    const countsMap = {
      paid: demoPayments.filter(p => p.status === "paid").length,
      pending: demoPayments.filter(p => p.status === "pending").length,
      overdue: demoPayments.filter(p => p.status === "overdue").length,
    };
    const totalCount = demoPayments.length;

    const monthlyTotalValue = demoPayments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const pendingTotalValue = demoPayments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const overdueTotalValue = demoPayments
      .filter(p => p.status === "overdue")
      .reduce((sum, p) => sum + p.amountCents, 0);

    const tabs: { id: FilterTab; label: string; count: number }[] = [
      { id: "all", label: "All", count: totalCount },
      { id: "paid", label: "Paid", count: countsMap.paid },
      { id: "pending", label: "Pending", count: countsMap.pending },
      { id: "overdue", label: "Overdue", count: countsMap.overdue },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Payments"
          subtitle="Track and manage your payment history"
          actions={
            <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)] border border-[var(--card-border)]">
              <ExportIcon className="h-4 w-4" />
              Export
            </button>
          }
        />

        {/* Demo Mode Banner */}
        <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
          <p className="text-sm text-[var(--primary)]">
            <strong>Demo Mode:</strong> Viewing sample payment data.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="This Month"
            value={formatCurrency(monthlyTotalValue)}
            positive
          />
          <StatCard
            label="Pending"
            value={formatCurrency(pendingTotalValue)}
          />
          <StatCard
            label="Overdue"
            value={formatCurrency(overdueTotalValue)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.id === "all" ? "/payments" : `/payments?filter=${tab.id}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === tab.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  filter === tab.id
                    ? "bg-white/20"
                    : "bg-[var(--background-secondary)]"
                )}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Payments Table */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Description
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition-colors hover:bg-[var(--background-hover)]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">
                      {payment.projectName || payment.description}
                    </p>
                    {payment.clientEmail && (
                      <p className="text-sm text-foreground-muted">{payment.clientEmail}</p>
                    )}
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-foreground-muted md:table-cell">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">
                    {formatCurrency(payment.amountCents)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase",
                        statusColors[payment.status]
                      )}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Database mode
  const { prisma } = await import("@/lib/db");

  // Get organization (later from auth)
  const organization = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please run the seed script to populate demo data.</p>
      </div>
    );
  }

  // Build status filter
  const statusFilter = filter === "all" ? undefined : filter;

  // Fetch payment data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [payments, monthlyTotal, pendingTotal, overdueTotal, counts] = await Promise.all([
    // Filtered payments list
    prisma.payment.findMany({
      where: {
        organizationId: organization.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Monthly total (paid)
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        status: "paid",
        createdAt: { gte: startOfMonth },
      },
      _sum: { amountCents: true },
    }),

    // Pending total
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        status: "pending",
      },
      _sum: { amountCents: true },
    }),

    // Overdue total
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        status: "overdue",
      },
      _sum: { amountCents: true },
    }),

    // Counts by status
    prisma.payment.groupBy({
      by: ["status"],
      where: { organizationId: organization.id },
      _count: { id: true },
    }),
  ]);

  // Process counts
  const countsMap = counts.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = Object.values(countsMap).reduce((a, b) => a + b, 0);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalCount },
    { id: "paid", label: "Paid", count: countsMap.paid || 0 },
    { id: "pending", label: "Pending", count: countsMap.pending || 0 },
    { id: "overdue", label: "Overdue", count: countsMap.overdue || 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Track and manage your payment history"
        actions={
          <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)] border border-[var(--card-border)]">
            <ExportIcon className="h-4 w-4" />
            Export
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="This Month"
          value={formatCurrency(monthlyTotal._sum.amountCents || 0)}
          positive
        />
        <StatCard
          label="Pending"
          value={formatCurrency(pendingTotal._sum.amountCents || 0)}
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(overdueTotal._sum.amountCents || 0)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "all" ? "/payments" : `/payments?filter=${tab.id}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                filter === tab.id
                  ? "bg-white/20"
                  : "bg-[var(--background-secondary)]"
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Payments Table */}
      {payments.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Description
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition-colors hover:bg-[var(--background-hover)]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">
                      {payment.project?.name || payment.description || "Payment"}
                    </p>
                    {payment.clientEmail && (
                      <p className="text-sm text-foreground-muted">{payment.clientEmail}</p>
                    )}
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-foreground-muted md:table-cell">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">
                    {formatCurrency(payment.amountCents)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase",
                        statusColors[payment.status]
                      )}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <PaymentIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No payments found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {filter === "all"
              ? "Payments will appear here once clients pay for galleries."
              : `No ${filter} payments found.`}
          </p>
        </div>
      )}
    </div>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

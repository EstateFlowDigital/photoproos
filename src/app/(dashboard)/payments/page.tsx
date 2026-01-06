export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav, StatCard } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { FilterPills } from "@/components/ui/filter-pills";
import { ExportButton } from "./export-button";
import { BulkPdfButton } from "./bulk-pdf-button";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { PaymentsPageClient } from "./payments-page-client";

type FilterTab = "all" | "paid" | "pending" | "overdue";

interface PaymentsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

// Status badge classes are centralized in lib/status-badges.ts

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const filter = (params.filter || "all") as FilterTab;

  // Get authenticated user and organization
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

  const filterOptions = [
    { value: "all", label: "All", count: totalCount, href: "/payments" },
    { value: "paid", label: "Paid", count: countsMap.paid || 0, href: "/payments?filter=paid" },
    { value: "pending", label: "Pending", count: countsMap.pending || 0, href: "/payments?filter=pending" },
    { value: "overdue", label: "Overdue", count: countsMap.overdue || 0, href: "/payments?filter=overdue" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Track and manage your payment history"
        actions={
          <div className="flex items-center gap-3">
            <BulkPdfButton paidCount={countsMap.paid || 0} />
            <ExportButton />
          </div>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Payments", href: "/payments", icon: <CurrencyIcon className="h-4 w-4" /> },
          { label: "Invoices", href: "/invoices", icon: <DocumentIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          { label: "Stripe Settings", href: "/settings/payments", icon: <SettingsIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Stats Cards */}
      <div className="auto-grid grid-min-220 grid-gap-4">
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
      <PaymentsPageClient payments={payments} filter={filter} />
    </div>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152Z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.35 1.35 0 0 0-.447-.563 2.187 2.187 0 0 0-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 1 1-1.5 0v-.3a3.78 3.78 0 0 1-1.653-.712 2.93 2.93 0 0 1-.925-1.2.75.75 0 0 1 1.395-.55c.12.3.316.55.541.73.264.189.573.338.918.413V10.7a4.299 4.299 0 0 1-1.958-.696C5.504 9.49 5 8.735 5 7.875c0-.86.504-1.616 1.29-2.13.577-.377 1.261-.603 1.96-.696V4.75A.75.75 0 0 1 10 4Z" clipRule="evenodd" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retainers | PhotoProOS",
  description: "Manage client retainer agreements.",
};

export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav, DocumentIcon, CurrencyIcon } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { RetainersPageClient } from "./retainers-page-client";

interface PageProps {
  searchParams: Promise<{ filter?: "all" | "active" | "inactive" | "low_balance" }>;
}

export default async function RetainersPage({ searchParams }: PageProps) {
  const { filter = "all" } = await searchParams;

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

  // Build filter conditions
  const where: Record<string, unknown> = { organizationId: organization.id };
  if (filter === "active") {
    where.isActive = true;
  } else if (filter === "inactive") {
    where.isActive = false;
  }

  // Fetch retainers
  const retainers = await prisma.clientRetainer.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          company: true,
          email: true,
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Filter for low balance if needed
  let filteredRetainers = retainers;
  if (filter === "low_balance") {
    filteredRetainers = retainers.filter(
      (r) => r.lowBalanceThresholdCents !== null && r.balanceCents <= r.lowBalanceThresholdCents
    );
  }

  // Calculate summary metrics
  const allRetainers = await prisma.clientRetainer.findMany({
    where: { organizationId: organization.id },
    select: {
      isActive: true,
      balanceCents: true,
      totalDepositedCents: true,
      totalUsedCents: true,
      lowBalanceThresholdCents: true,
    },
  });

  const totalBalance = allRetainers.reduce((sum, r) => sum + r.balanceCents, 0);
  const totalDeposited = allRetainers.reduce((sum, r) => sum + r.totalDepositedCents, 0);
  const totalUsed = allRetainers.reduce((sum, r) => sum + r.totalUsedCents, 0);

  const filterCounts = {
    all: allRetainers.length,
    active: allRetainers.filter((r) => r.isActive).length,
    inactive: allRetainers.filter((r) => !r.isActive).length,
    low_balance: allRetainers.filter(
      (r) => r.lowBalanceThresholdCents !== null && r.balanceCents <= r.lowBalanceThresholdCents
    ).length,
  };

  return (
    <div className="space-y-6" data-element="billing-retainers-page">
      <PageHeader
        title="Retainers"
        subtitle={`${filteredRetainers.length} retainer account${filteredRetainers.length !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/billing/retainers/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:px-4"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden md:inline">New Retainer</span>
          </Link>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Billing", href: "/billing", icon: <OverviewIcon className="h-4 w-4" /> },
          { label: "Retainers", href: "/billing/retainers", icon: <WalletIcon className="h-4 w-4" /> },
          { label: "Invoices", href: "/invoices", icon: <DocumentIcon className="h-4 w-4" /> },
          { label: "Payments", href: "/payments", icon: <CurrencyIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Summary Cards */}
      <div className="auto-grid grid-min-220 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Balance</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(totalBalance)}</p>
          <p className="mt-1 text-sm text-foreground-muted">across all accounts</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Deposited</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(totalDeposited)}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">lifetime deposits</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Used</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            {formatCurrency(totalUsed)}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">applied to invoices</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Low Balance Alerts</p>
          <p className={cn(
            "mt-2 text-2xl font-semibold",
            filterCounts.low_balance > 0 ? "text-[var(--warning)]" : "text-foreground"
          )}>
            {filterCounts.low_balance}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">accounts need attention</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/billing/retainers"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          All
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{filterCounts.all}</span>
        </Link>
        <Link
          href="/billing/retainers?filter=active"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            filter === "active"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Active
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              filter === "active" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
            )}
          >
            {filterCounts.active}
          </span>
        </Link>
        <Link
          href="/billing/retainers?filter=inactive"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            filter === "inactive"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Inactive
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              filter === "inactive" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
            )}
          >
            {filterCounts.inactive}
          </span>
        </Link>
        <Link
          href="/billing/retainers?filter=low_balance"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            filter === "low_balance"
              ? "bg-[var(--warning)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Low Balance
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              filter === "low_balance" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
            )}
          >
            {filterCounts.low_balance}
          </span>
        </Link>
      </div>

      {/* Retainers Table */}
      <RetainersPageClient retainers={filteredRetainers} filter={filter} />
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M1 4.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 2H3.25A2.25 2.25 0 0 0 1 4.25ZM1 7.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 5H3.25A2.25 2.25 0 0 0 1 7.25ZM7 8a1 1 0 0 1 1 1 2 2 0 1 0 4 0 1 1 0 0 1 1-1h3.75A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5A2.25 2.25 0 0 1 3.25 8H7Z" />
    </svg>
  );
}

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getBrokerages } from "@/lib/actions/brokerages";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface BrokeragesPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function BrokeragesPage({ searchParams }: BrokeragesPageProps) {
  const { search, status } = await searchParams;

  const includeInactive = status === "all" || status === "inactive";
  const result = await getBrokerages({
    includeInactive,
    search: search || undefined,
  });

  const brokerages = result.success && result.data ? result.data : [];

  // Filter by status if needed
  const filteredBrokerages =
    status === "inactive"
      ? brokerages?.filter((b) => !b.isActive) ?? []
      : status === "active"
      ? brokerages?.filter((b) => b.isActive) ?? []
      : brokerages ?? [];

  // Calculate summary stats
  const totalBrokerages = brokerages.length;
  const activeBrokerages = brokerages.filter((b) => b.isActive).length;
  const totalAgents = brokerages.reduce((sum, b) => sum + (b._count?.agents || 0), 0);
  const totalRevenue = brokerages.reduce((sum, b) => sum + b.totalRevenueCents, 0);

  return (
    <div className="space-y-6" data-element="brokerages-page">
      <PageHeader
        title="Brokerages"
        subtitle={`${totalBrokerages} brokerage${totalBrokerages !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/brokerages/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:px-4"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden md:inline">Add Brokerage</span>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Active Brokerages</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{activeBrokerages}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Agents</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{totalAgents}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Brokerage Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form className="flex-1 max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search brokerages..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Link
            href="/brokerages"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              !status || status === "active"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            Active
          </Link>
          <Link
            href="/brokerages?status=all"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              status === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            All
          </Link>
          <Link
            href="/brokerages?status=inactive"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              status === "inactive"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            Inactive
          </Link>
        </div>
      </div>

      {/* Brokerages List */}
      {filteredBrokerages.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Brokerage
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Contact
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Agents
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted sm:table-cell">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredBrokerages.map((brokerage) => (
                <tr
                  key={brokerage.id}
                  className="group relative transition-colors hover:bg-[var(--background-hover)] cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/brokerages/${brokerage.id}`}
                      className="absolute inset-0 z-0"
                      aria-label={`View ${brokerage.name}`}
                    />
                    <div className="relative z-10 pointer-events-none flex items-center gap-3">
                      {brokerage.logoUrl ? (
                        <img
                          src={brokerage.logoUrl}
                          alt={brokerage.name}
                          className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                        />
                      ) : (
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                          style={{ backgroundColor: brokerage.primaryColor || "#3b82f6" }}
                        >
                          {(brokerage.name || "B").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{brokerage.name}</p>
                        {brokerage.city && brokerage.state && (
                          <p className="text-xs text-foreground-muted">
                            {brokerage.city}, {brokerage.state}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <div className="relative z-10 pointer-events-none">
                      <p className="text-sm text-foreground">
                        {brokerage.contactName || "—"}
                      </p>
                      {brokerage.contactEmail && (
                        <p className="text-xs text-foreground-muted">
                          {brokerage.contactEmail}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 lg:table-cell">
                    <div className="relative z-10 pointer-events-none">
                      <span className="text-sm text-foreground">
                        {brokerage._count?.agents || 0}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <div className="relative z-10 pointer-events-none">
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(brokerage.totalRevenueCents)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "relative z-10 pointer-events-none inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        brokerage.isActive
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                      )}
                    >
                      {brokerage.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative z-10 pointer-events-none">
                      <ChevronRightIcon className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <BuildingIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {search ? "No brokerages found" : "No brokerages yet"}
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search
              ? "Try a different search term or clear your filters."
              : "Add your first brokerage to start managing agent relationships."}
          </p>
          {!search && (
            <Link
              href="/brokerages/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Add First Brokerage
            </Link>
          )}
        </div>
      )}
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1 0-1.5H4Zm3-11a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 5.5Zm.75 2.25a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM7 11a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 11Zm4-5.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 11 5.5Zm.75 2.25a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM11 11a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 11 11Zm-4 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3H7v-3Z" clipRule="evenodd" />
    </svg>
  );
}

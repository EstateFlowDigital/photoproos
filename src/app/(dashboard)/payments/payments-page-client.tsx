"use client";

import { useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CurrencyIcon } from "@/components/ui/icons";

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type SortOption = "newest" | "oldest" | "amountHigh" | "amountLow";
type DateRangeFilter = "all" | "7days" | "30days" | "90days";

interface Payment {
  id: string;
  status: string;
  amountCents: number;
  description: string | null;
  clientEmail: string | null;
  createdAt: Date;
  project: {
    name: string;
  } | null;
}

interface PaymentsPageClientProps {
  payments: Payment[];
  filter: string;
}

export function PaymentsPageClient({ payments, filter }: PaymentsPageClientProps) {
  const tableParentRef = useRef<HTMLDivElement | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.project?.name?.toLowerCase().includes(query) ||
          payment.description?.toLowerCase().includes(query) ||
          payment.clientEmail?.toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const daysAgo = dateRangeFilter === "7days" ? 7 : dateRangeFilter === "30days" ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      result = result.filter((payment) => new Date(payment.createdAt) >= cutoffDate);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amountHigh":
          return b.amountCents - a.amountCents;
        case "amountLow":
          return a.amountCents - b.amountCents;
        default:
          return 0;
      }
    });

    return result;
  }, [payments, searchQuery, sortOption, dateRangeFilter]);

  const rowVirtualizer = useVirtualizer({
    count: filteredPayments.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 68,
    overscan: 8,
    getItemKey: (index) => filteredPayments[index]?.id ?? index,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
        <CurrencyIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No payments found</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          {filter === "all"
            ? "Payments will appear here once clients pay for galleries."
            : `No ${filter} payments found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          aria-label="Sort payments"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amountHigh">Amount: High to Low</option>
          <option value="amountLow">Amount: Low to High</option>
        </select>

        {/* Date Range Filter */}
        <select
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          aria-label="Filter by date range"
        >
          <option value="all">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>

        {/* Results Count */}
        <span className="text-sm text-foreground-muted">
          {filteredPayments.length} of {payments.length} payments
        </span>
      </div>

      {/* Empty State for Filtered Results */}
      {filteredPayments.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <CurrencyIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No matching payments</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Payments Table */}
      {filteredPayments.length > 0 && (
        <div
          ref={tableParentRef}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] max-h-[70vh] overflow-auto"
        >
      <table className="w-full min-w-[600px]">
        <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] sticky top-0 z-10">
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
        <tbody
          style={{
            position: "relative",
            height: rowVirtualizer.getTotalSize(),
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const payment = filteredPayments[virtualRow.index];
            if (!payment) return null;

            return (
              <tr
                key={payment.id}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                className="table w-full transition-colors hover:bg-[var(--background-hover)]"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
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
                      getStatusBadgeClasses(payment.status),
                      payment.status === "refunded" && "line-through"
                    )}
                  >
                    {formatStatusLabel(payment.status)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
        </div>
      )}
    </div>
  );
}

// Search icon component
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

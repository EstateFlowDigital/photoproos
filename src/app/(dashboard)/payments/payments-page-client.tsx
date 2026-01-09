"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { VirtualList } from "@/components/ui/virtual-list";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
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
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk selection helpers
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredPayments.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Export selected payments to CSV
  const handleExportCSV = () => {
    const selectedPayments = filteredPayments.filter((p) => selectedIds.has(p.id));
    const headers = ["Description", "Client Email", "Amount", "Status", "Date"];
    const rows = selectedPayments.map((p) => [
      p.project?.name || p.description || "Payment",
      p.clientEmail || "",
      (p.amountCents / 100).toFixed(2),
      p.status,
      formatDate(p.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    clearSelection();
  };

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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:min-h-0"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="min-h-[44px] flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:flex-none sm:min-h-0"
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
            className="min-h-[44px] flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:flex-none sm:min-h-0"
            aria-label="Filter by date range"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          {/* Results Count */}
          <span className="text-sm text-foreground-muted whitespace-nowrap">
            {filteredPayments.length} of {payments.length}
          </span>
        </div>
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
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <VirtualList
            className="max-h-[70vh]"
            items={filteredPayments}
            getItemKey={(p) => p.id}
            estimateSize={() => 72}
            itemGap={0}
            prepend={
              <div className="sticky top-0 z-10 hidden grid-cols-[60px,2fr,1fr,1fr,1fr] items-center gap-3 border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted md:grid">
                <span className="w-12">
                  <input
                    type="checkbox"
                    checked={filteredPayments.length > 0 && filteredPayments.every((p) => selectedIds.has(p.id))}
                    onChange={() =>
                      filteredPayments.every((p) => selectedIds.has(p.id)) ? clearSelection() : selectAll()
                    }
                    className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                  />
                </span>
                <span>Description</span>
                <span>Date</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Status</span>
              </div>
            }
            renderItem={(payment) => {
              const isSelected = selectedIds.has(payment.id);
              return (
                <div
                  className={cn(
                    "border-b border-[var(--card-border)] px-4 py-4 last:border-b-0 hover:bg-[var(--background-hover)] md:px-6",
                    isSelected && "bg-[var(--primary)]/5"
                  )}
                >
                  <div className="flex flex-col gap-3 md:grid md:grid-cols-[60px,2fr,1fr,1fr,1fr] md:items-center md:gap-3">
                    <div className="flex items-center gap-2 md:justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(payment.id)}
                        className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                      />
                      <div className="md:hidden">
                        <p className="font-medium text-foreground">
                          {payment.project?.name || payment.description || "Payment"}
                        </p>
                        {payment.clientEmail && (
                          <p className="text-sm text-foreground-muted">{payment.clientEmail}</p>
                        )}
                        <p className="mt-1 text-xs text-foreground-muted">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <p className="font-medium text-foreground">
                        {payment.project?.name || payment.description || "Payment"}
                      </p>
                      {payment.clientEmail && (
                        <p className="text-sm text-foreground-muted">{payment.clientEmail}</p>
                      )}
                    </div>

                    <div className="hidden text-sm text-foreground-muted md:block">
                      {formatDate(payment.createdAt)}
                    </div>

                    <div className="text-right font-medium text-foreground">
                      {formatCurrency(payment.amountCents)}
                    </div>

                    <div className="flex justify-end">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase",
                          getStatusBadgeClasses(payment.status),
                          payment.status === "refunded" && "line-through"
                        )}
                      >
                        {formatStatusLabel(payment.status)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-3 shadow-2xl sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:gap-3 sm:px-4">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          <div className="hidden h-4 w-px bg-[var(--card-border)] sm:block" />
          <button
            onClick={handleExportCSV}
            className="min-h-[44px] rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/20 sm:min-h-0 sm:py-1.5"
          >
            Export CSV
          </button>
          <button
            onClick={clearSelection}
            className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted hover:text-foreground sm:min-h-0 sm:py-1.5"
          >
            Clear
          </button>
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

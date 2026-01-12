"use client";

import { useRef, useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import type { InvoiceStatus } from "@prisma/client";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRightIcon, PlusIcon, DocumentIcon, SearchIcon, XIcon as CloseIcon } from "@/components/ui/icons";
import { updateInvoiceStatus, sendInvoiceReminder } from "@/lib/actions/invoices";

type SortOption = "newest" | "oldest" | "amountHigh" | "amountLow" | "dueDate";
type DateRangeFilter = "all" | "7days" | "30days" | "90days";

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  totalCents: number;
  issueDate: Date;
  dueDate: Date;
  clientName: string | null;
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string | null;
  } | null;
  lineItems: { id: string }[];
}

interface InvoicesPageClientProps {
  invoices: Invoice[];
  statusFilter?: InvoiceStatus;
}

export function InvoicesPageClient({ invoices, statusFilter }: InvoicesPageClientProps) {
  const router = useRouter();
  const [_isPending, _startTransition] = useTransition();
  const tableParentRef = useRef<HTMLDivElement | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((inv) => {
        const clientName = inv.client?.fullName || inv.client?.company || inv.clientName || "";
        const clientEmail = inv.client?.email || "";
        const searchableText = [inv.invoiceNumber, clientName, clientEmail].join(" ").toLowerCase();
        return searchableText.includes(query);
      });
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      result = result.filter((inv) => {
        const issueDate = new Date(inv.issueDate);
        const daysAgo = (now.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24);
        if (dateRangeFilter === "7days") return daysAgo <= 7;
        if (dateRangeFilter === "30days") return daysAgo <= 30;
        if (dateRangeFilter === "90days") return daysAgo <= 90;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        case "amountHigh":
          return b.totalCents - a.totalCents;
        case "amountLow":
          return a.totalCents - b.totalCents;
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "newest":
        default:
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      }
    });

    return result;
  }, [invoices, searchQuery, sortOption, dateRangeFilter]);

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
    setSelectedIds(new Set(filteredInvoices.map((inv) => inv.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected = filteredInvoices.length > 0 && filteredInvoices.every((inv) => selectedIds.has(inv.id));

  // Bulk actions
  const handleBulkMarkAsPaid = async () => {
    setIsBulkActionPending(true);
    try {
      await Promise.all([...selectedIds].map((id) => updateInvoiceStatus(id, "paid")));
      router.refresh();
      clearSelection();
    } finally {
      setIsBulkActionPending(false);
    }
  };

  const handleBulkSendReminder = async () => {
    setIsBulkActionPending(true);
    try {
      await Promise.all([...selectedIds].map((id) => sendInvoiceReminder(id)));
      router.refresh();
      clearSelection();
    } finally {
      setIsBulkActionPending(false);
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: filteredInvoices.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 76,
    overscan: 8,
    getItemKey: (index) => filteredInvoices[index]?.id ?? index,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  // Show empty state only if there are no invoices at all
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
        <DocumentIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          {statusFilter ? `No ${statusFilter} invoices` : "No invoices yet"}
        </h3>
        <p className="mt-2 text-sm text-foreground-muted">
          {statusFilter
            ? "Try a different filter or create a new invoice."
            : "Create your first invoice to start billing clients."}
        </p>
        <Link
          href="/invoices/new"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
        >
          <PlusIcon className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter row with selects */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Date Range Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
            className="min-h-[44px] flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:flex-none"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          {/* Sort Options */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="min-h-[44px] flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:flex-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amountHigh">Amount: High to Low</option>
            <option value="amountLow">Amount: Low to High</option>
            <option value="dueDate">Due Date</option>
          </select>

          {/* Results count */}
          <span className="text-sm text-foreground-muted whitespace-nowrap">
            {filteredInvoices.length} of {invoices.length}
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-12 text-center">
          <SearchIcon className="mx-auto h-10 w-10 text-foreground-muted" />
          <p className="mt-4 font-medium text-foreground">No invoices found</p>
          <p className="mt-1 text-sm text-foreground-muted">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div
          ref={tableParentRef}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] max-h-[70vh] overflow-auto"
        >
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] sticky top-0 z-10">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => (isAllSelected ? clearSelection() : selectAll())}
                    className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Invoice
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Client
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
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
                const invoice = filteredInvoices[virtualRow.index];
                if (!invoice) return null;

                const clientName = invoice.client?.fullName || invoice.client?.company || invoice.clientName || "Unknown";
                // Note: Overdue status is now automatically set server-side when invoices are fetched
                const isOverdue = invoice.status === "overdue";
                const statusLabel = formatStatusLabel(invoice.status);
                const isSelected = selectedIds.has(invoice.id);

                return (
                  <tr
                    key={invoice.id}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    className={cn(
                      "group absolute left-0 right-0 w-full table table-fixed cursor-pointer transition-colors hover:bg-[var(--background-hover)]",
                      isSelected && "bg-[var(--primary)]/5"
                    )}
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <td className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(invoice.id)}
                        className="relative z-20 h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="absolute inset-0 z-0"
                        aria-label={`View invoice: ${invoice.invoiceNumber}`}
                      />
                      <div className="pointer-events-none relative z-10">
                        <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-foreground-muted md:hidden">
                          {clientName}
                        </p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      <div className="pointer-events-none relative z-10 flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full avatar-gradient text-xs font-medium text-white">
                          {clientName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{clientName}</p>
                          {invoice.client?.email && (
                            <p className="text-xs text-foreground-muted">{invoice.client.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <div className="pointer-events-none relative z-10 text-sm">
                        <p className="text-foreground">{formatDate(invoice.issueDate)}</p>
                        <p className={cn(
                          "text-xs",
                          isOverdue ? "text-[var(--error)]" : "text-foreground-muted"
                        )}>
                          Due {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "pointer-events-none relative z-10 inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        getStatusBadgeClasses(invoice.status),
                        invoice.status === "cancelled" && "line-through"
                      )}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="pointer-events-none relative z-10 font-medium text-foreground">
                        {formatCurrency(invoice.totalCents)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="pointer-events-none relative z-10">
                        <ChevronRightIcon className="h-4 w-4 text-foreground-muted transition-colors group-hover:text-foreground" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            onClick={handleBulkMarkAsPaid}
            disabled={isBulkActionPending}
            className="min-h-[44px] rounded-lg bg-[var(--success)]/10 px-3 py-2 text-sm font-medium text-[var(--success)] hover:bg-[var(--success)]/20 disabled:opacity-50 sm:min-h-0 sm:py-1.5"
          >
            Mark as Paid
          </button>
          <button
            onClick={handleBulkSendReminder}
            disabled={isBulkActionPending}
            className="min-h-[44px] rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/20 disabled:opacity-50 sm:min-h-0 sm:py-1.5"
          >
            Send Reminder
          </button>
          <button
            onClick={clearSelection}
            disabled={isBulkActionPending}
            className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted hover:text-foreground disabled:opacity-50 sm:min-h-0 sm:py-1.5"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

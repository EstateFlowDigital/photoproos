"use client";

import Link from "next/link";
import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VirtualList } from "@/components/ui/virtual-list";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { updateOrder } from "@/lib/actions/orders";
import { useToast } from "@/components/ui/toast";

type OrderStatus = "cart" | "pending" | "paid" | "processing" | "completed" | "cancelled";
type SortOption = "newest" | "oldest" | "amountHigh" | "amountLow" | "preferredDate";
type DateRangeFilter = "all" | "7days" | "30days" | "90days";
type ViewMode = "list" | "board";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientCompany: string | null;
  orderPage:
    | {
        id: string;
        name: string | null;
        slug: string | null;
      }
    | null;
  itemCount: number;
  preferredDate: string | null;
  preferredTime: string | null;
  paidAt: string | null;
  createdAt: string;
  submittedAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Not specified";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTimePreference(time: string | null) {
  if (!time) return "";
  const timeMap: Record<string, string> = {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
  };
  return timeMap[time] || time;
}

// Kanban column definitions
const _KANBAN_COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "Pending", color: "var(--warning)" },
  { status: "paid", label: "Paid", color: "var(--success)" },
  { status: "processing", label: "Processing", color: "var(--primary)" },
  { status: "completed", label: "Completed", color: "var(--success)" },
  { status: "cancelled", label: "Cancelled", color: "var(--foreground-muted)" },
];

export function OrdersTableClient({
  orders,
  statusFilter,
}: {
  orders: OrderRow[];
  statusFilter?: OrderStatus;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [_isPending, startTransition] = useTransition();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Kanban drag state
  const [draggedOrder, setDraggedOrder] = useState<OrderRow | null>(null);
  const [_dragOverColumn, setDragOverColumn] = useState<OrderStatus | null>(null);

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

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Export selected orders to CSV
  const handleExportCSV = () => {
    const selectedOrders = filteredOrders.filter((o) => selectedIds.has(o.id));
    const headers = ["Order Number", "Client", "Email", "Items", "Total", "Status", "Preferred Date", "Created"];
    const rows = selectedOrders.map((o) => [
      o.orderNumber,
      o.clientName || "Guest",
      o.clientEmail || "",
      o.itemCount.toString(),
      (o.totalCents / 100).toFixed(2),
      o.status,
      o.preferredDate ? formatDate(o.preferredDate) : "",
      formatDate(o.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    clearSelection();
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.clientName?.toLowerCase().includes(query) ||
          order.clientEmail?.toLowerCase().includes(query) ||
          order.clientCompany?.toLowerCase().includes(query) ||
          order.orderPage?.name?.toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const daysAgo = dateRangeFilter === "7days" ? 7 : dateRangeFilter === "30days" ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      result = result.filter((order) => new Date(order.createdAt) >= cutoffDate);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amountHigh":
          return b.totalCents - a.totalCents;
        case "amountLow":
          return a.totalCents - b.totalCents;
        case "preferredDate": {
          // Sort by preferred date, null dates go to the end
          if (!a.preferredDate && !b.preferredDate) return 0;
          if (!a.preferredDate) return 1;
          if (!b.preferredDate) return -1;
          return new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
        }
        default:
          return 0;
      }
    });

    return result;
  }, [orders, searchQuery, sortOption, dateRangeFilter]);

  const selectAll = () => {
    setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
  };

  const isAllSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id));

  // Group orders by status for Kanban view
  const _ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, OrderRow[]> = {
      cart: [],
      pending: [],
      paid: [],
      processing: [],
      completed: [],
      cancelled: [],
    };
    filteredOrders.forEach((order) => {
      grouped[order.status].push(order);
    });
    return grouped;
  }, [filteredOrders]);

  // Kanban drag handlers
  const _handleDragStart = (order: OrderRow) => {
    setDraggedOrder(order);
  };

  const _handleDragOver = (e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const _handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const _handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedOrder && draggedOrder.status !== targetStatus) {
      // Prevent certain status transitions
      if (targetStatus === "paid" && draggedOrder.status === "pending") {
        showToast("Orders can only be marked as paid through payment", "error");
        setDraggedOrder(null);
        return;
      }

      startTransition(async () => {
        const result = await updateOrder({
          id: draggedOrder.id,
          status: targetStatus,
        });

        if (result.success) {
          showToast(`Order ${draggedOrder.orderNumber} moved to ${formatStatusLabel(targetStatus)}`, "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to update order status", "error");
        }
      });
    }

    setDraggedOrder(null);
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
        <ShoppingCartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          {statusFilter ? `No ${statusFilter} orders` : "No orders yet"}
        </h3>
        <p className="mt-2 text-sm text-foreground-muted">
          {statusFilter
            ? "Try a different filter."
            : "Orders will appear here when clients place them through your order pages."}
        </p>
        <Link
          href="/order-pages"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
        >
          <GlobeIcon className="h-4 w-4" />
          Manage Order Pages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "board"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <BoardIcon className="h-4 w-4" />
            Board
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Sort Dropdown - only show in list view */}
        {viewMode === "list" && (
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            aria-label="Sort orders"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amountHigh">Amount: High to Low</option>
            <option value="amountLow">Amount: Low to High</option>
            <option value="preferredDate">Preferred Date</option>
          </select>
        )}

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
          {filteredOrders.length} of {orders.length} orders
        </span>
      </div>

      {/* Empty State for Filtered Results */}
      {filteredOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No matching orders</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <VirtualList
            className="max-h-[70vh]"
            items={filteredOrders}
            estimateSize={() => 112}
            itemGap={0}
            getItemKey={(order) => order.id}
            prepend={
              <div className="sticky top-0 z-10 hidden grid-cols-[40px,1.3fr,1.2fr,1fr,1.1fr,0.9fr,0.9fr,0.5fr] items-center gap-3 border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted lg:grid">
                <span>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => (isAllSelected ? clearSelection() : selectAll())}
                    className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                    aria-label="Select all orders"
                  />
                </span>
                <span>Order</span>
                <span>Client</span>
                <span>Items</span>
                <span>Preferred</span>
                <span>Status</span>
                <span className="text-right">Total</span>
                <span className="text-right">Actions</span>
              </div>
            }
            renderItem={(order) => {
              const clientName = order.clientName || "Guest";
              const isSelected = selectedIds.has(order.id);
              return (
                <div className={cn(
                  "border-b border-[var(--card-border)] px-4 py-4 last:border-b-0 hover:bg-[var(--background-hover)] lg:px-6",
                  isSelected && "bg-[var(--primary)]/5"
                )}>
                  <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[40px,1.3fr,1.2fr,1fr,1.1fr,0.9fr,0.9fr,0.5fr] lg:items-center lg:gap-3">
                    {/* Checkbox - hidden on mobile */}
                    <div className="hidden lg:block">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(order.id)}
                        className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                        aria-label={`Select order ${order.orderNumber}`}
                      />
                    </div>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-medium text-foreground">{order.orderNumber}</p>
                        <p className="text-xs text-foreground-muted">{formatDate(order.createdAt)}</p>
                        <p className="text-sm text-foreground-muted lg:hidden">{clientName}</p>
                      </div>
                      <div className="text-right lg:hidden">
                        <span className="rounded-full bg-[var(--background-secondary)] px-2 py-1 text-xs font-medium text-foreground">
                          {formatCurrency(order.totalCents)}
                        </span>
                      </div>
                    </div>

                    <div className="hidden items-center gap-3 lg:flex">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full avatar-gradient text-xs font-medium text-white">
                        {clientName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{clientName}</p>
                        {order.clientEmail && (
                          <p className="truncate text-xs text-foreground-muted">{order.clientEmail}</p>
                        )}
                      </div>
                    </div>

                    <div className="hidden min-w-0 lg:block">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">
                          {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                        </span>
                        {order.orderPage?.name && (
                          <span className="truncate rounded bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs text-foreground-muted">
                            {order.orderPage.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      {order.preferredDate ? (
                        <div className="text-sm">
                          <p className="text-foreground">{formatDate(order.preferredDate)}</p>
                          {order.preferredTime && (
                            <p className="text-xs text-foreground-muted">
                              {formatTimePreference(order.preferredTime)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-foreground-muted">Not specified</span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-4 flex-wrap lg:justify-start lg:gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          getStatusBadgeClasses(order.status)
                        )}
                      >
                        {formatStatusLabel(order.status)}
                      </span>
                      <span className="text-sm font-semibold text-foreground lg:hidden">
                        {formatCurrency(order.totalCents)}
                      </span>
                    </div>

                    <div className="hidden text-right font-medium text-foreground lg:block">
                      {formatCurrency(order.totalCents)}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Link>
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
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 shadow-2xl">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-[var(--card-border)]" />
          <button
            onClick={handleExportCSV}
            className="rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/20"
          >
            Export CSV
          </button>
          <button
            onClick={clearSelection}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground-muted hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 1-11-4.69v.001a2.75 2.75 0 0 0 1.5 2.439V9.25a.75.75 0 0 0 .75.75h.75v.75c0 .415.336.75.75.75h.75v1.25a.75.75 0 0 0 .22.53l1.5 1.5a.75.75 0 0 0 .53.22h.25a.75.75 0 0 0 .75-.75v-3.25a.75.75 0 0 0-.22-.53l-.5-.5a.75.75 0 0 0-.53-.22H9.81a.75.75 0 0 0-.53.22l-.5.5a.75.75 0 0 1-1.06-1.06l.5-.5a.75.75 0 0 0 .22-.53V7.25a.75.75 0 0 0-.75-.75H6.5v-.5a.75.75 0 0 0-.39-.659 1.25 1.25 0 0 1 1.14-2.226A6.475 6.475 0 0 1 16.5 10Z" clipRule="evenodd" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1h.01a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM2.99 9a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1h-.01ZM1.99 15.25a1 1 0 0 1 1-1h.01a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01Z" clipRule="evenodd" />
    </svg>
  );
}

function BoardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15 3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10ZM5 11a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H5Z" />
    </svg>
  );
}

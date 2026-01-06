export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav } from "@/components/dashboard";
import { getOrders, getOrderStats } from "@/lib/actions/orders";
import Link from "next/link";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { cn } from "@/lib/utils";
import { OrdersTableClient } from "./orders-table-client";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

type OrderStatus = "cart" | "pending" | "paid" | "processing" | "completed" | "cancelled";
const validStatuses: OrderStatus[] = ["cart", "pending", "paid", "processing", "completed", "cancelled"];

export default async function OrdersPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;

  // Validate status filter
  const statusFilter = statusParam && validStatuses.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const [orders, stats] = await Promise.all([
    getOrders(statusFilter ? { status: statusFilter } : undefined),
    getOrderStats(),
  ]);

  const clientOrders = orders.map((order) => ({
    ...order,
    preferredDate: order.preferredDate ? order.preferredDate.toISOString() : null,
    preferredTime: order.preferredTime,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    submittedAt: order.submittedAt ? order.submittedAt.toISOString() : null,
  }));

  // Group by status for counts
  const statusCounts = {
    all: orders.length || stats.totalOrders,
    pending: orders.filter((o) => o.status === "pending").length || stats.pendingOrders,
    paid: orders.filter((o) => o.status === "paid").length || stats.paidOrders,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  // Recalculate if filtering
  if (!statusFilter) {
    statusCounts.pending = stats.pendingOrders;
    statusCounts.paid = stats.paidOrders;
    statusCounts.all = stats.totalOrders;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Orders", href: "/orders", icon: <ShoppingCartIcon className="h-4 w-4" /> },
          { label: "Sqft Analytics", href: "/orders/analytics", icon: <ChartIcon className="h-4 w-4" /> },
          { label: "Order Pages", href: "/order-pages", icon: <GlobeIcon className="h-4 w-4" /> },
          { label: "Invoices", href: "/invoices", icon: <DocumentIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Summary Cards */}
      <div className="auto-grid grid-min-220 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Orders</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {stats.totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Revenue (30 days)</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(stats.recentRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--warning)]">
            {stats.pendingOrders}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Paid</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {stats.paidOrders}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/orders"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            !statusFilter
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          All
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
            {statusCounts.all}
          </span>
        </Link>
        <Link
          href="/orders?status=pending"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            statusFilter === "pending"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Pending
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-xs",
            statusFilter === "pending" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
          )}>
            {statusCounts.pending}
          </span>
        </Link>
        <Link
          href="/orders?status=paid"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            statusFilter === "paid"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Paid
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-xs",
            statusFilter === "paid" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
          )}>
            {statusCounts.paid}
          </span>
        </Link>
        <Link
          href="/orders?status=completed"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            statusFilter === "completed"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Completed
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-xs",
            statusFilter === "completed" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
          )}>
            {statusCounts.completed}
          </span>
        </Link>
        <Link
          href="/orders?status=cancelled"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            statusFilter === "cancelled"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Cancelled
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-xs",
            statusFilter === "cancelled" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
          )}>
            {statusCounts.cancelled}
          </span>
        </Link>
      </div>

      {/* Orders Table */}
      <OrdersTableClient orders={clientOrders} statusFilter={statusFilter} />
    </div>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 1-11-4.69v.001a2.75 2.75 0 0 0 1.5 2.439V9.25a.75.75 0 0 0 .75.75h.75v.75c0 .415.336.75.75.75h.75v1.25a.75.75 0 0 0 .22.53l1.5 1.5a.75.75 0 0 0 .53.22h.25a.75.75 0 0 0 .75-.75v-3.25a.75.75 0 0 0-.22-.53l-.5-.5a.75.75 0 0 0-.53-.22H9.81a.75.75 0 0 0-.53.22l-.5.5a.75.75 0 0 1-1.06-1.06l.5-.5a.75.75 0 0 0 .22-.53V7.25a.75.75 0 0 0-.75-.75H6.5v-.5a.75.75 0 0 0-.39-.659 1.25 1.25 0 0 1 1.14-2.226A6.475 6.475 0 0 1 16.5 10Z" clipRule="evenodd" />
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

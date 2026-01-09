"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { RevenueStats, RecentPayment, RecentInvoice } from "@/lib/actions/super-admin";

// Icons
function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendingDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

// Mini chart component
function MiniBarChart({
  data,
  height = 60,
  color = "var(--primary)",
}: {
  data: Array<{ date: string; amount: number }>;
  height?: number;
  color?: string;
}) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.amount / max) * height;
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all hover:opacity-80"
            style={{
              height: Math.max(barHeight, 2),
              backgroundColor: color,
              opacity: 0.7 + (i / data.length) * 0.3,
            }}
            title={`${item.date}: $${item.amount.toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-[var(--success)]/10", text: "text-[var(--success)]", label: "Completed" },
    pending: { bg: "bg-[var(--warning)]/10", text: "text-[var(--warning)]", label: "Pending" },
    failed: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Failed" },
    paid: { bg: "bg-[var(--success)]/10", text: "text-[var(--success)]", label: "Paid" },
    overdue: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Overdue" },
    sent: { bg: "bg-[var(--primary)]/10", text: "text-[var(--primary)]", label: "Sent" },
    draft: { bg: "bg-[var(--foreground)]/10", text: "text-[var(--foreground-muted)]", label: "Draft" },
  };

  const { bg, text, label } = config[status] || config.pending;

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", bg, text)}>
      {label}
    </span>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

interface RevenuePageClientProps {
  stats: RevenueStats | null;
  recentPayments: RecentPayment[];
  overdueInvoices: RecentInvoice[];
}

export function RevenuePageClient({
  stats,
  recentPayments,
  overdueInvoices,
}: RevenuePageClientProps) {
  const [chartView, setChartView] = useState<"daily" | "monthly">("daily");

  if (!stats) {
    return (
      <div className="text-center py-12 text-[var(--foreground-muted)]">
        Unable to load revenue statistics
      </div>
    );
  }

  // Primary stats cards
  const primaryStats = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenueCents / 100),
      subtext: "All time",
      icon: DollarSignIcon,
      color: "text-[var(--success)]",
      bgColor: "bg-[var(--success)]/10",
    },
    {
      label: "This Month",
      value: formatCurrency(stats.revenueThisMonth),
      subtext: stats.revenueGrowthPercent >= 0
        ? `+${stats.revenueGrowthPercent.toFixed(1)}% vs last month`
        : `${stats.revenueGrowthPercent.toFixed(1)}% vs last month`,
      icon: stats.revenueGrowthPercent >= 0 ? TrendingUpIcon : TrendingDownIcon,
      color: stats.revenueGrowthPercent >= 0 ? "text-[var(--success)]" : "text-[var(--error)]",
      bgColor: stats.revenueGrowthPercent >= 0 ? "bg-[var(--success)]/10" : "bg-[var(--error)]/10",
    },
    {
      label: "MRR",
      value: formatCurrency(stats.mrr),
      subtext: `${formatCurrency(stats.arr)} ARR`,
      icon: CalendarIcon,
      color: "text-[var(--primary)]",
      bgColor: "bg-[var(--primary)]/10",
    },
    {
      label: "Success Rate",
      value: `${stats.paymentSuccessRate.toFixed(1)}%`,
      subtext: `${stats.successfulPayments} of ${stats.totalPayments} payments`,
      icon: CheckCircleIcon,
      color: stats.paymentSuccessRate >= 95 ? "text-[var(--success)]" : "text-[var(--warning)]",
      bgColor: stats.paymentSuccessRate >= 95 ? "bg-[var(--success)]/10" : "bg-[var(--warning)]/10",
    },
  ];

  // Secondary stats
  const secondaryStats = [
    {
      label: "Today",
      value: formatCurrency(stats.revenueToday),
      icon: ClockIcon,
    },
    {
      label: "This Week",
      value: formatCurrency(stats.revenueThisWeek),
      icon: CalendarIcon,
    },
    {
      label: "This Year",
      value: formatCurrency(stats.revenueThisYear),
      icon: CalendarIcon,
    },
    {
      label: "Avg Payment",
      value: formatCurrencyDetailed(stats.averagePaymentCents / 100),
      icon: CreditCardIcon,
    },
  ];

  // Invoice stats
  const invoiceStats = [
    {
      label: "Total Invoices",
      value: stats.totalInvoices,
      color: "text-[var(--foreground)]",
    },
    {
      label: "Paid",
      value: stats.paidInvoices,
      color: "text-[var(--success)]",
    },
    {
      label: "Unpaid",
      value: stats.unpaidInvoices,
      color: "text-[var(--warning)]",
    },
    {
      label: "Overdue",
      value: stats.overdueInvoices,
      color: "text-[var(--error)]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Revenue statistics">
        {primaryStats.map((card) => (
          <div
            key={card.label}
            className={cn(
              "p-5 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bgColor)}>
                <card.icon className={cn("w-5 h-5", card.color)} aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)] mb-0.5">
              {card.value}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">{card.label}</div>
            <div className="text-xs text-[var(--foreground-muted)] mt-0.5">{card.subtext}</div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "p-4 rounded-lg",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
              <span className="text-xs text-[var(--foreground-muted)]">{stat.label}</span>
            </div>
            <div className="text-xl font-semibold text-[var(--foreground)]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <section
        className={cn(
          "p-5 rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
        aria-labelledby="revenue-chart-heading"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h2 id="revenue-chart-heading" className="font-semibold text-[var(--foreground)]">
            Revenue Trend
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--background-tertiary)]">
            <button
              onClick={() => setChartView("daily")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                chartView === "daily"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              30 Days
            </button>
            <button
              onClick={() => setChartView("monthly")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                chartView === "monthly"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              12 Months
            </button>
          </div>
        </div>
        <div className="h-32">
          {chartView === "daily" ? (
            <MiniBarChart data={stats.revenueByDay} height={120} color="var(--success)" />
          ) : (
            <MiniBarChart
              data={stats.revenueByMonth.map((m) => ({ date: m.month, amount: m.amount }))}
              height={120}
              color="var(--primary)"
            />
          )}
        </div>
      </section>

      {/* Invoice Stats & Outstanding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Overview */}
        <section
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
          aria-labelledby="invoice-overview-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileTextIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            <h2 id="invoice-overview-heading" className="font-semibold text-[var(--foreground)]">
              Invoice Overview
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {invoiceStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                <div className="text-xs text-[var(--foreground-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-[var(--border)]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <span className="text-sm text-[var(--foreground-muted)]">Outstanding Amount</span>
              <span className="text-lg font-semibold text-[var(--warning)]">
                {formatCurrencyDetailed(stats.outstandingAmountCents / 100)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap mt-2">
              <span className="text-sm text-[var(--foreground-muted)]">Average Invoice</span>
              <span className="text-lg font-semibold text-[var(--foreground)]">
                {formatCurrencyDetailed(stats.averageInvoiceCents / 100)}
              </span>
            </div>
          </div>
        </section>

        {/* Payment Status Breakdown */}
        <section
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
          aria-labelledby="payment-breakdown-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCardIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            <h2 id="payment-breakdown-heading" className="font-semibold text-[var(--foreground)]">
              Payment Status
            </h2>
          </div>
          <div className="space-y-3">
            {stats.paymentsByStatus.map((status) => {
              const percentage = stats.totalPayments > 0
                ? (status.count / stats.totalPayments) * 100
                : 0;
              const statusConfig: Record<string, string> = {
                completed: "bg-[var(--success)]",
                pending: "bg-[var(--warning)]",
                failed: "bg-[var(--error)]",
                refunded: "bg-[var(--foreground-muted)]",
              };
              const barColor = statusConfig[status.status] || "bg-[var(--foreground-muted)]";

              return (
                <div key={status.status}>
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
                    <span className="text-sm capitalize text-[var(--foreground)]">
                      {status.status}
                    </span>
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {status.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Top Customers & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <section
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
          aria-labelledby="top-customers-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <UsersIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            <h2 id="top-customers-heading" className="font-semibold text-[var(--foreground)]">
              Top Customers
            </h2>
          </div>
          {stats.topCustomers.length > 0 ? (
            <ul className="space-y-2" role="list">
              {stats.topCustomers.slice(0, 5).map((customer, index) => (
                <li
                  key={customer.organizationId}
                  className={cn(
                    "flex items-start justify-between gap-4 flex-wrap p-2.5 rounded-lg",
                    "bg-[var(--background-tertiary)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-[var(--foreground)] truncate max-w-[180px]">
                      {customer.organizationName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(customer.totalRevenue)}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      {customer.paymentCount} payments
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-[var(--foreground-muted)] text-sm">
              No customer data yet
            </div>
          )}
        </section>

        {/* Recent Payments */}
        <section
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
          aria-labelledby="recent-payments-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCardIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            <h2 id="recent-payments-heading" className="font-semibold text-[var(--foreground)]">
              Recent Payments
            </h2>
          </div>
          {recentPayments.length > 0 ? (
            <ul className="space-y-2" role="list">
              {recentPayments.slice(0, 5).map((payment) => (
                <li
                  key={payment.id}
                  className={cn(
                    "flex items-start justify-between gap-4 flex-wrap p-2.5 rounded-lg",
                    "bg-[var(--background-tertiary)]"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {payment.clientName || payment.clientEmail || "Unknown"}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      {payment.organization?.name || "Unknown org"} &middot;{" "}
                      {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrencyDetailed((payment.amountCents + payment.tipAmountCents) / 100)}
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-[var(--foreground-muted)] text-sm">
              No recent payments
            </div>
          )}
        </section>
      </div>

      {/* Overdue Invoices */}
      {overdueInvoices.length > 0 && (
        <section
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--error)]/30",
            "bg-[var(--error)]/5"
          )}
          aria-labelledby="overdue-invoices-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangleIcon className="w-4 h-4 text-[var(--error)]" aria-hidden="true" />
            <h2 id="overdue-invoices-heading" className="font-semibold text-[var(--error)]">
              Overdue Invoices ({overdueInvoices.length})
            </h2>
          </div>
          <ul className="space-y-2" role="list">
            {overdueInvoices.map((invoice) => (
              <li
                key={invoice.id}
                className={cn(
                  "flex items-start justify-between gap-4 flex-wrap p-3 rounded-lg",
                  "bg-[var(--card)] border border-[var(--border)]"
                )}
              >
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {invoice.client?.name || invoice.client?.email || "Unknown client"} &middot;{" "}
                    {invoice.organization?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[var(--error)]">
                    {formatCurrencyDetailed((invoice.totalCents - invoice.paidAmountCents) / 100)}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    Due {formatDistanceToNow(new Date(invoice.dueDate), { addSuffix: true })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Revenue by Plan */}
      {stats.revenueByPlan.length > 0 && (
        <section
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
          aria-labelledby="revenue-by-plan-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            <h2 id="revenue-by-plan-heading" className="font-semibold text-[var(--foreground)]">
              Revenue by Plan
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.revenueByPlan.map((plan) => (
              <div
                key={plan.plan}
                className={cn(
                  "p-4 rounded-lg",
                  "bg-[var(--background-tertiary)]"
                )}
              >
                <div className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide mb-1">
                  {plan.plan}
                </div>
                <div className="text-lg font-semibold text-[var(--foreground)]">
                  {formatCurrency(plan.amount)}
                </div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  {plan.count} customers
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

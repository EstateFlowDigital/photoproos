import { Suspense } from "react";
import {
  getRevenueStats,
  getRecentPayments,
  getRecentInvoices,
} from "@/lib/actions/super-admin";
import { RevenuePageClient } from "./revenue-client";

async function RevenueLoader() {
  const [statsResult, paymentsResult, invoicesResult] = await Promise.all([
    getRevenueStats(),
    getRecentPayments({ limit: 10 }),
    getRecentInvoices({ limit: 10, status: "overdue" }),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const recentPayments = paymentsResult.success ? paymentsResult.data : [];
  const overdueInvoices = invoicesResult.success ? invoicesResult.data : [];

  return (
    <RevenuePageClient
      stats={stats}
      recentPayments={recentPayments || []}
      overdueInvoices={overdueInvoices || []}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-64 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />

      {/* Lists skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
        <div className="h-80 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
      </div>
    </div>
  );
}

export default function RevenuePage() {
  return (
    <div data-element="super-admin-revenue-page">
      <div className="mb-8" data-element="super-admin-revenue-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]" data-element="super-admin-revenue-title">
          Revenue & Billing
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Platform-wide payment analytics and billing overview
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <RevenueLoader />
      </Suspense>
    </div>
  );
}

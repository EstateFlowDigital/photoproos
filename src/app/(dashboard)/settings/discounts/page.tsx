import { Suspense } from "react";
import { getOrgDiscounts, getOrgDiscountStats } from "@/lib/actions/organization-discounts";
import { DiscountsSettingsClient } from "./discounts-settings-client";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]"
          >
            <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded animate-pulse mb-2" />
            <div className="h-8 w-16 bg-[var(--background-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--card)] p-4 border-b border-[var(--border)]">
          <div className="h-4 w-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 border-b border-[var(--border)] last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 bg-[var(--background-tertiary)] rounded animate-pulse" />
              <div className="h-4 w-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Data fetcher component
async function DiscountsLoader() {
  const [discountsResult, statsResult] = await Promise.all([
    getOrgDiscounts({ limit: 20 }),
    getOrgDiscountStats(),
  ]);

  const discounts = discountsResult.success ? discountsResult.data?.discounts || [] : [];
  const total = discountsResult.success ? discountsResult.data?.total || 0 : 0;
  const stats = statsResult.success ? statsResult.data || null : null;

  return (
    <DiscountsSettingsClient
      initialDiscounts={discounts}
      totalDiscounts={total}
      stats={stats}
    />
  );
}

export default function DiscountsSettingsPage() {
  return (
    <div data-element="settings-discounts-page">
      <Suspense fallback={<LoadingSkeleton />}>
        <DiscountsLoader />
      </Suspense>
    </div>
  );
}

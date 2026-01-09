import { Suspense } from "react";
import { getPlatformDiscounts, getDiscountStats } from "@/lib/actions/super-admin";
import { DiscountsPageClient } from "./discounts-client";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-4">
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
        {[...Array(5)].map((_, i) => (
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
    getPlatformDiscounts({ limit: 20 }),
    getDiscountStats(),
  ]);

  const discounts = discountsResult.success
    ? discountsResult.data.discounts
    : [];
  const total = discountsResult.success
    ? discountsResult.data.total
    : 0;
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <DiscountsPageClient
      initialDiscounts={discounts}
      totalDiscounts={total}
      stats={stats}
    />
  );
}

export default function DiscountsPage() {
  return (
    <div data-element="super-admin-discounts-page">
      <Suspense fallback={<LoadingSkeleton />}>
        <DiscountsLoader />
      </Suspense>
    </div>
  );
}

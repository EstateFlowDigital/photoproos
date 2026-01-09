import { Suspense } from "react";
import {
  getEngagementStats,
  getAtRiskUsers,
} from "@/lib/actions/super-admin";
import { EngagementPageClient } from "./engagement-client";

async function EngagementLoader() {
  const [statsResult, atRiskResult] = await Promise.all([
    getEngagementStats(),
    getAtRiskUsers({ daysInactive: 14, limit: 20 }),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const atRiskUsers = atRiskResult.success ? atRiskResult.data : [];

  return (
    <EngagementPageClient
      stats={stats}
      atRiskUsers={atRiskUsers || []}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="h-8 w-64 bg-[var(--background-tertiary)] rounded animate-pulse" />

      {/* Primary stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
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

export default function EngagementPage() {
  return (
    <div data-element="super-admin-engagement-page">
      <div className="mb-8" data-element="super-admin-engagement-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]" data-element="super-admin-engagement-title">
          User Engagement & Churn
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Monitor user activity, engagement metrics, and churn risk indicators
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <EngagementLoader />
      </Suspense>
    </div>
  );
}

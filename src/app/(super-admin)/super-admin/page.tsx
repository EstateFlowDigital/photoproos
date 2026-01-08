import { Suspense } from "react";
import { getSuperAdminDashboardStats } from "@/lib/actions/super-admin";
import { getAllSupportTickets } from "@/lib/actions/support-tickets";
import { SuperAdminDashboardClient } from "./dashboard-client";

async function DashboardLoader() {
  const [statsResult, ticketsResult] = await Promise.all([
    getSuperAdminDashboardStats(),
    getAllSupportTickets({ status: "open" }),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const recentTickets = ticketsResult.success ? ticketsResult.data?.slice(0, 5) : [];

  return (
    <SuperAdminDashboardClient
      stats={stats}
      recentTickets={recentTickets || []}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
        <div className="h-80 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Platform overview and quick actions
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardLoader />
      </Suspense>
    </div>
  );
}

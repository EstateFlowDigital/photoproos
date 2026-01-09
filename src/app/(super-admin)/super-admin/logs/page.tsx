import { Suspense } from "react";
import { getAuditLogs, getSystemHealthStats } from "@/lib/actions/super-admin";
import { LogsPageClient } from "./logs-client";

interface SearchParams {
  page?: string;
  type?: string;
  search?: string;
}

async function LogsLoader({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page || "1");
  const type = searchParams.type;
  const search = searchParams.search;

  const [logsResult, healthResult] = await Promise.all([
    getAuditLogs({
      limit: 50,
      offset: (page - 1) * 50,
      actionType: type as string | undefined,
    }),
    getSystemHealthStats(),
  ]);

  const logs = logsResult.success ? logsResult.data.logs : [];
  const totalLogs = logsResult.success ? logsResult.data.total : 0;
  const health = healthResult.success ? healthResult.data : null;

  return (
    <LogsPageClient
      logs={logs}
      totalLogs={totalLogs}
      currentPage={page}
      health={health}
      filterType={type}
      filterSearch={search}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-4">
        <div className="h-10 w-48 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-x-auto">
        <div className="h-12 bg-[var(--background-tertiary)] animate-pulse" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-16 border-t border-[var(--border)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div data-element="super-admin-logs-page">
      <div className="mb-8" data-element="super-admin-logs-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]" data-element="super-admin-logs-title">
          System Logs & Monitoring
        </h1>
        <p className="text-[var(--foreground-muted)]">
          View admin activity, system health, and platform metrics
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <LogsLoader searchParams={params} />
      </Suspense>
    </div>
  );
}

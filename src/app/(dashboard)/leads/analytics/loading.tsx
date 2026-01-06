import { PageHeader, Breadcrumb } from "@/components/dashboard";

export default function LeadsAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Leads", href: "/leads" },
          { label: "Analytics" },
        ]}
      />
      <PageHeader
        title="Leads Analytics"
        subtitle="Track lead performance and conversion metrics"
      />

      {/* Summary Stats Skeleton */}
      <div className="auto-grid grid-min-180 grid-gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-[var(--background-secondary)]" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[var(--background-secondary)]" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[var(--background-secondary)]" />
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel Skeleton */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--background-secondary)]" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-[var(--background-secondary)]" />
                  <div className="h-4 w-8 animate-pulse rounded bg-[var(--background-secondary)]" />
                </div>
                <div className="h-8 animate-pulse rounded-lg bg-[var(--background-secondary)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Source Attribution Skeleton */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--background-secondary)]" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-32 animate-pulse rounded bg-[var(--background-secondary)]" />
                  <div className="h-4 w-12 animate-pulse rounded bg-[var(--background-secondary)]" />
                </div>
                <div className="h-2 animate-pulse rounded-full bg-[var(--background-secondary)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart Skeleton */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--background-secondary)]" />
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-16 animate-pulse rounded bg-[var(--background-secondary)]" />
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-end gap-2" style={{ height: "200px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-1 space-y-2">
              <div
                className="animate-pulse rounded bg-[var(--background-secondary)]"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
              <div className="h-3 animate-pulse rounded bg-[var(--background-secondary)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--background-secondary)]" />
          <div className="mt-6 h-8 animate-pulse rounded-lg bg-[var(--background-secondary)]" />
          <div className="mt-4 flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-20 animate-pulse rounded bg-[var(--background-secondary)]" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--background-secondary)]" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--background-secondary)]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

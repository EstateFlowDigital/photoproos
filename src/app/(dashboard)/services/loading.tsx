export default function ServicesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-28 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-[var(--background-secondary)] animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
      </div>

      {/* Category Tabs Skeleton */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-lg bg-[var(--background-secondary)] animate-pulse"
          />
        ))}
      </div>

      {/* Services Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
          >
            {/* Service Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="h-5 w-32 rounded bg-[var(--background-secondary)] animate-pulse" />
                <div className="mt-2 h-4 w-20 rounded bg-[var(--background-secondary)] animate-pulse" />
              </div>
              <div className="h-6 w-16 rounded-full bg-[var(--background-secondary)] animate-pulse" />
            </div>

            {/* Service Details */}
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-[var(--background-secondary)] animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-[var(--background-secondary)] animate-pulse" />
            </div>

            {/* Service Footer */}
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
              <div className="h-6 w-20 rounded bg-[var(--background-secondary)] animate-pulse" />
              <div className="h-4 w-16 rounded bg-[var(--background-secondary)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

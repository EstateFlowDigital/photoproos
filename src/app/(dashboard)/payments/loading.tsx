export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
          <div className="mt-2 h-4 w-56 rounded bg-[var(--background-secondary)] animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
              <div>
                <div className="h-4 w-20 rounded bg-[var(--background-secondary)] animate-pulse" />
                <div className="mt-1 h-6 w-24 rounded bg-[var(--background-secondary)] animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-64 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
      </div>

      {/* Payment Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[var(--background-secondary)] animate-pulse" />
                <div>
                  <div className="h-5 w-40 rounded bg-[var(--background-secondary)] animate-pulse" />
                  <div className="mt-1 h-4 w-24 rounded bg-[var(--background-secondary)] animate-pulse" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 w-20 rounded bg-[var(--background-secondary)] animate-pulse" />
                <div className="mt-1 h-4 w-16 rounded bg-[var(--background-secondary)] animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

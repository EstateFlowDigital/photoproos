export default function InvoicesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
          <div className="mt-2 h-4 w-48 rounded bg-[var(--background-secondary)] animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
          >
            <div className="h-4 w-20 rounded bg-[var(--background-secondary)] animate-pulse" />
            <div className="mt-2 h-8 w-24 rounded bg-[var(--background-secondary)] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-64 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 border-b border-[var(--card-border)] bg-[var(--background)] px-6 py-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-4 w-16 rounded bg-[var(--background-secondary)] animate-pulse"
            />
          ))}
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
          <div
            key={row}
            className="grid grid-cols-6 gap-4 border-b border-[var(--card-border)] px-6 py-4 last:border-0"
          >
            <div className="h-4 w-20 rounded bg-[var(--background-secondary)] animate-pulse" />
            <div className="h-4 w-32 rounded bg-[var(--background-secondary)] animate-pulse" />
            <div className="h-4 w-16 rounded bg-[var(--background-secondary)] animate-pulse" />
            <div className="h-4 w-24 rounded bg-[var(--background-secondary)] animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-[var(--background-secondary)] animate-pulse" />
            <div className="h-8 w-8 rounded bg-[var(--background-secondary)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

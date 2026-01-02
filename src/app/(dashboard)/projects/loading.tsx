export default function ProjectsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-[var(--card-border)] bg-[var(--card)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 animate-pulse rounded bg-[var(--background-hover)]" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-[var(--background-hover)]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-[var(--background-hover)]" />
            <div className="h-9 w-36 animate-pulse rounded-lg bg-[var(--background-hover)]" />
          </div>
        </div>
      </div>

      {/* Board Skeleton */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {/* Column Skeletons */}
          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="w-80 flex-shrink-0 rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--background-hover)]" />
                  <div className="h-4 w-20 animate-pulse rounded bg-[var(--background-hover)]" />
                  <div className="h-5 w-6 animate-pulse rounded-full bg-[var(--background-hover)]" />
                </div>
              </div>

              {/* Task Card Skeletons */}
              <div className="space-y-2 p-3">
                {[1, 2, 3].slice(0, col === 3 ? 1 : col === 4 ? 2 : 3).map((task) => (
                  <div
                    key={task}
                    className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-5 w-14 animate-pulse rounded bg-[var(--background-hover)]" />
                    </div>
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--background-hover)]" />
                    <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-[var(--background-hover)]" />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-8 animate-pulse rounded bg-[var(--background-hover)]" />
                        <div className="h-4 w-8 animate-pulse rounded bg-[var(--background-hover)]" />
                      </div>
                      <div className="h-6 w-6 animate-pulse rounded-full bg-[var(--background-hover)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

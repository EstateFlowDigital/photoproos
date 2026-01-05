export default function FeedbackLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-card rounded animate-pulse" />
          <div className="h-4 w-64 bg-card rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-card rounded animate-pulse" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-24 bg-card rounded-full animate-pulse" />
        ))}
      </div>

      {/* Feedback items skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-background-tertiary rounded-full animate-pulse" />
                  <div className="h-4 w-32 bg-background-tertiary rounded animate-pulse" />
                </div>
                <div className="h-4 w-full bg-background-tertiary rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-background-tertiary rounded animate-pulse" />
                <div className="flex items-center gap-3">
                  <div className="h-3 w-24 bg-background-tertiary rounded animate-pulse" />
                  <div className="h-3 w-32 bg-background-tertiary rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[var(--background-elevated)]",
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 lg:p-5">
      <Skeleton className="h-4 w-24" />
      <div className="mt-2 flex items-baseline gap-2">
        <Skeleton className="h-8 w-32 lg:h-9" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-6 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GalleryCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <Skeleton className="mb-3 aspect-video w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-1.5 h-3 w-1/2" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function UpcomingBookingsSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] divide-y divide-[var(--card-border)]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="divide-y divide-[var(--card-border)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton({ showAction = false }: { showAction?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-64" />
      </div>
      {showAction && <Skeleton className="h-10 w-32 rounded-lg" />}
    </div>
  );
}

export function FilterTabsSkeleton() {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--card-border)] pb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full" />
      ))}
    </div>
  );
}

export function ClientCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CalendarDaySkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
      <Skeleton className="mx-auto h-4 w-8" />
      <Skeleton className="mx-auto mt-2 h-8 w-8 rounded-full" />
    </div>
  );
}

export function BookingItemSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-5 w-5 shrink-0" />
      </div>
    </div>
  );
}

export function GalleriesPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showAction />
      <FilterTabsSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <GalleryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ClientsPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showAction />
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ClientCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function PropertiesPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showAction />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SchedulingPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showAction />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <CalendarDaySkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SettingsCardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Status and info bar */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Photos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Details */}
        <div className="space-y-4">
          {/* Client info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-40" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="mt-1 h-3 w-16" />
              </div>
              <div>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="mt-1 h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-1 h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Client info card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Galleries section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <GalleryCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <RecentActivitySkeleton />
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="mt-1 h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Property hero */}
      <Skeleton className="aspect-video w-full rounded-xl" />

      {/* Property details grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-1 h-3 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Agent card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="mt-1 h-3 w-12" />
              </div>
              <div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="mt-1 h-3 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Booking details grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Date/time card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="mt-1 h-5 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="mt-1 h-5 w-24" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-1 h-5 w-full" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <Skeleton className="h-6 w-16 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Client card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-40" />
              </div>
            </div>
          </div>

          {/* Service card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <Skeleton className="h-5 w-16 mb-3" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <QuickActionsSkeleton />

      {/* Revenue Chart Skeleton */}
      <RevenueChartSkeleton />

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Galleries Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <GalleryCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Upcoming Bookings Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
            <UpcomingBookingsSkeleton />
          </div>

          {/* Recent Activity Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <RecentActivitySkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

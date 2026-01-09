"use client";

/**
 * Skeleton loaders for client portal tabs
 * Provides visual feedback while content is loading
 */

// Base skeleton component with shimmer animation
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-[var(--background-tertiary)] via-[var(--card-border)] to-[var(--background-tertiary)] bg-[length:200%_100%] ${className}`}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// Skeleton for property cards
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-2 h-5 w-48" />
        <Skeleton className="mt-1 h-4 w-36" />
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="mt-4 h-9 w-full" />
      </div>
    </div>
  );
}

export function PropertiesTabSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for gallery cards
export function GalleryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="border-t border-[var(--card-border)] p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-16 flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function GalleriesTabSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <GalleryCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for download cards
export function DownloadCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="border-b border-[var(--card-border)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DownloadsTabSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-64" />
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        {[1, 2].map((i) => (
          <DownloadCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Skeleton for invoice cards
export function InvoiceCardSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12" />
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-9 w-10" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function InvoicesTabSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <InvoiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for questionnaire cards
export function QuestionnaireCardSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12" />
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-48" />
          <Skeleton className="mt-1 h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function QuestionnairesTabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <QuestionnaireCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Skeleton for stats cards
export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-6 w-12" />
          <Skeleton className="mt-1 h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function PortalStatsSkeleton() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for action cards
export function ActionCardsSkeleton() {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-3 h-9 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Full portal page skeleton
export function PortalPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Welcome */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Action Cards */}
      <ActionCardsSkeleton />

      {/* Stats */}
      <PortalStatsSkeleton />

      {/* Tabs */}
      <div className="mb-6 hidden md:flex md:gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-28" />
        ))}
      </div>

      {/* Tab Content */}
      <PropertiesTabSkeleton />
    </div>
  );
}

import { Suspense } from "react";
import { getAnnouncements, getAnnouncementStats } from "@/lib/actions/super-admin";
import { AnnouncementsPageClient } from "./announcements-client";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]"
          >
            <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded animate-pulse mb-2" />
            <div className="h-8 w-16 bg-[var(--background-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--card)] p-4 border-b border-[var(--border)]">
          <div className="h-4 w-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 border-b border-[var(--border)] last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <div className="h-4 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
              <div className="h-4 w-24 bg-[var(--background-tertiary)] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Data fetcher component
async function AnnouncementsLoader() {
  const [announcementsResult, statsResult] = await Promise.all([
    getAnnouncements({ limit: 20 }),
    getAnnouncementStats(),
  ]);

  const announcements = announcementsResult.success
    ? announcementsResult.data.announcements
    : [];
  const total = announcementsResult.success
    ? announcementsResult.data.total
    : 0;
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <AnnouncementsPageClient
      initialAnnouncements={announcements}
      totalAnnouncements={total}
      stats={stats}
    />
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AnnouncementsLoader />
    </Suspense>
  );
}

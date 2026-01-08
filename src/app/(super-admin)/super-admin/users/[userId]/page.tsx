import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUserDetails } from "@/lib/actions/super-admin";
import { UserDetailClient } from "./user-detail-client";

interface PageProps {
  params: Promise<{ userId: string }>;
}

async function UserDetailLoader({ userId }: { userId: string }) {
  const result = await getUserDetails(userId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <UserDetailClient user={result.data} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-[var(--background-tertiary)] animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
          <div className="h-5 w-32 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
        <div className="h-64 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
      </div>
    </div>
  );
}

export default async function UserDetailPage({ params }: PageProps) {
  const { userId } = await params;

  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <UserDetailLoader userId={userId} />
      </Suspense>
    </div>
  );
}

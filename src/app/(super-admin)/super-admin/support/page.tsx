import { Suspense } from "react";
import { getAllSupportTickets } from "@/lib/actions/support-tickets";
import { SupportPageClient } from "./support-client";

interface SearchParams {
  status?: string;
  priority?: string;
  category?: string;
}

async function SupportLoader({ searchParams }: { searchParams: SearchParams }) {
  const result = await getAllSupportTickets({
    status: searchParams.status as "open" | "in_progress" | "resolved" | "closed" | undefined,
    priority: searchParams.priority as "low" | "medium" | "high" | "urgent" | undefined,
    category: searchParams.category as "support_request" | "report_issue" | "billing" | "questions" | "feature_request" | "other" | undefined,
  });

  const tickets = result.success ? result.data || [] : [];

  return (
    <SupportPageClient
      tickets={tickets}
      filters={{
        status: searchParams.status,
        priority: searchParams.priority,
        category: searchParams.category,
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex gap-2">
        <div className="h-10 w-32 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 border-b border-[var(--border)] last:border-0 animate-pulse bg-[var(--background-tertiary)]/50"
          />
        ))}
      </div>
    </div>
  );
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Support Tickets
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Manage and respond to user support requests
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <SupportLoader searchParams={params} />
      </Suspense>
    </div>
  );
}

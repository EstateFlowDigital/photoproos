import { Suspense } from "react";
import { getConversations, getAIUsageStats } from "@/lib/actions/ai";
import { AIPageClient } from "./ai-client";

// AI page is session-aware and uses headers; force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function AILoader() {
  const [conversationsResult, statsResult] = await Promise.all([
    getConversations(),
    getAIUsageStats(),
  ]);

  const conversations = conversationsResult.success
    ? conversationsResult.data || []
    : [];
  const stats = statsResult.success ? statsResult.data : null;

  return <AIPageClient conversations={conversations} stats={stats} />;
}

function LoadingSkeleton() {
  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Sidebar skeleton */}
      <div className="w-72 border-r border-[var(--border)] p-4 space-y-4">
        <div className="h-10 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-[var(--background-tertiary)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Main chat skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--background-tertiary)] rounded-full animate-pulse" />
          <div className="h-6 w-48 mx-auto bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <div data-element="ai-page">
      <Suspense fallback={<LoadingSkeleton />}>
        <AILoader />
      </Suspense>
    </div>
  );
}

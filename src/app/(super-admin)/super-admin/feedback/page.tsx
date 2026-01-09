import { Suspense } from "react";
import { getAllPlatformFeedback, getFeedbackStats } from "@/lib/actions/platform-feedback";
import { FeedbackPageClient } from "./feedback-client";

async function FeedbackLoader() {
  const [feedbackResult, statsResult] = await Promise.all([
    getAllPlatformFeedback({ limit: 100 }),
    getFeedbackStats(),
  ]);

  const feedback = feedbackResult.success ? feedbackResult.data || [] : [];
  const stats = statsResult.success ? statsResult.data : null;

  return <FeedbackPageClient feedback={feedback} stats={stats} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
        <div className="h-64 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="h-96 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <div data-element="super-admin-feedback-page">
      <div className="mb-8" data-element="super-admin-feedback-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]" data-element="super-admin-feedback-title">
          Platform Feedback
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Review user feedback and track platform satisfaction
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <FeedbackLoader />
      </Suspense>
    </div>
  );
}

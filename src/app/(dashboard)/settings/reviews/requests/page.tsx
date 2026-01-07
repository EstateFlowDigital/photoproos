/**
 * Review Requests Dashboard
 *
 * View and manage all review requests and responses.
 * Includes filtering, search, and detailed response viewing.
 */

import { Suspense } from "react";
import { getReviewRequests, getReviewStats } from "@/lib/actions/review-gate";
import { ReviewRequestsClient } from "./review-requests-client";

export const metadata = {
  title: "Review Requests | Settings",
  description: "View and manage review requests and responses",
};

export const dynamic = "force-dynamic";

export default async function ReviewRequestsPage() {
  const [requestsResult, statsResult] = await Promise.all([
    getReviewRequests({ pageSize: 50 }),
    getReviewStats(),
  ]);

  const requests = requestsResult.success ? requestsResult.data.requests : [];
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      }
    >
      <ReviewRequestsClient initialRequests={requests} stats={stats} />
    </Suspense>
  );
}

"use client";

import { useEffect } from "react";
import { GamificationErrorFallback } from "@/components/gamification";

export default function YearInReviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("[Year in Review Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <GamificationErrorFallback
        error={error}
        resetErrorBoundary={reset}
        title="Unable to Load Year in Review"
        description="There was a problem loading your year in review data. Please try again."
      />
    </div>
  );
}

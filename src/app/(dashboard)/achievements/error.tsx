"use client";

import { useEffect } from "react";
import { GamificationErrorFallback } from "@/components/gamification";

export default function AchievementsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("[Achievements Page Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <GamificationErrorFallback
        error={error}
        resetErrorBoundary={reset}
        title="Unable to Load Achievements"
        description="There was a problem loading your achievements. Please try again."
      />
    </div>
  );
}

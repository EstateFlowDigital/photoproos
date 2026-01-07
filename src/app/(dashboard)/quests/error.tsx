"use client";

import { useEffect } from "react";
import { GamificationErrorFallback } from "@/components/gamification";

export default function QuestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("[Quests Page Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <GamificationErrorFallback
        error={error}
        resetErrorBoundary={reset}
        title="Unable to Load Quests"
        description="There was a problem loading your quests. Please try again."
      />
    </div>
  );
}

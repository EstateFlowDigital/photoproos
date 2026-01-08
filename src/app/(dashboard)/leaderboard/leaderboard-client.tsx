"use client";

import { useCallback } from "react";
import { EnhancedLeaderboard } from "@/components/gamification";
import {
  getEnhancedLeaderboard,
  type EnhancedLeaderboardEntry,
  type LeaderboardFilters,
} from "@/lib/actions/gamification";

interface LeaderboardClientProps {
  initialData: EnhancedLeaderboardEntry[];
}

export function LeaderboardClient({ initialData }: LeaderboardClientProps) {
  const handleFetchData = useCallback(async (filters: LeaderboardFilters) => {
    const result = await getEnhancedLeaderboard(filters);
    if (result.success) {
      return result.data;
    }
    throw new Error("Failed to fetch leaderboard");
  }, []);

  return (
    <EnhancedLeaderboard
      initialData={initialData}
      onFetchData={handleFetchData}
      showFilters={true}
    />
  );
}

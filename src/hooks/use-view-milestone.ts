"use client";

import { useState, useEffect, useCallback } from "react";

export interface MilestoneConfig {
  threshold: number;
  label: string;
}

// Default milestones
export const DEFAULT_MILESTONES: MilestoneConfig[] = [
  { threshold: 100, label: "100 views" },
  { threshold: 500, label: "500 views" },
  { threshold: 1000, label: "1,000 views" },
  { threshold: 5000, label: "5,000 views" },
  { threshold: 10000, label: "10,000 views" },
];

interface UseViewMilestoneResult {
  /** The milestone that was just reached (if any) */
  reachedMilestone: MilestoneConfig | null;
  /** Call this to acknowledge the milestone and hide it */
  acknowledgeMilestone: () => void;
  /** Check if a specific milestone has been reached */
  hasMilestoneBeenReached: (threshold: number) => boolean;
}

/**
 * Hook to track view milestones for a gallery
 *
 * Stores celebrated milestones in localStorage to avoid showing
 * the same celebration multiple times.
 *
 * @param galleryId - The ID of the gallery
 * @param viewCount - Current view count
 * @param milestones - Custom milestone thresholds (optional)
 */
export function useViewMilestone(
  galleryId: string,
  viewCount: number,
  milestones: MilestoneConfig[] = DEFAULT_MILESTONES
): UseViewMilestoneResult {
  const [reachedMilestone, setReachedMilestone] = useState<MilestoneConfig | null>(null);

  // Get storage key for this gallery
  const storageKey = `gallery_milestones_${galleryId}`;

  // Get celebrated milestones from localStorage
  const getCelebratedMilestones = useCallback((): number[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  // Save celebrated milestone to localStorage
  const saveCelebratedMilestone = useCallback(
    (threshold: number) => {
      if (typeof window === "undefined") return;
      try {
        const current = getCelebratedMilestones();
        if (!current.includes(threshold)) {
          localStorage.setItem(storageKey, JSON.stringify([...current, threshold]));
        }
      } catch {
        // Ignore localStorage errors
      }
    },
    [storageKey, getCelebratedMilestones]
  );

  // Check for new milestones when view count changes
  useEffect(() => {
    if (!galleryId || viewCount <= 0) return;

    const celebrated = getCelebratedMilestones();

    // Find the highest milestone that has been reached but not celebrated
    const newMilestone = milestones
      .filter((m) => viewCount >= m.threshold && !celebrated.includes(m.threshold))
      .sort((a, b) => b.threshold - a.threshold)[0]; // Get highest uncelebrated

    if (newMilestone) {
      setReachedMilestone(newMilestone);
    }
  }, [galleryId, viewCount, milestones, getCelebratedMilestones]);

  // Acknowledge and save milestone
  const acknowledgeMilestone = useCallback(() => {
    if (reachedMilestone) {
      saveCelebratedMilestone(reachedMilestone.threshold);
      setReachedMilestone(null);
    }
  }, [reachedMilestone, saveCelebratedMilestone]);

  // Check if a specific milestone has been reached
  const hasMilestoneBeenReached = useCallback(
    (threshold: number) => {
      return getCelebratedMilestones().includes(threshold);
    },
    [getCelebratedMilestones]
  );

  return {
    reachedMilestone,
    acknowledgeMilestone,
    hasMilestoneBeenReached,
  };
}

/**
 * Get milestone celebration config based on the milestone
 */
export function getMilestoneCelebration(milestone: MilestoneConfig) {
  // Higher milestones get bigger celebrations
  if (milestone.threshold >= 10000) {
    return {
      particleCount: 100,
      duration: 4000,
      colors: ["#FFD700", "#FFA500", "#FF4500", "#8B5CF6"], // Gold celebration
    };
  }
  if (milestone.threshold >= 1000) {
    return {
      particleCount: 60,
      duration: 3500,
      colors: ["#22C55E", "#3B82F6", "#8B5CF6", "#EC4899"], // Standard celebration
    };
  }
  // 100-999 views
  return {
    particleCount: 30,
    duration: 2500,
    colors: ["#22C55E", "#3B82F6", "#8B5CF6"], // Smaller celebration
  };
}

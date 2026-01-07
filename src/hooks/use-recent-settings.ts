"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentSettingsItem {
  href: string;
  label: string;
  iconName: string;
  visitedAt: number;
}

const STORAGE_KEY = "recent-settings";
const MAX_RECENT_ITEMS = 6;

function getStoredItems(): RecentSettingsItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const items = JSON.parse(stored) as RecentSettingsItem[];
    // Filter out items older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return items.filter((item) => item.visitedAt > thirtyDaysAgo);
  } catch {
    return [];
  }
}

function saveItems(items: RecentSettingsItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

export function useRecentSettings() {
  const [recentItems, setRecentItems] = useState<RecentSettingsItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setRecentItems(getStoredItems());
    setIsLoaded(true);
  }, []);

  // Track a visit to a settings page
  const trackVisit = useCallback(
    (item: Omit<RecentSettingsItem, "visitedAt">) => {
      setRecentItems((current) => {
        // Remove existing entry if present
        const filtered = current.filter((i) => i.href !== item.href);

        // Add new entry at the beginning
        const updated = [
          { ...item, visitedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_RECENT_ITEMS);

        // Persist to localStorage
        saveItems(updated);

        return updated;
      });
    },
    []
  );

  // Clear all recent items
  const clearRecent = useCallback(() => {
    setRecentItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    recentItems,
    trackVisit,
    clearRecent,
    isLoaded,
  };
}

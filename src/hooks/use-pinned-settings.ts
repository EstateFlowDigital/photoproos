"use client";

import { useState, useEffect, useCallback } from "react";

export interface PinnedSettingsItem {
  href: string;
  label: string;
  iconName: string;
  pinnedAt: number;
}

const STORAGE_KEY = "pinned-settings";
const MAX_PINNED_ITEMS = 8;

function getStoredItems(): PinnedSettingsItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as PinnedSettingsItem[];
  } catch {
    return [];
  }
}

function saveItems(items: PinnedSettingsItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

export function usePinnedSettings() {
  const [pinnedItems, setPinnedItems] = useState<PinnedSettingsItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setPinnedItems(getStoredItems());
    setIsLoaded(true);
  }, []);

  // Check if a settings page is pinned
  const isPinned = useCallback(
    (href: string) => pinnedItems.some((item) => item.href === href),
    [pinnedItems]
  );

  // Pin a settings page
  const pin = useCallback((item: Omit<PinnedSettingsItem, "pinnedAt">) => {
    setPinnedItems((current) => {
      // Don't add if already pinned
      if (current.some((i) => i.href === item.href)) {
        return current;
      }

      // Limit to max items
      if (current.length >= MAX_PINNED_ITEMS) {
        return current;
      }

      const updated = [...current, { ...item, pinnedAt: Date.now() }];
      saveItems(updated);
      return updated;
    });
  }, []);

  // Unpin a settings page
  const unpin = useCallback((href: string) => {
    setPinnedItems((current) => {
      const updated = current.filter((item) => item.href !== href);
      saveItems(updated);
      return updated;
    });
  }, []);

  // Toggle pin state
  const togglePin = useCallback(
    (item: Omit<PinnedSettingsItem, "pinnedAt">) => {
      if (isPinned(item.href)) {
        unpin(item.href);
      } else {
        pin(item);
      }
    },
    [isPinned, pin, unpin]
  );

  // Clear all pinned items
  const clearPinned = useCallback(() => {
    setPinnedItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Reorder pinned items
  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setPinnedItems((current) => {
      const updated = [...current];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      saveItems(updated);
      return updated;
    });
  }, []);

  return {
    pinnedItems,
    isPinned,
    pin,
    unpin,
    togglePin,
    clearPinned,
    reorder,
    isLoaded,
    maxItems: MAX_PINNED_ITEMS,
    canPin: pinnedItems.length < MAX_PINNED_ITEMS,
  };
}

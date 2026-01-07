"use client";

import * as React from "react";
import type {
  WalkthroughState,
  WalkthroughPageId,
  WalkthroughPreference,
} from "@/lib/walkthrough-types";
import { DEFAULT_WALKTHROUGH_STATE } from "@/lib/walkthrough-types";

interface UseWalkthroughOptions {
  /** The page ID for this walkthrough */
  pageId: WalkthroughPageId;
  /** Initial preferences from the server */
  initialPreference?: WalkthroughPreference | null;
  /** Callback to save state changes to the server */
  onStateChange?: (pageId: WalkthroughPageId, newState: WalkthroughState) => Promise<void>;
}

interface UseWalkthroughReturn {
  /** Current walkthrough state */
  state: WalkthroughState;
  /** Whether the walkthrough should be visible */
  isVisible: boolean;
  /** Change the walkthrough state */
  setState: (newState: WalkthroughState) => void;
  /** Whether a state change is being saved */
  isSaving: boolean;
  /** Any error that occurred during state save */
  error: Error | null;
}

/**
 * useWalkthrough Hook
 *
 * Manages the walkthrough state for a specific page.
 * Handles local state, optimistic updates, and server synchronization.
 *
 * @example
 * const { state, setState, isVisible } = useWalkthrough({
 *   pageId: "dashboard",
 *   initialPreference: serverPreference,
 *   onStateChange: updateWalkthroughPreference,
 * });
 */
export function useWalkthrough({
  pageId,
  initialPreference,
  onStateChange,
}: UseWalkthroughOptions): UseWalkthroughReturn {
  // Initialize state from server preference or default
  const [state, setStateInternal] = React.useState<WalkthroughState>(
    initialPreference?.state ?? DEFAULT_WALKTHROUGH_STATE
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Update state when initialPreference changes (server refresh)
  React.useEffect(() => {
    if (initialPreference?.state) {
      setStateInternal(initialPreference.state);
    }
  }, [initialPreference?.state]);

  // Computed visibility
  const isVisible = state !== "hidden" && state !== "dismissed";

  // Handle state change with optimistic update
  const setState = React.useCallback(
    async (newState: WalkthroughState) => {
      const previousState = state;

      // Optimistic update
      setStateInternal(newState);
      setError(null);

      // Persist to server if callback provided
      if (onStateChange) {
        setIsSaving(true);
        try {
          await onStateChange(pageId, newState);
        } catch (err) {
          // Revert on error
          setStateInternal(previousState);
          setError(err instanceof Error ? err : new Error("Failed to save"));
          console.error("Failed to save walkthrough state:", err);
        } finally {
          setIsSaving(false);
        }
      }
    },
    [state, pageId, onStateChange]
  );

  return {
    state,
    isVisible,
    setState,
    isSaving,
    error,
  };
}

/**
 * useWalkthroughPreferences Hook
 *
 * Manages multiple walkthrough preferences at once.
 * Useful for the settings page.
 *
 * @example
 * const { preferences, updatePreference, resetAll } = useWalkthroughPreferences({
 *   initialPreferences: serverPreferences,
 *   onUpdate: savePreference,
 *   onResetAll: resetAllPreferences,
 * });
 */
interface UseWalkthroughPreferencesOptions {
  /** Initial preferences from the server */
  initialPreferences: WalkthroughPreference[];
  /** Callback to update a single preference */
  onUpdate?: (pageId: WalkthroughPageId, newState: WalkthroughState) => Promise<void>;
  /** Callback to reset all preferences */
  onResetAll?: () => Promise<void>;
}

interface UseWalkthroughPreferencesReturn {
  /** Map of page ID to walkthrough state */
  preferences: Map<WalkthroughPageId, WalkthroughState>;
  /** Update a single preference */
  updatePreference: (pageId: WalkthroughPageId, newState: WalkthroughState) => Promise<void>;
  /** Reset all hidden preferences to open */
  resetAll: () => Promise<void>;
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
}

export function useWalkthroughPreferences({
  initialPreferences,
  onUpdate,
  onResetAll,
}: UseWalkthroughPreferencesOptions): UseWalkthroughPreferencesReturn {
  const [preferences, setPreferences] = React.useState<Map<WalkthroughPageId, WalkthroughState>>(
    () => {
      const map = new Map<WalkthroughPageId, WalkthroughState>();
      initialPreferences.forEach((pref) => {
        map.set(pref.pageId, pref.state);
      });
      return map;
    }
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Update preferences when initialPreferences changes
  React.useEffect(() => {
    const map = new Map<WalkthroughPageId, WalkthroughState>();
    initialPreferences.forEach((pref) => {
      map.set(pref.pageId, pref.state);
    });
    setPreferences(map);
  }, [initialPreferences]);

  const updatePreference = React.useCallback(
    async (pageId: WalkthroughPageId, newState: WalkthroughState) => {
      const previousState = preferences.get(pageId);

      // Optimistic update
      setPreferences((prev) => {
        const next = new Map(prev);
        next.set(pageId, newState);
        return next;
      });
      setError(null);

      if (onUpdate) {
        setIsLoading(true);
        try {
          await onUpdate(pageId, newState);
        } catch (err) {
          // Revert on error
          if (previousState !== undefined) {
            setPreferences((prev) => {
              const next = new Map(prev);
              next.set(pageId, previousState);
              return next;
            });
          }
          setError(err instanceof Error ? err : new Error("Failed to update"));
        } finally {
          setIsLoading(false);
        }
      }
    },
    [preferences, onUpdate]
  );

  const resetAll = React.useCallback(async () => {
    // Only reset hidden preferences, not dismissed ones
    const resetMap = new Map(preferences);
    preferences.forEach((state, pageId) => {
      if (state === "hidden") {
        resetMap.set(pageId, "open");
      }
    });

    const previousPreferences = new Map(preferences);

    // Optimistic update
    setPreferences(resetMap);
    setError(null);

    if (onResetAll) {
      setIsLoading(true);
      try {
        await onResetAll();
      } catch (err) {
        // Revert on error
        setPreferences(previousPreferences);
        setError(err instanceof Error ? err : new Error("Failed to reset"));
      } finally {
        setIsLoading(false);
      }
    }
  }, [preferences, onResetAll]);

  return {
    preferences,
    updatePreference,
    resetAll,
    isLoading,
    error,
  };
}

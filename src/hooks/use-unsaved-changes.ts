"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UseUnsavedChangesOptions {
  /** Message to show in the confirmation dialog */
  message?: string;
  /** Callback when user confirms leaving */
  onConfirm?: () => void;
  /** Callback when user cancels leaving */
  onCancel?: () => void;
  /** Whether the warning is currently enabled */
  enabled?: boolean;
}

interface UseUnsavedChangesReturn {
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Set whether there are unsaved changes */
  setHasUnsavedChanges: (value: boolean) => void;
  /** Mark form as dirty (has changes) */
  markDirty: () => void;
  /** Mark form as clean (no changes) */
  markClean: () => void;
  /** Whether the confirmation dialog is open */
  isDialogOpen: boolean;
  /** The URL the user is trying to navigate to */
  pendingUrl: string | null;
  /** Confirm navigation (proceed to pending URL) */
  confirmNavigation: () => void;
  /** Cancel navigation (stay on current page) */
  cancelNavigation: () => void;
  /** Reset the state */
  reset: () => void;
}

const DEFAULT_MESSAGE =
  "You have unsaved changes. Are you sure you want to leave?";

export function useUnsavedChanges(
  options: UseUnsavedChangesOptions = {}
): UseUnsavedChangesReturn {
  const {
    message = DEFAULT_MESSAGE,
    onConfirm,
    onCancel,
    enabled = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const initialPathname = useRef(pathname);

  // Handle browser beforeunload event (refresh, close tab)
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers require returnValue to be set
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, message, enabled]);

  // Mark form as dirty
  const markDirty = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Mark form as clean
  const markClean = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Confirm navigation
  const confirmNavigation = useCallback(() => {
    setIsDialogOpen(false);
    setHasUnsavedChanges(false);

    if (pendingUrl) {
      onConfirm?.();
      router.push(pendingUrl);
      setPendingUrl(null);
    }
  }, [pendingUrl, router, onConfirm]);

  // Cancel navigation
  const cancelNavigation = useCallback(() => {
    setIsDialogOpen(false);
    setPendingUrl(null);
    onCancel?.();
  }, [onCancel]);

  // Reset all state
  const reset = useCallback(() => {
    setHasUnsavedChanges(false);
    setIsDialogOpen(false);
    setPendingUrl(null);
  }, []);

  // Intercept navigation (for client-side routing)
  // This is a custom hook, components should call checkNavigation before navigating
  const checkNavigation = useCallback(
    (url: string): boolean => {
      if (!enabled || !hasUnsavedChanges) {
        return true; // Allow navigation
      }

      // Show confirmation dialog
      setPendingUrl(url);
      setIsDialogOpen(true);
      return false; // Block navigation
    },
    [enabled, hasUnsavedChanges]
  );

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    markDirty,
    markClean,
    isDialogOpen,
    pendingUrl,
    confirmNavigation,
    cancelNavigation,
    reset,
  };
}

// ============================================================================
// Form Change Tracking Hook
// ============================================================================

interface UseFormChangesOptions<T> {
  initialValues: T;
  currentValues: T;
  /** Custom comparison function */
  compare?: (a: T, b: T) => boolean;
}

/**
 * Tracks whether form values have changed from their initial state
 */
export function useFormChanges<T>({
  initialValues,
  currentValues,
  compare,
}: UseFormChangesOptions<T>): boolean {
  const defaultCompare = (a: T, b: T) => JSON.stringify(a) !== JSON.stringify(b);
  const compareFn = compare || defaultCompare;

  return compareFn(initialValues, currentValues);
}

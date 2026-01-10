"use client";

import * as React from "react";
import { PageWalkthrough } from "./page-walkthrough";
import { updateWalkthroughState } from "@/lib/actions/walkthrough";
import { getWalkthroughConfig } from "@/lib/walkthrough-configs";
import type { WalkthroughPageId, WalkthroughState } from "@/lib/walkthrough-types";

interface WalkthroughWrapperProps {
  /** The page ID for this walkthrough */
  pageId: WalkthroughPageId;
  /** Initial state from server (or "open" for new users) */
  initialState: WalkthroughState;
  /** Additional className */
  className?: string;
}

/**
 * WalkthroughWrapper Component
 *
 * A client-side wrapper that handles state management and server syncing
 * for the PageWalkthrough component.
 *
 * @example
 * <WalkthroughWrapper
 *   pageId="dashboard"
 *   initialState={userPreference?.state ?? "open"}
 * />
 */
export function WalkthroughWrapper({
  pageId,
  initialState,
  className,
}: WalkthroughWrapperProps) {
  const [state, setState] = React.useState<WalkthroughState>(initialState);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Get the walkthrough config for this page
  const config = getWalkthroughConfig(pageId);

  // Use a ref to track the previous state for rollback without adding to useCallback dependencies
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle state changes with optimistic updates
  // NOTE: Wrapped in useCallback to prevent PageWalkthrough's useEffect from re-running on every render
  const handleStateChange = React.useCallback(async (newState: WalkthroughState) => {
    // Optimistically update the state
    const previousState = stateRef.current;
    setState(newState);
    setIsUpdating(true);

    try {
      // Sync with server
      const result = await updateWalkthroughState(pageId, newState);

      if (!result.success) {
        // Revert on failure
        console.error("Failed to update walkthrough state:", result.error);
        setState(previousState);
      }
    } catch (error) {
      // Revert on error
      console.error("Error updating walkthrough state:", error);
      setState(previousState);
    } finally {
      setIsUpdating(false);
    }
  }, [pageId]);

  // If no config exists for this page, don't render
  if (!config) {
    return null;
  }

  return (
    <PageWalkthrough
      pageId={pageId}
      config={config}
      state={state}
      onStateChange={handleStateChange}
      className={className}
    />
  );
}

/**
 * Server-side helper to get walkthrough props
 * Use this in your page components to fetch the initial state
 */
export interface WalkthroughProps {
  pageId: WalkthroughPageId;
  initialState: WalkthroughState;
}

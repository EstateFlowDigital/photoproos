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

  // If no config exists for this page, don't render
  if (!config) {
    return null;
  }

  // Handle state changes with optimistic updates
  const handleStateChange = async (newState: WalkthroughState) => {
    // Optimistically update the state
    const previousState = state;
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
  };

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

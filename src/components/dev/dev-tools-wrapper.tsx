"use client";

import { ErrorBoundary } from "@/components/debug/error-boundary";
import { BugProbe } from "./bug-probe";
import { DebugBanner } from "@/components/debug/debug-banner";

/**
 * DevToolsWrapper
 *
 * Wraps developer tools (BugProbe, DebugBanner) in error boundaries
 * to prevent crashes in dev tools from breaking the entire app.
 */
export function DevToolsWrapper() {
  return (
    <>
      <ErrorBoundary label="BugProbe">
        <BugProbe />
      </ErrorBoundary>
      <ErrorBoundary label="DebugBanner">
        <DebugBanner />
      </ErrorBoundary>
    </>
  );
}

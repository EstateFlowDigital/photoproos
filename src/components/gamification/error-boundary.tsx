"use client";

import React, { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface GamificationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for gamification components.
 * Catches errors in child components and displays a graceful fallback UI
 * without crashing the entire application.
 */
export class GamificationErrorBoundary extends Component<
  GamificationErrorBoundaryProps,
  GamificationErrorBoundaryState
> {
  constructor(props: GamificationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GamificationErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging
    console.error("[Gamification] Component error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <GamificationErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

interface GamificationErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Default fallback UI for gamification errors
 */
export function GamificationErrorFallback({
  error,
  onRetry,
  className,
}: GamificationErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        "gamification-error-fallback rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--error)]/15">
          <AlertCircle className="h-4 w-4 text-[var(--error)]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--foreground)]">
            Gamification temporarily unavailable
          </h4>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            {error?.message || "Something went wrong loading this component."}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--background-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact error fallback for widgets
 */
export function GamificationErrorCompact({ className }: { className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "gamification-error-compact flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
      <span className="text-sm text-[var(--foreground-muted)]">
        Unable to load
      </span>
    </div>
  );
}

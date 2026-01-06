"use client";

import { useEffect } from "react";
import { WarningIcon } from "@/components/ui/icons";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  logPrefix?: string;
  showDigest?: boolean;
}

/**
 * Reusable error state component for dashboard error boundaries
 *
 * @example
 * // Basic usage in error.tsx
 * export default function MyPageError({ error, reset }) {
 *   return <ErrorState error={error} reset={reset} title="Failed to load data" />;
 * }
 *
 * @example
 * // With custom icon
 * import { PhotoIcon } from "@/components/ui/icons";
 * export default function GalleriesError({ error, reset }) {
 *   return (
 *     <ErrorState
 *       error={error}
 *       reset={reset}
 *       title="Failed to load galleries"
 *       icon={PhotoIcon}
 *       logPrefix="Galleries"
 *     />
 *   );
 * }
 */
export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again or contact support if the problem persists.",
  icon: Icon = WarningIcon,
  logPrefix = "Error",
  showDigest = true,
}: ErrorStateProps) {
  useEffect(() => {
    console.error(`${logPrefix} error:`, error);
  }, [error, logPrefix]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error)]/10">
          <Icon className="h-8 w-8 text-[var(--error)]" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
        <p className="mb-6 text-sm text-foreground-muted">{description}</p>
        {showDigest && error.digest && (
          <p className="mb-4 text-xs text-foreground-muted">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

// Pre-configured error states for common pages
export function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      logPrefix="Dashboard"
      showDigest={true}
    />
  );
}

export function GalleriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load galleries"
      description="We couldn't load your gallery data. This might be a temporary issue."
      logPrefix="Galleries"
    />
  );
}

export function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load clients"
      description="We couldn't load your client data. This might be a temporary issue."
      logPrefix="Clients"
    />
  );
}

export function PaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load payments"
      description="We couldn't load your payment data. This might be a temporary issue."
      logPrefix="Payments"
    />
  );
}

export function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load services"
      description="We couldn't load your service data. This might be a temporary issue."
      logPrefix="Services"
    />
  );
}

export function BookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load bookings"
      description="We couldn't load your booking data. This might be a temporary issue."
      logPrefix="Bookings"
    />
  );
}

export function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load settings"
      description="We couldn't load your settings. This might be a temporary issue."
      logPrefix="Settings"
    />
  );
}

export function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load invoices"
      description="We couldn't load your invoice data. This might be a temporary issue."
      logPrefix="Invoices"
    />
  );
}

export function SchedulingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load scheduling"
      description="We couldn't load your scheduling data. This might be a temporary issue."
      logPrefix="Scheduling"
    />
  );
}

export function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load analytics"
      description="We couldn't load your analytics data. This might be a temporary issue."
      logPrefix="Analytics"
    />
  );
}

export function ContractsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Failed to load contracts"
      description="We couldn't load your contract data. This might be a temporary issue."
      logPrefix="Contracts"
    />
  );
}

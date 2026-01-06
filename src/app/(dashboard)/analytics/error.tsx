"use client";

import { AnalyticsError as ErrorComponent } from "@/components/dashboard/error-state";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

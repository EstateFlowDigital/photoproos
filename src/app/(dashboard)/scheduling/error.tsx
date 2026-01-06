"use client";

import { SchedulingError as ErrorComponent } from "@/components/dashboard/error-state";

export default function SchedulingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

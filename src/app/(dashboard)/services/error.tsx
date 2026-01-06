"use client";

import { ServicesError as ErrorComponent } from "@/components/dashboard/error-state";

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

"use client";

import { ContractsError as ErrorComponent } from "@/components/dashboard/error-state";

export default function ContractsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

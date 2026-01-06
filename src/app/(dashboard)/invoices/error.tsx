"use client";

import { InvoicesError as ErrorComponent } from "@/components/dashboard/error-state";

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

"use client";

import { ClientsError as ErrorComponent } from "@/components/dashboard/error-state";

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

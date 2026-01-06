"use client";

import { PaymentsError as ErrorComponent } from "@/components/dashboard/error-state";

export default function PaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

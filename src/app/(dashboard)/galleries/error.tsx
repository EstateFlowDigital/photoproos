"use client";

import { GalleriesError as ErrorComponent } from "@/components/dashboard/error-state";

export default function GalleriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}

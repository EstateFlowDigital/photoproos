"use client";

import { useEffect } from "react";

export default function UnsubscribeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unsubscribe page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10">
          <AlertIcon className="h-8 w-8 text-[var(--error)]" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Unable to process request
        </h2>
        <p className="mb-6 text-sm text-foreground-muted">
          We&apos;re having trouble processing your unsubscribe request. Please try again in a moment.
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-foreground-muted">
            Reference: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

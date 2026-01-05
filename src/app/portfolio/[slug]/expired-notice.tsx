"use client";

interface ExpiredNoticeProps {
  websiteName: string;
}

export function ExpiredNotice({ websiteName }: ExpiredNoticeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md text-center">
        {/* Clock Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--background-elevated)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-[var(--warning)]"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl font-semibold text-white">
          Portfolio Expired
        </h1>
        <p className="mt-3 text-[var(--foreground-secondary)]">
          The portfolio{" "}
          <span className="font-medium text-white">{websiteName}</span> is no
          longer available.
        </p>

        {/* Info Box */}
        <div className="mt-8 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--foreground-muted)]">
            This portfolio has passed its expiration date set by the
            photographer. If you need access, please contact them directly.
          </p>
        </div>

        {/* Branding */}
        <p className="mt-8 text-xs text-[var(--border-visible)]">
          Powered by PhotoProOS
        </p>
      </div>
    </div>
  );
}

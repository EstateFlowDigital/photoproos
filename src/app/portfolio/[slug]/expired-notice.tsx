"use client";

interface ExpiredNoticeProps {
  websiteName: string;
}

export function ExpiredNotice({ websiteName }: ExpiredNoticeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md text-center">
        {/* Clock Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1E1E1E]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-[#f97316]"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl font-semibold text-white">
          Portfolio Expired
        </h1>
        <p className="mt-3 text-[#A7A7A7]">
          The portfolio{" "}
          <span className="font-medium text-white">{websiteName}</span> is no
          longer available.
        </p>

        {/* Info Box */}
        <div className="mt-8 rounded-xl border border-[#262626] bg-[#141414] p-6">
          <p className="text-sm text-[#7C7C7C]">
            This portfolio has passed its expiration date set by the
            photographer. If you need access, please contact them directly.
          </p>
        </div>

        {/* Branding */}
        <p className="mt-8 text-xs text-[#454545]">
          Powered by ListingLens
        </p>
      </div>
    </div>
  );
}

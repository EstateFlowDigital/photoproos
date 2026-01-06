"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  illustration?: "photos" | "property" | "invoice" | "questionnaire" | "download";
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({ icon, title, description, illustration, action }: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-[var(--card-border)] bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--background-tertiary)] p-8 text-center sm:p-12">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <BackgroundPattern />
      </div>

      {/* Floating Elements for visual interest */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-gradient-to-tr from-[var(--ai)]/10 to-transparent blur-3xl" />

      <div className="relative z-10">
        {/* Illustration or Icon */}
        {illustration ? (
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--background-tertiary)] to-[var(--card)] shadow-lg ring-1 ring-[var(--card-border)]">
            <IllustrationIcon type={illustration} />
          </div>
        ) : (
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--background-tertiary)] ring-1 ring-[var(--card-border)]">
            <div className="text-[var(--foreground-muted)]">{icon}</div>
          </div>
        )}

        {/* Text Content */}
        <h3 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">{title}</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--foreground-muted)] sm:text-base">
          {description}
        </p>

        {/* Action Button */}
        {action && (
          <div className="mt-6">
            {action.href ? (
              <a
                href={action.href}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--primary)]/90 hover:shadow-lg hover:shadow-[var(--primary)]/20"
              >
                {action.label}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--primary)]/90 hover:shadow-lg hover:shadow-[var(--primary)]/20"
              >
                {action.label}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Help Text */}
        <p className="mt-6 text-xs text-[var(--foreground-muted)]/60">
          Need help? Contact your photographer for assistance.
        </p>
      </div>
    </div>
  );
}

// Custom illustration icons with more detail
function IllustrationIcon({ type }: { type: "photos" | "property" | "invoice" | "questionnaire" | "download" }) {
  switch (type) {
    case "photos":
      return (
        <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
          {/* Stack of photos effect */}
          <rect x="8" y="12" width="28" height="22" rx="2" fill="var(--foreground-muted)" fillOpacity="0.1" stroke="var(--foreground-muted)" strokeOpacity="0.3" strokeWidth="1.5" />
          <rect x="12" y="8" width="28" height="22" rx="2" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" />
          {/* Mountain and sun */}
          <circle cx="20" cy="15" r="3" fill="var(--warning)" fillOpacity="0.6" />
          <path d="M14 26l6-8 4 5 6-7 8 10H14z" fill="var(--success)" fillOpacity="0.5" />
        </svg>
      );

    case "property":
      return (
        <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
          {/* House shape */}
          <path d="M24 6L6 20v22h36V20L24 6z" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Door */}
          <rect x="20" y="28" width="8" height="14" rx="1" fill="var(--primary)" fillOpacity="0.3" stroke="var(--primary)" strokeWidth="1.5" />
          {/* Windows */}
          <rect x="11" y="24" width="6" height="6" rx="1" fill="var(--foreground-muted)" fillOpacity="0.2" stroke="var(--foreground-muted)" strokeOpacity="0.5" strokeWidth="1" />
          <rect x="31" y="24" width="6" height="6" rx="1" fill="var(--foreground-muted)" fillOpacity="0.2" stroke="var(--foreground-muted)" strokeOpacity="0.5" strokeWidth="1" />
          {/* Roof detail */}
          <path d="M24 6L6 20h36L24 6z" fill="var(--primary)" fillOpacity="0.15" />
        </svg>
      );

    case "invoice":
      return (
        <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
          {/* Paper */}
          <path d="M12 6h18l8 8v28a2 2 0 01-2 2H12a2 2 0 01-2-2V8a2 2 0 012-2z" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" />
          {/* Folded corner */}
          <path d="M30 6v8h8" fill="var(--background-tertiary)" stroke="var(--primary)" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Lines */}
          <path d="M16 20h16M16 26h12M16 32h8" stroke="var(--foreground-muted)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
          {/* Dollar sign */}
          <circle cx="32" cy="32" r="8" fill="var(--success)" fillOpacity="0.2" stroke="var(--success)" strokeWidth="1.5" />
          <path d="M32 28v8M30 30h4M30 34h4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "questionnaire":
      return (
        <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
          {/* Clipboard */}
          <rect x="10" y="8" width="28" height="34" rx="2" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" />
          {/* Clip */}
          <rect x="18" y="4" width="12" height="8" rx="2" fill="var(--background-tertiary)" stroke="var(--primary)" strokeWidth="1.5" />
          {/* Checkboxes */}
          <rect x="15" y="18" width="5" height="5" rx="1" fill="var(--success)" fillOpacity="0.2" stroke="var(--success)" strokeWidth="1.5" />
          <path d="M16 20.5l1.5 1.5 2.5-2.5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="15" y="27" width="5" height="5" rx="1" fill="var(--warning)" fillOpacity="0.2" stroke="var(--warning)" strokeWidth="1.5" />
          <rect x="15" y="36" width="5" height="5" rx="1" fill="var(--foreground-muted)" fillOpacity="0.2" stroke="var(--foreground-muted)" strokeOpacity="0.5" strokeWidth="1.5" />
          {/* Lines */}
          <path d="M24 20h9M24 29h7M24 38h5" stroke="var(--foreground-muted)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "download":
      return (
        <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
          {/* Cloud */}
          <path d="M14 32a6 6 0 01-.5-12 8 8 0 0115.5-2 7 7 0 014.5 12.5" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Arrow */}
          <path d="M24 24v14M19 34l5 5 5-5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Progress indicator */}
          <rect x="14" y="42" width="20" height="3" rx="1.5" fill="var(--foreground-muted)" fillOpacity="0.2" />
          <rect x="14" y="42" width="10" height="3" rx="1.5" fill="var(--primary)" fillOpacity="0.6" />
        </svg>
      );
  }
}

// Background pattern for visual texture
function BackgroundPattern() {
  return (
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

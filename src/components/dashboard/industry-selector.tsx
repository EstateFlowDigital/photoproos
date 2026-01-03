"use client";

import { cn } from "@/lib/utils";
import type { Industry } from "@prisma/client";

const industryLabels: Record<Industry, string> = {
  real_estate: "Real Estate",
  commercial: "Commercial",
  events: "Events",
  portraits: "Portraits",
  food: "Food & Hospitality",
  product: "Product",
};

const industryDescriptions: Record<Industry, string> = {
  real_estate: "Property listings, interiors, architecture",
  commercial: "Business, corporate, marketing",
  events: "Weddings, conferences, parties",
  portraits: "Headshots, family, lifestyle",
  food: "Restaurants, menus, hospitality",
  product: "E-commerce, catalog, packaging",
};

interface IndustrySelectorProps {
  industries: Industry[];
  value: Industry | null;
  onChange: (industry: Industry | null) => void;
  allowNone?: boolean;
  noneLabel?: string;
}

export function IndustrySelector({
  industries,
  value,
  onChange,
  allowNone = false,
  noneLabel = "All Industries",
}: IndustrySelectorProps) {
  if (industries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {allowNone && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
            value === null
              ? "border-[var(--primary)] bg-[var(--primary)]/10"
              : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              value === null
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted"
            )}
          >
            <AllIndustriesIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="font-medium text-foreground">{noneLabel}</span>
            <p className="text-sm text-foreground-muted">Show form for all industries</p>
          </div>
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {industries.map((industry) => (
          <button
            key={industry}
            type="button"
            onClick={() => onChange(industry)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
              value === industry
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                value === industry
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-muted"
              )}
            >
              <IndustryIcon industry={industry} />
            </div>
            <div className="min-w-0">
              <span className="font-medium text-foreground block">
                {industryLabels[industry]}
              </span>
              <p className="text-xs text-foreground-muted truncate">
                {industryDescriptions[industry]}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact version for inline use
interface IndustrySelectorCompactProps {
  industries: Industry[];
  value: Industry | null;
  onChange: (industry: Industry | null) => void;
  allowNone?: boolean;
}

export function IndustrySelectorCompact({
  industries,
  value,
  onChange,
  allowNone = false,
}: IndustrySelectorCompactProps) {
  if (industries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allowNone && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            value === null
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          All
        </button>
      )}
      {industries.map((industry) => (
        <button
          key={industry}
          type="button"
          onClick={() => onChange(industry)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            value === industry
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          <IndustryIcon industry={industry} className="h-4 w-4" />
          {industryLabels[industry]}
        </button>
      ))}
    </div>
  );
}

// Industry icon component
function IndustryIcon({ industry, className }: { industry: Industry; className?: string }) {
  const iconClass = className || "h-5 w-5";

  switch (industry) {
    case "real_estate":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
        </svg>
      );
    case "commercial":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5H4Zm3-11a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM11 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm.5 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z" clipRule="evenodd" />
        </svg>
      );
    case "events":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
        </svg>
      );
    case "portraits":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
        </svg>
      );
    case "food":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path d="M4.5 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm0 2a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4 2a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm1 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm2-1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
          <path fillRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM3.5 10a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z" clipRule="evenodd" />
        </svg>
      );
    case "product":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018a.75.75 0 0 0-.095 1.264l7.21 5.27a.75.75 0 0 0 .724 0l7.21-5.27a.75.75 0 0 0-.095-1.264L10.362 1.093ZM2.928 7.846l6.71 4.905v5.31l-5.924-4.33a.75.75 0 0 1-.286-.58l-.5-5.305Zm7.21 10.215v-5.31l6.71-4.905-.5 5.305a.75.75 0 0 1-.286.58l-5.924 4.33Z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
        </svg>
      );
  }
}

function AllIndustriesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" />
    </svg>
  );
}

// Export utility functions
export { industryLabels, industryDescriptions };

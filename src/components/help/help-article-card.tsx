"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface HelpArticleCardProps {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  categoryLabel?: string;
  variant?: "default" | "compact";
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function HelpArticleCard({
  slug,
  categorySlug,
  title,
  description,
  categoryLabel,
  variant = "default",
  className,
}: HelpArticleCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/help/${categorySlug}/${slug}`}
        className={cn(
          "group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--background-hover)]",
          className
        )}
      >
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted transition-colors group-hover:text-[var(--primary)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground group-hover:text-[var(--primary)]">
            {title}
          </span>
          {categoryLabel && (
            <span className="ml-2 text-xs text-foreground-muted">
              {categoryLabel}
            </span>
          )}
        </div>
        <svg
          className="h-4 w-4 shrink-0 text-foreground-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href={`/help/${categorySlug}/${slug}`}
      className={cn(
        "group flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)] hover:shadow-md hover:shadow-black/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <h4 className="text-sm font-medium text-foreground group-hover:text-[var(--primary)]">
          {title}
        </h4>
        <svg
          className="h-4 w-4 shrink-0 text-foreground-muted transition-all group-hover:translate-x-0.5 group-hover:text-[var(--primary)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs text-foreground-muted">
        {description}
      </p>
      {categoryLabel && (
        <span className="mt-3 inline-flex rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
          {categoryLabel}
        </span>
      )}
    </Link>
  );
}

export default HelpArticleCard;

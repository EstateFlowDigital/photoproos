"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface HelpCategoryCardProps {
  slug: string;
  title: string;
  description: string;
  icon: string;
  articleCount?: number;
  className?: string;
}

// ============================================================================
// Icon Component
// ============================================================================

function CategoryIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  // Map icon names to SVG paths
  const iconPaths: Record<string, React.ReactNode> = {
    rocket: (
      <path
        fillRule="evenodd"
        d="M4.25 9.5a.75.75 0 00-.75.75v7c0 .414.336.75.75.75h3.5a.75.75 0 00.75-.75v-7a.75.75 0 00-.75-.75h-3.5zm8-4.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h3.5a.75.75 0 00.75-.75V5.75a.75.75 0 00-.75-.75h-3.5z"
        clipRule="evenodd"
      />
    ),
    image: (
      <path
        fillRule="evenodd"
        d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
        clipRule="evenodd"
      />
    ),
    users: (
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
    ),
    "credit-card": (
      <path
        fillRule="evenodd"
        d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z"
        clipRule="evenodd"
      />
    ),
    calendar: (
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
        clipRule="evenodd"
      />
    ),
    settings: (
      <path
        fillRule="evenodd"
        d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    ),
    plug: (
      <path d="M14 6a2 2 0 012 2v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1a1 1 0 00-1-1H8a1 1 0 00-1 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V8a2 2 0 012-2h8zM7 2.75C7 1.784 7.784 1 8.75 1h2.5c.966 0 1.75.784 1.75 1.75V4h-6V2.75zM8.75 17a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 00-.75-.75zm2.5 0a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 00-.75-.75z" />
    ),
    fileText: (
      <path
        fillRule="evenodd"
        d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
        clipRule="evenodd"
      />
    ),
  };

  return (
    <svg
      className={cn("h-6 w-6", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      {iconPaths[icon] || iconPaths.fileText}
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function HelpCategoryCard({
  slug,
  title,
  description,
  icon,
  articleCount,
  className,
}: HelpCategoryCardProps) {
  return (
    <Link
      href={`/help/${slug}`}
      className={cn(
        "group flex flex-col items-start rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5",
        className
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--foreground-muted)]/15 text-foreground-muted transition-colors group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
        <CategoryIcon icon={icon} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-foreground-muted">
        {description}
      </p>
      {articleCount !== undefined && (
        <span className="mt-3 text-xs font-medium text-foreground-muted">
          {articleCount} {articleCount === 1 ? "article" : "articles"}
        </span>
      )}
    </Link>
  );
}

export default HelpCategoryCard;

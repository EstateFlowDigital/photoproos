"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole } from "@/lib/utils/units";

// ============================================================================
// Types
// ============================================================================

interface Gallery {
  id: string;
  name: string;
  client: string;
  photoCount: number;
  status: "draft" | "pending" | "delivered" | "expired";
  thumbnailUrl?: string;
  revenue?: number;
  createdAt: Date;
}

interface RecentGalleriesWidgetProps {
  galleries?: Gallery[];
  maxItems?: number;
  showThumbnails?: boolean;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const STATUS_STYLES: Record<Gallery["status"], { bg: string; text: string; label: string }> = {
  draft: {
    bg: "bg-[var(--background-secondary)]",
    text: "text-foreground-muted",
    label: "Draft",
  },
  pending: {
    bg: "bg-[var(--warning)]/10",
    text: "text-[var(--warning)]",
    label: "Pending",
  },
  delivered: {
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    label: "Delivered",
  },
  expired: {
    bg: "bg-[var(--error)]/10",
    text: "text-[var(--error)]",
    label: "Expired",
  },
};

// ============================================================================
// Component
// ============================================================================

export function RecentGalleriesWidget({
  galleries = [],
  maxItems = 4,
  showThumbnails = true,
  className,
}: RecentGalleriesWidgetProps) {
  const displayGalleries = galleries.slice(0, maxItems);

  if (displayGalleries.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)]">
          <svg
            className="h-5 w-5 text-foreground-muted"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">No galleries yet</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Create your first gallery to get started
        </p>
        <Link
          href="/galleries/new"
          className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          Create gallery
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3", showThumbnails ? "grid-cols-2" : "grid-cols-1", className)}>
      {displayGalleries.map((gallery) => (
        <Link
          key={gallery.id}
          href={`/galleries/${gallery.id}`}
          className={cn(
            "group overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] transition-all hover:border-[var(--primary)]/50",
            showThumbnails && "flex flex-col"
          )}
        >
          {/* Thumbnail */}
          {showThumbnails && (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--background-secondary)]">
              {gallery.thumbnailUrl ? (
                <Image
                  src={gallery.thumbnailUrl}
                  alt={gallery.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="h-8 w-8 text-foreground-muted"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </div>
              )}
              {/* Photo count badge */}
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                <svg
                  className="h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                {gallery.photoCount}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-1 flex-col p-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{gallery.name}</p>
                <p className="mt-0.5 truncate text-xs text-foreground-muted">
                  {gallery.client}
                </p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLES[gallery.status].bg,
                  STATUS_STYLES[gallery.status].text
                )}
              >
                {STATUS_STYLES[gallery.status].label}
              </span>
            </div>

            {!showThumbnails && (
              <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {gallery.photoCount} photos
                </span>
                {gallery.revenue !== undefined && gallery.revenue > 0 && (
                  <span className="font-medium text-foreground">
                    {formatCurrencyWhole(gallery.revenue)}
                  </span>
                )}
              </div>
            )}

            {showThumbnails && gallery.revenue !== undefined && gallery.revenue > 0 && (
              <p className="mt-auto pt-2 text-sm font-semibold text-foreground">
                {formatCurrencyWhole(gallery.revenue)}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default RecentGalleriesWidget;

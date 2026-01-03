"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import Link from "next/link";

type GalleryStatus = "delivered" | "pending" | "draft" | "archived";

export type QuickAction = "duplicate" | "archive" | "delete" | "share";

interface GalleryCardProps {
  id: string;
  title: string;
  client: string;
  photos: number;
  status: GalleryStatus;
  revenue?: string;
  thumbnailUrl?: string;
  onQuickAction?: (action: QuickAction, galleryId: string) => void;
}

export function GalleryCard({ id, title, client, photos, status, revenue, thumbnailUrl, onQuickAction }: GalleryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleAction = (action: QuickAction, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onQuickAction?.(action, id);
  };

  return (
    <div className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all duration-200 hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/10">
      {/* Quick Action Menu Button */}
      {onQuickAction && (
        <div ref={menuRef} className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              menuOpen
                ? "bg-[var(--background)] text-foreground"
                : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreIcon className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-xl">
              <button
                onClick={(e) => handleAction("share", e)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)]"
              >
                <ShareIcon className="h-4 w-4 text-foreground-muted" />
                Share Link
              </button>
              <button
                onClick={(e) => handleAction("duplicate", e)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)]"
              >
                <DuplicateIcon className="h-4 w-4 text-foreground-muted" />
                Duplicate
              </button>
              <button
                onClick={(e) => handleAction("archive", e)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)]"
              >
                <ArchiveIcon className="h-4 w-4 text-foreground-muted" />
                Archive
              </button>
              <hr className="my-1 border-[var(--card-border)]" />
              <button
                onClick={(e) => handleAction("delete", e)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--error)]/10"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <Link href={`/galleries/${id}`} className="block">
        {/* Thumbnail */}
        <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ai)]/20">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <GalleryPlaceholderIcon className="h-8 w-8 text-foreground-muted/50" />
            </div>
          )}
        </div>

        {/* Content */}
        <h4
          className="line-clamp-2 text-sm font-semibold text-foreground sm:line-clamp-1"
          title={title}
        >
          {title}
        </h4>
        <p
          className="mt-0.5 line-clamp-2 text-xs text-foreground-muted sm:line-clamp-1"
          title={client}
        >
          {client}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-foreground-muted">{photos} photos</span>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
            getStatusBadgeClasses(status)
          )}>
            {formatStatusLabel(status)}
          </span>
        </div>

        {/* Revenue */}
        {revenue && (
          <p className="mt-2 text-sm font-semibold text-[var(--success)]">{revenue}</p>
        )}
      </Link>
    </div>
  );
}

function GalleryPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
      <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

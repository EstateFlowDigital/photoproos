"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import Link from "next/link";
import {
  EyeIcon,
  MoreIcon,
  ShareIcon,
  DuplicateIcon,
  ArchiveIcon,
  TrashIcon,
  DownloadIcon,
  GalleryPlaceholderIcon,
} from "@/components/ui/icons";

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
  views?: number;
  downloads?: number;
  onQuickAction?: (action: QuickAction, galleryId: string) => void;
}

export function GalleryCard({ id, title, client, photos, status, revenue, thumbnailUrl, views, downloads, onQuickAction }: GalleryCardProps) {
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
        <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ai)]/20">
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
          {/* Performance Badges */}
          {(views !== undefined || downloads !== undefined) && (views || 0) + (downloads || 0) > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              {views !== undefined && views > 0 && (
                <div className="flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  <EyeIcon className="h-3 w-3" />
                  {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
                </div>
              )}
              {downloads !== undefined && downloads > 0 && (
                <div className="flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  <DownloadIcon className="h-3 w-3" />
                  {downloads >= 1000 ? `${(downloads / 1000).toFixed(1)}k` : downloads}
                </div>
              )}
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

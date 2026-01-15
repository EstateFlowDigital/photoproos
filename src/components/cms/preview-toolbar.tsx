"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Eye, X, Edit3, Monitor, Tablet, Smartphone } from "lucide-react";

interface PreviewToolbarProps {
  /** Whether preview mode is currently enabled */
  isPreview: boolean;
  /** Whether the page has unpublished draft changes */
  hasDraft?: boolean;
  /** The current page slug for linking to editor */
  pageSlug?: string;
}

type DevicePreview = "desktop" | "tablet" | "mobile";

/**
 * Preview toolbar that appears when draft mode is enabled
 * Shows preview status and provides quick actions
 */
export function PreviewToolbar({ isPreview, hasDraft, pageSlug }: PreviewToolbarProps) {
  const pathname = usePathname();
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("desktop");
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't render if not in preview mode
  if (!isPreview) return null;

  const exitPreviewUrl = `/api/preview/disable?redirect=${encodeURIComponent(pathname)}`;
  const editUrl = pageSlug ? `/super-admin/marketing/${pageSlug}` : "/super-admin/marketing";

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-4 right-4 z-[100]",
          "flex items-center gap-2 px-3 py-2 rounded-full",
          "bg-orange-500 text-white shadow-lg",
          "hover:bg-orange-600 transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500"
        )}
        aria-label="Expand preview toolbar"
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">Preview</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]",
        "flex items-center gap-3 px-4 py-2.5 rounded-full",
        "bg-[var(--card)] border border-[var(--border)] shadow-xl",
        "backdrop-blur-sm"
      )}
      role="toolbar"
      aria-label="Preview mode controls"
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
        </div>
        <span className="text-sm font-medium text-[var(--foreground)]">
          Preview Mode
        </span>
        {hasDraft && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium">
            Draft
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />

      {/* Device preview buttons */}
      <div className="flex items-center gap-1" role="group" aria-label="Device preview">
        <button
          onClick={() => setDevicePreview("desktop")}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
            devicePreview === "desktop"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
          )}
          aria-label="Desktop preview"
          aria-pressed={devicePreview === "desktop"}
        >
          <Monitor className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => setDevicePreview("tablet")}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
            devicePreview === "tablet"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
          )}
          aria-label="Tablet preview"
          aria-pressed={devicePreview === "tablet"}
        >
          <Tablet className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => setDevicePreview("mobile")}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
            devicePreview === "mobile"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
          )}
          aria-label="Mobile preview"
          aria-pressed={devicePreview === "mobile"}
        >
          <Smartphone className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Edit in CMS */}
        <Link
          href={editUrl}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
            "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--background-elevated)] transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          )}
        >
          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
          Edit
        </Link>

        {/* Exit preview */}
        <Link
          href={exitPreviewUrl}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          )}
        >
          Exit Preview
        </Link>
      </div>

      {/* Minimize button */}
      <button
        onClick={() => setIsMinimized(true)}
        className={cn(
          "p-1.5 rounded-lg transition-colors ml-1",
          "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
          "hover:bg-[var(--background-elevated)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        )}
        aria-label="Minimize preview toolbar"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Server component wrapper that checks preview mode
 */
export async function PreviewToolbarWrapper({ pageSlug: _pageSlug }: { pageSlug?: string }) {
  // This is meant to be used with the isPreviewMode check
  // For now, it's a placeholder that needs to be integrated with the page
  return null;
}

"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  slug: string;
  isVisible: boolean;
  onClose: () => void;
  refreshKey?: number;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

const VIEWPORT_SIZES: Record<ViewportSize, { width: number; label: string }> = {
  desktop: { width: 1280, label: "Desktop" },
  tablet: { width: 768, label: "Tablet" },
  mobile: { width: 375, label: "Mobile" },
};

export function PreviewPanel({
  slug,
  isVisible,
  onClose,
  refreshKey = 0,
}: PreviewPanelProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = `/portfolio/${slug}?preview=true`;

  // Refresh iframe when refreshKey changes
  useEffect(() => {
    if (iframeRef.current && refreshKey > 0) {
      setIsLoading(true);
      iframeRef.current.src = `${previewUrl}&t=${Date.now()}`;
    }
  }, [refreshKey, previewUrl]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = `${previewUrl}&t=${Date.now()}`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-[50vw] max-w-[800px] flex-col border-l border-[var(--card-border)] bg-[var(--background)]">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>

          {/* Viewport Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-0.5">
            {(Object.keys(VIEWPORT_SIZES) as ViewportSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  viewport === size
                    ? "bg-[var(--background-secondary)] text-foreground"
                    : "text-foreground-muted hover:text-foreground"
                )}
                title={VIEWPORT_SIZES[size].label}
              >
                {size === "desktop" && <DesktopIcon className="h-3.5 w-3.5" />}
                {size === "tablet" && <TabletIcon className="h-3.5 w-3.5" />}
                {size === "mobile" && <MobileIcon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{VIEWPORT_SIZES[size].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            title="Refresh preview"
          >
            <RefreshIcon className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>

          {/* Open in New Tab */}
          <a
            href={`/portfolio/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            title="Open in new tab"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            title="Close preview"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[var(--background-tertiary)] p-4">
        {/* Device Frame */}
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-lg border border-[var(--border-visible)] bg-white shadow-2xl transition-all duration-300",
            viewport === "desktop" && "w-full",
            viewport === "tablet" && "w-[768px] max-w-full",
            viewport === "mobile" && "w-[375px] max-w-full"
          )}
          style={{
            maxWidth: viewport === "desktop" ? "100%" : `${VIEWPORT_SIZES[viewport].width}px`,
          }}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                <span className="text-sm text-gray-500">Loading preview...</span>
              </div>
            </div>
          )}

          {/* Preview Iframe */}
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="h-full w-full border-0"
            title="Portfolio Preview"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Viewport Size Label */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
          {VIEWPORT_SIZES[viewport].width}px
        </div>
      </div>
    </div>
  );
}

// Icons
function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
  );
}

function MobileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

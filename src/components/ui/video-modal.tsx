"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-4xl mx-4 transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <span>Close</span>
          <kbd className="rounded bg-white/10 px-2 py-0.5 text-xs">ESC</kbd>
        </button>

        {/* Video container */}
        <div className="relative aspect-video overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
          {videoUrl ? (
            <iframe
              src={videoUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Placeholder when no video is available
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[var(--primary)]/20 via-[var(--background)] to-[var(--ai)]/20">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-lg">
                <PlayIcon className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">Demo Video Coming Soon</h3>
                <p className="mt-2 max-w-md text-foreground-muted">
                  We&apos;re creating an in-depth walkthrough of PhotoProOS.
                  Subscribe to be notified when it&apos;s ready!
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--primary)]/90 hover:scale-105"
              >
                Explore the App Instead
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
    </svg>
  );
}

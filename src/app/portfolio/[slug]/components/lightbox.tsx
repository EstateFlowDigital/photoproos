"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface LightboxImage {
  url: string;
  alt: string;
  projectName?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  allowDownloads?: boolean;
}

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  allowDownloads = false,
}: LightboxProps) {
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasMultiple) onPrevious();
          break;
        case "ArrowRight":
          if (hasMultiple) onNext();
          break;
      }
    },
    [onClose, onNext, onPrevious, hasMultiple]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.alt || "image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (!currentImage) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <CloseIcon className="h-5 w-5" />
      </button>

      {/* Image Counter */}
      {hasMultiple && (
        <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Download Button */}
      {allowDownloads && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="absolute right-16 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Download image"
        >
          <DownloadIcon className="h-5 w-5" />
        </button>
      )}

      {/* Navigation - Previous */}
      {hasMultiple && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}

      {/* Navigation - Next */}
      {hasMultiple && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Next image"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      )}

      {/* Main Image */}
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          draggable={false}
        />
      </div>

      {/* Caption */}
      {currentImage.projectName && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-white/10 px-4 py-2 text-center text-white backdrop-blur-sm">
          <p className="text-sm font-medium">{currentImage.projectName}</p>
        </div>
      )}
    </div>
  );

  // Use portal to render at document body level
  if (typeof window !== "undefined") {
    return createPortal(content, document.body);
  }

  return null;
}

// Icons
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

function ChevronLeftIcon({ className }: { className?: string }) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

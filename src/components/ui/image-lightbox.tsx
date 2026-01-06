"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  filename: string;
}

interface ImageLightboxProps {
  photos: Photo[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  isDownloading?: boolean;
  isDeleting?: boolean;
}

export function ImageLightbox({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  isDownloading = false,
  isDeleting = false,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentPhoto = photos[currentIndex];

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [photos.length]);

  // Reset index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--overlay-heavy)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[var(--overlay)] to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-sm text-[var(--foreground)]/70 truncate max-w-[200px]">
            {currentPhoto.filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={() => onDownload(currentPhoto)}
              disabled={isDownloading || isDeleting}
              className={cn(
                "rounded-lg bg-[var(--foreground)]/10 p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)]/20",
                (isDownloading || isDeleting) && "opacity-50 cursor-not-allowed"
              )}
              title={isDownloading ? "Downloading..." : "Download"}
              aria-label="Download photo"
            >
              {isDownloading ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-[var(--foreground)] border-t-transparent" />
              ) : (
                <DownloadIcon className="h-5 w-5" />
              )}
            </button>
          )}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="rounded-lg bg-[var(--foreground)]/10 p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)]/20"
            title={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? (
              <ZoomOutIcon className="h-5 w-5" />
            ) : (
              <ZoomInIcon className="h-5 w-5" />
            )}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(currentPhoto)}
              disabled={isDeleting || isDownloading}
              className={cn(
                "rounded-lg bg-[var(--error)]/20 p-2 text-[var(--error)] transition-colors hover:bg-[var(--error)]/30",
                (isDeleting || isDownloading) && "opacity-50 cursor-not-allowed"
              )}
              title={isDeleting ? "Deleting..." : "Delete"}
              aria-label="Delete photo"
            >
              {isDeleting ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-[var(--error)] border-t-transparent" />
              ) : (
                <TrashIcon className="h-5 w-5" />
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-[var(--foreground)]/10 p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)]/20"
            title="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-transform duration-200",
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={currentPhoto.mediumUrl || currentPhoto.url}
          alt={currentPhoto.filename}
          className={cn(
            "max-h-[80vh] max-w-[90vw] object-contain transition-transform duration-200",
            isZoomed && "scale-150"
          )}
        />
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[var(--overlay)] p-3 text-[var(--foreground)] transition-colors hover:bg-[var(--overlay-heavy)]"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[var(--overlay)] p-3 text-[var(--foreground)] transition-colors hover:bg-[var(--overlay-heavy)]"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-2 px-4 py-4 bg-gradient-to-t from-[var(--overlay)] to-transparent overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setIsZoomed(false);
              }}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                index === currentIndex
                  ? "border-[var(--foreground)] scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.filename}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Icon Components
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function ZoomInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" />
      <path d="M9 5.25a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5H9.75v2.25a.75.75 0 0 1-1.5 0v-2.25H6a.75.75 0 0 1 0-1.5h2.25V6a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

function ZoomOutIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" />
      <path d="M6 8.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H6Z" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

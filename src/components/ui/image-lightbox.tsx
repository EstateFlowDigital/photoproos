"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  filename: string;
  width?: number | null;
  height?: number | null;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
    dateTaken?: string;
  } | null;
}

interface ImageLightboxProps {
  photos: Photo[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  onFavorite?: (photo: Photo) => void;
  isDownloading?: boolean;
  isDeleting?: boolean;
  isFavorited?: boolean;
  showInfo?: boolean;
}

export function ImageLightbox({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onFavorite,
  isDownloading = false,
  isDeleting = false,
  isFavorited = false,
  showInfo: initialShowInfo = false,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(initialShowInfo);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];
  const isZoomed = zoomLevel > 100;

  // Reset zoom and pan when changing photos
  const resetView = useCallback(() => {
    setZoomLevel(100);
    setPanX(0);
    setPanY(0);
  }, []);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsImageLoaded(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
      resetView();
      setIsTransitioning(false);
    }, 150);
  }, [photos.length, resetView, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsImageLoaded(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
      resetView();
      setIsTransitioning(false);
    }, 150);
  }, [photos.length, resetView, isTransitioning]);

  const goToIndex = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setIsImageLoaded(false);
    setTimeout(() => {
      setCurrentIndex(index);
      resetView();
      setIsTransitioning(false);
    }, 150);
  }, [currentIndex, resetView, isTransitioning]);

  // Progressive zoom with bounds
  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(50, Math.min(400, prev + delta));
      // Reset pan if zooming out to 100% or less
      if (newZoom <= 100) {
        setPanX(0);
        setPanY(0);
      }
      return newZoom;
    });
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -20 : 20;
    handleZoom(delta);
  }, [handleZoom]);

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (zoomLevel > 100) {
      resetView();
    } else {
      setZoomLevel(200);
    }
  }, [zoomLevel, resetView]);

  // Pan/drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel <= 100) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX,
      panY,
    };
  }, [zoomLevel, panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Calculate bounds based on zoom level
    const maxPan = ((zoomLevel - 100) / 100) * 200;

    setPanX(Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panX + deltaX)));
    setPanY(Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panY + deltaY)));
  }, [isDragging, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handling for mobile
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      if (zoomLevel > 100) {
        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX,
          panY,
        };
        setIsDragging(true);
      }
    }
  }, [zoomLevel, panX, panY]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const maxPan = ((zoomLevel - 100) / 100) * 200;
    setPanX(Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panX + deltaX)));
    setPanY(Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panY + deltaY)));
  }, [isDragging, zoomLevel]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setIsDragging(false);
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Swipe detection (only when not zoomed)
    if (zoomLevel <= 100 && deltaTime < 300 && Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    touchStartRef.current = null;
  }, [zoomLevel, goToPrevious, goToNext]);

  // Reset index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetView();
    setIsImageLoaded(false);
  }, [initialIndex, resetView]);

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
        case "i":
        case "I":
          setShowInfo((prev) => !prev);
          break;
        case "+":
        case "=":
          handleZoom(25);
          break;
        case "-":
          handleZoom(-25);
          break;
        case "0":
          resetView();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext, handleZoom, resetView]);

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

  // Global mouse up listener for drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Premium Backdrop with gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/85 via-black/92 to-black/95 backdrop-blur-md transition-opacity duration-300",
          isTransitioning ? "opacity-90" : "opacity-100"
        )}
        onClick={onClose}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between gap-4 flex-wrap px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white/90">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-sm text-white/60 truncate max-w-[200px]">
            {currentPhoto.filename}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-white/10">
            <button
              onClick={() => handleZoom(-25)}
              className="rounded p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              title="Zoom out (-)"
            >
              <ZoomOutIcon className="h-4 w-4" />
            </button>
            <span className="text-xs text-white/70 w-12 text-center tabular-nums">
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(25)}
              className="rounded p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              title="Zoom in (+)"
            >
              <ZoomInIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              showInfo
                ? "bg-white/20 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
            )}
            title="Photo info (I)"
          >
            <InfoIcon className="h-5 w-5" />
          </button>

          {onFavorite && (
            <button
              onClick={() => onFavorite(currentPhoto)}
              className={cn(
                "rounded-lg p-2 transition-all",
                isFavorited
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
              )}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <HeartIcon className="h-5 w-5" filled={isFavorited} />
            </button>
          )}

          {onDownload && (
            <button
              onClick={() => onDownload(currentPhoto)}
              disabled={isDownloading || isDeleting}
              className={cn(
                "rounded-lg bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white",
                (isDownloading || isDeleting) && "opacity-50 cursor-not-allowed"
              )}
              title={isDownloading ? "Downloading..." : "Download"}
              aria-label="Download photo"
            >
              {isDownloading ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <DownloadIcon className="h-5 w-5" />
              )}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(currentPhoto)}
              disabled={isDeleting || isDownloading}
              className={cn(
                "rounded-lg bg-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/30",
                (isDeleting || isDownloading) && "opacity-50 cursor-not-allowed"
              )}
              title={isDeleting ? "Deleting..." : "Delete"}
              aria-label="Delete photo"
            >
              {isDeleting ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
              ) : (
                <TrashIcon className="h-5 w-5" />
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white ml-1"
            title="Close (Esc)"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        ref={imageContainerRef}
        className={cn(
          "relative flex items-center justify-center w-full h-full",
          isZoomed ? "cursor-grab" : "cursor-zoom-in",
          isDragging && "cursor-grabbing"
        )}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white/80 animate-spin" />
          </div>
        )}

        <img
          src={currentPhoto.mediumUrl || currentPhoto.url}
          alt={currentPhoto.filename}
          className={cn(
            "max-h-[80vh] max-w-[90vw] object-contain select-none transition-all duration-300 ease-out",
            isTransitioning && "opacity-0 scale-95",
            !isImageLoaded && "opacity-0"
          )}
          style={{
            transform: `scale(${zoomLevel / 100}) translate(${panX / (zoomLevel / 100)}px, ${panY / (zoomLevel / 100)}px)`,
          }}
          onLoad={() => setIsImageLoaded(true)}
          draggable={false}
        />
      </div>

      {/* EXIF Info Panel */}
      <div
        className={cn(
          "absolute right-0 top-16 bottom-24 w-80 bg-black/80 backdrop-blur-lg border-l border-white/10 transition-transform duration-300 ease-out overflow-y-auto",
          showInfo ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
            Photo Information
          </h3>

          {/* Dimensions */}
          {(currentPhoto.width || currentPhoto.height) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Dimensions
              </h4>
              <p className="text-sm text-white/80">
                {currentPhoto.width} × {currentPhoto.height} px
              </p>
            </div>
          )}

          {/* EXIF Data */}
          {currentPhoto.exif && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Camera Settings
              </h4>

              {currentPhoto.exif.camera && (
                <ExifRow label="Camera" value={currentPhoto.exif.camera} />
              )}
              {currentPhoto.exif.lens && (
                <ExifRow label="Lens" value={currentPhoto.exif.lens} />
              )}
              {currentPhoto.exif.focalLength && (
                <ExifRow label="Focal Length" value={currentPhoto.exif.focalLength} />
              )}
              {currentPhoto.exif.aperture && (
                <ExifRow label="Aperture" value={currentPhoto.exif.aperture} />
              )}
              {currentPhoto.exif.shutterSpeed && (
                <ExifRow label="Shutter" value={currentPhoto.exif.shutterSpeed} />
              )}
              {currentPhoto.exif.iso && (
                <ExifRow label="ISO" value={currentPhoto.exif.iso} />
              )}
              {currentPhoto.exif.dateTaken && (
                <ExifRow
                  label="Date Taken"
                  value={new Date(currentPhoto.exif.dateTaken).toLocaleDateString()}
                />
              )}
            </div>
          )}

          {/* File info */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">
              File
            </h4>
            <p className="text-sm text-white/80 break-all">
              {currentPhoto.filename}
            </p>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-white/50">← →</span>
              <span className="text-white/70">Navigate</span>
              <span className="text-white/50">+ -</span>
              <span className="text-white/70">Zoom</span>
              <span className="text-white/50">0</span>
              <span className="text-white/70">Reset zoom</span>
              <span className="text-white/50">I</span>
              <span className="text-white/70">Toggle info</span>
              <span className="text-white/50">Esc</span>
              <span className="text-white/70">Close</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 backdrop-blur-sm p-3 text-white/80 transition-all hover:bg-black/60 hover:text-white hover:scale-105"
            aria-label="Previous photo"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 backdrop-blur-sm p-3 text-white/80 transition-all hover:bg-black/60 hover:text-white hover:scale-105"
            aria-label="Next photo"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-2 px-4 py-4 bg-gradient-to-t from-black/70 to-transparent overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={(e) => {
                e.stopPropagation();
                goToIndex(index);
              }}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-x-auto rounded-lg transition-all duration-200",
                index === currentIndex
                  ? "ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110"
                  : "opacity-50 hover:opacity-80 hover:scale-105"
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

// EXIF Row Component
function ExifRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-sm text-white/90 font-medium">{value}</span>
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

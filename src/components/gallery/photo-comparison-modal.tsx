"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Grid2x2,
  Columns2,
  Rows2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  filename: string;
}

interface PhotoComparisonModalProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
  allPhotos?: Photo[]; // For swapping photos in/out
}

type LayoutMode = "2-horizontal" | "2-vertical" | "4-grid";

export function PhotoComparisonModal({
  photos,
  isOpen,
  onClose,
  allPhotos = [],
}: PhotoComparisonModalProps) {
  const [comparisonPhotos, setComparisonPhotos] = useState<Photo[]>(photos);
  const [layout, setLayout] = useState<LayoutMode>(
    photos.length > 2 ? "4-grid" : "2-horizontal"
  );
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update photos when prop changes
  useEffect(() => {
    setComparisonPhotos(photos);
    setLayout(photos.length > 2 ? "4-grid" : "2-horizontal");
  }, [photos]);

  // Reset zoom when layout changes
  useEffect(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [layout]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (activeSlot !== null) {
            setActiveSlot(null);
          } else {
            onClose();
          }
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(z + 0.25, 4));
          break;
        case "-":
          setZoom((z) => Math.max(z - 0.25, 0.5));
          break;
        case "0":
          setZoom(1);
          setPanOffset({ x: 0, y: 0 });
          break;
        case "i":
          setShowInfo((s) => !s);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, activeSlot]);

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

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsPanning(true);
        setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    },
    [zoom, panOffset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && zoom > 1) {
        setPanOffset({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        });
      }
    },
    [isPanning, zoom, startPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const swapPhoto = (slotIndex: number, newPhoto: Photo) => {
    setComparisonPhotos((prev) => {
      const updated = [...prev];
      updated[slotIndex] = newPhoto;
      return updated;
    });
    setActiveSlot(null);
  };

  const removePhotoSlot = (slotIndex: number) => {
    if (comparisonPhotos.length <= 2) return; // Minimum 2 photos
    setComparisonPhotos((prev) => prev.filter((_, i) => i !== slotIndex));
    setActiveSlot(null);
  };

  const navigateInSlot = (slotIndex: number, direction: "prev" | "next") => {
    const currentPhoto = comparisonPhotos[slotIndex];
    const currentIndex = allPhotos.findIndex((p) => p.id === currentPhoto.id);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === "prev") {
      newIndex = currentIndex === 0 ? allPhotos.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === allPhotos.length - 1 ? 0 : currentIndex + 1;
    }

    // Make sure we don't pick a photo already in comparison
    const usedIds = new Set(comparisonPhotos.map((p) => p.id));
    let attempts = 0;
    while (usedIds.has(allPhotos[newIndex].id) && attempts < allPhotos.length) {
      if (direction === "prev") {
        newIndex = newIndex === 0 ? allPhotos.length - 1 : newIndex - 1;
      } else {
        newIndex = newIndex === allPhotos.length - 1 ? 0 : newIndex + 1;
      }
      attempts++;
    }

    if (attempts < allPhotos.length) {
      swapPhoto(slotIndex, allPhotos[newIndex]);
    }
  };

  if (!isOpen || comparisonPhotos.length < 2) return null;

  const getGridClass = () => {
    switch (layout) {
      case "2-horizontal":
        return "grid-cols-2 grid-rows-1";
      case "2-vertical":
        return "grid-cols-1 grid-rows-2";
      case "4-grid":
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-2 grid-rows-1";
    }
  };

  // Available photos for swapping (not already in comparison)
  const availablePhotos = allPhotos.filter(
    (p) => !comparisonPhotos.some((cp) => cp.id === p.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="shrink-0 flex items-start justify-between gap-4 flex-wrap px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            Photo Comparison
          </span>
          <span className="text-xs text-white/50">
            {comparisonPhotos.length} photos
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Layout Toggles */}
          <div className="flex items-center gap-1 mr-2 border-r border-white/20 pr-2">
            <button
              onClick={() => setLayout("2-horizontal")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                layout === "2-horizontal"
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              title="Side by side"
            >
              <Columns2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout("2-vertical")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                layout === "2-vertical"
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              title="Stacked"
            >
              <Rows2 className="h-4 w-4" />
            </button>
            {comparisonPhotos.length >= 3 && (
              <button
                onClick={() => setLayout("4-grid")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  layout === "4-grid"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                title="Grid"
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 mr-2 border-r border-white/20 pr-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-white/60 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Other Controls */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              showInfo
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            title="Show info"
          >
            <Info className="h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div
        ref={containerRef}
        className={cn("flex-1 grid gap-1 p-1", getGridClass())}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
      >
        {comparisonPhotos.slice(0, layout === "4-grid" ? 4 : 2).map((photo, index) => (
          <div
            key={photo.id}
            className="relative overflow-hidden bg-black/50 rounded-lg group"
          >
            {/* Image */}
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              }}
            >
              <img
                src={photo.mediumUrl || photo.url}
                alt={photo.filename}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>

            {/* Info Overlay */}
            {showInfo && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-sm font-medium text-white truncate">
                  {photo.filename}
                </p>
              </div>
            )}

            {/* Navigation Arrows */}
            {allPhotos.length > comparisonPhotos.length && (
              <>
                <button
                  onClick={() => navigateInSlot(index, "prev")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigateInSlot(index, "next")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Remove Button */}
            {comparisonPhotos.length > 2 && (
              <button
                onClick={() => removePhotoSlot(index)}
                className="absolute top-2 right-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                title="Remove from comparison"
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Slot Number */}
            <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Picker (when a slot is active) */}
      {activeSlot !== null && (
        <div className="absolute inset-0 bg-black/80 z-10 flex flex-col">
          <div className="flex items-start justify-between gap-4 flex-wrap px-4 py-3 border-b border-white/10">
            <span className="text-sm font-medium text-white">
              Select photo for slot {activeSlot + 1}
            </span>
            <button
              onClick={() => setActiveSlot(null)}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-6 gap-2">
              {availablePhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => swapPhoto(activeSlot, photo)}
                  className="aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-white transition-colors"
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.filename}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="shrink-0 flex items-center justify-center gap-4 px-4 py-2 border-t border-white/10 text-xs text-white/40">
        <span>
          <kbd className="px-1 py-0.5 bg-white/10 rounded">+/-</kbd> Zoom
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-white/10 rounded">0</kbd> Reset
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-white/10 rounded">I</kbd> Toggle info
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-white/10 rounded">Esc</kbd> Close
        </span>
        {zoom > 1 && (
          <span className="flex items-center gap-1">
            <Move className="h-3 w-3" /> Click and drag to pan
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
  Grid3x3,
  Layers,
  Download,
  Loader2,
} from "lucide-react";

type FloorPlanType = "two_d" | "three_d" | "interactive";

interface FloorPlanViewerProps {
  /** Floor plan image URL */
  imageUrl: string;
  /** Floor plan type */
  type?: FloorPlanType;
  /** Floor plan label (e.g., "Main Floor", "Upper Level") */
  label?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Enable zoom controls */
  enableZoom?: boolean;
  /** Enable pan/drag */
  enablePan?: boolean;
  /** Initial zoom level (1 = 100%) */
  initialZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Enable responsive sizing */
  responsive?: boolean;
  /** Additional class name */
  className?: string;
  /** Download URL (if different from imageUrl) */
  downloadUrl?: string;
  /** Callback when floor plan loads */
  onLoad?: () => void;
  /** Callback for fullscreen */
  onFullscreen?: () => void;
}

/**
 * Interactive floor plan viewer with zoom and pan capabilities.
 *
 * Supports:
 * - 2D floor plan images
 * - 3D rendered floor plans
 * - Interactive floor plans with hotspots
 */
export function FloorPlanViewer({
  imageUrl,
  type = "two_d",
  label,
  alt = "Floor Plan",
  enableZoom = true,
  enablePan = true,
  initialZoom = 1,
  maxZoom = 4,
  minZoom = 0.5,
  responsive = true,
  className,
  downloadUrl,
  onLoad,
  onFullscreen,
}: FloorPlanViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(initialZoom);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Floor plan type display
  const typeLabel = useMemo(() => {
    switch (type) {
      case "two_d":
        return "2D Floor Plan";
      case "three_d":
        return "3D Floor Plan";
      case "interactive":
        return "Interactive";
      default:
        return "Floor Plan";
    }
  }, [type]);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, maxZoom));
  }, [maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, minZoom));
  }, [minZoom]);

  const handleReset = useCallback(() => {
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  }, [initialZoom]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!enableZoom) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
    },
    [enableZoom, minZoom, maxZoom]
  );

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enablePan || zoom <= 1) return;
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [enablePan, zoom, position]
  );

  // Handle pan move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    },
    [isPanning, dragStart]
  );

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Handle download
  const handleDownload = useCallback(() => {
    const url = downloadUrl || imageUrl;
    const link = document.createElement("a");
    link.href = url;
    link.download = label ? `${label.replace(/\s+/g, "-")}-floor-plan` : "floor-plan";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl, imageUrl, label]);

  // Add event listeners for mouse up outside container
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Keyboard navigation for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enableZoom) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if container or child is focused
      if (!container.contains(document.activeElement)) return;

      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleReset();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableZoom, handleZoomIn, handleZoomOut, handleReset]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "floor-plan-viewer group relative overflow-hidden rounded-xl bg-[var(--background-secondary)] border border-[var(--card-border)]",
        responsive && "w-full",
        className
      )}
    >
      {/* Header with label and type */}
      <div className="floor-plan-header absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-white/80" />
          <span className="text-sm font-medium text-white">
            {label || typeLabel}
          </span>
          {label && (
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
              {type === "three_d" ? "3D" : type === "interactive" ? "Interactive" : "2D"}
            </span>
          )}
        </div>

        {/* Zoom controls - 44px min touch targets on mobile */}
        {enableZoom && (
          <div className="floor-plan-zoom flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= minZoom}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50 sm:h-8 sm:w-8"
              aria-label="Zoom out (or press minus key)"
            >
              <ZoomOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
            <span className="min-w-[3rem] text-center text-xs font-medium text-white" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= maxZoom}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50 sm:h-8 sm:w-8"
              aria-label="Zoom in (or press plus key)"
            >
              <ZoomIn className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-8 sm:w-8"
              aria-label="Reset view (or press 0)"
            >
              <RotateCcw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Floor plan image */}
      <div
        className={cn(
          "floor-plan-content relative flex min-h-[300px] items-center justify-center overflow-hidden",
          enablePan && zoom > 1 && "cursor-grab",
          isPanning && "cursor-grabbing"
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="floor-plan-loading absolute inset-0 z-10 flex items-center justify-center bg-[var(--background-secondary)]" role="status" aria-label="Loading floor plan">
            <Loader2 className="h-8 w-8 animate-spin text-foreground-muted" />
          </div>
        )}

        {/* Floor plan image */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          className={cn(
            "max-h-[600px] max-w-full object-contain transition-transform",
            isLoading && "opacity-0"
          )}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          onLoad={handleImageLoad}
          draggable={false}
        />

        {/* Pan indicator */}
        {enablePan && zoom > 1 && !isPanning && (
          <div className="floor-plan-pan-hint absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
            <Move className="h-3 w-3" />
            Drag to pan
          </div>
        )}
      </div>

      {/* Footer with actions - 44px min touch targets */}
      <div className="floor-plan-footer absolute bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {downloadUrl && (
          <button
            type="button"
            onClick={handleDownload}
            className="flex h-11 items-center gap-1.5 rounded-lg bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-9 sm:px-3"
          >
            <Download className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            Download
          </button>
        )}
        {onFullscreen && (
          <button
            type="button"
            onClick={onFullscreen}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-9 sm:w-9"
            aria-label="View in fullscreen"
          >
            <Maximize2 className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact floor plan thumbnail for grid displays
 */
interface FloorPlanThumbnailProps {
  imageUrl: string;
  label?: string;
  type?: FloorPlanType;
  className?: string;
  onClick?: () => void;
}

export function FloorPlanThumbnail({
  imageUrl,
  label,
  type = "two_d",
  className,
  onClick,
}: FloorPlanThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "floor-plan-thumbnail group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)] transition-all hover:border-[var(--border-hover)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        className
      )}
      aria-label={`View ${label || "Floor Plan"}`}
    >
      {/* Floor plan image */}
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2">
        <span className="floor-plan-thumbnail-label flex items-center gap-1.5 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Grid3x3 className="h-3 w-3" />
          {label || "Floor Plan"}
        </span>

        {/* Type badge */}
        <span className="floor-plan-thumbnail-type rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80 backdrop-blur-sm">
          {type === "three_d" ? "3D" : type === "interactive" ? "Interactive" : "2D"}
        </span>
      </div>
    </button>
  );
}

/**
 * Multi-floor selector for properties with multiple levels
 */
interface FloorSelectorProps {
  floors: Array<{
    id: string;
    label: string;
    imageUrl: string;
    type?: FloorPlanType;
  }>;
  selectedFloorId?: string;
  onSelect: (floorId: string) => void;
  className?: string;
}

export function FloorSelector({
  floors,
  selectedFloorId,
  onSelect,
  className,
}: FloorSelectorProps) {
  return (
    <div className={cn("floor-selector flex flex-wrap gap-2", className)} role="tablist" aria-label="Floor selection">
      {floors.map((floor) => (
        <button
          key={floor.id}
          type="button"
          role="tab"
          aria-selected={selectedFloorId === floor.id}
          onClick={() => onSelect(floor.id)}
          className={cn(
            "flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 sm:px-3 sm:py-2",
            selectedFloorId === floor.id
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--card-border)] bg-[var(--card)] text-foreground hover:border-[var(--border-hover)]"
          )}
        >
          <Layers className="h-4 w-4" />
          {floor.label}
        </button>
      ))}
    </div>
  );
}

export type { FloorPlanType, FloorPlanViewerProps, FloorPlanThumbnailProps, FloorSelectorProps };

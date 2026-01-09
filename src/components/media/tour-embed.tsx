"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Box, Maximize2, Loader2, Compass, Move3d, Ruler } from "lucide-react";

type TourProvider =
  | "matterport"
  | "iguide"
  | "cupix"
  | "zillow_3d"
  | "ricoh"
  | "kuula"
  | "other";

interface TourEmbedProps {
  /** Tour provider */
  provider: TourProvider;
  /** Tour ID on the external platform */
  tourId: string;
  /** Direct embed URL (overrides provider + tourId) */
  embedUrl?: string;
  /** Thumbnail URL for tour preview */
  thumbnailUrl?: string;
  /** Tour title for accessibility */
  title?: string;
  /** Aspect ratio (default: 16:9) */
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9";
  /** Show minimap navigation */
  showMinimap?: boolean;
  /** Show floor plan toggle */
  showFloorPlan?: boolean;
  /** Enable measurement tools */
  showMeasurement?: boolean;
  /** Auto-rotate view */
  autoRotate?: boolean;
  /** Hide navigation controls */
  hideNavigation?: boolean;
  /** Start in dollhouse view (Matterport) */
  startInDollhouse?: boolean;
  /** Start in floor plan view */
  startInFloorPlan?: boolean;
  /** Enable responsive sizing */
  responsive?: boolean;
  /** Additional class name */
  className?: string;
  /** Callback when tour loads */
  onLoad?: () => void;
  /** Callback when entering fullscreen */
  onFullscreen?: () => void;
}

/**
 * Clean 3D tour embed component supporting multiple tour platforms.
 *
 * Supports:
 * - Matterport 3D tours
 * - iGuide tours
 * - Cupix tours
 * - Zillow 3D Home
 * - Ricoh Tours
 * - Kuula 360 tours
 */
export function TourEmbed({
  provider,
  tourId,
  embedUrl,
  thumbnailUrl,
  title = "3D Tour",
  aspectRatio = "16:9",
  showMinimap = true,
  showFloorPlan = true,
  showMeasurement = false,
  autoRotate = false,
  hideNavigation = false,
  startInDollhouse = false,
  startInFloorPlan = false,
  responsive = true,
  className,
  onLoad,
  onFullscreen,
}: TourEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Build embed URL based on provider
  const cleanEmbedUrl = useMemo(() => {
    if (embedUrl) return embedUrl;

    switch (provider) {
      case "matterport": {
        // Matterport embed parameters
        // https://support.matterport.com/s/article/URL-Parameters
        const params = new URLSearchParams();
        params.set("m", tourId);
        if (!showMinimap) params.set("mls", "0");
        if (!showFloorPlan) params.set("f", "0");
        if (showMeasurement) params.set("mt", "1");
        if (autoRotate) params.set("play", "1");
        if (hideNavigation) params.set("nt", "0");
        if (startInDollhouse) params.set("dh", "1");
        if (startInFloorPlan) params.set("fp", "1");
        // Clean branding options
        params.set("brand", "0"); // Hide Matterport branding
        params.set("help", "0"); // Hide help button
        params.set("qs", "1"); // Quick start (skip intro)
        params.set("ts", "0"); // Hide timestamp
        params.set("pin", "0"); // Hide pins
        return `https://my.matterport.com/show/?${params.toString()}`;
      }

      case "iguide": {
        // iGuide embed
        // https://iguide.com
        const params = new URLSearchParams();
        params.set("v", tourId);
        if (!showFloorPlan) params.set("floorplan", "0");
        if (!showMinimap) params.set("minimap", "0");
        if (showMeasurement) params.set("measure", "1");
        return `https://youriguide.com/embed/${tourId}?${params.toString()}`;
      }

      case "cupix": {
        // Cupix embed
        const params = new URLSearchParams();
        if (!showMinimap) params.set("minimap", "false");
        if (!showFloorPlan) params.set("floorplan", "false");
        if (autoRotate) params.set("autorotate", "true");
        return `https://player.cupix.com/p/${tourId}?${params.toString()}`;
      }

      case "zillow_3d": {
        // Zillow 3D Home embed
        return `https://www.zillow.com/view-3d-home/${tourId}`;
      }

      case "ricoh": {
        // Ricoh Tours embed
        const params = new URLSearchParams();
        if (autoRotate) params.set("autorotate", "true");
        return `https://theta360.com/s/${tourId}?${params.toString()}`;
      }

      case "kuula": {
        // Kuula 360 tours embed
        const params = new URLSearchParams();
        if (autoRotate) params.set("autorotate", "true");
        if (!showMinimap) params.set("hidemap", "true");
        params.set("info", "0"); // Hide info panels
        params.set("logo", "0"); // Hide logo
        return `https://kuula.co/share/${tourId}?${params.toString()}`;
      }

      case "other":
      default:
        // Generic embed URL
        return tourId;
    }
  }, [
    provider,
    tourId,
    embedUrl,
    showMinimap,
    showFloorPlan,
    showMeasurement,
    autoRotate,
    hideNavigation,
    startInDollhouse,
    startInFloorPlan,
  ]);

  // Aspect ratio classes
  const aspectRatioClass = useMemo(() => {
    switch (aspectRatio) {
      case "16:9":
        return "aspect-video";
      case "4:3":
        return "aspect-[4/3]";
      case "1:1":
        return "aspect-square";
      case "9:16":
        return "aspect-[9/16]";
      case "21:9":
        return "aspect-[21/9]";
      default:
        return "aspect-video";
    }
  }, [aspectRatio]);

  const handleLoad = useCallback(() => {
    setShowTour(true);
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Provider display name
  const providerName = useMemo(() => {
    switch (provider) {
      case "matterport":
        return "Matterport";
      case "iguide":
        return "iGuide";
      case "cupix":
        return "Cupix";
      case "zillow_3d":
        return "Zillow 3D";
      case "ricoh":
        return "Ricoh";
      case "kuula":
        return "Kuula";
      default:
        return "3D Tour";
    }
  }, [provider]);

  return (
    <div
      className={cn(
        "tour-embed group relative overflow-hidden rounded-xl bg-black",
        responsive && "w-full",
        aspectRatioClass,
        className
      )}
    >
      {/* Thumbnail / Load button overlay */}
      {!showTour && thumbnailUrl && (
        <button
          type="button"
          onClick={handleLoad}
          className="tour-embed-overlay absolute inset-0 z-10 flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label={`Open ${title}`}
        >
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* 3D Tour icon - responsive sizing with min touch target */}
          <div className="tour-embed-play relative z-10 flex h-16 w-16 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
            <Move3d className="h-8 w-8 text-white sm:h-10 sm:w-10" />
          </div>

          {/* Provider badge */}
          <span className="tour-embed-provider absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Box className="h-3.5 w-3.5" />
            {providerName}
          </span>

          {/* Feature badges */}
          <div className="tour-embed-features absolute bottom-3 left-3 z-10 flex gap-2">
            {showFloorPlan && (
              <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] font-medium text-white/80">
                <Compass className="h-3 w-3" />
                Floor Plan
              </span>
            )}
            {showMeasurement && (
              <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] font-medium text-white/80">
                <Ruler className="h-3 w-3" />
                Measure
              </span>
            )}
          </div>

          {/* View Tour CTA - min touch target */}
          <span className="tour-embed-cta absolute bottom-3 right-3 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition-transform group-hover:scale-105 sm:px-5 sm:py-2.5">
            View Tour
          </span>
        </button>
      )}

      {/* Loading spinner */}
      {showTour && isLoading && (
        <div className="tour-embed-loading absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black" role="status" aria-label="Loading 3D tour">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          <span className="text-sm text-white/60">Loading 3D Tour...</span>
        </div>
      )}

      {/* Tour iframe */}
      {(showTour || !thumbnailUrl) && (
        <iframe
          src={cleanEmbedUrl}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen; xr-spatial-tracking; vr"
          allowFullScreen
          loading="lazy"
          title={title}
          onLoad={handleIframeLoad}
        />
      )}

      {/* Fullscreen button - 44px min touch target */}
      {showTour && !isLoading && onFullscreen && (
        <button
          type="button"
          onClick={onFullscreen}
          className="tour-embed-fullscreen absolute right-3 top-3 z-30 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100"
          aria-label="View in fullscreen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact tour thumbnail for grid displays
 */
interface TourThumbnailProps {
  thumbnailUrl: string;
  title?: string;
  provider?: TourProvider;
  hasFloorPlan?: boolean;
  className?: string;
  onClick?: () => void;
}

export function TourThumbnail({
  thumbnailUrl,
  title = "3D Tour",
  provider,
  hasFloorPlan = false,
  className,
  onClick,
}: TourThumbnailProps) {
  const providerName = useMemo(() => {
    switch (provider) {
      case "matterport":
        return "Matterport";
      case "iguide":
        return "iGuide";
      case "cupix":
        return "Cupix";
      case "zillow_3d":
        return "Zillow 3D";
      case "ricoh":
        return "Ricoh";
      case "kuula":
        return "Kuula";
      default:
        return "3D Tour";
    }
  }, [provider]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tour-thumbnail group relative aspect-video w-full overflow-hidden rounded-lg bg-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        className
      )}
      aria-label={`View ${title}`}
    >
      {/* Thumbnail image */}
      <img
        src={thumbnailUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-80"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* 3D icon - 48px with min touch target */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="tour-thumbnail-icon flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
          <Move3d className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Provider badge */}
      <span className="tour-thumbnail-provider absolute left-2 top-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
        <Box className="h-3 w-3" />
        {providerName}
      </span>

      {/* Floor plan indicator */}
      {hasFloorPlan && (
        <span className="tour-thumbnail-floorplan absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
          <Compass className="h-3 w-3" />
          Floor Plan
        </span>
      )}
    </button>
  );
}

export type { TourProvider, TourEmbedProps, TourThumbnailProps };

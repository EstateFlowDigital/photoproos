"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { VideoEmbed, VideoThumbnail } from "./video-embed";
import { TourEmbed, TourThumbnail } from "./tour-embed";
import { FloorPlanViewer, FloorPlanThumbnail } from "./floor-plan-viewer";
import { Image, Play, Box, Grid3x3, Film, Plane, FileQuestion } from "lucide-react";

// Mirror the Prisma enums
type AssetMediaType =
  | "photo"
  | "video"
  | "video_tour"
  | "floor_plan"
  | "aerial"
  | "virtual_tour"
  | "other";

type VideoProvider =
  | "vimeo"
  | "youtube"
  | "bunny"
  | "mux"
  | "cloudflare"
  | "wistia"
  | "sprout"
  | "direct";

type TourProvider =
  | "matterport"
  | "iguide"
  | "cupix"
  | "zillow_3d"
  | "ricoh"
  | "kuula"
  | "other";

type FloorPlanType = "two_d" | "three_d" | "interactive";

/**
 * Asset data structure matching Prisma model
 */
interface Asset {
  id: string;
  mediaType: AssetMediaType;

  // Photo/file fields
  filename: string;
  originalUrl: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  width?: number | null;
  height?: number | null;

  // Video fields
  videoProvider?: VideoProvider | null;
  videoExternalId?: string | null;
  videoEmbedUrl?: string | null;
  videoDuration?: number | null;
  videoAutoplay?: boolean;
  videoMuted?: boolean;

  // Tour fields
  tourProvider?: TourProvider | null;
  tourExternalId?: string | null;
  tourEmbedUrl?: string | null;

  // Floor plan fields
  floorPlanType?: FloorPlanType | null;
  floorPlanLabel?: string | null;

  // Display fields
  caption?: string | null;
  isFeatured?: boolean;
}

type RenderMode = "full" | "thumbnail" | "preview";

interface AssetRendererProps {
  /** The asset to render */
  asset: Asset;
  /** Render mode: full (detailed), thumbnail (compact), preview (medium) */
  mode?: RenderMode;
  /** Additional class name */
  className?: string;
  /** Click handler (for thumbnails/previews) */
  onClick?: () => void;
  /** Callback when asset loads */
  onLoad?: () => void;
  /** Callback for fullscreen */
  onFullscreen?: () => void;
  /** Hide video/tour branding */
  hideBranding?: boolean;
  /** Show video controls */
  showControls?: boolean;
  /** Aspect ratio override */
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9" | "auto";
}

/**
 * Polymorphic asset renderer that displays the appropriate component
 * based on the asset's media type.
 *
 * Supports:
 * - Photos (standard images)
 * - Videos (embedded video players)
 * - Video Tours (walkthrough videos)
 * - Virtual Tours (3D tours like Matterport)
 * - Floor Plans (2D/3D floor plan images)
 * - Aerial (drone footage)
 */
export function AssetRenderer({
  asset,
  mode = "full",
  className,
  onClick,
  onLoad,
  onFullscreen,
  hideBranding = true,
  showControls = true,
  aspectRatio = "auto",
}: AssetRendererProps) {
  // Determine aspect ratio
  const computedAspectRatio = useMemo(() => {
    if (aspectRatio !== "auto") return aspectRatio;

    // Default aspect ratios by media type
    switch (asset.mediaType) {
      case "video":
      case "video_tour":
      case "aerial":
        return "16:9";
      case "virtual_tour":
        return "16:9";
      case "floor_plan":
        return "4:3";
      case "photo":
      default:
        // Use image dimensions if available
        if (asset.width && asset.height) {
          const ratio = asset.width / asset.height;
          if (ratio > 1.7) return "16:9";
          if (ratio > 1.2) return "4:3";
          if (ratio < 0.8) return "9:16";
          return "1:1";
        }
        return "16:9";
    }
  }, [asset, aspectRatio]);

  // Render based on media type and mode
  switch (asset.mediaType) {
    case "video":
    case "video_tour":
    case "aerial":
      return renderVideo(asset, mode, {
        className,
        onClick,
        onLoad,
        onFullscreen,
        hideBranding,
        showControls,
        aspectRatio: computedAspectRatio,
      });

    case "virtual_tour":
      return renderTour(asset, mode, {
        className,
        onClick,
        onLoad,
        onFullscreen,
        aspectRatio: computedAspectRatio,
      });

    case "floor_plan":
      return renderFloorPlan(asset, mode, {
        className,
        onClick,
        onLoad,
        onFullscreen,
      });

    case "photo":
    default:
      return renderPhoto(asset, mode, {
        className,
        onClick,
        onLoad,
        aspectRatio: computedAspectRatio,
      });
  }
}

// Video renderer
function renderVideo(
  asset: Asset,
  mode: RenderMode,
  options: {
    className?: string;
    onClick?: () => void;
    onLoad?: () => void;
    onFullscreen?: () => void;
    hideBranding?: boolean;
    showControls?: boolean;
    aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9";
  }
) {
  const { className, onClick, onLoad, hideBranding, showControls, aspectRatio } = options;

  if (!asset.videoProvider || !asset.videoExternalId) {
    return renderPlaceholder("video", asset.caption || "Video", className, onClick);
  }

  if (mode === "thumbnail") {
    return (
      <VideoThumbnail
        thumbnailUrl={asset.thumbnailUrl || asset.originalUrl}
        title={asset.caption || "Video"}
        duration={asset.videoDuration || undefined}
        provider={asset.videoProvider}
        className={className}
        onClick={onClick}
      />
    );
  }

  return (
    <VideoEmbed
      provider={asset.videoProvider}
      videoId={asset.videoExternalId}
      embedUrl={asset.videoEmbedUrl || undefined}
      thumbnailUrl={asset.thumbnailUrl || undefined}
      title={asset.caption || "Video"}
      aspectRatio={aspectRatio}
      autoplay={asset.videoAutoplay}
      muted={asset.videoMuted}
      hideBranding={hideBranding}
      hideRelated={true}
      hideTitle={true}
      hideControls={!showControls}
      duration={asset.videoDuration || undefined}
      className={className}
      onPlay={onLoad}
    />
  );
}

// Tour renderer
function renderTour(
  asset: Asset,
  mode: RenderMode,
  options: {
    className?: string;
    onClick?: () => void;
    onLoad?: () => void;
    onFullscreen?: () => void;
    aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9";
  }
) {
  const { className, onClick, onLoad, onFullscreen, aspectRatio } = options;

  if (!asset.tourProvider || !asset.tourExternalId) {
    return renderPlaceholder("tour", asset.caption || "3D Tour", className, onClick);
  }

  if (mode === "thumbnail") {
    return (
      <TourThumbnail
        thumbnailUrl={asset.thumbnailUrl || asset.originalUrl}
        title={asset.caption || "3D Tour"}
        provider={asset.tourProvider}
        className={className}
        onClick={onClick}
      />
    );
  }

  return (
    <TourEmbed
      provider={asset.tourProvider}
      tourId={asset.tourExternalId}
      embedUrl={asset.tourEmbedUrl || undefined}
      thumbnailUrl={asset.thumbnailUrl || undefined}
      title={asset.caption || "3D Tour"}
      aspectRatio={aspectRatio}
      className={className}
      onLoad={onLoad}
      onFullscreen={onFullscreen}
    />
  );
}

// Floor plan renderer
function renderFloorPlan(
  asset: Asset,
  mode: RenderMode,
  options: {
    className?: string;
    onClick?: () => void;
    onLoad?: () => void;
    onFullscreen?: () => void;
  }
) {
  const { className, onClick, onLoad, onFullscreen } = options;

  if (mode === "thumbnail") {
    return (
      <FloorPlanThumbnail
        imageUrl={asset.thumbnailUrl || asset.originalUrl}
        label={asset.floorPlanLabel || undefined}
        type={asset.floorPlanType || "two_d"}
        className={className}
        onClick={onClick}
      />
    );
  }

  return (
    <FloorPlanViewer
      imageUrl={asset.originalUrl}
      type={asset.floorPlanType || "two_d"}
      label={asset.floorPlanLabel || undefined}
      alt={asset.caption || "Floor Plan"}
      enableZoom={true}
      enablePan={true}
      className={className}
      onLoad={onLoad}
      onFullscreen={onFullscreen}
    />
  );
}

// Photo renderer
function renderPhoto(
  asset: Asset,
  mode: RenderMode,
  options: {
    className?: string;
    onClick?: () => void;
    onLoad?: () => void;
    aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9" | "auto";
  }
) {
  const { className, onClick, onLoad, aspectRatio } = options;

  // Get appropriate image URL based on mode
  const imageUrl =
    mode === "thumbnail"
      ? asset.thumbnailUrl || asset.mediumUrl || asset.originalUrl
      : mode === "preview"
        ? asset.mediumUrl || asset.originalUrl
        : asset.originalUrl;

  // Aspect ratio class
  const aspectClass =
    aspectRatio === "auto"
      ? undefined
      : aspectRatio === "16:9"
        ? "aspect-video"
        : aspectRatio === "4:3"
          ? "aspect-[4/3]"
          : aspectRatio === "1:1"
            ? "aspect-square"
            : aspectRatio === "9:16"
              ? "aspect-[9/16]"
              : "aspect-[21/9]";

  if (mode === "thumbnail") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "photo-thumbnail group relative w-full overflow-x-auto rounded-lg bg-[var(--background-secondary)]",
          aspectClass || "aspect-[4/3]",
          className
        )}
        aria-label={asset.caption || "View photo"}
      >
        <img
          src={imageUrl}
          alt={asset.caption || ""}
          className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
          onLoad={onLoad}
        />
        {asset.isFeatured && (
          <span className="absolute left-2 top-2 rounded bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">
            Featured
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "photo-renderer relative overflow-x-auto rounded-xl bg-[var(--background-secondary)]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <img
        src={imageUrl}
        alt={asset.caption || ""}
        className={cn(
          "w-full object-contain",
          aspectClass ? "h-auto" : "max-h-[80vh]"
        )}
        onLoad={onLoad}
      />
      {asset.caption && (
        <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-sm text-white">
          {asset.caption}
        </p>
      )}
    </div>
  );
}

// Placeholder for missing data
function renderPlaceholder(
  type: "video" | "tour" | "floor_plan",
  title: string,
  className?: string,
  onClick?: () => void
) {
  const Icon = type === "video" ? Play : type === "tour" ? Box : Grid3x3;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "placeholder-asset group relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-x-auto rounded-xl bg-[var(--background-secondary)] border border-dashed border-[var(--card-border)]",
        className
      )}
      aria-label={title}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
        <Icon className="h-6 w-6 text-foreground-muted" />
      </div>
      <span className="text-sm text-foreground-muted">{title}</span>
      <span className="text-xs text-foreground-muted/60">No content available</span>
    </button>
  );
}

/**
 * Get the icon for an asset media type
 */
export function getAssetIcon(mediaType: AssetMediaType) {
  switch (mediaType) {
    case "video":
    case "video_tour":
      return Play;
    case "aerial":
      return Plane;
    case "virtual_tour":
      return Box;
    case "floor_plan":
      return Grid3x3;
    case "photo":
      return Image;
    default:
      return FileQuestion;
  }
}

/**
 * Get display label for an asset media type
 */
export function getAssetTypeLabel(mediaType: AssetMediaType): string {
  switch (mediaType) {
    case "video":
      return "Video";
    case "video_tour":
      return "Video Tour";
    case "aerial":
      return "Aerial";
    case "virtual_tour":
      return "3D Tour";
    case "floor_plan":
      return "Floor Plan";
    case "photo":
      return "Photo";
    default:
      return "Other";
  }
}

/**
 * Media type filter pills for gallery filtering
 */
interface MediaTypeFilterProps {
  availableTypes: AssetMediaType[];
  selectedTypes: AssetMediaType[];
  onToggle: (type: AssetMediaType) => void;
  className?: string;
}

export function MediaTypeFilter({
  availableTypes,
  selectedTypes,
  onToggle,
  className,
}: MediaTypeFilterProps) {
  return (
    <div className={cn("media-type-filter flex flex-wrap gap-2", className)}>
      {availableTypes.map((type) => {
        const Icon = getAssetIcon(type);
        const isSelected = selectedTypes.includes(type);

        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--card-border)] bg-[var(--card)] text-foreground-muted hover:border-[var(--border-hover)] hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {getAssetTypeLabel(type)}
          </button>
        );
      })}
    </div>
  );
}

export type {
  Asset,
  AssetMediaType,
  VideoProvider,
  TourProvider,
  FloorPlanType,
  RenderMode,
  AssetRendererProps,
  MediaTypeFilterProps,
};

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Play, Loader2 } from "lucide-react";

type VideoProvider =
  | "vimeo"
  | "youtube"
  | "bunny"
  | "mux"
  | "cloudflare"
  | "wistia"
  | "sprout"
  | "direct";

interface VideoEmbedProps {
  /** Video provider */
  provider: VideoProvider;
  /** Video ID on the external platform */
  videoId: string;
  /** Direct embed URL (overrides provider + videoId) */
  embedUrl?: string;
  /** Thumbnail URL for video preview */
  thumbnailUrl?: string;
  /** Video title for accessibility */
  title?: string;
  /** Aspect ratio (default: 16:9) */
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9";
  /** Auto-play video */
  autoplay?: boolean;
  /** Start muted */
  muted?: boolean;
  /** Loop video */
  loop?: boolean;
  /** Hide player controls */
  hideControls?: boolean;
  /** Hide video title */
  hideTitle?: boolean;
  /** Hide provider branding */
  hideBranding?: boolean;
  /** Hide related/recommended videos */
  hideRelated?: boolean;
  /** Enable responsive sizing */
  responsive?: boolean;
  /** Additional class name */
  className?: string;
  /** Video duration in seconds (for display) */
  duration?: number;
  /** Callback when video starts playing */
  onPlay?: () => void;
  /** Callback when video ends */
  onEnded?: () => void;
}

/**
 * Clean video embed component supporting multiple video platforms.
 *
 * Optimized for real estate MLS compliance with options to:
 * - Hide all branding
 * - Hide recommended/related videos
 * - Clean, minimal player UI
 */
export function VideoEmbed({
  provider,
  videoId,
  embedUrl,
  thumbnailUrl,
  title = "Video",
  aspectRatio = "16:9",
  autoplay = false,
  muted = true,
  loop = false,
  hideControls = false,
  hideTitle = true,
  hideBranding = true,
  hideRelated = true,
  responsive = true,
  className,
  duration,
  onPlay,
  onEnded,
}: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(autoplay);

  // Handle keyboard activation for play button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showVideo) {
        // Allow escape to potentially pause/close video
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showVideo]);

  // Build clean embed URL based on provider
  const cleanEmbedUrl = useMemo(() => {
    if (embedUrl) return embedUrl;

    const params = new URLSearchParams();

    switch (provider) {
      case "vimeo": {
        // Vimeo Pro parameters for clean embed
        // https://developer.vimeo.com/player/embed-player
        params.set("autopause", "0");
        params.set("badge", hideBranding ? "0" : "1");
        params.set("byline", hideBranding ? "0" : "1");
        params.set("portrait", hideBranding ? "0" : "1");
        params.set("title", hideTitle ? "0" : "1");
        params.set("dnt", "1"); // Do not track
        params.set("quality", "1080p");
        if (autoplay) params.set("autoplay", "1");
        if (muted) params.set("muted", "1");
        if (loop) params.set("loop", "1");
        if (hideControls) params.set("controls", "0");
        params.set("pip", "0"); // Disable picture-in-picture
        params.set("vimeo_logo", "0"); // Requires Vimeo Pro/Business
        return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
      }

      case "youtube": {
        // YouTube nocookie for privacy + clean params
        // https://developers.google.com/youtube/player_parameters
        params.set("modestbranding", "1");
        params.set("rel", hideRelated ? "0" : "1");
        params.set("showinfo", hideTitle ? "0" : "1");
        params.set("iv_load_policy", "3"); // Hide annotations
        params.set("disablekb", "0");
        params.set("playsinline", "1");
        if (autoplay) params.set("autoplay", "1");
        if (muted) params.set("mute", "1");
        if (loop) {
          params.set("loop", "1");
          params.set("playlist", videoId);
        }
        if (hideControls) params.set("controls", "0");
        return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
      }

      case "bunny": {
        // Bunny Stream embed
        if (autoplay) params.set("autoplay", "true");
        if (muted) params.set("muted", "true");
        if (loop) params.set("loop", "true");
        if (hideControls) params.set("controls", "false");
        return `https://iframe.mediadelivery.net/embed/${videoId}?${params.toString()}`;
      }

      case "mux": {
        // Mux Video embed
        const muxParams: string[] = [];
        if (autoplay) muxParams.push("autoplay");
        if (muted) muxParams.push("muted");
        if (loop) muxParams.push("loop");
        return `https://stream.mux.com/${videoId}.m3u8${muxParams.length > 0 ? `?${muxParams.join("&")}` : ""}`;
      }

      case "cloudflare": {
        // Cloudflare Stream embed
        if (autoplay) params.set("autoplay", "true");
        if (muted) params.set("muted", "true");
        if (loop) params.set("loop", "true");
        if (hideControls) params.set("controls", "false");
        return `https://iframe.videodelivery.net/${videoId}?${params.toString()}`;
      }

      case "wistia": {
        // Wistia embed with clean params
        const wistiaParams: string[] = [];
        if (autoplay) wistiaParams.push("autoPlay=true");
        if (muted) wistiaParams.push("muted=true");
        if (hideBranding) wistiaParams.push("playerColor=000000");
        wistiaParams.push("playButton=true");
        wistiaParams.push("controlsVisibleOnLoad=false");
        return `https://fast.wistia.net/embed/iframe/${videoId}?${wistiaParams.join("&")}`;
      }

      case "sprout": {
        // Sprout Video embed
        return `https://videos.sproutvideo.com/embed/${videoId}`;
      }

      case "direct": {
        // Direct video URL (MP4, WebM, etc.)
        return videoId;
      }

      default:
        return videoId;
    }
  }, [provider, videoId, embedUrl, autoplay, muted, loop, hideControls, hideTitle, hideBranding, hideRelated]);

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

  // Format duration for display
  const formattedDuration = useMemo(() => {
    if (!duration) return null;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [duration]);

  const handlePlay = useCallback(() => {
    setShowVideo(true);
    onPlay?.();
  }, [onPlay]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Direct video player for direct URLs
  if (provider === "direct") {
    return (
      <div
        className={cn(
          "video-embed relative overflow-hidden rounded-xl bg-black",
          responsive && "w-full",
          aspectRatioClass,
          className
        )}
      >
        <video
          src={cleanEmbedUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          controls={!hideControls}
          playsInline
          onPlay={() => onPlay?.()}
          onEnded={onEnded}
          aria-label={title}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "video-embed group relative overflow-hidden rounded-xl bg-black",
        responsive && "w-full",
        aspectRatioClass,
        className
      )}
    >
      {/* Thumbnail / Play button overlay */}
      {!showVideo && thumbnailUrl && (
        <button
          type="button"
          onClick={handlePlay}
          className="video-embed-overlay absolute inset-0 z-10 flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label={`Play ${title}`}
        >
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Play button - 64px for good touch target */}
          <div className="video-embed-play relative z-10 flex h-16 w-16 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
            <Play className="h-8 w-8 fill-white text-white sm:h-10 sm:w-10" />
          </div>

          {/* Duration badge */}
          {formattedDuration && (
            <span className="video-embed-duration absolute bottom-3 right-3 z-10 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
              {formattedDuration}
            </span>
          )}
        </button>
      )}

      {/* Loading spinner */}
      {showVideo && isLoading && (
        <div className="video-embed-loading absolute inset-0 z-20 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}

      {/* Video iframe */}
      {(showVideo || autoplay) && (
        <iframe
          src={cleanEmbedUrl}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          loading="lazy"
          title={title}
          onLoad={handleIframeLoad}
        />
      )}
    </div>
  );
}

/**
 * Compact video thumbnail for grid displays
 */
interface VideoThumbnailProps {
  thumbnailUrl: string;
  title?: string;
  duration?: number;
  provider?: VideoProvider;
  className?: string;
  onClick?: () => void;
}

export function VideoThumbnail({
  thumbnailUrl,
  title = "Video",
  duration,
  provider,
  className,
  onClick,
}: VideoThumbnailProps) {
  const formattedDuration = useMemo(() => {
    if (!duration) return null;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [duration]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "video-thumbnail group relative aspect-video w-full overflow-hidden rounded-lg bg-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        className
      )}
      aria-label={`Play ${title}`}
    >
      {/* Thumbnail image */}
      <img
        src={thumbnailUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-80"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Play icon - 48px for touch target */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="video-thumbnail-play flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
          <Play className="h-5 w-5 fill-white text-white" />
        </div>
      </div>

      {/* Duration */}
      {formattedDuration && (
        <span className="video-thumbnail-duration absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
          {formattedDuration}
        </span>
      )}

      {/* Provider badge */}
      {provider && (
        <span className="video-thumbnail-provider absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
          {provider}
        </span>
      )}
    </button>
  );
}

export type { VideoProvider, VideoEmbedProps, VideoThumbnailProps };

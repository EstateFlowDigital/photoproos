"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface R2BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Full-resolution image source */
  src: string;
  /** Base64-encoded blur placeholder (from blurDataUrl field) */
  blurDataUrl?: string | null;
  /** Alt text for accessibility */
  alt: string;
  /** Enable lazy loading via Intersection Observer */
  lazy?: boolean;
  /** Root margin for Intersection Observer */
  rootMargin?: string;
  /** Threshold for Intersection Observer */
  threshold?: number;
  /** Duration of blur transition in ms */
  transitionDuration?: number;
  /** Fallback gradient if no blur placeholder */
  fallbackGradient?: string;
  /** Callback when image loads */
  onImageLoad?: () => void;
}

/**
 * R2-compatible image component with blur-up loading effect
 *
 * Displays a low-quality blur placeholder while the full image loads,
 * then smoothly transitions to the full-resolution image.
 *
 * Works with R2/S3 storage (doesn't require Cloudinary transformations).
 */
export function R2BlurImage({
  src,
  blurDataUrl,
  alt,
  className,
  lazy = true,
  rootMargin = "50px",
  threshold = 0.1,
  transitionDuration = 500,
  fallbackGradient = "linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)",
  onImageLoad,
  style,
  ...props
}: R2BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView, rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onImageLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Background style - blur placeholder or gradient fallback
  const backgroundStyle = blurDataUrl
    ? {
        backgroundImage: `url(${blurDataUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: fallbackGradient,
      };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        ...backgroundStyle,
        ...style,
      }}
    >
      {/* Blur layer - visible until image loads */}
      {blurDataUrl && (
        <div
          className="absolute inset-0 transition-opacity"
          style={{
            backgroundImage: `url(${blurDataUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px)",
            transform: "scale(1.2)", // Prevent blur edge artifacts
            opacity: isLoaded ? 0 : 1,
            transitionDuration: `${transitionDuration}ms`,
          }}
        />
      )}

      {/* Actual image - loads in background, fades in when ready */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          style={{
            transitionDuration: `${transitionDuration}ms`,
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          loading={lazy ? "lazy" : "eager"}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--background-secondary)]">
          <ImageErrorIcon className="h-8 w-8 text-foreground-muted/50" />
        </div>
      )}
    </div>
  );
}

// Convenience wrapper for gallery photo grids
interface GalleryImageProps {
  src: string;
  blurDataUrl?: string | null;
  alt: string;
  aspectRatio?: "square" | "video" | "portrait" | "original";
  className?: string;
  onClick?: () => void;
}

export function GalleryImage({
  src,
  blurDataUrl,
  alt,
  aspectRatio = "square",
  className,
  onClick,
}: GalleryImageProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    original: "",
  };

  return (
    <R2BlurImage
      src={src}
      blurDataUrl={blurDataUrl}
      alt={alt}
      className={cn(
        "cursor-pointer rounded-lg",
        aspectClasses[aspectRatio],
        className
      )}
      onClick={onClick}
    />
  );
}

function ImageErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto";
  objectFit?: "cover" | "contain" | "fill" | "none";
  priority?: boolean;
  onClick?: () => void;
}

/**
 * BlurImage component with lazy loading and blur-up placeholder effect
 * Uses Intersection Observer for true lazy loading
 * Works with external URLs (Cloudinary, S3, etc.)
 */
export function BlurImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = "auto",
  objectFit = "cover",
  priority = false,
  onClick,
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate a low-quality placeholder
  // For Cloudinary URLs, we can use their transformation
  const getPlaceholderUrl = (originalSrc: string): string => {
    if (originalSrc.includes("cloudinary.com")) {
      // Add transformation for a tiny blurred version
      return originalSrc.replace(
        "/upload/",
        "/upload/w_20,q_10,e_blur:1000/"
      );
    }
    // For other URLs, use a gradient placeholder
    return "";
  };

  const placeholderUrl = getPlaceholderUrl(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  };

  const objectFitClasses = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "blur-image-container relative overflow-hidden bg-[var(--background-tertiary)]",
        aspectRatioClasses[aspectRatio],
        onClick && "cursor-pointer",
        containerClassName
      )}
      onClick={onClick}
    >
      {/* Blur placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse",
            placeholderUrl
              ? "blur-xl scale-110"
              : "bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)]"
          )}
          style={
            placeholderUrl
              ? {
                  backgroundImage: `url(${placeholderUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
      )}

      {/* Shimmer loading effect */}
      {!isLoaded && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "h-full w-full transition-opacity duration-500",
            objectFitClasses[objectFit],
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-foreground-muted">
          <ImageErrorIcon className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

/**
 * BlurImageGrid - A responsive grid of blur-loading images
 */
interface BlurImageGridProps {
  images: { src: string; alt: string }[];
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  onImageClick?: (index: number) => void;
}

export function BlurImageGrid({
  images,
  columns = 3,
  gap = "md",
  aspectRatio = "landscape",
  onImageClick,
}: BlurImageGridProps) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div className={cn("grid", columnClasses[columns], gapClasses[gap])}>
      {images.map((image, index) => (
        <BlurImage
          key={index}
          src={image.src}
          alt={image.alt}
          aspectRatio={aspectRatio}
          containerClassName="rounded-lg"
          priority={index < 4} // Prioritize first 4 images
          onClick={onImageClick ? () => onImageClick(index) : undefined}
        />
      ))}
    </div>
  );
}

// Error icon component
function ImageErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

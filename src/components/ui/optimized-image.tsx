"use client";

import * as React from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  containerClassName?: string;
  showShimmer?: boolean;
}

/**
 * Optimized image component with shimmer loading effect
 * Wraps Next.js Image with loading state handling
 */
export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  showShimmer = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <div
      className={cn(
        "image-container",
        showShimmer && isLoading && "loading",
        containerClassName
      )}
    >
      <Image
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}

/**
 * Skeleton placeholder for content loading
 */
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "shimmer",
        variant === "circular" && "rounded-full",
        variant === "rounded" && "rounded-lg",
        variant === "text" && "rounded h-4",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

/**
 * Card skeleton for loading states
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6",
        className
      )}
    >
      <Skeleton variant="rounded" className="mb-4 h-40 w-full" />
      <Skeleton variant="text" className="mb-2 h-5 w-3/4" />
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="mt-1 h-4 w-2/3" />
    </div>
  );
}

/**
 * Avatar skeleton for loading states
 */
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

/**
 * Text block skeleton for loading states
 */
export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

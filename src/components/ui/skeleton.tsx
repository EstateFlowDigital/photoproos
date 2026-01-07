"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text" | "image";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  animationType?: "shimmer" | "pulse";
  delay?: number; // For staggered animations (in ms)
}

export function Skeleton({
  className,
  variant = "default",
  width,
  height,
  animate = true,
  animationType = "shimmer",
  delay = 0,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = "bg-[var(--background-elevated)] relative overflow-hidden";

  const variantStyles = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4 w-full",
    image: "rounded-lg aspect-video",
  };

  const animationStyles = {
    shimmer: "shimmer",
    pulse: "animate-pulse",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animate && animationStyles[animationType],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        animationDelay: delay ? `${delay}ms` : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

// Image skeleton with shimmer effect
interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  delay?: number; // For staggered animations (in ms)
}

export function ImageSkeleton({ className, aspectRatio = "video", delay = 0 }: ImageSkeletonProps) {
  const aspectStyles = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-[var(--background-elevated)]",
        aspectStyles[aspectRatio],
        className
      )}
      style={{ animationDelay: delay ? `${delay}ms` : undefined }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 shimmer-skeleton"
        style={{ animationDelay: delay ? `${delay}ms` : undefined }}
      />
      {/* Image icon placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-foreground-muted/30" />
      </div>
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

// Gallery grid skeleton with staggered animation
interface GallerySkeletonProps {
  count?: number;
  staggerDelay?: number; // Delay between each item in ms
  columns?: 2 | 3 | 4 | 5;
}

export function GallerySkeleton({
  count = 6,
  staggerDelay = 50,
  columns = 3
}: GallerySkeletonProps) {
  const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <ImageSkeleton
          key={i}
          aspectRatio="square"
          delay={i * staggerDelay}
        />
      ))}
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

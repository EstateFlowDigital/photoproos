"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PhotoProOSLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "full" | "icon";
}

/**
 * PhotoProOS Logo - Dynamic camera aperture-inspired logo
 * Sophisticated dark-first design aesthetic
 */
export function PhotoProOSLogo({
  className,
  size = "md",
  showText = true,
  variant = "full",
}: PhotoProOSLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-base" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
    xl: { icon: 56, text: "text-3xl" },
  };

  const iconSize = sizes[size].icon;
  const textClass = sizes[size].text;

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center", className)}>
        <PhotoProOSIcon size={iconSize} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <PhotoProOSIcon size={iconSize} />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", textClass)}>
          PhotoPro<span className="text-[var(--primary)]">OS</span>
        </span>
      )}
    </div>
  );
}

/**
 * Camera aperture-inspired icon with animated blades
 * Represents focus, precision, and professional photography
 */
function PhotoProOSIcon({ size = 32 }: { size?: number }) {
  return (
    <div
      className="group relative flex items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 p-1 transition-transform duration-300 hover:scale-105 motion-reduce:transform-none"
      style={{ width: size + 8, height: size + 8 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
        aria-hidden="true"
      >
        {/* Outer ring */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />

        {/* Aperture blades - 6 blade design */}
        <g className="origin-center transition-transform duration-500 group-hover:rotate-[15deg] motion-reduce:transform-none">
          {/* Blade 1 */}
          <path
            d="M16 2 L22 10 L16 10 Z"
            fill="white"
            opacity="0.9"
          />
          {/* Blade 2 */}
          <path
            d="M28.12 10 L24 18 L20 14 Z"
            fill="white"
            opacity="0.8"
          />
          {/* Blade 3 */}
          <path
            d="M28.12 22 L20 20 L22 14 Z"
            fill="white"
            opacity="0.9"
          />
          {/* Blade 4 */}
          <path
            d="M16 30 L10 22 L16 22 Z"
            fill="white"
            opacity="0.8"
          />
          {/* Blade 5 */}
          <path
            d="M3.88 22 L8 14 L12 18 Z"
            fill="white"
            opacity="0.9"
          />
          {/* Blade 6 */}
          <path
            d="M3.88 10 L12 12 L10 18 Z"
            fill="white"
            opacity="0.8"
          />
        </g>

        {/* Center circle (lens) */}
        <circle
          cx="16"
          cy="16"
          r="5"
          fill="white"
          className="drop-shadow-md"
        />

        {/* Inner lens detail */}
        <circle
          cx="16"
          cy="16"
          r="2.5"
          fill="url(#lensGradient)"
        />

        {/* Lens reflection */}
        <circle
          cx="14.5"
          cy="14.5"
          r="1"
          fill="white"
          opacity="0.6"
        />

        <defs>
          <linearGradient id="lensGradient" x1="13" y1="13" x2="19" y2="19">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Minimal version for favicon/small contexts
 */
export function PhotoProOSIconOnly({ size = 32 }: { size?: number }) {
  return <PhotoProOSIcon size={size} />;
}

/**
 * Text-only version for certain layouts
 */
export function PhotoProOSTextLogo({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight text-foreground", className)}>
      PhotoPro<span className="text-[var(--primary)]">OS</span>
    </span>
  );
}

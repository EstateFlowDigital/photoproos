"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline";
  size?: "default" | "sm" | "lg";
  gradient?: string;
  asChild?: boolean;
}

/**
 * Button with animated gradient border
 * Great for CTAs and prominent actions
 */
export function GradientButton({
  children,
  className,
  variant = "primary",
  size = "default",
  gradient = "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
  asChild = false,
  ...props
}: GradientButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const Comp = asChild ? Slot : "button";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  if (variant === "outline") {
    return (
      <div
        className="group relative inline-flex"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient border background */}
        <div
          className={cn(
            "absolute -inset-[2px] rounded-lg opacity-100 transition-opacity duration-300",
            isHovered && "animate-gradient-border"
          )}
          style={{
            background: gradient,
            backgroundSize: "300% 300%",
          }}
        />
        {/* Glow effect on hover */}
        <div
          className="absolute -inset-[2px] rounded-lg opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50"
          style={{
            background: gradient,
            backgroundSize: "300% 300%",
          }}
        />
        <Comp
          className={cn(
            "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] bg-[var(--background)] font-medium text-foreground transition-all duration-300",
            "hover:bg-[var(--background-secondary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
            "disabled:pointer-events-none disabled:opacity-60",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </Comp>
      </div>
    );
  }

  // Primary variant with gradient background
  return (
    <Comp
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium text-foreground transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "disabled:pointer-events-none disabled:opacity-60",
        "hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none",
        "hover:shadow-lg hover:shadow-purple-500/20",
        isHovered && "animate-gradient-bg",
        sizeClasses[size],
        className
      )}
      style={{
        background: gradient,
        backgroundSize: "200% 200%",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </Comp>
  );
}

/**
 * Shimmer button with animated shine effect
 */
interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
  shimmerColor?: string;
  asChild?: boolean;
}

export function ShimmerButton({
  children,
  className,
  size = "default",
  shimmerColor = "rgba(255, 255, 255, 0.4)",
  asChild = false,
  ...props
}: ShimmerButtonProps) {
  const Comp = asChild ? Slot : "button";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <div
      className="shimmer-container group relative inline-block overflow-hidden rounded-lg"
      onMouseEnter={(e) => e.currentTarget.classList.add("is-hovered")}
      onMouseLeave={(e) => e.currentTarget.classList.remove("is-hovered")}
    >
      <Comp
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-foreground font-medium text-[var(--background)] transition-all duration-300",
          "hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          "disabled:pointer-events-none disabled:opacity-60",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </Comp>
      <div
        className="shimmer-effect pointer-events-none absolute inset-0 z-20 -translate-x-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
    </div>
  );
}

/**
 * Pulse button with glow effect
 */
interface PulseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  asChild?: boolean;
}

export function PulseButton({
  children,
  className,
  glowColor = "rgba(59, 130, 246, 0.5)",
  asChild = false,
  ...props
}: PulseButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "pulse-button relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-foreground transition-all duration-300",
        "hover:bg-[var(--primary-hover)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "disabled:pointer-events-none disabled:opacity-60",
        "animate-pulse-glow",
        className
      )}
      style={{
        boxShadow: `0 0 20px ${glowColor}`,
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}

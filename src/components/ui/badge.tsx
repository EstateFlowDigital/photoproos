"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge Component
 *
 * A small label component for status indicators, tags, and labels.
 * Uses semantic design tokens for consistent theming.
 *
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="success">Active</Badge>
 * <Badge variant="ai" pulse>AI Powered</Badge>
 */
const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-[var(--badge-radius)]",
    "font-mono text-xs uppercase tracking-wider",
    "transition-colors duration-[var(--duration-fast)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-[var(--border)] text-[var(--foreground-secondary)]",
        primary: "bg-[var(--primary)]/20 text-[var(--blue-400)]",
        success: "bg-[var(--success-muted)] text-[var(--success-text)]",
        warning: "bg-[var(--warning-muted)] text-[var(--warning-text)]",
        error: "bg-[var(--error-muted)] text-[var(--error-text)]",
        ai: "bg-[var(--ai-muted)] text-[var(--ai-text)]",
        new: "bg-gradient-to-r from-[var(--orange-500)]/20 to-pink-500/20 text-[var(--orange-400)]",
        beta: "bg-[var(--border)] text-[var(--foreground-muted)]",
        outline: "border border-[var(--border-emphasis)] text-[var(--foreground-secondary)] bg-transparent",
      },
      size: {
        default: "h-5 px-2 text-xs",
        sm: "h-4 px-1.5 text-[10px]",
        lg: "h-6 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Adds a subtle pulse animation to draw attention */
  pulse?: boolean;
  /**
   * When true, adds role="status" for live region announcements.
   * Use for dynamic status badges that update (e.g., "Active", "Pending").
   */
  isStatus?: boolean;
  /**
   * For badges that act as tags/labels, provide a category name.
   * Adds aria-label="[category]: [badge text]" for context.
   */
  category?: string;
}

function Badge({
  className,
  variant,
  size,
  pulse,
  isStatus,
  category,
  children,
  ...props
}: BadgeProps) {
  // Build aria-label if category is provided
  const ariaLabel = category && typeof children === "string"
    ? `${category}: ${children}`
    : undefined;

  return (
    <span
      className={cn(
        badgeVariants({ variant, size }),
        pulse && "animate-pulse-slow",
        className
      )}
      role={isStatus ? "status" : undefined}
      aria-live={isStatus ? "polite" : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

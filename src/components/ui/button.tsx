"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button Component
 *
 * A flexible button component with multiple variants and sizes.
 * Uses semantic design tokens for consistent theming.
 *
 * @example
 * <Button variant="default">Primary Action</Button>
 * <Button variant="secondary">Secondary Action</Button>
 * <Button variant="ghost" size="icon"><Icon /></Button>
 */
const buttonVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--button-radius)] text-sm font-medium",
    // Transitions
    "transition-all duration-[var(--duration-fast)]",
    // Focus states (accessible)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Disabled state
    "disabled:pointer-events-none disabled:opacity-50",
    // Interactive feedback
    "active:scale-[0.98] hover:scale-[1.02]",
    // Respect reduced motion
    "motion-reduce:transform-none motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-foreground text-background",
          "hover:bg-foreground/90",
          "shadow-sm hover:shadow-md",
        ].join(" "),
        primary: [
          "bg-[var(--primary)] text-white",
          "hover:bg-[var(--primary)]/90",
          "shadow-sm hover:shadow-md",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-[var(--secondary-hover)]",
          "border border-[var(--secondary-border)]",
        ].join(" "),
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-[var(--ghost-hover)]",
          "hover:scale-100",
        ].join(" "),
        outline: [
          "bg-transparent text-foreground",
          "border border-[var(--border-emphasis)]",
          "hover:bg-[var(--ghost-hover)] hover:border-[var(--border-hover)]",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-[var(--destructive-hover)]",
        ].join(" "),
        danger: [
          "bg-[var(--error)] text-white",
          "hover:bg-[var(--error)]/90",
        ].join(" "),
        "danger-outline": [
          "bg-transparent text-[var(--error)]",
          "border border-[var(--error)]/30",
          "hover:bg-[var(--error)]/10 hover:border-[var(--error)]/50",
        ].join(" "),
        link: [
          "text-foreground underline-offset-4",
          "hover:underline",
          "p-0 hover:scale-100 active:scale-100",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 py-1.5 text-sm",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows loading state with spinner and disables interactions */
  loading?: boolean;
  /** Icon to display on the left side of the button text */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the button text */
  rightIcon?: React.ReactNode;
  /**
   * Required for icon-only buttons (size="icon", "icon-sm", "icon-lg").
   * Provides accessible label for screen readers.
   */
  "aria-label"?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isIconButton = size === "icon" || size === "icon-sm" || size === "icon-lg";

    // Spinner component for loading state
    const Spinner = (
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading || undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            {Spinner}
            {!isIconButton && <span className="sr-only">Loading</span>}
            {!isIconButton && children}
          </>
        ) : (
          <>
            {leftIcon && <span className="h-4 w-4 shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="h-4 w-4 shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

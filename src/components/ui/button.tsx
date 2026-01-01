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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

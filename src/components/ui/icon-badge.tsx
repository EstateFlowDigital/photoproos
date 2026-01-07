"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "default" | "primary" | "success" | "danger" | "warning" | "muted";
type Size = "sm" | "md" | "lg";

interface IconBadgeProps {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  className?: string;
  /** Optional flag to render a softer disabled appearance */
  disabled?: boolean;
}

const toneClasses: Record<Tone, string> = {
  default: "bg-[var(--background-tertiary)] border-[var(--card-border)] text-foreground-muted",
  muted: "bg-[var(--background-secondary)] border-[var(--card-border)] text-foreground-muted",
  primary: "bg-[var(--primary)]/15 border-[var(--primary)]/30 text-[var(--primary)]",
  success: "bg-[var(--success)]/15 border-[var(--success)]/30 text-[var(--success)]",
  danger: "bg-[var(--error)]/15 border-[var(--error)]/30 text-[var(--error)]",
  warning: "bg-[var(--warning)]/15 border-[var(--warning)]/30 text-[var(--warning)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-10 w-10 rounded-xl",
};

export function IconBadge({
  children,
  tone = "default",
  size = "md",
  className,
  disabled = false,
}: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors",
        toneClasses[tone],
        sizeClasses[size],
        disabled && "opacity-60 grayscale",
        className
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";

/**
 * SettingsFormCard
 *
 * A consistent card component for settings pages with an optional icon header.
 * Provides a standardized layout for form sections.
 */

interface SettingsFormCardProps {
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Icon component to display in header */
  icon?: LucideIcon;
  /** Card content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Variant for different styling (default or danger) */
  variant?: "default" | "danger" | "info" | "success";
  /** Optional footer content (e.g., save button) */
  footer?: React.ReactNode;
  /** Whether the card has a sticky footer */
  stickyFooter?: boolean;
}

const variantStyles = {
  default: {
    container: "border-[var(--card-border)] bg-[var(--card)]",
    iconContainer: "bg-[var(--primary)]/10 text-[var(--primary)]",
    title: "text-foreground",
  },
  danger: {
    container: "border-[var(--error)]/30 bg-[var(--error)]/5",
    iconContainer: "bg-[var(--error)]/10 text-[var(--error)]",
    title: "text-[var(--error)]",
  },
  info: {
    container: "border-[var(--primary)]/30 bg-[var(--primary)]/5",
    iconContainer: "bg-[var(--primary)]/10 text-[var(--primary)]",
    title: "text-foreground",
  },
  success: {
    container: "border-[var(--success)]/30 bg-[var(--success)]/5",
    iconContainer: "bg-[var(--success)]/10 text-[var(--success)]",
    title: "text-foreground",
  },
};

export function SettingsFormCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  variant = "default",
  footer,
  stickyFooter = false,
}: SettingsFormCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border",
        styles.container,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 p-6 pb-4">
        {Icon && (
          <IconBadge
            tone={
              variant === "danger"
                ? "danger"
                : variant === "success"
                  ? "success"
                  : "default"
            }
            size="lg"
            className="shrink-0"
          >
            <Icon className="h-5 w-5" />
          </IconBadge>
        )}
        <div className="flex-1 min-w-0">
          <h2 className={cn("text-lg font-semibold", styles.title)}>
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-foreground-muted">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">{children}</div>

      {/* Footer */}
      {footer && (
        <div
          className={cn(
            "border-t border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4",
            stickyFooter && "sticky bottom-0"
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

SettingsFormCard.displayName = "SettingsFormCard";

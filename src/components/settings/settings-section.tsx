"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SettingsSection
 *
 * A wrapper component for grouping related settings fields.
 * Provides consistent spacing and optional section headers.
 */

interface SettingsSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Whether to show a divider above */
  divider?: boolean;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  divider = false,
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        divider && "border-t border-[var(--card-border)] pt-6",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-foreground-muted">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * SettingsField
 *
 * A single field within a settings section with label and optional help text.
 */

interface SettingsFieldProps {
  /** Field label */
  label: string;
  /** Help text displayed below the field */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Field content (input, select, etc.) */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Horizontal layout (label and field side by side) */
  horizontal?: boolean;
}

export function SettingsField({
  label,
  helpText,
  error,
  required,
  children,
  className,
  horizontal = false,
}: SettingsFieldProps) {
  const labelId = React.useId();

  return (
    <div
      className={cn(
        horizontal ? "flex items-start justify-between gap-4" : "space-y-2",
        className
      )}
    >
      <div className={horizontal ? "flex-1" : undefined}>
        <label
          htmlFor={labelId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="ml-1 text-[var(--error)]">*</span>}
        </label>
        {helpText && !horizontal && (
          <p className="mt-1 text-xs text-foreground-muted">{helpText}</p>
        )}
      </div>
      <div className={horizontal ? "w-[300px]" : undefined}>
        {children}
        {error && (
          <p className="mt-1 text-xs text-[var(--error)]">{error}</p>
        )}
        {helpText && horizontal && (
          <p className="mt-1 text-xs text-foreground-muted">{helpText}</p>
        )}
      </div>
    </div>
  );
}

/**
 * SettingsRow
 *
 * A horizontal row for toggle switches or simple on/off settings.
 */

interface SettingsRowProps {
  /** Label text */
  label: string;
  /** Description text */
  description?: string;
  /** Control element (typically a Switch) */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function SettingsRow({
  label,
  description,
  children,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--ghost-hover)]",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

SettingsSection.displayName = "SettingsSection";
SettingsField.displayName = "SettingsField";
SettingsRow.displayName = "SettingsRow";

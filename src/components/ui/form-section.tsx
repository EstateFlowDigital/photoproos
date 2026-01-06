"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Optional description text below the title */
  description?: string;
  /** Form fields and content */
  children: React.ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Whether to render as a card with border */
  variant?: "default" | "card";
}

/**
 * A wrapper component for grouping related form fields.
 * Provides consistent styling for form sections across the application.
 */
export function FormSection({
  title,
  description,
  children,
  className,
  variant = "default",
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        variant === "card" && [
          "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6",
        ],
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
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

export interface FormRowProps {
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Helper text shown below the input */
  hint?: string;
  /** Error message */
  error?: string;
  /** The form input element */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** HTML for attribute to associate label with input */
  htmlFor?: string;
}

/**
 * A row wrapper for individual form fields.
 * Provides label, hint, and error message handling.
 */
export function FormRow({
  label,
  required,
  hint,
  error,
  children,
  className,
  htmlFor,
}: FormRowProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="ml-1 text-[var(--error)]">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-foreground-muted">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface FormGridProps {
  /** Number of columns on larger screens */
  columns?: 1 | 2 | 3 | 4;
  /** Form fields */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * A responsive grid layout for form fields.
 */
export function FormGrid({
  columns = 2,
  children,
  className,
}: FormGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {children}
    </div>
  );
}

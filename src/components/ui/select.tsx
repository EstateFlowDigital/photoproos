"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Select Component
 *
 * A styled select dropdown with optional label, icons, and validation states.
 * Uses semantic design tokens for consistent theming.
 *
 * @example
 * <Select label="Industry" options={[{value: "tech", label: "Technology"}]} />
 * <Select label="Status" error="Please select a status" />
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  leftIcon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, placeholder, options, leftIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const selectId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "mb-2 block text-sm font-medium transition-colors duration-[var(--duration-fast)]",
              isFocused ? "text-foreground" : "text-foreground-secondary",
              error && "text-[var(--error-text)]"
            )}
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center overflow-hidden",
            "rounded-[var(--input-radius)] border bg-[var(--background-elevated)]",
            "transition-all duration-[var(--duration-fast)]",
            isFocused
              ? "border-[var(--input-border-focus)] ring-2 ring-[var(--ring)]/20"
              : "border-[var(--input-border)]",
            error && "border-[var(--error)] ring-2 ring-[var(--error)]/20",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {leftIcon && (
            <div
              className={cn(
                "flex items-center justify-center pl-3 transition-colors duration-[var(--duration-fast)]",
                isFocused ? "text-foreground" : "text-foreground-muted"
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            className={cn(
              "flex-1 appearance-none bg-transparent px-4 py-3 text-sm text-foreground",
              "focus:outline-none disabled:cursor-not-allowed",
              leftIcon && "pl-2",
              "pr-10", // Space for chevron
              !props.value && placeholder && "text-foreground-muted",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error || helperText ? `${selectId}-hint` : undefined}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Chevron Icon */}
          <div
            className={cn(
              "pointer-events-none absolute right-3 flex items-center justify-center transition-colors duration-[var(--duration-fast)]",
              isFocused ? "text-foreground" : "text-foreground-muted"
            )}
            aria-hidden="true"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>
        {(error || helperText) && (
          <p
            id={`${selectId}-hint`}
            className={cn(
              "mt-2 text-xs transition-colors",
              error ? "text-[var(--error-text)]" : "text-foreground-muted"
            )}
            role={error ? "alert" : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export { Select };

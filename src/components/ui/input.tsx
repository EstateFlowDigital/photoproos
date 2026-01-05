"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input Component
 *
 * A text input field with optional label, icons, and validation states.
 * Uses semantic design tokens for consistent theming.
 *
 * @example
 * <Input label="Email" placeholder="you@example.com" />
 * <Input label="Search" leftIcon={<SearchIcon />} />
 * <Input error="This field is required" />
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
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
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent px-4 py-3 text-sm text-foreground",
              "placeholder:text-foreground-muted",
              "focus:outline-none disabled:cursor-not-allowed",
              leftIcon && "pl-2",
              rightIcon && "pr-2",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error || helperText ? `${inputId}-hint` : undefined}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && (
            <div
              className={cn(
                "flex items-center justify-center pr-3 transition-colors duration-[var(--duration-fast)]",
                isFocused ? "text-foreground" : "text-foreground-muted"
              )}
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            id={`${inputId}-hint`}
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
Input.displayName = "Input";

/**
 * Textarea Component
 *
 * A multi-line text input with optional label and validation states.
 * Uses semantic design tokens for consistent theming.
 *
 * @example
 * <Textarea label="Message" placeholder="Write your message..." />
 * <Textarea error="Message is too short" />
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "mb-2 block text-sm font-medium transition-colors duration-[var(--duration-fast)]",
              isFocused ? "text-foreground" : "text-foreground-secondary",
              error && "text-[var(--error-text)]"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "min-h-[120px] w-full resize-none",
            "rounded-[var(--input-radius)] border bg-[var(--background-elevated)]",
            "px-4 py-3 text-sm text-foreground",
            "placeholder:text-foreground-muted",
            "transition-all duration-[var(--duration-fast)]",
            "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            isFocused
              ? "border-[var(--input-border-focus)] ring-2 ring-[var(--ring)]/20"
              : "border-[var(--input-border)]",
            error && "border-[var(--error)] ring-2 ring-[var(--error)]/20",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error || helperText ? `${textareaId}-hint` : undefined}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {(error || helperText) && (
          <p
            id={`${textareaId}-hint`}
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
Textarea.displayName = "Textarea";

export { Input, Textarea };

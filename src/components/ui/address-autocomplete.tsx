"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { searchPlaces, getPlaceDetails } from "@/lib/google-maps/places";
import { isConfigured } from "@/lib/google-maps/client";
import type { PlaceAutocompleteResult, PlaceDetails } from "@/lib/google-maps/types";

/**
 * AddressAutocomplete Component
 *
 * A Google Places-powered address input with autocomplete suggestions.
 * Uses session tokens to optimize billing and reduce API costs.
 *
 * @example
 * <AddressAutocomplete
 *   label="Property Address"
 *   onPlaceSelect={(place) => console.log(place)}
 * />
 */
export interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (place: PlaceDetails) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function AddressAutocomplete({
  label,
  placeholder = "Start typing an address...",
  error,
  helperText,
  value: controlledValue,
  onChange,
  onPlaceSelect,
  disabled = false,
  required = false,
  className,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(controlledValue || "");
  const [suggestions, setSuggestions] = React.useState<PlaceAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [sessionToken, setSessionToken] = React.useState<string>(() => generateSessionToken());
  const [apiConfigured, setApiConfigured] = React.useState(true);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);
  const inputId = React.useId();

  // Check if API is configured on mount
  React.useEffect(() => {
    setApiConfigured(isConfigured());
  }, []);

  // Sync controlled value
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced search
  const searchAddress = React.useCallback(
    async (query: string) => {
      if (!query || query.length < 3 || !apiConfigured) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await searchPlaces(query, sessionToken);
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setHighlightedIndex(-1);
        } catch (err) {
          console.error("Address search error:", err);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [sessionToken, apiConfigured]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    searchAddress(newValue);
  };

  const handleSelect = async (suggestion: PlaceAutocompleteResult) => {
    setIsLoading(true);
    try {
      const details = await getPlaceDetails(suggestion.placeId, sessionToken);
      setInputValue(details.formattedAddress);
      onChange?.(details.formattedAddress);
      onPlaceSelect?.(details);
      setSuggestions([]);
      setIsOpen(false);
      // Generate new session token after selection
      setSessionToken(generateSessionToken());
    } catch (err) {
      console.error("Place details error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow click on suggestion
    setTimeout(() => {
      setIsOpen(false);
      setIsFocused(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Fallback to regular input if API not configured
  if (!apiConfigured) {
    return (
      <div className={cn("w-full", className)}>
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
            {required && <span className="text-[var(--error)] ml-1">*</span>}
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
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="flex items-center justify-center pl-3 text-foreground-muted">
            <MapPinIcon className="h-4 w-4" />
          </div>
          <input
            type="text"
            id={inputId}
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange?.(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent px-3 py-3 text-sm text-foreground",
              "placeholder:text-foreground-muted",
              "focus:outline-none disabled:cursor-not-allowed"
            )}
          />
        </div>
        {(error || helperText) && (
          <p
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

  return (
    <div className={cn("relative w-full", className)}>
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
          {required && <span className="text-[var(--error)] ml-1">*</span>}
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
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center pl-3 transition-colors duration-[var(--duration-fast)]",
            isFocused ? "text-foreground" : "text-foreground-muted"
          )}
        >
          <MapPinIcon className="h-4 w-4" />
        </div>

        <input
          type="text"
          id={inputId}
          ref={inputRef}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `${inputId}-option-${highlightedIndex}`
              : undefined
          }
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent px-3 py-3 text-sm text-foreground",
            "placeholder:text-foreground-muted",
            "focus:outline-none disabled:cursor-not-allowed"
          )}
        />

        {isLoading && (
          <div className="flex items-center justify-center pr-3">
            <LoadingSpinner className="h-4 w-4 text-foreground-muted" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full overflow-hidden",
            "rounded-lg border border-[var(--card-border)] bg-[var(--card)]",
            "shadow-lg max-h-60 overflow-y-auto"
          )}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.placeId}
              id={`${inputId}-option-${index}`}
              role="option"
              aria-selected={highlightedIndex === index}
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "cursor-pointer px-4 py-3 text-sm transition-colors",
                highlightedIndex === index
                  ? "bg-[var(--background-hover)]"
                  : "hover:bg-[var(--background-hover)]"
              )}
            >
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-4 w-4 mt-0.5 text-foreground-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {suggestion.mainText}
                  </p>
                  <p className="text-xs text-foreground-muted truncate">
                    {suggestion.secondaryText}
                  </p>
                </div>
              </div>
            </li>
          ))}
          <li className="px-4 py-2 border-t border-[var(--card-border)]">
            <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted">
              <GoogleIcon className="h-3 w-3" />
              <span>Powered by Google</span>
            </div>
          </li>
        </ul>
      )}

      {(error || helperText) && (
        <p
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

// Generate a unique session token for Google Places billing optimization
function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default AddressAutocomplete;

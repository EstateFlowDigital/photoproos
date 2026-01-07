"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, X, ChevronRight } from "lucide-react";
import {
  getAllSettingsItems,
  findCategoryForHref,
  type SettingsNavItemWithIconName,
} from "@/lib/constants/settings-navigation";
import { SETTINGS_ICON_MAP } from "./settings-icon-map";

/**
 * SettingsSearch
 *
 * A search component that filters through all settings pages.
 * Can be used in the sidebar or as a standalone component.
 */

interface SettingsSearchProps {
  /** Additional className */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show as a compact input */
  compact?: boolean;
  /** Callback when a result is selected */
  onSelect?: () => void;
}

export function SettingsSearch({
  className,
  placeholder = "Search settings...",
  compact = false,
  onSelect,
}: SettingsSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Get all settings items
  const allItems = React.useMemo(() => getAllSettingsItems(), []);

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return allItems.filter((item) => {
      const matchesLabel = item.label.toLowerCase().includes(searchTerm);
      const matchesDescription = item.description
        ?.toLowerCase()
        .includes(searchTerm);
      const category = findCategoryForHref(item.href);
      const matchesCategory = category?.label
        .toLowerCase()
        .includes(searchTerm);
      return matchesLabel || matchesDescription || matchesCategory;
    });
  }, [query, allItems]);

  // Reset selected index when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredItems.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (item: SettingsNavItemWithIconName) => {
    router.push(item.href);
    setQuery("");
    setIsOpen(false);
    onSelect?.();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)]",
            "pl-9 pr-8 text-sm text-foreground placeholder:text-foreground-muted",
            "focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
            "transition-colors",
            compact ? "py-1.5" : "py-2"
          )}
          aria-label="Search settings"
          aria-expanded={isOpen && filteredItems.length > 0}
          aria-controls="settings-search-results"
          role="combobox"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      {!compact && !isOpen && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && filteredItems.length > 0 && (
        <div
          ref={resultsRef}
          id="settings-search-results"
          role="listbox"
          className={cn(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--card-border)]",
            "bg-[var(--card)] shadow-lg",
            "animate-in fade-in-0 slide-in-from-top-2 duration-150"
          )}
        >
          <div className="max-h-80 overflow-y-auto py-2">
            {filteredItems.map((item, index) => {
              const IconComponent = SETTINGS_ICON_MAP[item.iconName];
              const category = findCategoryForHref(item.href);
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "bg-[var(--primary)]/10"
                      : "hover:bg-[var(--ghost-hover)]"
                  )}
                >
                  {IconComponent && (
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-foreground-muted truncate">
                      {category?.label && `${category.label} • `}
                      {item.description || ""}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-foreground-muted" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query && filteredItems.length === 0 && (
        <div
          ref={resultsRef}
          className={cn(
            "absolute z-50 mt-2 w-full rounded-xl border border-[var(--card-border)]",
            "bg-[var(--card)] p-6 text-center shadow-lg"
          )}
        >
          <p className="text-sm text-foreground-muted">
            No settings found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

SettingsSearch.displayName = "SettingsSearch";

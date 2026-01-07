"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { searchHelpArticles } from "@/lib/help/articles";

// ============================================================================
// Types
// ============================================================================

interface HelpSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

interface SearchResult {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
}

// ============================================================================
// Component
// ============================================================================

export function HelpSearch({
  className,
  placeholder = "Search help articles...",
  autoFocus = false,
}: HelpSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Search when query changes
  React.useEffect(() => {
    if (query.trim().length >= 2) {
      const searchResults = searchHelpArticles(query);
      setResults(
        searchResults.slice(0, 5).map((article) => ({
          slug: article.slug,
          categorySlug: article.categorySlug,
          title: article.title,
          description: article.description,
        }))
      );
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          navigateToResult(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToResult = (result: SearchResult) => {
    router.push(`/help/${result.categorySlug}/${result.slug}`);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          aria-label="Search help articles"
          aria-expanded={isOpen}
          aria-controls="help-search-results"
          aria-activedescendant={
            isOpen && results.length > 0 ? `result-${selectedIndex}` : undefined
          }
          role="combobox"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          id="help-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[300px] overflow-y-auto rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-lg"
        >
          {results.map((result, index) => (
            <button
              key={`${result.categorySlug}-${result.slug}`}
              id={`result-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => navigateToResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "flex w-full flex-col items-start px-4 py-3 text-left transition-colors",
                index === selectedIndex
                  ? "bg-[var(--background-hover)]"
                  : "hover:bg-[var(--background-hover)]"
              )}
            >
              <span className="text-sm font-medium text-foreground">
                {result.title}
              </span>
              <span className="mt-0.5 line-clamp-1 text-xs text-foreground-muted">
                {result.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-lg">
          <p className="text-sm text-foreground-muted">
            No articles found for &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

export default HelpSearch;

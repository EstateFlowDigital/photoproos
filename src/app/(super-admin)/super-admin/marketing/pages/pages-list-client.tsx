"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, ExternalLink, Search, X, Filter } from "lucide-react";
import type { MarketingPage } from "@prisma/client";

interface Props {
  pages: MarketingPage[];
}

// Page type configurations
const PAGE_TYPES = [
  { value: "all", label: "All", color: "" },
  { value: "homepage", label: "Homepage", color: "bg-blue-500/10 text-blue-500" },
  { value: "about", label: "About", color: "bg-purple-500/10 text-purple-500" },
  { value: "pricing", label: "Pricing", color: "bg-green-500/10 text-green-500" },
  { value: "features", label: "Features", color: "bg-orange-500/10 text-orange-500" },
  { value: "industries", label: "Industries", color: "bg-cyan-500/10 text-cyan-500" },
  { value: "legal", label: "Legal", color: "bg-gray-500/10 text-gray-400" },
  { value: "blog_index", label: "Blog", color: "bg-pink-500/10 text-pink-500" },
  { value: "contact", label: "Contact", color: "bg-yellow-500/10 text-yellow-500" },
  { value: "custom", label: "Custom", color: "bg-indigo-500/10 text-indigo-500" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

// Page type badge colors
const pageTypeColors: Record<string, string> = {
  homepage: "bg-blue-500/10 text-blue-500",
  about: "bg-purple-500/10 text-purple-500",
  pricing: "bg-green-500/10 text-green-500",
  features: "bg-orange-500/10 text-orange-500",
  industries: "bg-cyan-500/10 text-cyan-500",
  legal: "bg-gray-500/10 text-gray-400",
  blog_index: "bg-pink-500/10 text-pink-500",
  contact: "bg-yellow-500/10 text-yellow-500",
  custom: "bg-indigo-500/10 text-indigo-500",
};

// Status badge with accessibility
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    draft: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    published: "bg-green-500/10 text-green-600 dark:text-green-400",
    archived: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  };

  return (
    <span
      className={cn(
        "text-xs px-2 py-0.5 rounded-full font-medium",
        statusConfig[status as keyof typeof statusConfig]
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Page row component
function PageRow({ page }: { page: MarketingPage }) {
  const publicUrl =
    page.slug === "homepage"
      ? "/"
      : `/${page.slug.replace(/^(features|industries|legal)\//, "$1/")}`;

  return (
    <Link
      href={`/super-admin/marketing/${page.slug}`}
      className={cn(
        "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg",
        "bg-[var(--card)] border border-[var(--border)]",
        "hover:border-[var(--border-hover)] hover:bg-[var(--background-elevated)]",
        "transition-all duration-200",
        "group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[var(--foreground)] truncate">
            {page.title}
          </span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline-flex",
              pageTypeColors[page.pageType]
            )}
          >
            {page.pageType.replace("_", " ")}
          </span>
          <StatusBadge status={page.status} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-[var(--foreground-muted)] truncate">
            /{page.slug}
          </span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "text-[var(--foreground-muted)] hover:text-[var(--primary)]",
              "opacity-0 group-hover:opacity-100 sm:transition-opacity",
              "focus:opacity-100"
            )}
            aria-label={`View ${page.title} live page (opens in new tab)`}
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
      <ChevronRight
        className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />
    </Link>
  );
}

// Filter pill button
function FilterPill({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
        "transition-colors whitespace-nowrap",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        active
          ? "bg-[var(--primary)] text-white"
          : "bg-[var(--background-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
      )}
      aria-pressed={active}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center",
            active
              ? "bg-white/20 text-white"
              : "bg-[var(--background)] text-[var(--foreground-muted)]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function PagesListClient({ pages }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Count pages by type and status
  const counts = useMemo(() => {
    const typeCounts: Record<string, number> = { all: pages.length };
    const statusCounts: Record<string, number> = { all: pages.length };

    pages.forEach((page) => {
      typeCounts[page.pageType] = (typeCounts[page.pageType] || 0) + 1;
      statusCounts[page.status] = (statusCounts[page.status] || 0) + 1;
    });

    return { types: typeCounts, statuses: statusCounts };
  }, [pages]);

  // Filter pages based on search and filters
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        page.title.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType =
        selectedType === "all" || page.pageType === selectedType;

      // Status filter
      const matchesStatus =
        selectedStatus === "all" || page.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [pages, searchQuery, selectedType, selectedStatus]);

  // Group filtered pages by type
  const groupedPages = useMemo(() => {
    const groups: Record<string, MarketingPage[]> = {};

    filteredPages.forEach((page) => {
      const type = page.pageType;
      if (!groups[type]) groups[type] = [];
      groups[type].push(page);
    });

    return groups;
  }, [filteredPages]);

  // Order of page types to display
  const typeOrder = [
    "homepage",
    "about",
    "pricing",
    "features",
    "industries",
    "legal",
    "blog_index",
    "contact",
    "custom",
  ];

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery || selectedType !== "all" || selectedStatus !== "all";

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedStatus("all");
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title or slug..."
            aria-label="Search pages"
            className={cn(
              "w-full pl-10 pr-10 py-2.5 rounded-lg text-sm",
              "bg-[var(--background)] border border-[var(--border)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
              "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[var(--background-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by page type">
          {PAGE_TYPES.filter(
            (type) => type.value === "all" || counts.types[type.value]
          ).map((type) => (
            <FilterPill
              key={type.value}
              active={selectedType === type.value}
              onClick={() => setSelectedType(type.value)}
              count={counts.types[type.value]}
            >
              {type.label}
            </FilterPill>
          ))}
        </div>

        {/* Status filter and clear button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter
              className="w-4 h-4 text-[var(--foreground-muted)]"
              aria-hidden="true"
            />
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm",
                "bg-[var(--background)] border border-[var(--border)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1",
                "text-[var(--foreground)]"
              )}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}{" "}
                  {option.value !== "all" &&
                    counts.statuses[option.value] &&
                    `(${counts.statuses[option.value]})`}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[var(--foreground-muted)]" aria-live="polite">
        Showing {filteredPages.length} of {pages.length} page
        {pages.length !== 1 ? "s" : ""}
        {hasActiveFilters && " (filtered)"}
      </p>

      {/* Pages list */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--foreground-muted)]">No pages found</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 text-sm text-[var(--primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              Clear filters to see all pages
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {typeOrder.map((type) => {
            const typePages = groupedPages[type];
            if (!typePages || typePages.length === 0) return null;

            const typeLabel =
              PAGE_TYPES.find((t) => t.value === type)?.label ||
              type.replace("_", " ");

            return (
              <section key={type} aria-labelledby={`section-${type}`}>
                <h2
                  id={`section-${type}`}
                  className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3"
                >
                  {typeLabel} Pages ({typePages.length})
                </h2>
                <div className="space-y-2" role="list">
                  {typePages.map((page) => (
                    <div key={page.id} role="listitem">
                      <PageRow page={page} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

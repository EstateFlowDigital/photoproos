"use client";

import { useState, useMemo } from "react";
import { GalleryCard } from "@/components/dashboard/gallery-card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Gallery {
  id: string;
  name: string;
  client: string;
  photos: number;
  status: "delivered" | "pending" | "draft";
  revenue?: string;
  thumbnailUrl?: string;
  createdAt?: string;
}

interface GalleryListClientProps {
  galleries: Gallery[];
  filter: "all" | "delivered" | "pending" | "draft";
}

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "revenue-high" | "revenue-low";
type ViewMode = "grid" | "list";

export function GalleryListClient({ galleries, filter }: GalleryListClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Parse revenue string to number for sorting
  const parseRevenue = (revenue?: string) => {
    if (!revenue) return 0;
    return parseInt(revenue.replace(/[$,]/g, ""), 10);
  };

  // Filter and sort galleries
  const displayedGalleries = useMemo(() => {
    let result = [...galleries];

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((g) => g.status === filter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(searchLower) ||
          g.client.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        case "oldest":
          return (a.createdAt || "").localeCompare(b.createdAt || "");
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "revenue-high":
          return parseRevenue(b.revenue) - parseRevenue(a.revenue);
        case "revenue-low":
          return parseRevenue(a.revenue) - parseRevenue(b.revenue);
        default:
          return 0;
      }
    });

    return result;
  }, [galleries, filter, search, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "revenue-high", label: "Revenue (High)" },
    { value: "revenue-low", label: "Revenue (Low)" },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search galleries or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort & View Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-3 pr-10 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-[var(--primary)] text-white"
                  : "text-foreground-muted hover:text-foreground"
              )}
              title="Grid view"
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-colors",
                viewMode === "list"
                  ? "bg-[var(--primary)] text-white"
                  : "text-foreground-muted hover:text-foreground"
              )}
              title="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {search && (
        <p className="text-sm text-foreground-muted">
          {displayedGalleries.length} result{displayedGalleries.length !== 1 ? "s" : ""} for "{search}"
        </p>
      )}

      {/* Gallery Display */}
      {displayedGalleries.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedGalleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                id={gallery.id}
                title={gallery.name}
                client={gallery.client}
                photos={gallery.photos}
                status={gallery.status}
                revenue={gallery.revenue}
                thumbnailUrl={gallery.thumbnailUrl}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Gallery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Photos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {displayedGalleries.map((gallery) => (
                  <tr
                    key={gallery.id}
                    className="hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/galleries/${gallery.id}`}
                        className="flex items-center gap-3"
                      >
                        {gallery.thumbnailUrl && (
                          <img
                            src={gallery.thumbnailUrl}
                            alt=""
                            className="h-10 w-14 rounded-md object-cover"
                          />
                        )}
                        <span className="text-sm font-medium text-foreground hover:text-[var(--primary)]">
                          {gallery.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {gallery.client}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {gallery.photos}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          gallery.status === "delivered" && "bg-[var(--success)]/10 text-[var(--success)]",
                          gallery.status === "pending" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                          gallery.status === "draft" && "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                        )}
                      >
                        {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {gallery.revenue || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <GalleryPlaceholderIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {search ? "No galleries found" : "No galleries yet"}
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search
              ? `No galleries match "${search}"`
              : filter === "all"
              ? "Create your first gallery to get started."
              : `No ${filter} galleries found.`}
          </p>
          {!search && (
            <Link
              href="/galleries/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Gallery
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

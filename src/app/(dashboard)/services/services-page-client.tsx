"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { serviceCategories, formatServicePrice, type ServiceCategory } from "@/lib/services";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SelectableServiceCard,
  SelectableServiceRow,
  type SelectableService,
} from "@/components/dashboard/selectable-service-card";
import { ServicesBulkActions } from "@/components/dashboard/services-bulk-actions";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { SearchIcon, CheckIcon, MinusIcon, PlusIcon, PackageIcon } from "@/components/ui/icons";

interface ServicesPageClientProps {
  services: SelectableService[];
}

type SortOption = "name-asc" | "name-desc" | "price-high" | "price-low" | "usage" | "newest";

export function ServicesPageClient({ services }: ServicesPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectionMode = selectedIds.size > 0;

  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          (s.deliverables || []).some((d) => d.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter((s) => s.isActive);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-high":
          return b.priceCents - a.priceCents;
        case "price-low":
          return a.priceCents - b.priceCents;
        case "usage":
          return (b.usageCount || 0) - (a.usageCount || 0);
        case "newest":
        default:
          return 0;
      }
    });

    return filtered;
  }, [services, searchQuery, selectedCategory, sortBy, showInactive]);

  const categories: { id: ServiceCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...Object.entries(serviceCategories).map(([key, value]) => ({
      id: key as ServiceCategory,
      label: value.label,
    })),
  ];

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredServices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredServices.map((s) => s.id)));
    }
  }, [filteredServices, selectedIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleNavigate = useCallback(
    (id: string) => {
      router.push(`/services/${id}`);
    },
    [router]
  );

  const handleActionComplete = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:w-auto"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-high">Price (High)</option>
          <option value="price-low">Price (Low)</option>
          <option value="usage">Most Used</option>
        </select>

        {/* View Toggle */}
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          {categories.map((category) => {
            const count =
              category.id === "all"
                ? services.filter((s) => showInactive || s.isActive).length
                : services.filter(
                    (s) => s.category === category.id && (showInactive || s.isActive)
                  ).length;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  selectedCategory === category.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                )}
              >
                {category.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    selectedCategory === category.id
                      ? "bg-white/20"
                      : "bg-[var(--background-secondary)]"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Show Inactive Toggle */}
        <label className="flex items-center gap-2 text-sm text-foreground-muted cursor-pointer whitespace-nowrap">
          <Checkbox
            checked={showInactive}
            onCheckedChange={(checked) => setShowInactive(checked === true)}
          />
          Show inactive
        </label>
      </div>

      {/* Selection Bar (when items exist) */}
      {filteredServices.length > 0 && (
        <div className="flex flex-col gap-2 border-b border-[var(--card-border)] py-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                selectedIds.size === filteredServices.length && filteredServices.length > 0
                  ? "bg-[var(--primary)] border-[var(--primary)]"
                  : selectedIds.size > 0
                  ? "bg-[var(--primary)]/50 border-[var(--primary)]"
                  : "border-[var(--card-border)] bg-[var(--background)]"
              )}
            >
              {selectedIds.size === filteredServices.length && filteredServices.length > 0 && (
                <CheckIcon className="h-3 w-3 text-white" />
              )}
              {selectedIds.size > 0 && selectedIds.size < filteredServices.length && (
                <MinusIcon className="h-3 w-3 text-white" />
              )}
            </div>
            {selectedIds.size === 0
              ? "Select all"
              : selectedIds.size === filteredServices.length
              ? "Deselect all"
              : `${selectedIds.size} selected`}
          </button>

          <p className="text-sm text-foreground-muted">
            {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"}
            {(searchQuery || selectedCategory !== "all") && " found"}
          </p>
        </div>
      )}

      {/* Service Grid/List */}
      {filteredServices.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <PackageIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No services found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {searchQuery
              ? "Try adjusting your search or filters."
              : "Create your first service to get started."}
          </p>
          <Link
            href="/services/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Service
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="auto-grid grid-min-240 grid-gap-4">
          {filteredServices.map((service) => (
            <SelectableServiceCard
              key={service.id}
              service={service}
              isSelected={selectedIds.has(service.id)}
              onSelect={handleSelect}
              selectionMode={selectionMode}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[var(--background-secondary)] border-b border-[var(--card-border)]">
              <tr>
                <th className="px-4 py-3 w-12"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider hidden md:table-cell">
                  Duration
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-foreground-muted uppercase tracking-wider hidden lg:table-cell">
                  Usage
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-foreground-muted uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredServices.map((service) => (
                <SelectableServiceRow
                  key={service.id}
                  service={service}
                  isSelected={selectedIds.has(service.id)}
                  onSelect={handleSelect}
                  selectionMode={selectionMode}
                  onNavigate={handleNavigate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Actions */}
      <ServicesBulkActions
        selectedIds={Array.from(selectedIds)}
        onClearSelection={handleClearSelection}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}


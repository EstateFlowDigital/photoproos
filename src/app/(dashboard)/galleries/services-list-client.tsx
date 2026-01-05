"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { serviceCategories, formatServicePrice, type ServiceCategory } from "@/lib/services";
import { Checkbox } from "@/components/ui/checkbox";

interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  priceCents: number;
  duration: string | null;
  deliverables: string[];
  isActive: boolean;
  isDefault: boolean;
  usageCount?: number;
}

interface ServicesListClientProps {
  services: Service[];
}

type SortOption = "name-asc" | "name-desc" | "price-high" | "price-low" | "usage" | "newest";

export function ServicesListClient({ services }: ServicesListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showInactive, setShowInactive] = useState(false);

  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.deliverables.some((d) => d.toLowerCase().includes(query))
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

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          className="h-10 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-high">Price (High)</option>
          <option value="price-low">Price (Low)</option>
          <option value="usage">Most Used</option>
        </select>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-[var(--card-border)] p-1 bg-[var(--background)]">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <GridIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              viewMode === "list"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          {categories.map((category) => {
            const count = category.id === "all"
              ? services.filter(s => showInactive || s.isActive).length
              : services.filter(s => s.category === category.id && (showInactive || s.isActive)).length;

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

      {/* Results Info */}
      {(searchQuery || selectedCategory !== "all") && (
        <p className="text-sm text-foreground-muted">
          {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} found
        </p>
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
            href="/galleries/services/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Service
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="auto-grid grid-min-240 grid-gap-4">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[var(--background-secondary)] border-b border-[var(--card-border)]">
              <tr>
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
                <ServiceRow key={service.id} service={service} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const categoryInfo = serviceCategories[service.category];

  return (
    <Link
      href={`/galleries/services/${service.id}`}
      className={cn(
        "group block rounded-xl border bg-[var(--card)] p-5 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg",
        service.isActive ? "border-[var(--card-border)]" : "border-dashed opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", categoryInfo.color)}>
              {categoryInfo.label}
            </span>
            {service.isDefault && (
              <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                Template
              </span>
            )}
            {!service.isActive && (
              <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                Inactive
              </span>
            )}
          </div>
          <h3
            className="font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors line-clamp-2 sm:line-clamp-1"
            title={service.name}
          >
            {service.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-foreground">{formatServicePrice(service.priceCents)}</p>
          {service.duration && (
            <p className="text-xs text-foreground-muted">{service.duration}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {service.description && (
        <p className="mt-3 text-sm text-foreground-muted line-clamp-2">{service.description}</p>
      )}

      {/* Deliverables */}
      {service.deliverables.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {service.deliverables.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-foreground">
              <CheckIcon className="h-3.5 w-3.5 text-[var(--success)] shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
          {service.deliverables.length > 3 && (
            <p className="text-xs text-foreground-muted pl-5">
              +{service.deliverables.length - 3} more
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-foreground-muted">
        <span>Used in {service.usageCount || 0} galleries</span>
        <span className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
          Edit →
        </span>
      </div>
    </Link>
  );
}

function ServiceRow({ service }: { service: Service }) {
  const categoryInfo = serviceCategories[service.category];

  return (
    <tr className="hover:bg-[var(--background-hover)] transition-colors">
      <td className="px-4 py-3">
        <Link href={`/galleries/services/${service.id}`} className="hover:text-[var(--primary)] transition-colors">
          <p className="font-medium text-foreground">{service.name}</p>
          {service.description && (
            <p className="text-xs text-foreground-muted truncate max-w-xs">{service.description}</p>
          )}
        </Link>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", categoryInfo.color)}>
          {categoryInfo.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-semibold text-foreground">{formatServicePrice(service.priceCents)}</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-foreground-muted">{service.duration || "—"}</span>
      </td>
      <td className="px-4 py-3 text-center hidden lg:table-cell">
        <span className="text-sm text-foreground-muted">{service.usageCount || 0}</span>
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        {service.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--foreground-muted)]/10 px-2 py-0.5 text-xs font-medium text-foreground-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted" />
            Inactive
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/galleries/services/${service.id}`}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-foreground-muted hover:bg-[var(--background)] hover:text-foreground transition-colors"
        >
          Edit
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </td>
    </tr>
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
      <path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4.167a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 4.166a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 4.167a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

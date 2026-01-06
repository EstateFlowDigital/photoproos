"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { duplicateBundle } from "@/lib/actions/bundles";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface BundleService {
  id: string;
  serviceId: string;
  serviceName: string;
  servicePriceCents: number;
  serviceCategory: string;
  isRequired: boolean;
  quantity: number;
  sortOrder: number;
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  bundleType: string;
  imageUrl: string | null;
  badgeText: string | null;
  originalPriceCents: number | null;
  savingsPercent: number | null;
  isActive: boolean;
  isPublic: boolean;
  services: BundleService[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BundleListProps {
  initialBundles: Bundle[];
}


const bundleTypeInfo = {
  fixed: { label: "Fixed", color: "bg-blue-500/10 text-blue-400" },
  tiered: { label: "Tiered", color: "bg-purple-500/10 text-purple-400" },
  custom: { label: "Custom", color: "bg-amber-500/10 text-amber-400" },
};

export function BundleList({ initialBundles }: BundleListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [bundles] = useState(initialBundles);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "fixed" | "tiered" | "custom">("all");
  const [showDuplicateModal, setShowDuplicateModal] = useState<string | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateSlug, setDuplicateSlug] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter bundles based on search and filters
  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bundle.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && bundle.isActive) ||
        (statusFilter === "inactive" && !bundle.isActive);

      // Type filter
      const matchesType =
        typeFilter === "all" || bundle.bundleType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bundles, searchQuery, statusFilter, typeFilter]);

  const activeCount = useMemo(() => bundles.filter((b) => b.isActive).length, [bundles]);

  // Generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  // Duplicate handler
  const handleDuplicate = useCallback(
    async (id: string) => {
      setIsProcessing(true);
      try {
        const result = await duplicateBundle(id, duplicateName || undefined, duplicateSlug || undefined);

        if (result.success) {
          showToast("Bundle duplicated successfully", "success");
          router.refresh();
        } else {
          showToast(result.error, "error");
        }
      } catch {
        showToast("Failed to duplicate bundle", "error");
      } finally {
        setIsProcessing(false);
        setShowDuplicateModal(null);
        setDuplicateName("");
        setDuplicateSlug("");
      }
    },
    [duplicateName, duplicateSlug, router, showToast]
  );

  const openDuplicateModal = useCallback((id: string) => {
    const bundle = bundles.find((b) => b.id === id);
    if (bundle) {
      const newName = `${bundle.name} (Copy)`;
      setDuplicateName(newName);
      setDuplicateSlug(generateSlug(newName));
      setShowDuplicateModal(id);
    }
  }, [bundles, generateSlug]);

  const handleNameChange = useCallback((name: string) => {
    setDuplicateName(name);
    setDuplicateSlug(generateSlug(name));
  }, [generateSlug]);

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bundles..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="all">All Status</option>
          <option value="active">Active ({activeCount})</option>
          <option value="inactive">Inactive ({bundles.length - activeCount})</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="all">All Types</option>
          <option value="fixed">Fixed Price</option>
          <option value="tiered">Tiered</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Results Count */}
      {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
        <p className="text-sm text-foreground-muted">
          Showing {filteredBundles.length} of {bundles.length} bundles
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}

      {/* Grid */}
      {filteredBundles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          {bundles.length === 0 ? (
            <>
              <div className="mx-auto rounded-full bg-[var(--primary)]/10 p-4 w-fit mb-4">
                <CubeIcon className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No bundles yet</h3>
              <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
                Create service bundles to offer package deals and increase your average order value.
              </p>
              <Link
                href="/services/bundles/new"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PlusIcon className="h-4 w-4" />
                Create Your First Bundle
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto rounded-full bg-[var(--foreground-muted)]/10 p-4 w-fit mb-4">
                <SearchIcon className="h-8 w-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No matching bundles</h3>
              <p className="mt-2 text-sm text-foreground-muted">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="mt-4 text-sm text-[var(--primary)] hover:underline"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBundles.map((bundle) => {
            const typeInfo = bundleTypeInfo[bundle.bundleType as keyof typeof bundleTypeInfo];
            return (
              <div
                key={bundle.id}
                className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
              >
                {/* Action Menu */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openDuplicateModal(bundle.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[var(--background-hover)] text-foreground-muted hover:text-foreground transition-colors"
                    title="Duplicate"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>

                <Link href={`/services/bundles/${bundle.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {bundle.badgeText && (
                          <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                            {bundle.badgeText}
                          </span>
                        )}
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", typeInfo.color)}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground truncate group-hover:text-[var(--primary)] transition-colors">
                        {bundle.name}
                      </h3>
                      {bundle.description && (
                        <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                          {bundle.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        bundle.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {bundle.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-semibold text-foreground">
                      {formatCurrency(bundle.priceCents)}
                    </span>
                    {bundle.savingsPercent && bundle.savingsPercent > 0 && (
                      <span className="text-sm text-[var(--success)]">
                        Save {bundle.savingsPercent}%
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">
                        {bundle.services.length} service{bundle.services.length !== 1 ? "s" : ""} included
                      </span>
                      {bundle.usageCount > 0 && (
                        <span className="text-foreground-muted">
                          {bundle.usageCount} order{bundle.usageCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Duplicate Bundle</h3>
            <p className="text-sm text-foreground-muted mb-4">
              Create a copy of this bundle with a new name and URL slug.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="duplicateName" className="block text-sm font-medium text-foreground mb-1.5">
                  New Bundle Name
                </label>
                <input
                  type="text"
                  id="duplicateName"
                  value={duplicateName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label htmlFor="duplicateSlug" className="block text-sm font-medium text-foreground mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  id="duplicateSlug"
                  value={duplicateSlug}
                  onChange={(e) => setDuplicateSlug(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(null);
                  setDuplicateName("");
                  setDuplicateSlug("");
                }}
                disabled={isProcessing}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDuplicate(showDuplicateModal)}
                disabled={isProcessing || !duplicateName.trim() || !duplicateSlug.trim()}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isProcessing ? "Duplicating..." : "Duplicate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

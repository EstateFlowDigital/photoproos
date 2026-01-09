"use client";

import { useTransition, useState, useMemo } from "react";
import Link from "next/link";
import { createProductCatalog } from "@/lib/actions/products";
import { cn } from "@/lib/utils";
import { Search, X, Package, CheckCircle, Clock, Archive } from "lucide-react";

interface CatalogCardProps {
  id: string;
  name: string;
  description: string | null;
  status: string;
  tags: string[];
  _count: { products: number };
  updatedAt: Date;
}

interface ProductsClientProps {
  catalogs: CatalogCardProps[];
}

type StatusFilter = "all" | "active" | "draft" | "archived";

export function ProductsClient({ catalogs }: ProductsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Filter catalogs by search query and status
  const filteredCatalogs = useMemo(() => {
    return catalogs.filter((catalog) => {
      // Status filter
      if (statusFilter !== "all" && catalog.status !== statusFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const catalogName = (catalog.name || "").toLowerCase();
        const catalogDesc = catalog.description?.toLowerCase() || "";
        const tags = (catalog.tags || []).join(" ").toLowerCase();
        return catalogName.includes(query) || catalogDesc.includes(query) || tags.includes(query);
      }
      return true;
    });
  }, [catalogs, searchQuery, statusFilter]);

  // Stats for summary cards
  const stats = useMemo(() => {
    return {
      total: catalogs.length,
      active: catalogs.filter((c) => c.status === "active").length,
      draft: catalogs.filter((c) => c.status === "draft").length,
      totalProducts: catalogs.reduce((acc, c) => acc + c._count.products, 0),
    };
  }, [catalogs]);

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    return {
      all: catalogs.length,
      active: catalogs.filter((c) => c.status === "active").length,
      draft: catalogs.filter((c) => c.status === "draft").length,
      archived: catalogs.filter((c) => c.status === "archived").length,
    };
  }, [catalogs]);

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      const result = await createProductCatalog({
        name,
        description,
        tags: [],
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setName("");
      setDescription("");
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Product Catalogs</h1>
          <p className="text-sm text-foreground-secondary">
            Track SKU shoots, variants, and approvals for e-commerce clients.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground">Catalog name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spring 2025 Collection"
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Platform specs, deliverables, notes"
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={isPending || !name}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Create Catalog"}
          </button>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-foreground-muted">Total Catalogs</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/15 text-[var(--success)]">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-foreground-muted">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/15 text-[var(--warning)]">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.draft}</p>
              <p className="text-xs text-foreground-muted">Drafts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/15 text-[var(--ai)]">
              <Archive className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalProducts}</p>
              <p className="text-xs text-foreground-muted">Total Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search catalogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5">
          {(["all", "active", "draft", "archived"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                statusFilter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={cn(
                "rounded-full px-1.5 text-[10px]",
                statusFilter === status ? "bg-white/20" : "bg-[var(--background)]"
              )}>
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Catalogs Grid */}
      <div className="auto-grid grid-min-240 grid-gap-4">
        {catalogs.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No catalogs yet</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Create your first product catalog to start tracking SKUs.
            </p>
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-10 text-center">
            <Search className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No catalogs found</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              {searchQuery
                ? `No catalogs match "${searchQuery}".`
                : `No ${statusFilter} catalogs.`}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredCatalogs.map((catalog) => (
            <Link
              key={catalog.id}
              href={`/products/${catalog.id}`}
              className="flex flex-col gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition hover:border-[var(--primary)]/50"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-foreground">{catalog.name}</h3>
                <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                  {catalog.status}
                </span>
              </div>
              {catalog.description && (
                <p className="text-sm text-foreground-secondary line-clamp-2">{catalog.description}</p>
              )}
              <div className="flex flex-col gap-1 text-sm text-foreground-secondary sm:flex-row sm:items-center sm:justify-between">
                <span>{catalog._count.products} products</span>
                <span>
                  Updated {new Date(catalog.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

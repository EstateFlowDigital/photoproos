"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { createProductCatalog } from "@/lib/actions/products";

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

export function ProductsClient({ catalogs }: ProductsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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

      <div className="auto-grid grid-min-240 grid-gap-4">
        {catalogs.length === 0 ? (
          <div className="col-span-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center text-foreground-secondary">
            No catalogs yet. Create your first product catalog to start tracking SKUs.
          </div>
        ) : (
          catalogs.map((catalog) => (
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

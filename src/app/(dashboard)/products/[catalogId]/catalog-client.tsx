"use client";

import { useState, useTransition } from "react";
import { createProduct } from "@/lib/actions/products";

interface CatalogClientProps {
  catalog: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    products: Array<{
      id: string;
      sku: string;
      name: string;
      category: string | null;
      status: string;
      angles: string[];
      photos: Array<{
        id: string;
        angle: string;
        isPrimary: boolean;
        asset: {
          id: string;
          filename: string;
          thumbnailUrl: string | null;
          originalUrl: string;
        };
      }>;
      variants: Array<{
        id: string;
        name: string | null;
        color: string | null;
        size: string | null;
      }>;
      updatedAt: Date;
    }>;
  };
}

export function CatalogClient({ catalog }: CatalogClientProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    angles: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleCreateProduct = () => {
    setError(null);
    startTransition(async () => {
      const angles = form.angles
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const result = await createProduct({
        catalogId: catalog.id,
        sku: form.sku,
        name: form.name,
        category: form.category || undefined,
        angles,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setForm({ sku: "", name: "", category: "", angles: "" });
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{catalog.name}</h1>
            {catalog.description && <p className="text-sm text-foreground-secondary">{catalog.description}</p>}
          </div>
          <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
            {catalog.status}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Add product</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-foreground">SKU</label>
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              placeholder="SKU-123"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              placeholder="Shoes, Apparel..."
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-foreground">Required angles (comma separated)</label>
            <input
              value={form.angles}
              onChange={(e) => setForm({ ...form, angles: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              placeholder="front, back, side_left, lifestyle"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCreateProduct}
            disabled={isPending || !form.sku || !form.name}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
          >
            {isPending ? "Adding..." : "Add Product"}
          </button>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Products</h2>
          <span className="text-sm text-foreground-secondary">{catalog.products.length} items</span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--card-border)]">
          <table className="min-w-[720px] w-full divide-y divide-[var(--card-border)]">
            <thead className="bg-[var(--background)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-secondary">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-secondary">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-secondary">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-secondary">Angles</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-secondary">Photos</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-secondary">Variants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)] bg-[var(--card)]">
              {catalog.products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-foreground-secondary">
                    No products yet. Add your first SKU above.
                  </td>
                </tr>
              ) : (
                catalog.products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-medium capitalize text-[var(--primary)]">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {product.angles.length > 0 ? product.angles.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {product.photos.length} photo{product.photos.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {product.variants.length === 0
                        ? "—"
                        : product.variants
                            .map((v) => [v.name, v.color, v.size].filter(Boolean).join(" "))
                            .join(" • ")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

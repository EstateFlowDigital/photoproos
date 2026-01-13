"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Frame,
  Maximize,
  Palette,
  Image,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WallArtProduct {
  id: string;
  name: string;
  type: "canvas" | "metal" | "acrylic" | "framed";
  client: string;
  project: string;
  image: string;
  size: string;
  frame?: string;
  status: "draft" | "ordered" | "production" | "shipped" | "delivered";
  price: number;
  orderedAt: string | null;
}

const typeConfig = {
  canvas: { label: "Canvas", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  metal: { label: "Metal Print", color: "text-slate-300", bg: "bg-slate-300/10" },
  acrylic: { label: "Acrylic", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  framed: { label: "Framed Print", color: "text-amber-400", bg: "bg-amber-400/10" },
};

const statusConfig = {
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
  ordered: { label: "Ordered", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  production: { label: "In Production", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  shipped: { label: "Shipped", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  delivered: { label: "Delivered", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
};

const mockProducts: WallArtProduct[] = [
  {
    id: "1",
    name: "Sunset Over Mountains",
    type: "canvas",
    client: "Sarah Mitchell",
    project: "Mitchell Wedding",
    image: "/api/placeholder/400/300",
    size: "24x36",
    status: "delivered",
    price: 450,
    orderedAt: "2025-01-02",
  },
  {
    id: "2",
    name: "Downtown Skyline",
    type: "metal",
    client: "Mark Thompson",
    project: "Cityscape Series",
    image: "/api/placeholder/400/300",
    size: "30x20",
    status: "production",
    price: 380,
    orderedAt: "2025-01-08",
  },
  {
    id: "3",
    name: "Family Portrait",
    type: "framed",
    client: "Emily Roberts",
    project: "Roberts Family",
    image: "/api/placeholder/400/300",
    size: "16x20",
    frame: "Black Wood",
    status: "shipped",
    price: 320,
    orderedAt: "2025-01-06",
  },
  {
    id: "4",
    name: "Abstract Architecture",
    type: "acrylic",
    client: "James Chen",
    project: "Modern Spaces",
    image: "/api/placeholder/400/300",
    size: "40x30",
    status: "ordered",
    price: 650,
    orderedAt: "2025-01-10",
  },
  {
    id: "5",
    name: "Beachscape Trio",
    type: "canvas",
    client: "Amanda White",
    project: "Coastal Collection",
    image: "/api/placeholder/400/300",
    size: "20x30",
    status: "draft",
    price: 280,
    orderedAt: null,
  },
  {
    id: "6",
    name: "Romantic Kiss",
    type: "framed",
    client: "Sarah Mitchell",
    project: "Mitchell Wedding",
    image: "/api/placeholder/400/300",
    size: "11x14",
    frame: "White Matted",
    status: "delivered",
    price: 220,
    orderedAt: "2024-12-20",
  },
];

export function WallArtClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || product.type === typeFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalRevenue = mockProducts
    .filter((p) => p.status !== "draft")
    .reduce((sum, p) => sum + p.price, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCreate = () => {
    toast({
      title: "Create Wall Art",
      description: "Opening wall art designer...",
    });
  };

  const handleAction = (action: string, product: WallArtProduct) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${product.name}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Frame className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockProducts.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Products</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <ShoppingCart className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <Package className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {mockProducts.filter((p) => p.status === "production" || p.status === "shipped").length}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">In Progress</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Maximize className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {mockProducts.filter((p) => p.status === "delivered").length}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search wall art..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="canvas">Canvas</option>
            <option value="metal">Metal Print</option>
            <option value="acrylic">Acrylic</option>
            <option value="framed">Framed Print</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="ordered">Ordered</option>
            <option value="production">In Production</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Wall Art
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)]/30 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] bg-[var(--background-secondary)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="h-12 w-12 text-[var(--foreground-muted)]" />
              </div>
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConfig[product.type].bg} ${typeConfig[product.type].color}`}>
                  {typeConfig[product.type].label}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[product.status].bg} ${statusConfig[product.status].color}`}>
                  {statusConfig[product.status].label}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                <Maximize className="h-3 w-3" />
                {product.size}"
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-[var(--foreground)] truncate">{product.name}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] truncate">{product.client}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                    className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === product.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      <button
                        onClick={() => handleAction("View Details", product)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      <button
                        onClick={() => handleAction("Edit Product", product)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleAction("Room Visualization", product)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Palette className="h-4 w-4" /> Room Preview
                      </button>
                      {product.status === "draft" && (
                        <button
                          onClick={() => handleAction("Order Product", product)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <ShoppingCart className="h-4 w-4" /> Place Order
                        </button>
                      )}
                      <hr className="my-1 border-[var(--card-border)]" />
                      <button
                        onClick={() => handleAction("Delete Product", product)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {formatCurrency(product.price)}
                </p>
                {product.frame && (
                  <span className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                    <Frame className="h-3 w-3" />
                    {product.frame}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                {product.project}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Frame className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No wall art found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || typeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first wall art product to get started"}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Create Wall Art
          </button>
        </div>
      )}
    </div>
  );
}

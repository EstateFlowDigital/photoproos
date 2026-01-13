"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  DollarSign,
  ShoppingCart,
  FileText,
  Image,
  Key,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DigitalProduct {
  id: string;
  name: string;
  type: "preset" | "lut" | "guide" | "template" | "bundle";
  price: number;
  status: "active" | "draft" | "archived";
  sales: number;
  revenue: number;
  downloads: number;
  fileSize: string;
  description: string;
  createdAt: string;
}

const typeConfig = {
  preset: { label: "Preset Pack", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", icon: Image },
  lut: { label: "LUT", color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10", icon: Image },
  guide: { label: "Guide/eBook", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", icon: FileText },
  template: { label: "Template", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", icon: FileText },
  bundle: { label: "Bundle", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10", icon: Package },
};

const statusConfig = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
  archived: { label: "Archived", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
};

const mockProducts: DigitalProduct[] = [
  {
    id: "1",
    name: "Film Emulation Preset Pack",
    type: "preset",
    price: 49,
    status: "active",
    sales: 234,
    revenue: 11466,
    downloads: 312,
    fileSize: "15 MB",
    description: "25 Lightroom presets inspired by classic film stocks",
    createdAt: "2024-06-15",
  },
  {
    id: "2",
    name: "Cinematic LUT Collection",
    type: "lut",
    price: 39,
    status: "active",
    sales: 156,
    revenue: 6084,
    downloads: 189,
    fileSize: "8 MB",
    description: "10 professional LUTs for video editing",
    createdAt: "2024-08-20",
  },
  {
    id: "3",
    name: "Photography Business Guide",
    type: "guide",
    price: 79,
    status: "active",
    sales: 89,
    revenue: 7031,
    downloads: 89,
    fileSize: "45 MB",
    description: "Complete guide to starting your photography business",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Wedding Album Template",
    type: "template",
    price: 29,
    status: "active",
    sales: 178,
    revenue: 5162,
    downloads: 201,
    fileSize: "120 MB",
    description: "20 customizable wedding album layouts",
    createdAt: "2024-09-05",
  },
  {
    id: "5",
    name: "Ultimate Creator Bundle",
    type: "bundle",
    price: 149,
    status: "active",
    sales: 45,
    revenue: 6705,
    downloads: 67,
    fileSize: "250 MB",
    description: "All presets, LUTs, and templates in one package",
    createdAt: "2024-11-01",
  },
  {
    id: "6",
    name: "Portrait Retouching Presets",
    type: "preset",
    price: 35,
    status: "draft",
    sales: 0,
    revenue: 0,
    downloads: 0,
    fileSize: "10 MB",
    description: "Professional portrait editing presets",
    createdAt: "2025-01-10",
  },
];

export function DigitalProductsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || product.type === typeFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalRevenue = mockProducts.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = mockProducts.reduce((sum, p) => sum + p.sales, 0);
  const activeProducts = mockProducts.filter((p) => p.status === "active").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCreate = () => {
    toast({
      title: "Create Product",
      description: "Opening product creation form...",
    });
  };

  const handleAction = (action: string, product: DigitalProduct) => {
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
              <Package className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{activeProducts}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Active Products</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <DollarSign className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <ShoppingCart className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalSales}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Sales</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <Download className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {mockProducts.reduce((sum, p) => sum + p.downloads, 0)}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">Downloads</p>
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
              placeholder="Search products..."
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
            <option value="preset">Presets</option>
            <option value="lut">LUTs</option>
            <option value="guide">Guides</option>
            <option value="template">Templates</option>
            <option value="bundle">Bundles</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const TypeIcon = typeConfig[product.type].icon;

          return (
            <div
              key={product.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-5 hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeConfig[product.type].bg}`}>
                    <TypeIcon className={`h-5 w-5 ${typeConfig[product.type].color}`} />
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig[product.type].bg} ${typeConfig[product.type].color}`}>
                      {typeConfig[product.type].label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[product.status].bg} ${statusConfig[product.status].color}`}>
                    {statusConfig[product.status].label}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                      className="rounded p-1 hover:bg-[var(--background-secondary)]"
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
                          onClick={() => handleAction("View Purchases", product)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <ShoppingCart className="h-4 w-4" /> View Purchases
                        </button>
                        <button
                          onClick={() => handleAction("Generate License", product)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Key className="h-4 w-4" /> Generate License
                        </button>
                        <hr className="my-1 border-[var(--card-border)]" />
                        <button
                          onClick={() => handleAction("Delete", product)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="mt-3 font-semibold text-[var(--foreground)]">{product.name}</h3>
              <p className="mt-1 text-sm text-[var(--foreground-muted)] line-clamp-2">{product.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-2xl font-bold text-[var(--foreground)]">{formatCurrency(product.price)}</p>
                <span className="text-xs text-[var(--foreground-muted)]">{product.fileSize}</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--card-border)] pt-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-[var(--foreground)]">{product.sales}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[var(--success)]">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[var(--foreground)]">{product.downloads}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Downloads</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No products found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || typeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first digital product to start selling"}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      )}
    </div>
  );
}

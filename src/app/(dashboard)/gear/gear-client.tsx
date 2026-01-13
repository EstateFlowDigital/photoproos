"use client";

import { useState } from "react";
import {
  Camera,
  Package,
  DollarSign,
  AlertTriangle,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Wrench,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type GearCategory = "camera" | "lens" | "lighting" | "audio" | "accessory" | "computer";
type GearStatus = "active" | "maintenance" | "retired";

interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: GearStatus;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  notes: string;
  insuranceValue: number;
}

const MOCK_GEAR: GearItem[] = [
  {
    id: "1",
    name: "Sony A7R V",
    category: "camera",
    brand: "Sony",
    model: "A7R V",
    serialNumber: "SN-1234567890",
    purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    purchasePrice: 3898,
    currentValue: 3500,
    status: "active",
    lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Primary wedding camera",
    insuranceValue: 3898,
  },
  {
    id: "2",
    name: "Sony 24-70mm f/2.8 GM II",
    category: "lens",
    brand: "Sony",
    model: "FE 24-70mm f/2.8 GM II",
    serialNumber: "SN-2345678901",
    purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    purchasePrice: 2298,
    currentValue: 2100,
    status: "active",
    lastMaintenance: null,
    nextMaintenance: null,
    notes: "Main workhorse lens",
    insuranceValue: 2298,
  },
  {
    id: "3",
    name: "Sony 70-200mm f/2.8 GM II",
    category: "lens",
    brand: "Sony",
    model: "FE 70-200mm f/2.8 GM OSS II",
    serialNumber: "SN-3456789012",
    purchaseDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    purchasePrice: 2798,
    currentValue: 2500,
    status: "active",
    lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Ceremony and reception lens",
    insuranceValue: 2798,
  },
  {
    id: "4",
    name: "Profoto B10 Plus Kit",
    category: "lighting",
    brand: "Profoto",
    model: "B10 Plus Duo Kit",
    serialNumber: "SN-4567890123",
    purchaseDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    purchasePrice: 3990,
    currentValue: 3200,
    status: "active",
    lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Studio and location lighting",
    insuranceValue: 3990,
  },
  {
    id: "5",
    name: "Sony A7 III",
    category: "camera",
    brand: "Sony",
    model: "A7 III",
    serialNumber: "SN-5678901234",
    purchaseDate: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000).toISOString(),
    purchasePrice: 1998,
    currentValue: 1200,
    status: "maintenance",
    lastMaintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: null,
    notes: "Backup camera - shutter being replaced",
    insuranceValue: 1998,
  },
  {
    id: "6",
    name: "MacBook Pro 16\"",
    category: "computer",
    brand: "Apple",
    model: "MacBook Pro 16\" M3 Max",
    serialNumber: "SN-6789012345",
    purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    purchasePrice: 3499,
    currentValue: 3200,
    status: "active",
    lastMaintenance: null,
    nextMaintenance: null,
    notes: "Primary editing workstation",
    insuranceValue: 3499,
  },
];

const CATEGORY_CONFIG: Record<GearCategory, { label: string; color: string; bg: string }> = {
  camera: { label: "Camera", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  lens: { label: "Lens", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  lighting: { label: "Lighting", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  audio: { label: "Audio", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  accessory: { label: "Accessory", color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10" },
  computer: { label: "Computer", color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10" },
};

const STATUS_CONFIG: Record<GearStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  maintenance: { label: "In Maintenance", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  retired: { label: "Retired", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function GearClient() {
  const { showToast } = useToast();
  const [gear, setGear] = useState<GearItem[]>(MOCK_GEAR);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<GearCategory | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredGear = gear.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (gearId: string) => {
    setGear((prev) => prev.filter((g) => g.id !== gearId));
    showToast("Gear item removed", "success");
    setOpenMenuId(null);
  };

  const handleToggleStatus = (gearId: string) => {
    setGear((prev) =>
      prev.map((g) =>
        g.id === gearId
          ? { ...g, status: g.status === "active" ? "maintenance" : "active" }
          : g
      )
    );
    showToast("Gear status updated", "success");
    setOpenMenuId(null);
  };

  const stats = {
    totalItems: gear.length,
    totalValue: gear.filter((g) => g.status !== "retired").reduce((sum, g) => sum + g.currentValue, 0),
    insuranceValue: gear.filter((g) => g.status !== "retired").reduce((sum, g) => sum + g.insuranceValue, 0),
    inMaintenance: gear.filter((g) => g.status === "maintenance").length,
  };

  const needsMaintenance = gear.filter(
    (g) => g.nextMaintenance && new Date(g.nextMaintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Items</p>
            <Package className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalItems}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Current Value</p>
            <DollarSign className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.totalValue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Insurance Value</p>
            <DollarSign className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.insuranceValue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">In Maintenance</p>
            <Wrench className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.inMaintenance}</p>
        </div>
      </div>

      {/* Maintenance Alert */}
      {needsMaintenance > 0 && (
        <div className="card p-4 bg-[var(--warning)]/5 border-[var(--warning)]/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
            <span className="text-sm text-[var(--warning)] font-medium">
              {needsMaintenance} item{needsMaintenance > 1 ? "s" : ""} due for maintenance soon
            </span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search gear..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as GearCategory | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Gear
        </Button>
      </div>

      {/* Gear List */}
      {filteredGear.length === 0 ? (
        <div className="card p-12 text-center">
          <Camera className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No gear found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first piece of gear to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGear.map((item) => {
            const categoryConfig = CATEGORY_CONFIG[item.category];
            const statusConfig = STATUS_CONFIG[item.status];
            const depreciation = Math.round(((item.purchasePrice - item.currentValue) / item.purchasePrice) * 100);

            return (
              <div key={item.id} className="card p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
                        {categoryConfig.label}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                        >
                          {item.status === "active" ? (
                            <>
                              <Wrench className="h-4 w-4" />
                              Mark Maintenance
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Mark Active
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Brand/Model</span>
                    <span className="text-foreground">{item.brand} {item.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Current Value</span>
                    <span className="text-foreground font-medium">{formatCurrency(item.currentValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Depreciation</span>
                    <span className="text-[var(--error)]">-{depreciation}%</span>
                  </div>
                </div>

                {item.nextMaintenance && (
                  <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center gap-2 text-xs text-foreground-muted">
                    <Calendar className="h-3 w-3" />
                    <span>Maintenance due {formatDate(item.nextMaintenance)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

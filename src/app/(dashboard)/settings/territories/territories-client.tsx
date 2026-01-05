"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceTerritory } from "@/lib/actions/territories";
import {
  createTerritory,
  updateTerritory,
  deleteTerritory,
  toggleTerritoryStatus,
} from "@/lib/actions/territories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TerritoriesClientProps {
  initialTerritories: ServiceTerritory[];
  services: { id: string; name: string }[];
}

// Territory colors for visual distinction
const TERRITORY_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
];

export function TerritoriesClient({ initialTerritories, services }: TerritoriesClientProps): JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [territories, setTerritories] = useState<ServiceTerritory[]>(initialTerritories);
  const [showModal, setShowModal] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<ServiceTerritory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    zipCodes: "",
    pricingModifier: "1.0",
    travelFee: "",
    color: TERRITORY_COLORS[0].value,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      zipCodes: "",
      pricingModifier: "1.0",
      travelFee: "",
      color: TERRITORY_COLORS[0].value,
      isActive: true,
    });
    setEditingTerritory(null);
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (territory: ServiceTerritory) => {
    setEditingTerritory(territory);
    setFormData({
      name: territory.name,
      description: territory.description || "",
      zipCodes: territory.zipCodes.join(", "),
      pricingModifier: territory.pricingModifier.toString(),
      travelFee: territory.travelFee ? (territory.travelFee / 100).toString() : "",
      color: territory.color || TERRITORY_COLORS[0].value,
      isActive: territory.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Territory name is required");
      return;
    }

    const zipCodesArray = formData.zipCodes
      .split(/[,\s]+/)
      .map((z) => z.trim())
      .filter((z) => z.length > 0);

    if (zipCodesArray.length === 0) {
      setError("At least one ZIP code is required");
      return;
    }

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      zipCodes: zipCodesArray,
      pricingModifier: parseFloat(formData.pricingModifier) || 1.0,
      travelFee: formData.travelFee ? Math.round(parseFloat(formData.travelFee) * 100) : undefined,
      isActive: formData.isActive,
    };

    startTransition(async () => {
      try {
        if (editingTerritory) {
          const result = await updateTerritory(editingTerritory.id, data);
          if (result.success) {
            setTerritories((prev) =>
              prev.map((t) => (t.id === editingTerritory.id ? result.data : t))
            );
            closeModal();
            router.refresh();
          } else {
            setError(result.error);
          }
        } else {
          const result = await createTerritory(data);
          if (result.success) {
            setTerritories((prev) => [...prev, result.data]);
            closeModal();
            router.refresh();
          } else {
            setError(result.error);
          }
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const result = await deleteTerritory(id);
      if (result.success) {
        setTerritories((prev) => prev.filter((t) => t.id !== id));
        setDeleteConfirm(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    startTransition(async () => {
      const result = await toggleTerritoryStatus(id);
      if (result.success) {
        setTerritories((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
        );
        router.refresh();
      }
    });
  };

  const activeTerritories = territories.filter((t) => t.isActive);
  const inactiveTerritories = territories.filter((t) => !t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Service Territories</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Define zones with custom pricing and travel fees based on ZIP codes
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <PlusIcon className="h-4 w-4" />
          Add Territory
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Territories</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{territories.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Active</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">{activeTerritories.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total ZIP Codes</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {territories.reduce((sum, t) => sum + t.zipCodes.length, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Services</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{services.length}</p>
        </div>
      </div>

      {/* Territories List */}
      {territories.length > 0 ? (
        <div className="space-y-4">
          {/* Active Territories */}
          {activeTerritories.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
              <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Active Territories ({activeTerritories.length})
                </h2>
              </div>
              <div className="divide-y divide-[var(--card-border)]">
                {activeTerritories.map((territory) => (
                  <TerritoryRow
                    key={territory.id}
                    territory={territory}
                    onEdit={() => openEditModal(territory)}
                    onDelete={() => setDeleteConfirm(territory.id)}
                    onToggleStatus={() => handleToggleStatus(territory.id)}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Territories */}
          {inactiveTerritories.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden opacity-75">
              <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-3">
                <h2 className="text-sm font-semibold text-foreground-muted">
                  Inactive Territories ({inactiveTerritories.length})
                </h2>
              </div>
              <div className="divide-y divide-[var(--card-border)]">
                {inactiveTerritories.map((territory) => (
                  <TerritoryRow
                    key={territory.id}
                    territory={territory}
                    onEdit={() => openEditModal(territory)}
                    onDelete={() => setDeleteConfirm(territory.id)}
                    onToggleStatus={() => handleToggleStatus(territory.id)}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <MapIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No territories yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Create your first territory to set up zone-based pricing.
          </p>
          <Button variant="primary" onClick={openCreateModal} className="mt-6">
            <PlusIcon className="h-4 w-4" />
            Add First Territory
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editingTerritory ? "Edit Territory" : "Create Territory"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
                <p className="text-sm text-[var(--error)]">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Territory Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Downtown Zone, Premium Area"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                ZIP Codes <span className="text-[var(--error)]">*</span>
              </label>
              <textarea
                value={formData.zipCodes}
                onChange={(e) => setFormData({ ...formData, zipCodes: e.target.value })}
                placeholder="Enter ZIP codes separated by commas or spaces (e.g., 90210, 90211, 90212)"
                rows={3}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                {formData.zipCodes.split(/[,\s]+/).filter((z) => z.trim()).length} ZIP codes entered
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Price Modifier
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricingModifier}
                    onChange={(e) => setFormData({ ...formData, pricingModifier: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">
                    multiplier
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground-muted">
                  1.0 = base price, 1.1 = +10%, 0.9 = -10%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Travel Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-muted">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.travelFee}
                    onChange={(e) => setFormData({ ...formData, travelFee: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <p className="mt-1 text-xs text-foreground-muted">
                  Optional flat fee added for this zone
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Color</label>
              <div className="flex flex-wrap gap-2">
                {TERRITORY_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={cn(
                      "h-8 w-8 rounded-lg border-2 transition-all",
                      formData.color === color.value
                        ? "border-white scale-110"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
              />
              <label htmlFor="isActive" className="text-sm text-foreground">
                Territory is active
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button variant="outline" type="button" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isPending} className="flex-1">
                {isPending ? "Saving..." : editingTerritory ? "Save Changes" : "Create Territory"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent size="sm">
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error)]/10">
              <TrashIcon className="h-6 w-6 text-[var(--error)]" />
            </div>
            <DialogTitle className="mt-4 text-lg font-semibold text-foreground">
              Delete Territory?
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-foreground-muted">
              This will permanently delete this territory. Any bookings or orders using this zone will need to be updated manually.
            </DialogDescription>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={isPending} className="flex-1">
                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Territory Row Component
function TerritoryRow({
  territory,
  onEdit,
  onDelete,
  onToggleStatus,
  isPending,
}: {
  territory: ServiceTerritory;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isPending: boolean;
}) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="group flex items-center gap-4 px-6 py-4 hover:bg-[var(--background-hover)]">
      {/* Color indicator */}
      <div
        className="h-10 w-10 shrink-0 rounded-lg"
        style={{ backgroundColor: territory.color || "#3b82f6" }}
      />

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{territory.name}</h3>
          {!territory.isActive && (
            <span className="inline-flex rounded-full bg-[var(--foreground-muted)]/10 px-2 py-0.5 text-xs font-medium text-foreground-muted">
              Inactive
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-foreground-muted truncate">
          {territory.zipCodes.length} ZIP code{territory.zipCodes.length !== 1 ? "s" : ""}
          {territory.description && ` • ${territory.description}`}
        </p>
      </div>

      {/* Pricing info */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs uppercase text-foreground-muted">Modifier</p>
          <p className="font-medium text-foreground">
            {territory.pricingModifier === 1.0
              ? "Base"
              : territory.pricingModifier > 1
                ? `+${((territory.pricingModifier - 1) * 100).toFixed(0)}%`
                : `-${((1 - territory.pricingModifier) * 100).toFixed(0)}%`}
          </p>
        </div>
        {territory.travelFee !== null && territory.travelFee > 0 && (
          <div className="text-right">
            <p className="text-xs uppercase text-foreground-muted">Travel Fee</p>
            <p className="font-medium text-foreground">{formatCurrency(territory.travelFee)}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggleStatus}
          disabled={isPending}
          className={cn(
            "rounded-lg p-2 transition-colors",
            territory.isActive
              ? "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              : "text-[var(--success)] hover:bg-[var(--success)]/10"
          )}
          title={territory.isActive ? "Deactivate" : "Activate"}
        >
          {territory.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        </button>
        <button
          onClick={onEdit}
          className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
          title="Edit"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
    </svg>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ServiceTerritory,
  createTerritory,
  deleteTerritory,
  toggleTerritoryStatus,
} from "@/lib/actions/territories";
import { toast } from "sonner";
import { Plus, MapPin, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  priceCents: number;
}

interface TerritoriesClientProps {
  initialTerritories: ServiceTerritory[];
  services: Service[];
}

export function TerritoriesClient({
  initialTerritories,
  services,
}: TerritoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [territories, setTerritories] = useState(initialTerritories);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreate = async (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      zipCodes: (formData.get("zipCodes") as string).split(",").map((z) => z.trim()).filter(Boolean),
      pricingModifier: parseFloat(formData.get("pricingModifier") as string) || 1.0,
    };

    startTransition(async () => {
      const result = await createTerritory(data);
      if (result.success && result.data) {
        setTerritories([...territories, result.data]);
        setShowAddForm(false);
        toast.success("Territory created");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create territory");
      }
    });
  };

  const handleToggle = async (id: string) => {
    startTransition(async () => {
      const result = await toggleTerritoryStatus(id);
      if (result.success) {
        setTerritories(
          territories.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
        );
        toast.success("Territory updated");
      } else {
        toast.error(result.error || "Failed to update territory");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this territory?")) return;

    startTransition(async () => {
      const result = await deleteTerritory(id);
      if (result.success) {
        setTerritories(territories.filter((t) => t.id !== id));
        toast.success("Territory deleted");
      } else {
        toast.error(result.error || "Failed to delete territory");
      }
    });
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Service Territories</h1>
          <p className="settings-description">
            Define service areas with zone-based pricing adjustments
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
          disabled={isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Territory
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-6">
          <form action={handleCreate} className="space-y-4 p-4">
            <div>
              <label className="form-label">Name</label>
              <input
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="e.g., Downtown Metro"
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-input"
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div>
              <label className="form-label">ZIP Codes</label>
              <input
                name="zipCodes"
                type="text"
                required
                className="form-input"
                placeholder="e.g., 90210, 90211, 90212"
              />
              <p className="form-hint">Comma-separated list of ZIP codes</p>
            </div>
            <div>
              <label className="form-label">Pricing Modifier</label>
              <input
                name="pricingModifier"
                type="number"
                step="0.01"
                min="0"
                defaultValue="1.0"
                className="form-input"
              />
              <p className="form-hint">1.0 = no change, 1.1 = 10% increase</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                Create Territory
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {territories.length === 0 ? (
          <div className="card p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-medium mb-2">No territories defined</h3>
            <p className="text-muted mb-4">
              Create service territories to set up zone-based pricing
            </p>
          </div>
        ) : (
          territories.map((territory) => (
            <div key={territory.id} className="card">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      territory.isActive ? "bg-primary/10" : "bg-muted/10"
                    }`}
                  >
                    <MapPin
                      className={`w-5 h-5 ${
                        territory.isActive ? "text-primary" : "text-muted"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{territory.name}</h3>
                    <p className="text-sm text-muted">
                      {territory.zipCodes.length} ZIP codes
                      {territory.pricingModifier !== 1.0 &&
                        ` • ${(territory.pricingModifier * 100 - 100).toFixed(0)}% modifier`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(territory.id)}
                    className="btn btn-ghost btn-sm"
                    disabled={isPending}
                  >
                    {territory.isActive ? (
                      <ToggleRight className="w-5 h-5 text-success" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(territory.id)}
                    className="btn btn-ghost btn-sm text-error"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="border-t border-border px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {territory.zipCodes.slice(0, 10).map((zip) => (
                    <span key={zip} className="badge badge-secondary">
                      {zip}
                    </span>
                  ))}
                  {territory.zipCodes.length > 10 && (
                    <span className="badge badge-muted">
                      +{territory.zipCodes.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

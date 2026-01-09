"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from "@/lib/actions/equipment";
import { PlusIcon, EditIcon, TrashIcon, CameraIcon } from "@/components/ui/settings-icons";

type EquipmentCategory =
  | "camera"
  | "lens"
  | "lighting"
  | "drone"
  | "tripod"
  | "audio"
  | "stabilizer"
  | "backdrop"
  | "other";

interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string | null;
  serialNumber: string | null;
  valueCents: number | null;
  userAssignments: {
    user: {
      id: string;
      fullName: string | null;
    };
  }[];
}

interface EquipmentListProps {
  initialEquipment: Record<string, Equipment[]>;
}

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  camera: "Cameras",
  lens: "Lenses",
  lighting: "Lighting",
  drone: "Drones",
  tripod: "Tripods & Supports",
  audio: "Audio Equipment",
  stabilizer: "Stabilizers & Gimbals",
  backdrop: "Backdrops & Sets",
  other: "Other Equipment",
};

const CATEGORY_ICONS: Record<EquipmentCategory, React.ReactNode> = {
  camera: <CameraIcon className="h-5 w-5" />,
  lens: <LensIcon className="h-5 w-5" />,
  lighting: <LightingIcon className="h-5 w-5" />,
  drone: <DroneIcon className="h-5 w-5" />,
  tripod: <TripodIcon className="h-5 w-5" />,
  audio: <AudioIcon className="h-5 w-5" />,
  stabilizer: <StabilizerIcon className="h-5 w-5" />,
  backdrop: <BackdropIcon className="h-5 w-5" />,
  other: <OtherIcon className="h-5 w-5" />,
};

export function EquipmentList({ initialEquipment }: EquipmentListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "camera" as EquipmentCategory,
    description: "",
    serialNumber: "",
    valueCents: "",
  });

  const openAddModal = () => {
    setEditingEquipment(null);
    setFormData({
      name: "",
      category: "camera",
      description: "",
      serialNumber: "",
      valueCents: "",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormData({
      name: equipment.name,
      category: equipment.category,
      description: equipment.description || "",
      serialNumber: equipment.serialNumber || "",
      valueCents: equipment.valueCents ? (equipment.valueCents / 100).toString() : "",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Equipment name is required");
      return;
    }

    startTransition(async () => {
      const data = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        serialNumber: formData.serialNumber.trim() || null,
        valueCents: formData.valueCents ? Math.round(parseFloat(formData.valueCents) * 100) : null,
      };

      let result;
      if (editingEquipment) {
        result = await updateEquipment({ id: editingEquipment.id, ...data });
      } else {
        result = await createEquipment(data);
      }

      if (result.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete equipment",
      description: "Are you sure you want to delete this equipment? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteEquipment(id);
      if (result.success) {
        showToast("Equipment deleted successfully", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete equipment", "error");
      }
    });
  };

  const categories = Object.keys(CATEGORY_LABELS) as EquipmentCategory[];
  const hasAnyEquipment = Object.values(initialEquipment).some((arr) => arr.length > 0);

  return (
    <div className="space-y-6">
      {/* Add Equipment Button */}
      <div className="flex flex-col items-stretch sm:items-end">
        <Button variant="primary" onClick={openAddModal}>
          <PlusIcon className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Empty State */}
      {!hasAnyEquipment && (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-[var(--background)] flex items-center justify-center mb-4">
            <CameraIcon className="h-6 w-6 text-foreground-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No equipment added</h3>
          <p className="text-sm text-foreground-muted mb-6 max-w-sm mx-auto">
            Track your photography equipment, assign it to team members, and link it to service requirements.
          </p>
          <Button variant="primary" onClick={openAddModal}>
            <PlusIcon className="h-4 w-4" />
            Add Your First Equipment
          </Button>
        </div>
      )}

      {/* Equipment by Category */}
      {hasAnyEquipment && (
        <div className="space-y-6">
          {categories.map((category) => {
            const items = initialEquipment[category] || [];
            if (items.length === 0) return null;

            return (
              <div key={category} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
                {/* Category Header */}
                <div className="px-6 py-4 border-b border-[var(--card-border)] bg-[var(--background)]">
                  <div className="flex items-center gap-3">
                    <div className="text-foreground-muted">{CATEGORY_ICONS[category]}</div>
                    <h3 className="font-semibold text-foreground">{CATEGORY_LABELS[category]}</h3>
                    <span className="rounded-full bg-[var(--background-hover)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Equipment List */}
                <div className="divide-y divide-[var(--card-border)]">
                  {items.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{equipment.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          {equipment.serialNumber && (
                            <span className="text-xs text-foreground-muted">S/N: {equipment.serialNumber}</span>
                          )}
                          {equipment.valueCents && (
                            <span className="text-xs text-foreground-muted">
                              ${(equipment.valueCents / 100).toLocaleString()}
                            </span>
                          )}
                          {equipment.userAssignments.length > 0 && (
                            <span className="text-xs text-[var(--primary)]">
                              Assigned to {equipment.userAssignments.map((a) => a.user.fullName || "User").join(", ")}
                            </span>
                          )}
                        </div>
                        {equipment.description && (
                          <p className="text-sm text-foreground-muted mt-1 line-clamp-1">{equipment.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
                        <button
                          onClick={() => openEditModal(equipment)}
                          aria-label={`Edit ${equipment.name}`}
                          className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(equipment.id)}
                          disabled={isPending}
                          aria-label={`Delete ${equipment.name}`}
                          className="p-2 rounded-lg text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {error && (
              <div className="mb-4 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
                <p className="text-sm text-[var(--error)]">{error}</p>
              </div>
            )}

            <form id="equipment-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="equipment-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="equipment-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sony A7R V"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="equipment-category" className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <select
                  id="equipment-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="equipment-serial" className="block text-sm font-medium text-foreground mb-1.5">Serial Number</label>
                <input
                  type="text"
                  id="equipment-serial"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="equipment-value" className="block text-sm font-medium text-foreground mb-1.5">Value ($)</label>
                <input
                  type="number"
                  id="equipment-value"
                  step="0.01"
                  min="0"
                  value={formData.valueCents}
                  onChange={(e) => setFormData({ ...formData, valueCents: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="equipment-description" className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  id="equipment-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Optional notes about this equipment"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="equipment-form" disabled={isPending}>
              {isPending ? "Saving..." : editingEquipment ? "Save Changes" : "Add Equipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Equipment-specific icons (not in shared library)
function LensIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" />
    </svg>
  );
}

function LightingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 8ZM14 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 8ZM7.172 13.89a.75.75 0 0 1-1.061-1.062l1.06-1.06a.75.75 0 0 1 1.062 1.06l-1.06 1.061ZM12.828 10.828a.75.75 0 0 1 0 1.061l-1.06 1.06a.75.75 0 0 1-1.062-1.06l1.061-1.06a.75.75 0 0 1 1.06 0ZM8 17a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 8 17Z" />
      <path fillRule="evenodd" d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function DroneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5V5a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1V3.5A1.5 1.5 0 0 0 4 2h-.5ZM15.5 2A1.5 1.5 0 0 0 14 3.5V5a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1V3.5A1.5 1.5 0 0 0 16 2h-.5ZM3.5 14A1.5 1.5 0 0 0 2 15.5V17a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-1.5A1.5 1.5 0 0 0 4 14h-.5ZM15.5 14a1.5 1.5 0 0 0-1.5 1.5V17a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-1.5a1.5 1.5 0 0 0-1.5-1.5H16ZM6 8.5A1.5 1.5 0 0 1 7.5 7h5A1.5 1.5 0 0 1 14 8.5v3a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 6 11.5v-3Z" />
    </svg>
  );
}

function TripodIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 6a1 1 0 0 1 1 1v2.5L14.5 18H5.5L9 9.5V7a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function AudioIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
      <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
    </svg>
  );
}

function StabilizerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function BackdropIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function OtherIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM2.99 9.25a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1H3a1 1 0 0 0 1-1v-.01a1 1 0 0 0-1-1h-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01Z" clipRule="evenodd" />
    </svg>
  );
}

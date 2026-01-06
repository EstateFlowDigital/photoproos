"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createGalleryAddon,
  updateGalleryAddon,
  deleteGalleryAddon,
  reorderGalleryAddons,
  type GalleryAddonInput,
} from "@/lib/actions/gallery-addons";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Sparkles,
  Sofa,
  Megaphone,
  Film,
  Printer,
  Palette,
  Eraser,
  Package,
  DollarSign,
  Image as ImageIcon,
  Clock,
  Check,
  X,
} from "lucide-react";
import { GalleryAddonCategory, ClientIndustry } from "@prisma/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GalleryAddon {
  id: string;
  name: string;
  description: string | null;
  iconName: string | null;
  priceCents: number | null;
  pricePerItem: boolean;
  category: GalleryAddonCategory;
  industries: ClientIndustry[];
  estimatedTurnaround: string | null;
  sortOrder: number;
  imageUrl: string | null;
  isActive: boolean;
  requiresSelection: boolean;
  maxPhotos: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AddonCatalogManagerProps {
  addons: GalleryAddon[];
  className?: string;
}

const CATEGORIES: { value: GalleryAddonCategory; label: string; icon: React.ReactNode }[] = [
  { value: "enhancement", label: "Enhancement", icon: <Sparkles className="h-4 w-4" /> },
  { value: "virtual_staging", label: "Virtual Staging", icon: <Sofa className="h-4 w-4" /> },
  { value: "marketing", label: "Marketing", icon: <Megaphone className="h-4 w-4" /> },
  { value: "video", label: "Video", icon: <Film className="h-4 w-4" /> },
  { value: "print", label: "Print", icon: <Printer className="h-4 w-4" /> },
  { value: "editing", label: "Editing", icon: <Palette className="h-4 w-4" /> },
  { value: "removal", label: "Removal", icon: <Eraser className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <Package className="h-4 w-4" /> },
];

const INDUSTRIES: { value: ClientIndustry; label: string }[] = [
  { value: "real_estate", label: "Real Estate" },
  { value: "wedding", label: "Wedding" },
  { value: "portrait", label: "Portrait" },
  { value: "commercial", label: "Commercial" },
  { value: "architecture", label: "Architecture" },
  { value: "food_hospitality", label: "Food & Hospitality" },
  { value: "events", label: "Events" },
  { value: "headshots", label: "Headshots" },
  { value: "product", label: "Product" },
  { value: "other", label: "Other" },
];

function SortableAddonRow({
  addon,
  onEdit,
  onDelete,
  isDeleting,
}: {
  addon: GalleryAddon;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: addon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const categoryInfo = CATEGORIES.find((c) => c.value === addon.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4",
        isDragging && "opacity-50 shadow-lg",
        !addon.isActive && "opacity-60"
      )}
    >
      <button
        className="cursor-grab text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--foreground)] truncate">
            {addon.name}
          </span>
          {!addon.isActive && (
            <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--foreground-muted)]/20 text-[var(--foreground-muted)]">
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--foreground-muted)]">
          <span className="flex items-center gap-1">
            {categoryInfo?.icon}
            {categoryInfo?.label}
          </span>
          {addon.priceCents !== null && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${(addon.priceCents / 100).toFixed(2)}
              {addon.pricePerItem && "/photo"}
            </span>
          )}
          {addon.priceCents === null && (
            <span className="text-[var(--primary)]">Request Quote</span>
          )}
          {addon.estimatedTurnaround && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {addon.estimatedTurnaround}
            </span>
          )}
        </div>
        {addon.industries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {addon.industries.map((ind) => (
              <span
                key={ind}
                className="px-1.5 py-0.5 text-xs rounded bg-[var(--primary)]/10 text-[var(--primary)]"
              >
                {INDUSTRIES.find((i) => i.value === ind)?.label || ind}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit} title="Edit">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AddonCatalogManager({
  addons: initialAddons,
  className,
}: AddonCatalogManagerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [addons, setAddons] = useState(initialAddons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<GalleryAddon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<GalleryAddonInput>({
    name: "",
    description: "",
    iconName: null,
    priceCents: null,
    pricePerItem: false,
    category: "other",
    industries: [],
    estimatedTurnaround: "",
    sortOrder: 0,
    imageUrl: null,
    isActive: true,
    requiresSelection: false,
    maxPhotos: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      iconName: null,
      priceCents: null,
      pricePerItem: false,
      category: "other",
      industries: [],
      estimatedTurnaround: "",
      sortOrder: 0,
      imageUrl: null,
      isActive: true,
      requiresSelection: false,
      maxPhotos: null,
    });
    setEditingAddon(null);
  };

  const openModal = (addon?: GalleryAddon) => {
    if (addon) {
      setEditingAddon(addon);
      setFormData({
        name: addon.name,
        description: addon.description,
        iconName: addon.iconName,
        priceCents: addon.priceCents,
        pricePerItem: addon.pricePerItem,
        category: addon.category,
        industries: addon.industries,
        estimatedTurnaround: addon.estimatedTurnaround,
        sortOrder: addon.sortOrder,
        imageUrl: addon.imageUrl,
        isActive: addon.isActive,
        requiresSelection: addon.requiresSelection,
        maxPhotos: addon.maxPhotos,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Please enter a name", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingAddon) {
        const result = await updateGalleryAddon(editingAddon.id, formData);
        if (result.success) {
          showToast("Add-on updated successfully", "success");
          router.refresh();
          closeModal();
        } else if (!result.success) {
          showToast(result.error || "Failed to update add-on", "error");
        }
      } else {
        const result = await createGalleryAddon(formData);
        if (result.success) {
          showToast("Add-on created successfully", "success");
          router.refresh();
          closeModal();
        } else if (!result.success) {
          showToast(result.error || "Failed to create add-on", "error");
        }
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addonId: string) => {
    setIsSubmitting(true);
    try {
      const result = await deleteGalleryAddon(addonId);
      if (result.success) {
        showToast("Add-on deleted successfully", "success");
        router.refresh();
        setDeleteConfirmId(null);
      } else if (!result.success) {
        showToast(result.error || "Failed to delete add-on", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = addons.findIndex((a) => a.id === active.id);
      const newIndex = addons.findIndex((a) => a.id === over.id);
      const newAddons = arrayMove(addons, oldIndex, newIndex);
      setAddons(newAddons);

      // Save new order
      const result = await reorderGalleryAddons(newAddons.map((a) => a.id));
      if (result.success) {
        showToast("Order saved", "success");
      } else if (!result.success) {
        showToast(result.error || "Failed to save order", "error");
        setAddons(initialAddons); // Revert
      }
    }
  };

  const toggleIndustry = (industry: ClientIndustry) => {
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries?.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...(prev.industries || []), industry],
    }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Gallery Add-ons
          </h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Configure add-on services clients can request from their gallery
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Add-on
        </Button>
      </div>

      {/* Add-ons List */}
      {addons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <Package className="h-8 w-8 mx-auto text-[var(--foreground-muted)] mb-3" />
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
            No add-ons yet
          </h3>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            Create add-on services that clients can request directly from their gallery.
          </p>
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Add-on
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={addons.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {addons.map((addon) => (
                <SortableAddonRow
                  key={addon.id}
                  addon={addon}
                  onEdit={() => openModal(addon)}
                  onDelete={() => setDeleteConfirmId(addon.id)}
                  isDeleting={isSubmitting && deleteConfirmId === addon.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddon ? "Edit Add-on" : "Create Add-on"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Name <span className="text-[var(--error)]">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Virtual Staging"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of the add-on"
                  className="w-full rounded-md border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  rows={2}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, category: cat.value }))
                      }
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors",
                        formData.category === cat.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--card-border)] hover:border-[var(--primary)]/50"
                      )}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Price (leave blank for quotes)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.priceCents ? (formData.priceCents / 100).toFixed(2) : ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priceCents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null,
                        }))
                      }
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Turnaround Time
                  </label>
                  <Input
                    value={formData.estimatedTurnaround || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, estimatedTurnaround: e.target.value }))
                    }
                    placeholder="e.g., 24-48 hours"
                  />
                </div>
              </div>

              {/* Price per item toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pricePerItem}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pricePerItem: e.target.checked }))
                  }
                  className="rounded border-[var(--input-border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <span className="text-sm text-[var(--foreground)]">
                  Price is per photo
                </span>
              </label>

              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Industries (leave empty to show for all)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.value}
                      type="button"
                      onClick={() => toggleIndustry(ind.value)}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full border transition-colors",
                        formData.industries?.includes(ind.value)
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--card-border)] hover:border-[var(--primary)]/50"
                      )}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo selection requirements */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresSelection}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, requiresSelection: e.target.checked }))
                    }
                    className="rounded border-[var(--input-border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    Requires photo selection
                  </span>
                </label>

                {formData.requiresSelection && (
                  <div className="ml-6">
                    <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                      Max photos (leave blank for unlimited)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxPhotos || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxPhotos: e.target.value ? parseInt(e.target.value) : null,
                        }))
                      }
                      placeholder="Unlimited"
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded border-[var(--input-border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <span className="text-sm text-[var(--foreground)]">
                  Active (shown to clients)
                </span>
              </label>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingAddon ? "Save Changes" : "Create Add-on"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Add-on</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-[var(--foreground-muted)]">
              Are you sure you want to delete this add-on? This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

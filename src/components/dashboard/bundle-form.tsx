"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  createBundle,
  updateBundle,
  deleteBundle,
  setBundleServices,
} from "@/lib/actions/bundles";
import { getServices } from "@/lib/actions/services";
import { useToast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/ui/image-upload";

interface BundleFormData {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  bundleType: "fixed" | "tiered" | "custom";
  imageUrl: string;
  badgeText: string;
  isActive: boolean;
  isPublic: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  priceCents: number;
  category: string;
  isActive: boolean;
}

interface BundleService {
  serviceId: string;
  isRequired: boolean;
  quantity: number;
  sortOrder: number;
}

interface BundleFormProps {
  initialData?: BundleFormData & {
    id?: string;
    usageCount?: number;
    services?: BundleService[];
  };
  mode: "create" | "edit";
}

const defaultFormData: BundleFormData = {
  name: "",
  slug: "",
  description: "",
  priceCents: 0,
  bundleType: "fixed",
  imageUrl: "",
  badgeText: "",
  isActive: true,
  isPublic: true,
};

const bundleTypes = [
  { value: "fixed", label: "Fixed Price", description: "Single price for all included services" },
  { value: "tiered", label: "Tiered", description: "Multiple pricing tiers with different options" },
  { value: "custom", label: "Custom", description: "Client can customize their selection" },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BundleForm({ initialData, mode }: BundleFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<BundleFormData>(
    initialData || defaultFormData
  );
  const [bundleServices, setBundleServicesState] = useState<BundleService[]>(
    initialData?.services || []
  );
  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const usageCount = initialData?.usageCount || 0;

  // Load available services
  useEffect(() => {
    async function loadServices() {
      try {
        const services = await getServices({ isActive: true });
        setAvailableServices(services);
      } catch (error) {
        console.error("Error loading services:", error);
        showToast("Failed to load services", "error");
      } finally {
        setIsLoadingServices(false);
      }
    }
    loadServices();
  }, [showToast]);

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (name: string) => {
      setFormData((prev) => ({
        ...prev,
        name,
        ...(autoSlug ? { slug: generateSlug(name) } : {}),
      }));
    },
    [autoSlug]
  );

  const handleSlugChange = useCallback((slug: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug }));
  }, []);

  const handleAddService = useCallback((serviceId: string) => {
    setBundleServicesState((prev) => {
      if (prev.some((s) => s.serviceId === serviceId)) return prev;
      return [
        ...prev,
        {
          serviceId,
          isRequired: true,
          quantity: 1,
          sortOrder: prev.length,
        },
      ];
    });
  }, []);

  const handleRemoveService = useCallback((serviceId: string) => {
    setBundleServicesState((prev) =>
      prev.filter((s) => s.serviceId !== serviceId)
    );
  }, []);

  const handleUpdateService = useCallback(
    (serviceId: string, updates: Partial<BundleService>) => {
      setBundleServicesState((prev) =>
        prev.map((s) =>
          s.serviceId === serviceId ? { ...s, ...updates } : s
        )
      );
    },
    []
  );

  // Drag-and-drop handlers for reordering services
  const handleServiceDragStart = useCallback((e: React.DragEvent, serviceId: string) => {
    setDraggedServiceId(serviceId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleServiceDragEnd = useCallback(() => {
    setDraggedServiceId(null);
    setIsDragging(false);
  }, []);

  const handleServiceDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleServiceDrop = useCallback(
    (e: React.DragEvent, targetServiceId: string) => {
      e.preventDefault();
      if (!draggedServiceId || draggedServiceId === targetServiceId) return;

      setBundleServicesState((prev) => {
        const draggedIndex = prev.findIndex((s) => s.serviceId === draggedServiceId);
        const targetIndex = prev.findIndex((s) => s.serviceId === targetServiceId);

        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const newServices = [...prev];
        const [removed] = newServices.splice(draggedIndex, 1);
        newServices.splice(targetIndex, 0, removed);

        // Update sort orders
        return newServices.map((s, index) => ({
          ...s,
          sortOrder: index,
        }));
      });

      setDraggedServiceId(null);
      setIsDragging(false);
    },
    [draggedServiceId]
  );

  // Calculate total value of services
  const servicesTotalCents = bundleServices.reduce((total, bs) => {
    const service = availableServices.find((s) => s.id === bs.serviceId);
    if (service) {
      return total + service.priceCents * bs.quantity;
    }
    return total;
  }, 0);

  const savingsPercent =
    servicesTotalCents > 0
      ? Math.round(
          ((servicesTotalCents - formData.priceCents) / servicesTotalCents) * 100
        )
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (mode === "create") {
        const result = await createBundle({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          priceCents: formData.priceCents,
          bundleType: formData.bundleType,
          imageUrl: formData.imageUrl || null,
          badgeText: formData.badgeText || null,
          isActive: formData.isActive,
          isPublic: formData.isPublic,
        });

        if (result.success) {
          // Add services to the bundle
          if (bundleServices.length > 0) {
            await setBundleServices({
              bundleId: result.data.id,
              services: bundleServices,
            });
          }
          showToast("Bundle created successfully", "success");
          router.push("/services/bundles");
        } else {
          showToast(result.error, "error");
        }
      } else {
        if (!initialData?.id) {
          showToast("Bundle ID is missing", "error");
          setIsSaving(false);
          return;
        }

        const result = await updateBundle({
          id: initialData.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          priceCents: formData.priceCents,
          bundleType: formData.bundleType,
          imageUrl: formData.imageUrl || null,
          badgeText: formData.badgeText || null,
          isActive: formData.isActive,
          isPublic: formData.isPublic,
        });

        if (result.success) {
          // Update services
          await setBundleServices({
            bundleId: initialData.id,
            services: bundleServices,
          });
          showToast("Bundle updated successfully", "success");
          router.push("/services/bundles");
        } else {
          showToast(result.error, "error");
        }
      }
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);
    try {
      const result = await deleteBundle(initialData.id, false);

      if (result.success) {
        showToast(
          usageCount > 0 ? "Bundle archived" : "Bundle deleted",
          "success"
        );
        router.push("/services/bundles");
      } else {
        showToast(result.error, "error");
      }
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Bundle Details
        </h2>

        <div className="space-y-5">
          {/* Bundle Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Bundle Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Complete Real Estate Package"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Slug and Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                URL Slug <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="complete-real-estate-package"
                required
                pattern="^[a-z0-9-]+$"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div>
              <label
                htmlFor="badgeText"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Badge Text
              </label>
              <input
                type="text"
                id="badgeText"
                value={formData.badgeText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, badgeText: e.target.value }))
                }
                placeholder="e.g., Most Popular"
                maxLength={30}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          {/* Bundle Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Bundle Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {bundleTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      bundleType: type.value as "fixed" | "tiered" | "custom",
                    }))
                  }
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    formData.bundleType === type.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
                  )}
                >
                  <span className="block text-sm font-medium text-foreground">
                    {type.label}
                  </span>
                  <span className="block text-xs text-foreground-muted mt-1">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Bundle Price <span className="text-[var(--error)]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                $
              </span>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.priceCents / 100 || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceCents: Math.round(
                      parseFloat(e.target.value || "0") * 100
                    ),
                  }))
                }
                placeholder="0.00"
                required
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            {savingsPercent > 0 && (
              <p className="mt-1.5 text-xs text-[var(--success)]">
                {savingsPercent}% savings vs. purchasing services separately
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what's included in this bundle..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Bundle Image
            </label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, imageUrl: url }))
              }
              entityType="bundle"
              entityId={initialData?.id}
            />
          </div>
        </div>
      </div>

      {/* Included Services Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Included Services
        </h2>

        {isLoadingServices ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Selected Services */}
            {bundleServices.length > 0 && (
              <div className={cn("space-y-3 mb-6", isDragging && "cursor-grabbing")}>
                {bundleServices.length > 1 && (
                  <p className="text-xs text-foreground-muted mb-2">
                    Drag services to reorder them
                  </p>
                )}
                {bundleServices.map((bs, index) => {
                  const service = availableServices.find(
                    (s) => s.id === bs.serviceId
                  );
                  if (!service) return null;
                  return (
                    <div
                      key={bs.serviceId}
                      draggable
                      onDragStart={(e) => handleServiceDragStart(e, bs.serviceId)}
                      onDragEnd={handleServiceDragEnd}
                      onDragOver={handleServiceDragOver}
                      onDrop={(e) => handleServiceDrop(e, bs.serviceId)}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] transition-all",
                        draggedServiceId === bs.serviceId && "opacity-50 ring-2 ring-[var(--primary)]",
                        isDragging && draggedServiceId !== bs.serviceId && "hover:ring-2 hover:ring-[var(--primary)]/50"
                      )}
                    >
                      {/* Drag Handle */}
                      <div className="cursor-grab opacity-50 group-hover:opacity-100 transition-opacity">
                        <GripIcon className="h-4 w-4 text-foreground-muted" />
                      </div>
                      {/* Order Number */}
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {service.name}
                        </h4>
                        <p className="text-sm text-foreground-muted">
                          {formatCurrency(service.priceCents)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-foreground-muted">
                            Qty:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={bs.quantity}
                            onChange={(e) =>
                              handleUpdateService(bs.serviceId, {
                                quantity: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-16 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1 text-sm text-foreground text-center"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-foreground-muted">
                          <input
                            type="checkbox"
                            checked={bs.isRequired}
                            onChange={(e) =>
                              handleUpdateService(bs.serviceId, {
                                isRequired: e.target.checked,
                              })
                            }
                            className="rounded border-[var(--card-border)]"
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(bs.serviceId)}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Value Summary */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                  <span className="text-sm text-foreground-muted">
                    Services Value:
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(servicesTotalCents)}
                  </span>
                </div>
              </div>
            )}

            {/* Add Service Select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Add Services
              </label>
              <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                {availableServices
                  .filter((s) => !bundleServices.some((bs) => bs.serviceId === s.id))
                  .map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleAddService(service.id)}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-left"
                    >
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {service.name}
                        </span>
                        <span className="text-xs text-foreground-muted ml-2 capitalize">
                          {service.category.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-sm text-foreground-muted">
                        {formatCurrency(service.priceCents)}
                      </span>
                    </button>
                  ))}
                {availableServices.filter(
                  (s) => !bundleServices.some((bs) => bs.serviceId === s.id)
                ).length === 0 && (
                  <p className="text-sm text-foreground-muted text-center py-4">
                    All available services have been added
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Settings</h2>

        <div className="space-y-4">
          {/* Active Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">Active</span>
              <p className="text-xs text-foreground-muted">
                Active bundles appear on order pages
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                formData.isActive
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--background-hover)]"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  formData.isActive ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </label>

          {/* Public Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">Public</span>
              <p className="text-xs text-foreground-muted">
                Public bundles can be viewed by anyone with the link
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isPublic}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
              }
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                formData.isPublic
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--background-hover)]"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  formData.isPublic ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {usageCount > 0 ? "Archive Bundle?" : "Delete Bundle?"}
            </h3>
            <p className="text-sm text-foreground-muted mb-6">
              {usageCount > 0
                ? `This bundle has been used in ${usageCount} ${usageCount === 1 ? "order" : "orders"}. It will be archived and hidden from new orders.`
                : "This action cannot be undone. The bundle will be permanently deleted."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isDeleting
                  ? "Processing..."
                  : usageCount > 0
                  ? "Archive"
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto rounded-lg border border-[var(--error)]/50 bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
            >
              {usageCount > 0 ? "Archive Bundle" : "Delete Bundle"}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/services/bundles"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={
              isSaving ||
              !formData.name ||
              !formData.slug ||
              formData.priceCents <= 0
            }
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving
              ? "Saving..."
              : mode === "create"
              ? "Create Bundle"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 7a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
    </svg>
  );
}

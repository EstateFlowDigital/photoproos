"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  createAddon,
  updateAddon,
  deleteAddon,
  setAddonCompatibility,
} from "@/lib/actions/addons";
import { getServices } from "@/lib/actions/services";
import { useToast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/ui/image-upload";

interface AddonFormData {
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  iconName: string;
  triggerType: "always" | "with_service" | "cart_threshold";
  triggerValue: string;
  isActive: boolean;
  isOneTime: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  priceCents: number;
  category: string;
  isActive: boolean;
}

interface AddonFormProps {
  initialData?: AddonFormData & {
    id?: string;
    usageCount?: number;
    compatibleServiceIds?: string[];
  };
  mode: "create" | "edit";
}

const defaultFormData: AddonFormData = {
  name: "",
  description: "",
  priceCents: 0,
  imageUrl: "",
  iconName: "",
  triggerType: "always",
  triggerValue: "",
  isActive: true,
  isOneTime: true,
};

const triggerTypes = [
  {
    value: "always",
    label: "Always Show",
    description: "Display this addon on all order pages",
  },
  {
    value: "with_service",
    label: "With Service",
    description: "Show when specific services are in the cart",
  },
  {
    value: "cart_threshold",
    label: "Cart Threshold",
    description: "Show when cart total exceeds a specified amount",
  },
];

const iconOptions = [
  { value: "", label: "None" },
  { value: "clock", label: "Clock (Rush)" },
  { value: "star", label: "Star (Premium)" },
  { value: "gift", label: "Gift (Bonus)" },
  { value: "shield", label: "Shield (Protection)" },
  { value: "sparkles", label: "Sparkles (Enhancement)" },
  { value: "photo", label: "Photo (Media)" },
  { value: "video", label: "Video (Footage)" },
  { value: "drone", label: "Drone (Aerial)" },
  { value: "home", label: "Home (Property)" },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function AddonForm({ initialData, mode }: AddonFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<AddonFormData>(
    initialData || defaultFormData
  );
  const [compatibleServiceIds, setCompatibleServiceIds] = useState<string[]>(
    initialData?.compatibleServiceIds || []
  );
  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleToggleService = useCallback((serviceId: string) => {
    setCompatibleServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (mode === "create") {
        const result = await createAddon({
          name: formData.name,
          description: formData.description || null,
          priceCents: formData.priceCents,
          imageUrl: formData.imageUrl || null,
          iconName: formData.iconName || null,
          triggerType: formData.triggerType,
          triggerValue: formData.triggerValue || null,
          isActive: formData.isActive,
          isOneTime: formData.isOneTime,
        });

        if (result.success) {
          // Set compatible services
          if (compatibleServiceIds.length > 0) {
            await setAddonCompatibility({
              addonId: result.data.id,
              serviceIds: compatibleServiceIds,
            });
          }
          showToast("Addon created successfully", "success");
          router.push("/services/addons");
        } else {
          showToast(result.error, "error");
        }
      } else {
        if (!initialData?.id) {
          showToast("Addon ID is missing", "error");
          setIsSaving(false);
          return;
        }

        const result = await updateAddon({
          id: initialData.id,
          name: formData.name,
          description: formData.description || null,
          priceCents: formData.priceCents,
          imageUrl: formData.imageUrl || null,
          iconName: formData.iconName || null,
          triggerType: formData.triggerType,
          triggerValue: formData.triggerValue || null,
          isActive: formData.isActive,
          isOneTime: formData.isOneTime,
        });

        if (result.success) {
          // Update compatible services
          await setAddonCompatibility({
            addonId: initialData.id,
            serviceIds: compatibleServiceIds,
          });
          showToast("Addon updated successfully", "success");
          router.push("/services/addons");
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
      const result = await deleteAddon(initialData.id, false);

      if (result.success) {
        showToast(
          usageCount > 0 ? "Addon archived" : "Addon deleted",
          "success"
        );
        router.push("/services/addons");
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
          Addon Details
        </h2>

        <div className="space-y-5">
          {/* Addon Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Addon Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Rush Delivery"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Price and Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Price <span className="text-[var(--error)]">*</span>
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
            </div>

            <div>
              <label
                htmlFor="iconName"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Icon
              </label>
              <select
                id="iconName"
                value={formData.iconName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, iconName: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
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
              placeholder="Describe the value of this addon..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Addon Image
            </label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, imageUrl: url }))
              }
              entityType="addon"
              entityId={initialData?.id}
            />
          </div>
        </div>
      </div>

      {/* Trigger Settings Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Display Trigger
        </h2>

        <div className="space-y-5">
          {/* Trigger Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              When to Show
            </label>
            <div className="grid grid-cols-1 gap-3">
              {triggerTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      triggerType: type.value as typeof formData.triggerType,
                      triggerValue: "",
                    }))
                  }
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    formData.triggerType === type.value
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

          {/* Conditional: Cart Threshold */}
          {formData.triggerType === "cart_threshold" && (
            <div>
              <label
                htmlFor="triggerValue"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Minimum Cart Total
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                  $
                </span>
                <input
                  type="number"
                  id="triggerValue"
                  min="0"
                  step="1"
                  value={
                    formData.triggerValue
                      ? parseInt(formData.triggerValue) / 100
                      : ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      triggerValue: e.target.value
                        ? String(Math.round(parseFloat(e.target.value) * 100))
                        : "",
                    }))
                  }
                  placeholder="100"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <p className="mt-1.5 text-xs text-foreground-muted">
                Addon will be suggested when cart total exceeds this amount
              </p>
            </div>
          )}

          {/* Conditional: Compatible Services */}
          {formData.triggerType === "with_service" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Compatible Services
              </label>
              {isLoadingServices ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary)] border-t-transparent" />
                </div>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                  {availableServices.map((service) => (
                    <label
                      key={service.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        compatibleServiceIds.includes(service.id)
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={compatibleServiceIds.includes(service.id)}
                        onChange={() => handleToggleService(service.id)}
                        className="rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <div className="flex-1 min-w-0">
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
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-foreground-muted">
                This addon will be shown when any of these services are in the
                cart
              </p>
            </div>
          )}
        </div>
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
                Active addons can be added to orders
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

          {/* One-Time Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">
                One-Time Purchase
              </span>
              <p className="text-xs text-foreground-muted">
                One-time addons can only be purchased once per order
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isOneTime}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isOneTime: !prev.isOneTime }))
              }
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                formData.isOneTime
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--background-hover)]"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  formData.isOneTime ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Preview Card */}
      {formData.name && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Preview
          </h2>
          <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {formData.iconName && (
                    <AddonIcon name={formData.iconName} className="h-5 w-5 text-[var(--primary)]" />
                  )}
                  <h4 className="font-medium text-foreground">
                    {formData.name}
                  </h4>
                </div>
                {formData.description && (
                  <p className="text-sm text-foreground-muted mt-1">
                    {formData.description}
                  </p>
                )}
              </div>
              <span className="text-lg font-semibold text-foreground whitespace-nowrap">
                +{formatCurrency(formData.priceCents)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {usageCount > 0 ? "Archive Addon?" : "Delete Addon?"}
            </h3>
            <p className="text-sm text-foreground-muted mb-6">
              {usageCount > 0
                ? `This addon has been used in ${usageCount} ${usageCount === 1 ? "order" : "orders"}. It will be archived and hidden from new orders.`
                : "This action cannot be undone. The addon will be permanently deleted."}
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
              {usageCount > 0 ? "Archive Addon" : "Delete Addon"}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/services/addons"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || !formData.name || formData.priceCents <= 0}
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving
              ? "Saving..."
              : mode === "create"
              ? "Create Addon"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

function AddonIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "clock":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
        </svg>
      );
    case "star":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
        </svg>
      );
    case "gift":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M9.25 3.75v3h-3a.75.75 0 0 1 0-1.5h1.439a2.25 2.25 0 0 0-1.689-1.5.75.75 0 0 1 0-1.5 3.75 3.75 0 0 1 3.25 1.5ZM10.75 3.75v3h3a.75.75 0 0 0 0-1.5h-1.439a2.25 2.25 0 0 1 1.689-1.5.75.75 0 0 0 0-1.5 3.75 3.75 0 0 0-3.25 1.5ZM4.75 8.25a.75.75 0 0 0-.75.75v3.25c0 .414.336.75.75.75h4.5V8.25h-4.5ZM10.75 8.25v4.75h4.5a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75h-4.5Z" />
          <path d="M4 15.25a2 2 0 0 0 2 2h3.25v-3.5H4v1.5ZM10.75 17.25H14a2 2 0 0 0 2-2v-1.5h-5.25v3.5Z" />
        </svg>
      );
    case "shield":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.563 2 12.162 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
      );
    case "sparkles":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 10ZM14 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 10ZM5.172 14.828a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 0 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM14.828 14.828a.75.75 0 0 1 1.061 0l1.06 1.061a.75.75 0 1 1-1.06 1.06l-1.061-1.06a.75.75 0 0 1 0-1.061ZM10 16a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 16Z" />
          <path fillRule="evenodd" d="M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2.5 4a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" clipRule="evenodd" />
        </svg>
      );
    case "photo":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
        </svg>
      );
    case "video":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 0 0 1.28-.53V4.75Z" />
        </svg>
      );
    case "drone":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M4.93 2.31a41.401 41.401 0 0 1 10.14 0C16.194 2.45 17 3.414 17 4.517V5.5a.75.75 0 0 1-.75.75h-1.836a2.99 2.99 0 0 1-.379 1.081l1.81 1.81a.75.75 0 0 1-1.06 1.06l-1.81-1.81A2.99 2.99 0 0 1 11.893 8.75H8.107c-.39.4-.88.702-1.431.892l-1.81 1.81a.75.75 0 0 1-1.06-1.06l1.81-1.81A2.99 2.99 0 0 1 5.236 7.5H3.75A.75.75 0 0 1 3 6.75V4.517C3 3.414 3.806 2.45 4.93 2.31Zm3.027 3.69a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM10 10.75a.75.75 0 0 1 .75.75v.25H15a.75.75 0 0 1 0 1.5h-4.25v.25a.75.75 0 0 1-.75.75h-.25v2.25a.75.75 0 0 1-1.5 0V14.25H8a.75.75 0 0 1-.75-.75v-.25H5a.75.75 0 0 1 0-1.5h2.25v-.25A.75.75 0 0 1 8 10.75h2Z" clipRule="evenodd" />
        </svg>
      );
    case "home":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
}

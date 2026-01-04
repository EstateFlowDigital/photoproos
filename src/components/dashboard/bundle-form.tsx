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
  setBundlePricingTiers,
} from "@/lib/actions/bundles";
import { getServices } from "@/lib/actions/services";
import { useToast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/ui/image-upload";

interface BundleFormData {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  bundleType: "fixed" | "tiered" | "custom" | "sqft_based" | "tiered_sqft";
  pricingMethod: "fixed" | "per_sqft" | "tiered";
  pricePerSqftCents: number;
  minSqft: number;
  maxSqft: number | null;
  sqftIncrements: number;
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

interface PricingTier {
  id?: string;
  minSqft: number;
  maxSqft: number | null;
  priceCents: number;
  tierName: string | null;
  sortOrder?: number;
}

interface BundleFormProps {
  initialData?: BundleFormData & {
    id?: string;
    usageCount?: number;
    services?: BundleService[];
    pricingTiers?: PricingTier[];
  };
  mode: "create" | "edit";
}

const defaultFormData: BundleFormData = {
  name: "",
  slug: "",
  description: "",
  priceCents: 0,
  bundleType: "fixed",
  pricingMethod: "fixed",
  pricePerSqftCents: 0,
  minSqft: 0,
  maxSqft: null,
  sqftIncrements: 500,
  imageUrl: "",
  badgeText: "",
  isActive: true,
  isPublic: true,
};

const bundleTypes = [
  { value: "fixed", label: "Fixed Price", description: "Single price for all included services" },
  { value: "tiered", label: "Tiered", description: "Multiple pricing tiers with different options" },
  { value: "custom", label: "Custom", description: "Client can customize their selection" },
  { value: "sqft_based", label: "Per Sqft", description: "Price based on property square footage" },
  { value: "tiered_sqft", label: "Tiered Sqft", description: "Tiered pricing by square footage ranges" },
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
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(
    initialData?.pricingTiers || []
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

  // Pricing tier handlers
  const handleAddPricingTier = useCallback(() => {
    setPricingTiers((prev) => {
      const lastTier = prev[prev.length - 1];
      const newMinSqft = lastTier ? (lastTier.maxSqft || lastTier.minSqft) + 1 : 0;
      return [
        ...prev,
        {
          minSqft: newMinSqft,
          maxSqft: newMinSqft + 999,
          priceCents: 0,
          tierName: null,
          sortOrder: prev.length,
        },
      ];
    });
  }, []);

  const handleRemovePricingTier = useCallback((index: number) => {
    setPricingTiers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdatePricingTier = useCallback(
    (index: number, updates: Partial<PricingTier>) => {
      setPricingTiers((prev) =>
        prev.map((tier, i) => (i === index ? { ...tier, ...updates } : tier))
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
          pricingMethod: formData.pricingMethod,
          pricePerSqftCents: formData.pricePerSqftCents || null,
          minSqft: formData.minSqft || null,
          maxSqft: formData.maxSqft,
          sqftIncrements: formData.sqftIncrements || null,
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
          // Add pricing tiers for tiered bundles
          if (
            (formData.bundleType === "tiered_sqft" || formData.pricingMethod === "tiered") &&
            pricingTiers.length > 0
          ) {
            await setBundlePricingTiers({
              bundleId: result.data.id,
              tiers: pricingTiers.map((tier, index) => ({
                minSqft: tier.minSqft,
                maxSqft: tier.maxSqft,
                priceCents: tier.priceCents,
                tierName: tier.tierName,
                sortOrder: index,
              })),
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
          pricingMethod: formData.pricingMethod,
          pricePerSqftCents: formData.pricePerSqftCents || null,
          minSqft: formData.minSqft || null,
          maxSqft: formData.maxSqft,
          sqftIncrements: formData.sqftIncrements || null,
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
          // Update pricing tiers for tiered bundles
          if (formData.bundleType === "tiered_sqft" || formData.pricingMethod === "tiered") {
            await setBundlePricingTiers({
              bundleId: initialData.id,
              tiers: pricingTiers.map((tier, index) => ({
                minSqft: tier.minSqft,
                maxSqft: tier.maxSqft,
                priceCents: tier.priceCents,
                tierName: tier.tierName,
                sortOrder: index,
              })),
            });
          }
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
                  onClick={() => {
                    const newBundleType = type.value as "fixed" | "tiered" | "custom" | "sqft_based" | "tiered_sqft";
                    let newPricingMethod: "fixed" | "per_sqft" | "tiered" = "fixed";
                    if (newBundleType === "sqft_based") {
                      newPricingMethod = "per_sqft";
                    } else if (newBundleType === "tiered_sqft") {
                      newPricingMethod = "tiered";
                    }
                    setFormData((prev) => ({
                      ...prev,
                      bundleType: newBundleType,
                      pricingMethod: newPricingMethod,
                    }));
                  }}
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

          {/* Price - Only show for fixed pricing */}
          {(formData.bundleType === "fixed" || formData.bundleType === "tiered" || formData.bundleType === "custom") && (
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
          )}

          {/* Per Sqft Pricing - Show for sqft_based bundles */}
          {formData.bundleType === "sqft_based" && (
            <div className="space-y-4 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
              <h4 className="text-sm font-medium text-foreground">
                Square Footage Pricing
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pricePerSqft"
                    className="block text-xs font-medium text-foreground-muted mb-1.5"
                  >
                    Price per Sqft <span className="text-[var(--error)]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      id="pricePerSqft"
                      min="0"
                      step="0.01"
                      value={formData.pricePerSqftCents / 100 || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricePerSqftCents: Math.round(
                            parseFloat(e.target.value || "0") * 100
                          ),
                          pricingMethod: "per_sqft",
                        }))
                      }
                      placeholder="0.15"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-7 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="sqftIncrements"
                    className="block text-xs font-medium text-foreground-muted mb-1.5"
                  >
                    Sqft Increments
                  </label>
                  <input
                    type="number"
                    id="sqftIncrements"
                    min="1"
                    value={formData.sqftIncrements || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sqftIncrements: parseInt(e.target.value) || 500,
                      }))
                    }
                    placeholder="500"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="minSqft"
                    className="block text-xs font-medium text-foreground-muted mb-1.5"
                  >
                    Minimum Sqft
                  </label>
                  <input
                    type="number"
                    id="minSqft"
                    min="0"
                    value={formData.minSqft || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minSqft: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="1000"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxSqft"
                    className="block text-xs font-medium text-foreground-muted mb-1.5"
                  >
                    Maximum Sqft
                  </label>
                  <input
                    type="number"
                    id="maxSqft"
                    min="0"
                    value={formData.maxSqft || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxSqft: parseInt(e.target.value) || null,
                      }))
                    }
                    placeholder="10000 (optional)"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              {formData.pricePerSqftCents > 0 && (
                <p className="text-xs text-foreground-muted">
                  Example: 2,000 sqft = {formatCurrency(2000 * formData.pricePerSqftCents)}
                </p>
              )}
            </div>
          )}

          {/* Tiered Sqft Pricing - Show for tiered_sqft bundles */}
          {formData.bundleType === "tiered_sqft" && (
            <div className="space-y-4 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  Pricing Tiers
                </h4>
                <button
                  type="button"
                  onClick={handleAddPricingTier}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Tier
                </button>
              </div>

              {pricingTiers.length === 0 ? (
                <div className="text-center py-6 text-sm text-foreground-muted">
                  No pricing tiers configured. Add tiers to set prices for different square footage ranges.
                </div>
              ) : (
                <div className="space-y-3">
                  {pricingTiers.map((tier, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)]"
                    >
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-foreground-muted mb-1">
                            Tier Name
                          </label>
                          <input
                            type="text"
                            value={tier.tierName || ""}
                            onChange={(e) =>
                              handleUpdatePricingTier(index, {
                                tierName: e.target.value || null,
                              })
                            }
                            placeholder="e.g., Small"
                            className="w-full rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2.5 py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground-muted mb-1">
                            Min Sqft
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={tier.minSqft}
                            onChange={(e) =>
                              handleUpdatePricingTier(index, {
                                minSqft: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2.5 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground-muted mb-1">
                            Max Sqft
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={tier.maxSqft || ""}
                            onChange={(e) =>
                              handleUpdatePricingTier(index, {
                                maxSqft: parseInt(e.target.value) || null,
                              })
                            }
                            placeholder="No limit"
                            className="w-full rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2.5 py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground-muted mb-1">
                            Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground-muted text-xs">
                              $
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tier.priceCents / 100 || ""}
                              onChange={(e) =>
                                handleUpdatePricingTier(index, {
                                  priceCents: Math.round(
                                    parseFloat(e.target.value || "0") * 100
                                  ),
                                })
                              }
                              className="w-full rounded-md border border-[var(--card-border)] bg-[var(--background)] pl-5 pr-2.5 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePricingTier(index)}
                        className="mt-5 p-1.5 rounded-lg text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-foreground-muted">
                Tiers should not overlap. Leave &ldquo;Max Sqft&rdquo; empty for the last tier to accept any larger properties.
              </p>
            </div>
          )}

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
              // Validate pricing based on bundle type
              (formData.bundleType === "sqft_based" && formData.pricePerSqftCents <= 0) ||
              (formData.bundleType === "tiered_sqft" && pricingTiers.length === 0) ||
              (!["sqft_based", "tiered_sqft"].includes(formData.bundleType) && formData.priceCents <= 0)
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  serviceCategories,
  formatServicePrice,
  type ServiceCategory,
} from "@/lib/services";
import {
  createService,
  updateService,
  deleteService,
  setServicePricingTiers,
  updateServicePricingMethod,
} from "@/lib/actions/services";
import { useToast } from "@/components/ui/toast";
import type { ServicePricingMethod } from "@prisma/client";

// Pricing tier for UI state
interface PricingTier {
  id?: string;
  minSqft: number;
  maxSqft: number | null;
  priceCents: number;
  tierName: string;
}

interface ServiceFormData {
  name: string;
  category: ServiceCategory;
  description: string;
  priceCents: number;
  duration: string;
  deliverables: string[];
  isActive: boolean;
  // Square footage pricing
  pricingMethod: ServicePricingMethod;
  pricePerSqftCents: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  sqftIncrements: number | null;
  pricingTiers: PricingTier[];
}

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData> & { id?: string; isDefault?: boolean; usageCount?: number };
  mode: "create" | "edit";
}

const defaultFormData: ServiceFormData = {
  name: "",
  category: "other",
  description: "",
  priceCents: 0,
  duration: "",
  deliverables: [],
  isActive: true,
  pricingMethod: "fixed",
  pricePerSqftCents: null,
  minSqft: null,
  maxSqft: null,
  sqftIncrements: 500,
  pricingTiers: [],
};

const PRICING_METHODS: { value: ServicePricingMethod; label: string; description: string }[] = [
  { value: "fixed", label: "Fixed Price", description: "Single price regardless of property size" },
  { value: "per_sqft", label: "Per Square Foot", description: "Price calculated based on property square footage" },
  { value: "tiered", label: "Tiered Pricing", description: "Different prices for different size ranges (BICEP-style)" },
];

export function ServiceForm({ initialData, mode }: ServiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ServiceFormData>({
    ...defaultFormData,
    ...initialData,
    pricingTiers: initialData?.pricingTiers || [],
  });
  const [newDeliverable, setNewDeliverable] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Tier editing state
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);

  const usageCount = initialData?.usageCount || 0;

  const handleAddDeliverable = useCallback(() => {
    if (newDeliverable.trim()) {
      setFormData((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()],
      }));
      setNewDeliverable("");
    }
  }, [newDeliverable]);

  const handleRemoveDeliverable = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  }, []);

  // Tier management functions
  const handleAddTier = useCallback(() => {
    setEditingTier({
      minSqft: formData.pricingTiers.length === 0 ? 0 : Math.max(...formData.pricingTiers.map(t => t.maxSqft || t.minSqft + 1000)) + 1,
      maxSqft: null,
      priceCents: 0,
      tierName: "",
    });
    setShowTierModal(true);
  }, [formData.pricingTiers]);

  const handleEditTier = useCallback((tier: PricingTier, index: number) => {
    setEditingTier({ ...tier, id: tier.id || `temp-${index}` });
    setShowTierModal(true);
  }, []);

  const handleSaveTier = useCallback(() => {
    if (!editingTier) return;

    setFormData((prev) => {
      const existingIndex = prev.pricingTiers.findIndex(
        (t) => (t.id && t.id === editingTier.id) || (!t.id && t.minSqft === editingTier.minSqft && editingTier.id?.startsWith("temp-"))
      );

      let newTiers: PricingTier[];
      if (existingIndex >= 0) {
        // Update existing
        newTiers = [...prev.pricingTiers];
        newTiers[existingIndex] = { ...editingTier, id: prev.pricingTiers[existingIndex].id };
      } else {
        // Add new
        newTiers = [...prev.pricingTiers, editingTier];
      }

      // Sort by minSqft
      newTiers.sort((a, b) => a.minSqft - b.minSqft);
      return { ...prev, pricingTiers: newTiers };
    });

    setEditingTier(null);
    setShowTierModal(false);
  }, [editingTier]);

  const handleDeleteTier = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, i) => i !== index),
    }));
  }, []);

  // Format price for display
  const formatPriceDisplay = useCallback(() => {
    switch (formData.pricingMethod) {
      case "fixed":
        return formatServicePrice(formData.priceCents);
      case "per_sqft":
        const perSqft = (formData.pricePerSqftCents || 0) / 100;
        return `$${perSqft.toFixed(2)}/sqft`;
      case "tiered":
        if (formData.pricingTiers.length > 0) {
          const sorted = [...formData.pricingTiers].sort((a, b) => a.priceCents - b.priceCents);
          return `From ${formatServicePrice(sorted[0].priceCents)}`;
        }
        return "Configure tiers";
      default:
        return formatServicePrice(formData.priceCents);
    }
  }, [formData.pricingMethod, formData.priceCents, formData.pricePerSqftCents, formData.pricingTiers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate tiered pricing has at least one tier
      if (formData.pricingMethod === "tiered" && formData.pricingTiers.length === 0) {
        showToast("Please add at least one pricing tier", "error");
        setIsSaving(false);
        return;
      }

      // Validate per_sqft has a price set
      if (formData.pricingMethod === "per_sqft" && (!formData.pricePerSqftCents || formData.pricePerSqftCents <= 0)) {
        showToast("Please set a price per square foot", "error");
        setIsSaving(false);
        return;
      }

      if (mode === "create") {
        const result = await createService({
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          priceCents: formData.priceCents,
          duration: formData.duration || null,
          deliverables: formData.deliverables,
          isActive: formData.isActive,
          pricingMethod: formData.pricingMethod,
          pricePerSqftCents: formData.pricePerSqftCents,
          minSqft: formData.minSqft,
          maxSqft: formData.maxSqft,
          sqftIncrements: formData.sqftIncrements,
        });

        if (!result.success) {
          showToast(result.error || "Failed to create service", "error");
          setIsSaving(false);
          return;
        }

        // If tiered pricing, save the tiers
        if (formData.pricingMethod === "tiered" && formData.pricingTiers.length > 0) {
          const tiersResult = await setServicePricingTiers({
            serviceId: result.data.id,
            tiers: formData.pricingTiers.map((tier) => ({
              minSqft: tier.minSqft,
              maxSqft: tier.maxSqft,
              priceCents: tier.priceCents,
              tierName: tier.tierName || null,
            })),
          });
          if (!tiersResult.success) {
            showToast("Service created but failed to save pricing tiers", "warning");
          }
        }
        showToast("Service created successfully", "success");
        router.push("/galleries/services");
      } else {
        if (!initialData?.id) {
          showToast("Service ID is missing", "error");
          setIsSaving(false);
          return;
        }

        // Update basic service info
        const result = await updateService({
          id: initialData.id,
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          priceCents: formData.priceCents,
          duration: formData.duration || null,
          deliverables: formData.deliverables,
          isActive: formData.isActive,
        });

        if (result.success) {
          // Update pricing method and sqft settings
          const pricingResult = await updateServicePricingMethod(
            initialData.id,
            formData.pricingMethod,
            {
              priceCents: formData.priceCents,
              pricePerSqftCents: formData.pricePerSqftCents || undefined,
              minSqft: formData.minSqft || undefined,
              maxSqft: formData.maxSqft,
              sqftIncrements: formData.sqftIncrements || undefined,
            }
          );

          if (!pricingResult.success) {
            showToast("Service updated but pricing settings may not have saved", "warning");
          }

          // If tiered pricing, save the tiers
          if (formData.pricingMethod === "tiered" && formData.pricingTiers.length > 0) {
            const tiersResult = await setServicePricingTiers({
              serviceId: initialData.id,
              tiers: formData.pricingTiers.map((tier) => ({
                minSqft: tier.minSqft,
                maxSqft: tier.maxSqft,
                priceCents: tier.priceCents,
                tierName: tier.tierName || null,
              })),
            });
            if (!tiersResult.success) {
              showToast("Service updated but failed to save pricing tiers", "warning");
            }
          }

          showToast("Service updated successfully", "success");
          router.push("/galleries/services");
        } else {
          showToast(result.error || "Failed to update service", "error");
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
      const result = await deleteService(initialData.id, false);

      if (result.success) {
        showToast(usageCount > 0 ? "Service archived" : "Service deleted", "success");
        router.push("/galleries/services");
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
      {/* Main Form Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Service Details
        </h2>

        <div className="space-y-5">
          {/* Service Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Service Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Luxury Property Package"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Category <span className="text-[var(--error)]">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as ServiceCategory,
                }))
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {Object.entries(serviceCategories).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Method */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Pricing Method <span className="text-[var(--error)]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRICING_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, pricingMethod: method.value }))}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                    formData.pricingMethod === method.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--primary)]/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    formData.pricingMethod === method.value ? "text-[var(--primary)]" : "text-foreground"
                  )}>
                    {method.label}
                  </span>
                  <span className="text-xs text-foreground-muted">
                    {method.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fixed Price */}
          {formData.pricingMethod === "fixed" && (
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
          )}

          {/* Per Square Foot Pricing */}
          {formData.pricingMethod === "per_sqft" && (
            <div className="space-y-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pricePerSqft"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Price per Sqft <span className="text-[var(--error)]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                      $
                    </span>
                    <input
                      type="number"
                      id="pricePerSqft"
                      min="0"
                      step="0.01"
                      value={(formData.pricePerSqftCents || 0) / 100 || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricePerSqftCents: Math.round(parseFloat(e.target.value || "0") * 100),
                        }))
                      }
                      placeholder="0.10"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sqftIncrements"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Round to Nearest
                  </label>
                  <select
                    id="sqftIncrements"
                    value={formData.sqftIncrements || 500}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sqftIncrements: parseInt(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value={100}>100 sqft</option>
                    <option value={250}>250 sqft</option>
                    <option value={500}>500 sqft</option>
                    <option value={1000}>1,000 sqft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="minSqft"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Minimum Sqft (for pricing)
                  </label>
                  <input
                    type="number"
                    id="minSqft"
                    min="0"
                    value={formData.minSqft || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minSqft: parseInt(e.target.value) || null,
                      }))
                    }
                    placeholder="e.g., 1000"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <p className="mt-1 text-xs text-foreground-muted">
                    Properties below this will be charged at this minimum
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="maxSqft"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Maximum Sqft (optional)
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
                    placeholder="e.g., 10000"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <p className="mt-1 text-xs text-foreground-muted">
                    Properties above this will be capped at this maximum
                  </p>
                </div>
              </div>

              {/* Price calculator preview */}
              {formData.pricePerSqftCents && formData.pricePerSqftCents > 0 && (
                <div className="mt-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/20 p-3">
                  <p className="text-xs font-medium text-foreground-muted mb-2">Price Examples</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {[1500, 2500, 4000].map((sqft) => {
                      const minSqft = formData.minSqft || 0;
                      const maxSqft = formData.maxSqft;
                      const increments = formData.sqftIncrements || 1;
                      let adjustedSqft = Math.max(sqft, minSqft);
                      if (maxSqft) adjustedSqft = Math.min(adjustedSqft, maxSqft);
                      adjustedSqft = Math.ceil(adjustedSqft / increments) * increments;
                      const price = adjustedSqft * (formData.pricePerSqftCents || 0) / 100;
                      return (
                        <div key={sqft} className="text-center">
                          <div className="text-foreground-muted">{sqft.toLocaleString()} sqft</div>
                          <div className="font-semibold text-foreground">${price.toFixed(0)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tiered Pricing */}
          {formData.pricingMethod === "tiered" && (
            <div className="space-y-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Pricing Tiers</h4>
                  <p className="text-xs text-foreground-muted">Define price ranges based on property size</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  Add Tier
                </button>
              </div>

              {formData.pricingTiers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
                  <SqftIcon className="mx-auto h-8 w-8 text-foreground-muted/50" />
                  <p className="mt-2 text-sm text-foreground-muted">No pricing tiers configured</p>
                  <p className="text-xs text-foreground-muted">Add tiers to define pricing for different property sizes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.pricingTiers
                    .sort((a, b) => a.minSqft - b.minSqft)
                    .map((tier, index) => (
                      <div
                        key={tier.id || index}
                        className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {tier.tierName && (
                              <span className="text-sm font-medium text-foreground">{tier.tierName}</span>
                            )}
                            <span className="text-xs text-foreground-muted">
                              {tier.minSqft.toLocaleString()} - {tier.maxSqft ? tier.maxSqft.toLocaleString() : "∞"} sqft
                            </span>
                          </div>
                          <div className="text-lg font-semibold text-[var(--success)]">
                            {formatServicePrice(tier.priceCents)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditTier(tier, index)}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(index)}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Estimated Duration
            </label>
            <input
              type="text"
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration: e.target.value }))
              }
              placeholder="e.g., 2-3 hours"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <p className="mt-1.5 text-xs text-foreground-muted">
              Enter a human-readable duration like &quot;2-3 hours&quot;, &quot;90 minutes&quot;, or &quot;Half day&quot;.
            </p>
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
              placeholder="Describe what's included in this service..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
            <p className="mt-1.5 text-xs text-foreground-muted">
              This description will be shown to clients on invoices and
              proposals.
            </p>
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              What&apos;s Included
            </label>

            {/* Existing Deliverables */}
            {formData.deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.deliverables.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm text-[var(--primary)]"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(index)}
                      className="ml-1 rounded-full p-0.5 hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Deliverable */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDeliverable();
                  }
                }}
                placeholder="Add item (e.g., '25 edited photos')"
                className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                disabled={!newDeliverable.trim()}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <p className="mt-1.5 text-xs text-foreground-muted">
              Press Enter or click Add to include items in your service
              package.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {(formData.name || formData.priceCents > 0) && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Preview
          </h2>

          <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      serviceCategories[formData.category].color
                    )}
                  >
                    {serviceCategories[formData.category].label}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">
                  {formData.name || "Untitled Service"}
                </h3>
                {formData.description && (
                  <p className="text-sm text-foreground-muted mt-1">
                    {formData.description}
                  </p>
                )}
                {formData.duration && (
                  <p className="text-xs text-foreground-muted mt-1">
                    {formData.duration}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-foreground">
                  {formatPriceDisplay()}
                </p>
                {formData.pricingMethod !== "fixed" && (
                  <p className="text-xs text-foreground-muted">
                    {formData.pricingMethod === "per_sqft" ? "per sqft" : "tiered"}
                  </p>
                )}
              </div>
            </div>
            {formData.deliverables.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--primary)]/20">
                <p className="text-xs font-medium text-foreground-muted mb-2">
                  Includes
                </p>
                <ul className="space-y-1.5">
                  {formData.deliverables.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckIcon className="h-4 w-4 text-[var(--success)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Toggle - only for edit mode */}
      {mode === "edit" && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Status</h2>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">
                Active
              </span>
              <p className="text-xs text-foreground-muted">
                Active services can be selected when creating galleries and
                bookings
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </label>

          {usageCount > 0 && (
            <p className="mt-4 text-sm text-foreground-muted">
              This service is used in {usageCount}{" "}
              {usageCount === 1 ? "gallery" : "galleries"}. Deactivating it will
              not affect existing galleries.
            </p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {usageCount > 0 ? "Archive Service?" : "Delete Service?"}
            </h3>
            <p className="text-sm text-foreground-muted mb-6">
              {usageCount > 0
                ? `This service is used in ${usageCount} ${usageCount === 1 ? "gallery" : "galleries"}. It will be archived and hidden from new galleries, but existing galleries will not be affected.`
                : "This action cannot be undone. The service will be permanently deleted."}
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

      {/* Tier Editing Modal */}
      {showTierModal && editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editingTier.id?.startsWith("temp-") || !editingTier.id ? "Add Pricing Tier" : "Edit Pricing Tier"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tier Name (optional)
                </label>
                <input
                  type="text"
                  value={editingTier.tierName}
                  onChange={(e) => setEditingTier({ ...editingTier, tierName: e.target.value })}
                  placeholder="e.g., Small Home, Medium Home"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Minimum Sqft
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingTier.minSqft}
                    onChange={(e) => setEditingTier({ ...editingTier, minSqft: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Maximum Sqft
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingTier.maxSqft || ""}
                    onChange={(e) => setEditingTier({ ...editingTier, maxSqft: parseInt(e.target.value) || null })}
                    placeholder="Unlimited"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Price for this Tier <span className="text-[var(--error)]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingTier.priceCents / 100 || ""}
                    onChange={(e) => setEditingTier({ ...editingTier, priceCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowTierModal(false);
                  setEditingTier(null);
                }}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTier}
                disabled={editingTier.priceCents <= 0}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTier.id?.startsWith("temp-") || !editingTier.id ? "Add Tier" : "Save Changes"}
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
              {usageCount > 0 ? "Archive Service" : "Delete Service"}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/galleries/services"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={
              isSaving ||
              !formData.name ||
              (formData.pricingMethod === "fixed" && formData.priceCents <= 0) ||
              (formData.pricingMethod === "per_sqft" && (!formData.pricePerSqftCents || formData.pricePerSqftCents <= 0)) ||
              (formData.pricingMethod === "tiered" && formData.pricingTiers.length === 0)
            }
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving
              ? "Saving..."
              : mode === "create"
              ? "Create Service"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SqftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25Zm4.03 6.28a.75.75 0 0 0-1.06-1.06L4.97 9.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 0 0 1.06-1.06L6.56 10l1.72-1.72Zm3.44-1.06a.75.75 0 1 0-1.06 1.06L12.44 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06l2.25-2.25a.75.75 0 0 0 0-1.06l-2.25-2.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  serviceCategories,
  formatServicePrice,
  type ServiceCategory,
} from "@/lib/services";
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/services";
import { useToast } from "@/components/ui/toast";

interface ServiceFormData {
  name: string;
  category: ServiceCategory;
  description: string;
  priceCents: number;
  duration: string;
  deliverables: string[];
  isActive: boolean;
}

interface ServiceFormProps {
  initialData?: ServiceFormData & { id?: string; isDefault?: boolean; usageCount?: number };
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
};

export function ServiceForm({ initialData, mode }: ServiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ServiceFormData>(
    initialData || defaultFormData
  );
  const [newDeliverable, setNewDeliverable] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (mode === "create") {
        const result = await createService({
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          priceCents: formData.priceCents,
          duration: formData.duration || null,
          deliverables: formData.deliverables,
          isActive: formData.isActive,
        });

        if (result.success) {
          showToast("Service created successfully", "success");
          router.push("/galleries/services");
        } else {
          showToast(result.error, "error");
        }
      } else {
        if (!initialData?.id) {
          showToast("Service ID is missing", "error");
          setIsSaving(false);
          return;
        }

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
          showToast("Service updated successfully", "success");
          router.push("/galleries/services");
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

          {/* Category and Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

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
            <div className="flex items-start justify-between gap-4">
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
                  {formatServicePrice(formData.priceCents)}
                </p>
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
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
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
            disabled={isSaving || !formData.name || formData.priceCents <= 0}
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

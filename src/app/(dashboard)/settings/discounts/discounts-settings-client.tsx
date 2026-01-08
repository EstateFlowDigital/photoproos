"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createOrgDiscount,
  updateOrgDiscount,
  deleteOrgDiscount,
  toggleOrgDiscountActive,
  generateOrgDiscountQrCode,
  type OrgDiscountListItem,
  type CreateOrgDiscountInput,
} from "@/lib/actions/organization-discounts";
import type { DiscountType, DiscountAppliesTo } from "@prisma/client";

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function ToggleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
      <circle cx="8" cy="12" r="2" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function QrCodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function PercentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Type labels
const TYPE_CONFIG: Record<DiscountType, { label: string; icon: typeof PercentIcon }> = {
  percentage: { label: "Percentage", icon: PercentIcon },
  fixed_amount: { label: "Fixed Amount", icon: DollarIcon },
  free_trial: { label: "Free Trial", icon: TagIcon },
  free_months: { label: "Free Months", icon: TagIcon },
};

const APPLIES_TO_LABELS: Record<DiscountAppliesTo, string> = {
  subscription: "Subscriptions",
  all_services: "All Services",
  specific_services: "Specific Services",
  gallery: "Gallery Delivery",
  booking: "Bookings",
  all: "Everything",
};

interface DiscountsSettingsClientProps {
  initialDiscounts: OrgDiscountListItem[];
  totalDiscounts: number;
  stats: {
    totalDiscounts: number;
    activeDiscounts: number;
    totalRedemptions: number;
    totalSavings: number;
  } | null;
}

export function DiscountsSettingsClient({
  initialDiscounts,
  totalDiscounts,
  stats,
}: DiscountsSettingsClientProps) {
  const [discounts, setDiscounts] = useState<OrgDiscountListItem[]>(initialDiscounts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<OrgDiscountListItem | null>(null);
  const [qrModalDiscount, setQrModalDiscount] = useState<OrgDiscountListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Refs for focus management
  const createModalRef = useRef<HTMLDivElement>(null);
  const qrModalRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key to close modals
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (qrModalDiscount) {
        setQrModalDiscount(null);
      } else if (isCreateModalOpen || editingDiscount) {
        setIsCreateModalOpen(false);
        setEditingDiscount(null);
        resetForm();
      }
    }
  }, [qrModalDiscount, isCreateModalOpen, editingDiscount]);

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [handleEscapeKey]);

  useEffect(() => {
    if (isCreateModalOpen || editingDiscount) {
      createModalRef.current?.focus();
    } else if (qrModalDiscount) {
      qrModalRef.current?.focus();
    }
  }, [isCreateModalOpen, editingDiscount, qrModalDiscount]);

  // Form state
  const [formData, setFormData] = useState<CreateOrgDiscountInput>({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    appliesTo: "gallery",
    maxUses: 0,
    usagePerUser: 1,
    isActive: true,
    isPublic: false,
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      appliesTo: "gallery",
      maxUses: 0,
      usagePerUser: 1,
      isActive: true,
      isPublic: false,
    });
  };

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createOrgDiscount(formData);
      if (result.success && result.data) {
        setDiscounts([result.data, ...discounts]);
        setIsCreateModalOpen(false);
        resetForm();
        toast.success("Discount code created");
      } else {
        toast.error(result.error || "Failed to create discount");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingDiscount) return;

    startTransition(async () => {
      const result = await updateOrgDiscount(editingDiscount.id, formData);
      if (result.success && result.data) {
        setDiscounts(discounts.map((d) => (d.id === editingDiscount.id ? result.data! : d)));
        setEditingDiscount(null);
        resetForm();
        toast.success("Discount updated");
      } else {
        toast.error(result.error || "Failed to update discount");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return;

    startTransition(async () => {
      const result = await deleteOrgDiscount(id);
      if (result.success) {
        setDiscounts(discounts.filter((d) => d.id !== id));
        toast.success("Discount deleted");
      } else {
        toast.error(result.error || "Failed to delete discount");
      }
    });
  };

  const handleToggleActive = (discount: OrgDiscountListItem) => {
    startTransition(async () => {
      const result = await toggleOrgDiscountActive(discount.id);
      if (result.success && result.data) {
        setDiscounts(discounts.map((d) => (d.id === discount.id ? { ...d, isActive: result.data!.isActive } : d)));
        toast.success(result.data.isActive ? "Discount activated" : "Discount deactivated");
      } else {
        toast.error(result.error || "Failed to toggle discount");
      }
    });
  };

  const handleGenerateQr = (discount: OrgDiscountListItem) => {
    startTransition(async () => {
      const baseUrl = window.location.origin;
      const result = await generateOrgDiscountQrCode(discount.id, baseUrl);
      if (result.success && result.data) {
        setDiscounts(discounts.map((d) => (d.id === discount.id ? { ...d, qrCodeUrl: result.data!.qrCodeUrl } : d)));
        setQrModalDiscount({ ...discount, qrCodeUrl: result.data.qrCodeUrl });
      } else {
        toast.error(result.error || "Failed to generate QR code");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const openEditModal = (discount: OrgDiscountListItem) => {
    setFormData({
      code: discount.code,
      name: discount.name || "",
      description: discount.description || "",
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      appliesTo: discount.appliesTo,
      maxUses: discount.maxUses || 0,
      usagePerUser: discount.usagePerUser,
      isActive: discount.isActive,
      isPublic: discount.isPublic,
    });
    setEditingDiscount(discount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Client Discounts</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Create and manage discount codes for your clients
          </p>
        </div>
        <button
          ref={triggerButtonRef}
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Create new discount code"
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
            "transition-colors font-medium",
            "w-full sm:w-auto"
          )}
        >
          <PlusIcon className="w-4 h-4" aria-hidden="true" />
          New Discount
        </button>
      </header>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Discount statistics">
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
              <TagIcon className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">Total Codes</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{stats.totalDiscounts}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <ToggleIcon className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{stats.activeDiscounts}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <UsersIcon className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">Redemptions</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{stats.totalRedemptions}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <DollarIcon className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">Savings Given</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(stats.totalSavings)}</p>
          </div>
        </div>
      )}

      {/* Discounts List */}
      <section className="rounded-lg border border-[var(--border)] overflow-hidden" aria-labelledby="discounts-list-heading">
        <div className="bg-[var(--card)] px-4 py-3 border-b border-[var(--border)]">
          <h2 id="discounts-list-heading" className="font-medium text-[var(--foreground)]">
            Your Discount Codes ({totalDiscounts})
          </h2>
        </div>

        {discounts.length === 0 ? (
          <div className="p-8 text-center">
            <TagIcon className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" aria-hidden="true" />
            <p className="text-[var(--foreground-muted)]">No discount codes yet. Create your first one!</p>
            <p className="text-sm text-[var(--foreground-muted)] mt-2">
              Share discount codes with your clients via QR codes or direct links.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]" role="list" aria-label="Discount codes list">
            {discounts.map((discount) => (
              <li
                key={discount.id}
                className={cn(
                  "p-4 hover:bg-[var(--background-tertiary)] transition-colors",
                  !discount.isActive && "opacity-60"
                )}
              >
                <article className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <code className="px-2 py-1 rounded bg-[var(--background-tertiary)] text-[var(--primary)] font-mono font-medium text-sm sm:text-base">
                        {discount.code}
                      </code>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {discount.discountType === "percentage"
                          ? `${discount.discountValue}% off`
                          : discount.discountType === "fixed_amount"
                          ? `${formatCurrency(discount.discountValue)} off`
                          : TYPE_CONFIG[discount.discountType].label}
                      </span>
                      {!discount.isActive && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--background-tertiary)] text-[var(--foreground-muted)]" aria-label="Status: Inactive">
                          Inactive
                        </span>
                      )}
                    </div>
                    {discount.name && (
                      <p className="text-sm text-[var(--foreground)] mb-1">{discount.name}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[var(--foreground-muted)]">
                      <span>Applies to: {APPLIES_TO_LABELS[discount.appliesTo]}</span>
                      <span>{discount.usedCount} used</span>
                      {discount.maxUses && discount.maxUses > 0 && (
                        <span>Limit: {discount.maxUses}</span>
                      )}
                      <span className="hidden sm:inline">Created {formatDate(discount.createdAt)}</span>
                      {discount.validUntil && (
                        <span>Expires {formatDate(discount.validUntil)}</span>
                      )}
                    </div>
                  </div>
                  <nav className="flex items-center gap-1" aria-label={`Actions for ${discount.code}`}>
                    <button
                      onClick={() => discount.qrCodeUrl ? setQrModalDiscount(discount) : handleGenerateQr(discount)}
                      disabled={isPending}
                      aria-label={`Generate QR code for ${discount.code}`}
                      className={cn(
                        "p-2 rounded-lg text-[var(--foreground-muted)]",
                        "hover:bg-[var(--background-tertiary)] transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <QrCodeIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(discount.code)}
                      aria-label={`Copy code ${discount.code} to clipboard`}
                      className={cn(
                        "p-2 rounded-lg text-[var(--foreground-muted)]",
                        "hover:bg-[var(--background-tertiary)] transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]"
                      )}
                    >
                      <CopyIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(discount)}
                      disabled={isPending}
                      aria-label={discount.isActive ? `Deactivate ${discount.code}` : `Activate ${discount.code}`}
                      aria-pressed={discount.isActive}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
                        discount.isActive
                          ? "text-green-400 hover:bg-green-500/10"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <ToggleIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => openEditModal(discount)}
                      disabled={isPending}
                      aria-label={`Edit ${discount.code}`}
                      className={cn(
                        "p-2 rounded-lg text-[var(--foreground-muted)]",
                        "hover:bg-[var(--background-tertiary)] transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <EditIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      disabled={isPending}
                      aria-label={`Delete ${discount.code}`}
                      className={cn(
                        "p-2 rounded-lg text-[var(--foreground-muted)]",
                        "hover:bg-red-500/10 hover:text-red-400 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-[var(--background)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <TrashIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </nav>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingDiscount) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCreateModalOpen(false);
              setEditingDiscount(null);
              resetForm();
            }
          }}
        >
          <div
            ref={createModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discount-modal-title"
            tabIndex={-1}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)] focus:outline-none"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card)]">
              <h2 id="discount-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
                {editingDiscount ? "Edit Discount" : "Create Discount"}
              </h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingDiscount(null);
                  resetForm();
                }}
                aria-label="Close dialog"
                className={cn(
                  "p-2 rounded-lg text-[var(--foreground-muted)]",
                  "hover:bg-[var(--background-tertiary)] transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                )}
              >
                <XIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingDiscount) {
                  handleUpdate();
                } else {
                  handleCreate();
                }
              }}
              className="p-4 space-y-4"
            >
              {/* Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discount-code" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Code <span className="text-red-400" aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id="discount-code"
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME10"
                    className={cn(
                      "w-full px-3 py-2 rounded-lg font-mono",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="discount-name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Internal Name
                  </label>
                  <input
                    id="discount-name"
                    type="text"
                    autoComplete="off"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="New Client Welcome"
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    )}
                  />
                </div>
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discount-type" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Discount Type
                  </label>
                  <select
                    id="discount-type"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    )}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="discount-value" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    {formData.discountType === "percentage" ? "Percentage" : "Amount (cents)"}
                  </label>
                  <input
                    id="discount-value"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={formData.discountType === "percentage" ? 100 : undefined}
                    aria-describedby={formData.discountType === "percentage" ? "value-hint" : undefined}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    )}
                  />
                  {formData.discountType === "percentage" && (
                    <p id="value-hint" className="text-xs text-[var(--foreground-muted)] mt-1">
                      Enter a value between 0 and 100
                    </p>
                  )}
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label htmlFor="applies-to" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Applies To
                </label>
                <select
                  id="applies-to"
                  value={formData.appliesTo}
                  onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as DiscountAppliesTo })}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    "bg-[var(--background)] border border-[var(--border)]",
                    "text-[var(--foreground)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                >
                  <option value="gallery">Gallery Delivery</option>
                  <option value="booking">Bookings</option>
                  <option value="all_services">All Services</option>
                  <option value="all">Everything</option>
                </select>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="max-uses" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Max Uses
                  </label>
                  <input
                    id="max-uses"
                    type="number"
                    value={formData.maxUses || 0}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                    min={0}
                    aria-describedby="max-uses-hint"
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    )}
                  />
                  <p id="max-uses-hint" className="text-xs text-[var(--foreground-muted)] mt-1">
                    0 = unlimited
                  </p>
                </div>
                <div>
                  <label htmlFor="uses-per-user" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Uses Per Client
                  </label>
                  <input
                    id="uses-per-user"
                    type="number"
                    value={formData.usagePerUser || 1}
                    onChange={(e) => setFormData({ ...formData, usagePerUser: parseInt(e.target.value) || 1 })}
                    min={1}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="discount-description" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Description
                </label>
                <textarea
                  id="discount-description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Internal notes about this discount..."
                  rows={2}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg resize-none",
                    "bg-[var(--background)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                />
              </div>

              {/* Options */}
              <fieldset className="flex flex-wrap items-center gap-4 sm:gap-6">
                <legend className="sr-only">Discount options</legend>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className={cn(
                      "w-4 h-4 rounded border-[var(--border)]",
                      "bg-[var(--background)] text-[var(--primary)]",
                      "focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                    )}
                  />
                  <span className="text-sm text-[var(--foreground)]">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className={cn(
                      "w-4 h-4 rounded border-[var(--border)]",
                      "bg-[var(--background)] text-[var(--primary)]",
                      "focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                    )}
                  />
                  <span className="text-sm text-[var(--foreground)]">Public</span>
                </label>
              </fieldset>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingDiscount(null);
                    resetForm();
                  }}
                  className={cn(
                    "w-full sm:w-auto px-4 py-2 rounded-lg",
                    "text-[var(--foreground)] bg-[var(--background-tertiary)]",
                    "hover:bg-[var(--background-hover)] transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !formData.code}
                  className={cn(
                    "w-full sm:w-auto px-4 py-2 rounded-lg font-medium",
                    "bg-[var(--primary)] text-white",
                    "hover:bg-[var(--primary)]/90 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isPending ? "Saving..." : editingDiscount ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalDiscount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setQrModalDiscount(null);
            }
          }}
        >
          <div
            ref={qrModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            tabIndex={-1}
            className="w-full max-w-md bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)] focus:outline-none"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 id="qr-modal-title" className="text-lg font-semibold text-[var(--foreground)]">Share Discount</h2>
              <button
                onClick={() => setQrModalDiscount(null)}
                aria-label="Close dialog"
                className={cn(
                  "p-2 rounded-lg text-[var(--foreground-muted)]",
                  "hover:bg-[var(--background-tertiary)] transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                )}
              >
                <XIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <code className="inline-block px-4 py-2 rounded-lg bg-[var(--background-tertiary)] text-[var(--primary)] font-mono text-xl font-bold">
                {qrModalDiscount.code}
              </code>

              {qrModalDiscount.qrCodeUrl && (
                <div className="flex justify-center">
                  <img
                    src={qrModalDiscount.qrCodeUrl}
                    alt={`QR Code for ${qrModalDiscount.code}`}
                    className="w-48 h-48 rounded-lg bg-white p-2"
                  />
                </div>
              )}

              {qrModalDiscount.shareableSlug && (
                <div className="space-y-2">
                  <label htmlFor="shareable-link" className="text-sm text-[var(--foreground-muted)]">
                    Shareable Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="shareable-link"
                      type="text"
                      readOnly
                      value={`${window.location.origin}/discount/${qrModalDiscount.shareableSlug}`}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-sm",
                        "bg-[var(--background)] border border-[var(--border)]",
                        "text-[var(--foreground)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      )}
                    />
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/discount/${qrModalDiscount.shareableSlug}`)}
                      aria-label="Copy shareable link"
                      className={cn(
                        "p-2 rounded-lg",
                        "bg-[var(--primary)] text-white",
                        "hover:bg-[var(--primary)]/90 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                      )}
                    >
                      <CopyIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  onClick={() => copyToClipboard(qrModalDiscount.code)}
                  aria-label={`Copy discount code ${qrModalDiscount.code}`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-[var(--background-tertiary)] text-[var(--foreground)]",
                    "hover:bg-[var(--background-hover)] transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  )}
                >
                  <CopyIcon className="w-4 h-4" aria-hidden="true" />
                  Copy Code
                </button>
                {qrModalDiscount.qrCodeUrl && (
                  <a
                    href={qrModalDiscount.qrCodeUrl}
                    download={`${qrModalDiscount.code}-qr.png`}
                    aria-label={`Download QR code for ${qrModalDiscount.code}`}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      "bg-[var(--primary)] text-white",
                      "hover:bg-[var(--primary)]/90 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                    )}
                  >
                    <QrCodeIcon className="w-4 h-4" aria-hidden="true" />
                    Download QR
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

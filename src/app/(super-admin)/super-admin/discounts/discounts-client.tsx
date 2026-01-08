"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createPlatformDiscount,
  updatePlatformDiscount,
  deletePlatformDiscount,
  toggleDiscountActive,
  generateDiscountQrCode,
  type DiscountCodeListItem,
  type CreateDiscountInput,
} from "@/lib/actions/super-admin";
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

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

// Type labels and colors
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

interface DiscountsPageClientProps {
  initialDiscounts: DiscountCodeListItem[];
  totalDiscounts: number;
  stats: {
    totalPlatformDiscounts: number;
    activePlatformDiscounts: number;
    totalRedemptions: number;
    totalSavings: number;
    topDiscounts: Array<{ code: string; usedCount: number; totalSavings: number }>;
    recentRedemptions: number;
  } | null;
}

export function DiscountsPageClient({
  initialDiscounts,
  totalDiscounts,
  stats,
}: DiscountsPageClientProps) {
  const [discounts, setDiscounts] = useState<DiscountCodeListItem[]>(initialDiscounts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCodeListItem | null>(null);
  const [qrModalDiscount, setQrModalDiscount] = useState<DiscountCodeListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState<Omit<CreateDiscountInput, "scope">>({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 20,
    appliesTo: "subscription",
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
      discountValue: 20,
      appliesTo: "subscription",
      maxUses: 0,
      usagePerUser: 1,
      isActive: true,
      isPublic: false,
    });
  };

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createPlatformDiscount({
        ...formData,
        scope: "platform",
      });
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
      const result = await updatePlatformDiscount({
        id: editingDiscount.id,
        ...formData,
      });
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
      const result = await deletePlatformDiscount(id);
      if (result.success) {
        setDiscounts(discounts.filter((d) => d.id !== id));
        toast.success("Discount deleted");
      } else {
        toast.error(result.error || "Failed to delete discount");
      }
    });
  };

  const handleToggleActive = (discount: DiscountCodeListItem) => {
    startTransition(async () => {
      const result = await toggleDiscountActive(discount.id);
      if (result.success && result.data) {
        setDiscounts(discounts.map((d) => (d.id === discount.id ? { ...d, isActive: result.data!.isActive } : d)));
        toast.success(result.data.isActive ? "Discount activated" : "Discount deactivated");
      } else {
        toast.error(result.error || "Failed to toggle discount");
      }
    });
  };

  const handleGenerateQr = (discount: DiscountCodeListItem) => {
    startTransition(async () => {
      const baseUrl = window.location.origin;
      const result = await generateDiscountQrCode(discount.id, baseUrl);
      if (result.success && result.data) {
        setDiscounts(discounts.map((d) => (d.id === discount.id ? { ...d, qrCodeUrl: result.data!.qrCodeUrl, shareableSlug: discount.shareableSlug } : d)));
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

  const openEditModal = (discount: DiscountCodeListItem) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Discount Codes</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Create and manage platform-wide discount codes for subscriptions
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90",
            "transition-colors font-medium"
          )}
        >
          <PlusIcon className="w-4 h-4" />
          New Discount
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
              <TagIcon className="w-4 h-4" />
              <span className="text-sm">Total Codes</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{stats.totalPlatformDiscounts}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <ToggleIcon className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{stats.activePlatformDiscounts}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <UsersIcon className="w-4 h-4" />
              <span className="text-sm">Redemptions</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{stats.totalRedemptions}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <DollarIcon className="w-4 h-4" />
              <span className="text-sm">Total Savings</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(stats.totalSavings)}</p>
          </div>
        </div>
      )}

      {/* Discounts List */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--card)] px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-medium text-[var(--foreground)]">All Discount Codes ({totalDiscounts})</h2>
        </div>

        {discounts.length === 0 ? (
          <div className="p-8 text-center">
            <TagIcon className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
            <p className="text-[var(--foreground-muted)]">No discount codes yet. Create your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className={cn(
                  "p-4 hover:bg-[var(--background-tertiary)] transition-colors",
                  !discount.isActive && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <code className="px-2 py-1 rounded bg-[var(--background-tertiary)] text-[var(--primary)] font-mono font-medium">
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
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                          Inactive
                        </span>
                      )}
                    </div>
                    {discount.name && (
                      <p className="text-sm text-[var(--foreground)] mb-1">{discount.name}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                      <span>Applies to: {APPLIES_TO_LABELS[discount.appliesTo]}</span>
                      <span>{discount.usedCount} used</span>
                      {discount.maxUses && discount.maxUses > 0 && (
                        <span>Limit: {discount.maxUses}</span>
                      )}
                      <span>Created {formatDate(discount.createdAt)}</span>
                      {discount.validUntil && (
                        <span>Expires {formatDate(discount.validUntil)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => discount.qrCodeUrl ? setQrModalDiscount(discount) : handleGenerateQr(discount)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] transition-colors"
                      title="QR Code & Share Link"
                    >
                      <QrCodeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(discount.code)}
                      className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] transition-colors"
                      title="Copy Code"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(discount)}
                      disabled={isPending}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        discount.isActive
                          ? "text-green-400 hover:bg-green-500/10"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]"
                      )}
                      title={discount.isActive ? "Deactivate" : "Activate"}
                    >
                      <ToggleIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(discount)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] transition-colors"
                      title="Edit"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingDiscount) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)]">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingDiscount ? "Edit Discount" : "Create Discount"}
              </h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingDiscount(null);
                  resetForm();
                }}
                className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER20"
                    className={cn(
                      "w-full px-3 py-2 rounded-lg font-mono",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Internal Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Summer Sale 2024"
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  />
                </div>
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  >
                    {Object.entries(TYPE_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    {formData.discountType === "percentage" ? "Percentage" : "Amount (cents)"}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={formData.discountType === "percentage" ? 100 : undefined}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  />
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Applies To
                </label>
                <select
                  value={formData.appliesTo}
                  onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as DiscountAppliesTo })}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    "bg-[var(--background)] border border-[var(--border)]",
                    "text-[var(--foreground)]",
                    "focus:outline-none focus:border-[var(--primary)]"
                  )}
                >
                  {Object.entries(APPLIES_TO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Max Uses (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses || 0}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                    min={0}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Uses Per User
                  </label>
                  <input
                    type="number"
                    value={formData.usagePerUser || 1}
                    onChange={(e) => setFormData({ ...formData, usagePerUser: parseInt(e.target.value) || 1 })}
                    min={1}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Internal notes about this discount..."
                  rows={2}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg resize-none",
                    "bg-[var(--background)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:border-[var(--primary)]"
                  )}
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">Public</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t border-[var(--border)] bg-[var(--card)]">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingDiscount(null);
                  resetForm();
                }}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "text-[var(--foreground)] bg-[var(--background-tertiary)]",
                  "hover:bg-[var(--background-hover)] transition-colors"
                )}
              >
                Cancel
              </button>
              <button
                onClick={editingDiscount ? handleUpdate : handleCreate}
                disabled={isPending || !formData.code}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium",
                  "bg-[var(--primary)] text-white",
                  "hover:bg-[var(--primary)]/90 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isPending ? "Saving..." : editingDiscount ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Share Discount</h2>
              <button
                onClick={() => setQrModalDiscount(null)}
                className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <XIcon className="w-5 h-5" />
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
                  <p className="text-sm text-[var(--foreground-muted)]">Shareable Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/discount/${qrModalDiscount.shareableSlug}`}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-sm",
                        "bg-[var(--background)] border border-[var(--border)]",
                        "text-[var(--foreground)]"
                      )}
                    />
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/discount/${qrModalDiscount.shareableSlug}`)}
                      className={cn(
                        "p-2 rounded-lg",
                        "bg-[var(--primary)] text-white",
                        "hover:bg-[var(--primary)]/90 transition-colors"
                      )}
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => copyToClipboard(qrModalDiscount.code)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-[var(--background-tertiary)] text-[var(--foreground)]",
                    "hover:bg-[var(--background-hover)] transition-colors"
                  )}
                >
                  <CopyIcon className="w-4 h-4" />
                  Copy Code
                </button>
                {qrModalDiscount.qrCodeUrl && (
                  <a
                    href={qrModalDiscount.qrCodeUrl}
                    download={`${qrModalDiscount.code}-qr.png`}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      "bg-[var(--primary)] text-white",
                      "hover:bg-[var(--primary)]/90 transition-colors"
                    )}
                  >
                    <QrCodeIcon className="w-4 h-4" />
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

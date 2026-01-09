"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  createBookingType,
  updateBookingType,
  deleteBookingType,
} from "@/lib/actions/booking-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal";

interface BookingType {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  color: string;
  isActive: boolean;
  _count: {
    bookings: number;
  };
}

interface BookingTypesClientProps {
  bookingTypes: BookingType[];
}

const COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#22c55e", label: "Green" },
  { value: "#f97316", label: "Orange" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#78716c", label: "Gray" },
];

export function BookingTypesClient({ bookingTypes }: BookingTypesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<BookingType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMinutes: 60,
    priceCents: 0,
    color: "#3b82f6",
    isActive: true,
  });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBookingType({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        durationMinutes: formData.durationMinutes,
        priceCents: formData.priceCents,
        color: formData.color,
        isActive: formData.isActive,
      });

      if (result.success) {
        showToast("Booking type created", "success");
        setIsCreateModalOpen(false);
        resetForm();
        router.refresh();
      } else {
        showToast(result.error, "error");
      }
    } catch {
      showToast("Failed to create booking type", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedType || !formData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateBookingType(selectedType.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        durationMinutes: formData.durationMinutes,
        priceCents: formData.priceCents,
        color: formData.color,
        isActive: formData.isActive,
      });

      if (result.success) {
        showToast("Booking type updated", "success");
        setIsEditModalOpen(false);
        setSelectedType(null);
        resetForm();
        router.refresh();
      } else {
        showToast(result.error, "error");
      }
    } catch {
      showToast("Failed to update booking type", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;

    const result = await deleteBookingType(selectedType.id);

    if (result.success) {
      showToast("Booking type deleted", "success");
      setIsDeleteModalOpen(false);
      setSelectedType(null);
      router.refresh();
    } else {
      showToast(result.error, "error");
    }
  };

  const openEditModal = (type: BookingType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
      durationMinutes: type.durationMinutes,
      priceCents: type.priceCents,
      color: type.color,
      isActive: type.isActive,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (type: BookingType) => {
    setSelectedType(type);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      durationMinutes: 60,
      priceCents: 0,
      color: "#3b82f6",
      isActive: true,
    });
  };

  const activeTypes = bookingTypes.filter((t) => t.isActive);
  const inactiveTypes = bookingTypes.filter((t) => !t.isActive);

  return (
    <>
      <div className="space-y-6">
        {/* Header with create button */}
        <div className="stack-header">
          <p className="text-sm text-foreground-muted">
            {bookingTypes.length} booking type{bookingTypes.length !== 1 ? "s" : ""}
          </p>
          <div className="stack-actions">
            <button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Type
            </button>
          </div>
        </div>

        {/* Active Types */}
        {activeTypes.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-foreground-muted mb-3">Active</h3>
            <div className="auto-grid grid-min-240 grid-gap-4">
              {activeTypes.map((type) => (
                <BookingTypeCard
                  key={type.id}
                  type={type}
                  formatDuration={formatDuration}
                  formatPrice={formatPrice}
                  onEdit={() => openEditModal(type)}
                  onDelete={() => openDeleteModal(type)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Types */}
        {inactiveTypes.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-foreground-muted mb-3">Inactive</h3>
            <div className="auto-grid grid-min-240 grid-gap-4">
              {inactiveTypes.map((type) => (
                <BookingTypeCard
                  key={type.id}
                  type={type}
                  formatDuration={formatDuration}
                  formatPrice={formatPrice}
                  onEdit={() => openEditModal(type)}
                  onDelete={() => openDeleteModal(type)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookingTypes.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
            <div className="mx-auto rounded-full bg-[var(--primary)]/10 p-4 w-fit mb-4">
              <TagIcon className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No booking types yet</h3>
            <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
              Create booking types to categorize your sessions and set default durations.
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Your First Type
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Booking Type</DialogTitle>
            <DialogDescription>
              Add a new booking type to categorize your sessions.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <BookingTypeForm
              formData={formData}
              setFormData={setFormData}
            />
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Type"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking Type</DialogTitle>
            <DialogDescription>
              Update the booking type details.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <BookingTypeForm
              formData={formData}
              setFormData={setFormData}
            />
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEdit}
              disabled={isSubmitting}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
        title="Delete Booking Type"
        description={
          selectedType?._count.bookings
            ? `This booking type has ${selectedType._count.bookings} associated booking${selectedType._count.bookings > 1 ? "s" : ""}. You must reassign or delete these bookings first.`
            : "Are you sure you want to delete this booking type? This action cannot be undone."
        }
        itemName={selectedType?.name || ""}
      />
    </>
  );
}

interface BookingTypeCardProps {
  type: BookingType;
  formatDuration: (minutes: number) => string;
  formatPrice: (cents: number) => string;
  onEdit: () => void;
  onDelete: () => void;
}

function BookingTypeCard({
  type,
  formatDuration,
  formatPrice,
  onEdit,
  onDelete,
}: BookingTypeCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all",
        !type.isActive && "opacity-60"
      )}
    >
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: type.color }}
          />
          <h3 className="font-medium text-foreground">{type.name}</h3>
        </div>
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={onEdit}
            className="rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {type.description && (
        <p className="text-sm text-foreground-muted mb-4 line-clamp-2">
          {type.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-foreground-secondary">
          <ClockIcon className="h-4 w-4" />
          {formatDuration(type.durationMinutes)}
        </span>
        <span className="text-foreground font-medium">
          {formatPrice(type.priceCents)}
        </span>
      </div>

      {type._count.bookings > 0 && (
        <p className="mt-3 text-xs text-foreground-muted">
          {type._count.bookings} booking{type._count.bookings > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

interface BookingTypeFormProps {
  formData: {
    name: string;
    description: string;
    durationMinutes: number;
    priceCents: number;
    color: string;
    isActive: boolean;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      durationMinutes: number;
      priceCents: number;
      color: string;
      isActive: boolean;
    }>
  >;
}

function BookingTypeForm({ formData, setFormData }: BookingTypeFormProps) {
  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Name <span className="text-[var(--error)]">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g., Real Estate Shoot"
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of this booking type"
          rows={2}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
        />
      </div>

      {/* Duration and Price */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                durationMinutes: parseInt(e.target.value) || 60,
              }))
            }
            min={15}
            step={15}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Default Price ($)
          </label>
          <input
            type="number"
            value={formData.priceCents / 100}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priceCents: Math.round(parseFloat(e.target.value) * 100) || 0,
              }))
            }
            min={0}
            step={25}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, color: color.value }))
              }
              className={cn(
                "h-8 w-8 rounded-full transition-all",
                formData.color === color.value
                  ? "ring-2 ring-offset-2 ring-offset-[var(--card)]"
                  : "hover:scale-110"
              )}
              style={{
                backgroundColor: color.value,
                // @ts-expect-error - Tailwind CSS custom property
                "--tw-ring-color": color.value,
              }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Active</p>
          <p className="text-xs text-foreground-muted">
            Inactive types won&apos;t appear in booking forms
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
          }
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            formData.isActive ? "bg-[var(--primary)]" : "bg-[var(--background-secondary)]"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              formData.isActive ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.379 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

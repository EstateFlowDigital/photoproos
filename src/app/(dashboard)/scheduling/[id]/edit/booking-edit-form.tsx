"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { ServiceSelector, type DatabaseServiceType } from "@/components/dashboard/service-selector";
import { updateBooking } from "@/lib/actions/bookings";
import { getServiceById, type ServiceType } from "@/lib/services";

// Union type for selected service (can be static or database service)
type SelectedService = ServiceType | DatabaseServiceType | null;

interface FieldErrors {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  address?: string;
}

interface BookingEditFormProps {
  booking: {
    id: string;
    title: string;
    type: string;
    status: "confirmed" | "pending" | "completed" | "cancelled";
    client: { id: string; name: string; email: string; phone: string };
    date: string;
    startTime: string;
    endTime: string;
    location: { address: string; notes: string | null };
    notes: string | null;
    price: number;
    deposit: number;
    depositPaid: boolean;
    serviceId?: string;
    serviceDescription?: string;
  };
  clients: { id: string; name: string }[];
}

export function BookingEditForm({ booking, clients }: BookingEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Get initial service if serviceId exists
  const initialService = booking.serviceId ? getServiceById(booking.serviceId) : null;

  const [selectedService, setSelectedService] = useState<SelectedService>(initialService || null);
  const [price, setPrice] = useState(booking.price);
  const [description, setDescription] = useState(booking.serviceDescription || "");

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "title" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, title: "Session title is required" }));
    } else if (field === "date" && !value) {
      setFieldErrors((prev) => ({ ...prev, date: "Date is required" }));
    } else if (field === "startTime" && !value) {
      setFieldErrors((prev) => ({ ...prev, startTime: "Start time is required" }));
    } else if (field === "endTime" && !value) {
      setFieldErrors((prev) => ({ ...prev, endTime: "End time is required" }));
    } else if (field === "address" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, address: "Address is required" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getInputClassName = (fieldName: keyof FieldErrors) => {
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    return cn(
      "w-full rounded-lg border bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1",
      hasError
        ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
        : "border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const clientId = formData.get("client") as string;
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const address = formData.get("address") as string;
    const locationNotes = formData.get("locationNotes") as string;
    const notes = formData.get("notes") as string;

    // Validate all fields
    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = "Session title is required";
    if (!date) errors.date = "Date is required";
    if (!startTime) errors.startTime = "Start time is required";
    if (!endTime) errors.endTime = "End time is required";
    if (!address.trim()) errors.address = "Address is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ title: true, date: true, startTime: true, endTime: true, address: true });
      return;
    }

    // Create Date objects from date and time
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      setFieldErrors((prev) => ({ ...prev, endTime: "End time must be after start time" }));
      return;
    }

    startTransition(async () => {
      const result = await updateBooking({
        id: booking.id,
        title,
        clientId: clientId || undefined,
        serviceId: selectedService?.id || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        location: address,
        locationNotes: locationNotes || undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        setSuccess(true);
        showToast("Booking updated successfully", "success");
        setTimeout(() => {
          router.push(`/scheduling/${booking.id}`);
        }, 1000);
      } else {
        setError(result.error);
        showToast(result.error, "error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
          <p className="text-sm text-[var(--success)]">Booking updated successfully! Redirecting...</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Session Details</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
              Session Title <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={booking.title}
              placeholder="e.g., Downtown Luxury Listing"
              onBlur={(e) => handleBlur("title", e.target.value)}
              className={getInputClassName("title")}
            />
            {touched.title && fieldErrors.title && (
              <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-foreground mb-1.5">
              Client
            </label>
            <select
              id="client"
              name="client"
              defaultValue={booking.client.id}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="">No client selected</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Date & Time</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1.5">
              Date <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={booking.date}
              onBlur={(e) => handleBlur("date", e.target.value)}
              className={getInputClassName("date")}
            />
            {touched.date && fieldErrors.date && (
              <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.date}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-foreground mb-1.5">
                Start Time <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                defaultValue={booking.startTime}
                onBlur={(e) => handleBlur("startTime", e.target.value)}
                className={getInputClassName("startTime")}
              />
              {touched.startTime && fieldErrors.startTime && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.startTime}</p>
              )}
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-foreground mb-1.5">
                End Time <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                defaultValue={booking.endTime}
                onBlur={(e) => handleBlur("endTime", e.target.value)}
                className={getInputClassName("endTime")}
              />
              {touched.endTime && fieldErrors.endTime && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.endTime}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Location</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
              Address <span className="text-[var(--error)]">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              defaultValue={booking.location.address}
              placeholder="Enter the full address..."
              onBlur={(e) => handleBlur("address", e.target.value)}
              className={cn(getInputClassName("address"), "resize-none")}
            />
            {touched.address && fieldErrors.address && (
              <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.address}</p>
            )}
          </div>

          <div>
            <label htmlFor="locationNotes" className="block text-sm font-medium text-foreground mb-1.5">
              Access Instructions
            </label>
            <textarea
              id="locationNotes"
              name="locationNotes"
              rows={2}
              defaultValue={booking.location.notes || ""}
              placeholder="Parking info, entry codes, contact on-site, etc."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Service & Pricing */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Service & Pricing</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Select a predefined service package or set custom pricing for this session.
        </p>

        <ServiceSelector
          selectedServiceId={selectedService?.id}
          customPrice={price}
          customDescription={description}
          onServiceChange={setSelectedService}
          onPriceChange={setPrice}
          onDescriptionChange={setDescription}
          mode="booking"
        />

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="serviceId" value={selectedService?.id || ""} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="serviceDescription" value={description} />

        {/* Deposit field */}
        <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="deposit" className="block text-sm font-medium text-foreground mb-1.5">
                Deposit Required
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                <input
                  type="number"
                  id="deposit"
                  name="deposit"
                  defaultValue={booking.deposit / 100}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  name="depositPaid"
                  defaultChecked={booking.depositPaid}
                  className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-foreground">Deposit has been paid</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Session Notes</h2>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
            Notes & Special Requirements
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={booking.notes || ""}
            placeholder="Equipment needed, special requests, important details..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />
          <p className="mt-2 text-xs text-foreground-muted">
            These notes are visible only to you and your team
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

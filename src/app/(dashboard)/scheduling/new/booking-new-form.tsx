"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ServiceSelector, type DatabaseServiceType } from "@/components/dashboard/service-selector";
import { createBooking } from "@/lib/actions/bookings";
import type { ServiceType } from "@/lib/services";

// Union type for selected service (can be static or database service)
type SelectedService = ServiceType | DatabaseServiceType | null;

interface Client {
  id: string;
  name: string;
  contact: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  duration: string | null;
  description: string | null;
}

interface BookingNewFormProps {
  clients: Client[];
  timeSlots: { value: string; label: string }[];
  services: Service[];
}

export function BookingNewForm({ clients, timeSlots, services }: BookingNewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<SelectedService>(null);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const clientId = formData.get("clientId") as string;
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const address = formData.get("address") as string;
    const locationNotes = formData.get("locationNotes") as string;
    const notes = formData.get("notes") as string;

    // Validate required fields
    if (!title || !date || !startTime || !endTime || !address) {
      setError("Please fill in all required fields");
      return;
    }

    // Create Date objects from date and time
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
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
        router.push(`/scheduling/${result.data.id}`);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {/* Session Details */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Session Details</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
              Session Title <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Downtown Luxury Listing"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-foreground mb-1.5">
              Client
            </label>
            <select
              id="client"
              name="clientId"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="">Select a client (optional)...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.contact})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-foreground-muted">
              Or{" "}
              <Link href="/clients/new" className="text-[var(--primary)] hover:underline">
                create a new client
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Date & Time</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1.5">
              Date <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-foreground mb-1.5">
                Start Time <span className="text-[var(--error)]">*</span>
              </label>
              <select
                id="startTime"
                name="startTime"
                required
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select start time...</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-foreground mb-1.5">
                End Time <span className="text-[var(--error)]">*</span>
              </label>
              <select
                id="endTime"
                name="endTime"
                required
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select end time...</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
              Address <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="123 Main Street, San Francisco, CA 94102"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="locationNotes" className="block text-sm font-medium text-foreground mb-1.5">
              Location Notes
            </label>
            <textarea
              id="locationNotes"
              name="locationNotes"
              rows={2}
              placeholder="e.g., Park in visitor lot, enter through side gate..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Service & Pricing Section */}
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
          <label htmlFor="deposit" className="block text-sm font-medium text-foreground mb-1.5">
            Deposit Required
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
            <input
              type="number"
              id="deposit"
              name="deposit"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <p className="mt-1.5 text-xs text-foreground-muted">
            Optional deposit to secure the booking
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Session Notes</h2>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
            Notes & Requirements
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="e.g., Bring wide-angle lens, property will be staged, focus on kitchen and master bedroom..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="sendConfirmation"
              defaultChecked
              className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Send confirmation email</span>
              <p className="text-xs text-foreground-muted">Email the client with booking details</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="sendReminder"
              defaultChecked
              className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Send reminder</span>
              <p className="text-xs text-foreground-muted">Remind client 24 hours before the session</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="addToCalendar"
              defaultChecked
              className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Add to calendar</span>
              <p className="text-xs text-foreground-muted">Create a calendar event for this booking</p>
            </div>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/scheduling"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Creating...
            </>
          ) : (
            "Create Booking"
          )}
        </button>
      </div>
    </form>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { ServiceSelector, type DatabaseServiceType } from "@/components/dashboard/service-selector";
import type { ServiceType } from "@/lib/services";

// Union type for selected service (can be static or database service)
type SelectedService = ServiceType | DatabaseServiceType | null;

interface Client {
  id: string;
  name: string;
  contact: string;
}

interface BookingNewFormProps {
  clients: Client[];
  timeSlots: { value: string; label: string }[];
}

export function BookingNewForm({ clients, timeSlots }: BookingNewFormProps) {
  const [selectedService, setSelectedService] = useState<SelectedService>(null);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");

  return (
    <form className="space-y-6">
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
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-foreground mb-1.5">
              Client <span className="text-[var(--error)]">*</span>
            </label>
            <select
              id="client"
              name="clientId"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="">Select a client...</option>
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
          disabled
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Booking
        </button>
      </div>
    </form>
  );
}

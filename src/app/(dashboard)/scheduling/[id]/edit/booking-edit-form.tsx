"use client";

import { useState } from "react";
import Link from "next/link";
import { ServiceSelector } from "@/components/dashboard/service-selector";
import { getServiceById, type ServiceType } from "@/lib/services";
import { cn } from "@/lib/utils";

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
  // Get initial service if serviceId exists
  const initialService = booking.serviceId ? getServiceById(booking.serviceId) : null;

  const [selectedService, setSelectedService] = useState<ServiceType | null>(initialService || null);
  const [price, setPrice] = useState(booking.price);
  const [description, setDescription] = useState(booking.serviceDescription || "");

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const statusStyles = {
    confirmed: { bg: "bg-[var(--success)]/10", text: "text-[var(--success)]", label: "Confirmed" },
    pending: { bg: "bg-[var(--warning)]/10", text: "text-[var(--warning)]", label: "Pending" },
    completed: { bg: "bg-[var(--primary)]/10", text: "text-[var(--primary)]", label: "Completed" },
    cancelled: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Cancelled" },
  };

  return (
    <form id="edit-booking-form" className="space-y-6">
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
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-foreground mb-1.5">
              Client <span className="text-[var(--error)]">*</span>
            </label>
            <select
              id="client"
              name="client"
              defaultValue={booking.client.id}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
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
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
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
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
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
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
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
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
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
    </form>
  );
}

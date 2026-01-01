export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";

// Demo clients for dropdown
const demoClients = [
  { id: "1", name: "Premier Realty", contact: "John Peterson" },
  { id: "2", name: "Tech Solutions Inc", contact: "Lisa Chen" },
  { id: "3", name: "Bella Cucina", contact: "Marco Rossi" },
  { id: "4", name: "Design Studio Pro", contact: "Amanda Foster" },
  { id: "5", name: "Sarah Mitchell", contact: "Sarah Mitchell" },
  { id: "6", name: "Berkshire Properties", contact: "David Park" },
  { id: "7", name: "Innovate Tech", contact: "Rachel Kim" },
  { id: "8", name: "Luxury Living Realty", contact: "James Wilson" },
];

const shootTypes = [
  { value: "real_estate", label: "Real Estate Photography" },
  { value: "commercial", label: "Commercial Photography" },
  { value: "headshots", label: "Corporate Headshots" },
  { value: "architecture", label: "Architecture & Interiors" },
  { value: "events", label: "Event Coverage" },
  { value: "food", label: "Food Photography" },
  { value: "product", label: "Product Photography" },
  { value: "portrait", label: "Portrait Session" },
  { value: "other", label: "Other" },
];

export default function NewBookingPage() {
  // Generate time slots
  const timeSlots = [];
  for (let hour = 6; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const h = hour.toString().padStart(2, "0");
      const m = min.toString().padStart(2, "0");
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      timeSlots.push({
        value: `${h}:${m}`,
        label: `${displayHour}:${m.padStart(2, "0")} ${ampm}`,
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Booking"
        subtitle="Schedule a new photography session"
        actions={
          <Link
            href="/scheduling"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Schedule
          </Link>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Form submissions are disabled. This is a preview of the booking flow.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
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
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1.5">
                  Session Type <span className="text-[var(--error)]">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">Select a session type...</option>
                  {shootTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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
                  {demoClients.map((client) => (
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

          {/* Pricing */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
                    Session Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
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
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>
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
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { createBooking } from "@/lib/actions/bookings";

interface Client {
  id: string;
  fullName: string | null;
  company: string | null;
  email: string;
}

interface CreateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (booking: { id: string }) => void;
  clients: Client[];
  defaultClientId?: string;
}

export function CreateBookingModal({
  open,
  onOpenChange,
  onSuccess,
  clients,
  defaultClientId,
}: CreateBookingModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1"); // hours
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Booking title is required");
      return;
    }

    if (!date || !startTime) {
      setError("Date and time are required");
      return;
    }

    // Parse date and time
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + parseFloat(duration));

    if (isNaN(startDateTime.getTime())) {
      setError("Invalid date or time");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createBooking({
          title: title.trim(),
          clientId: clientId || undefined,
          startTime: startDateTime,
          endTime: endDateTime,
          location: location.trim() || undefined,
        });

        if (result.success) {
          // Reset form
          setTitle("");
          setClientId(defaultClientId || "");
          setDate("");
          setStartTime("");
          setDuration("1");
          setLocation("");
          onOpenChange(false);

          // Call success callback
          onSuccess?.({ id: result.data.id });

          // Refresh the page
          router.refresh();
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle("");
      setClientId(defaultClientId || "");
      setDate("");
      setStartTime("");
      setDuration("1");
      setLocation("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Set default date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Schedule a new photo shoot with your client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {error && (
              <div className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
                {error}
              </div>
            )}

            {/* Booking Title */}
            <div>
              <label htmlFor="booking-title" className="block text-sm font-medium text-foreground mb-1.5">
                Title <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                id="booking-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Real Estate Photo Shoot - 123 Main St"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                autoFocus
              />
            </div>

            {/* Client Selection */}
            <div>
              <label htmlFor="booking-client" className="block text-sm font-medium text-foreground mb-1.5">
                Client
              </label>
              <select
                id="booking-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company || client.fullName || client.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-date" className="block text-sm font-medium text-foreground mb-1.5">
                  Date <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="date"
                  id="booking-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label htmlFor="booking-time" className="block text-sm font-medium text-foreground mb-1.5">
                  Start Time <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="time"
                  id="booking-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="booking-duration" className="block text-sm font-medium text-foreground mb-1.5">
                Duration
              </label>
              <select
                id="booking-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="0.5">30 minutes</option>
                <option value="1">1 hour</option>
                <option value="1.5">1.5 hours</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours (Full Day)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="booking-location" className="block text-sm font-medium text-foreground mb-1.5">
                Location
              </label>
              <input
                type="text"
                id="booking-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Address or location notes"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

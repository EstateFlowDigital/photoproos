export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDateInputValueInTimeZone, formatTimeInputValueInTimeZone } from "@/lib/dates";
import { BookingEditForm } from "./booking-edit-form";
import { getBooking, getClientsForBooking, updateBookingStatus } from "@/lib/actions/bookings";
import { redirect } from "next/navigation";

interface BookingEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingEditPage({ params }: BookingEditPageProps) {
  const { id } = await params;

  const [booking, clients] = await Promise.all([
    getBooking(id),
    getClientsForBooking(),
  ]);

  if (!booking) {
    notFound();
  }

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

  const timeZone = booking.timezone || "America/New_York";

  // Map booking to the format expected by the form
  const bookingForForm = {
    id: booking.id,
    title: booking.title,
    type: booking.service?.category || "other",
    status: booking.status,
    client: booking.client
      ? {
          id: booking.client.id,
          name: booking.client.company || booking.client.fullName || "Unknown",
          email: booking.client.email,
          phone: booking.client.phone || "",
        }
      : {
          id: "",
          name: booking.clientName || "Unknown",
          email: booking.clientEmail || "",
          phone: booking.clientPhone || "",
      },
    date: formatDateInputValueInTimeZone(booking.startTime, timeZone),
    startTime: formatTimeInputValueInTimeZone(booking.startTime, timeZone),
    endTime: formatTimeInputValueInTimeZone(booking.endTime, timeZone),
    location: {
      address: booking.location || "",
      notes: booking.locationNotes || null,
    },
    notes: booking.notes || null,
    price: booking.service?.priceCents || 0,
    deposit: 0,
    depositPaid: false,
    serviceId: booking.service?.id,
    serviceDescription: booking.service?.description || "",
    timezone: timeZone,
  };

  // Map clients for dropdown
  const clientsForForm = clients.map((client) => ({
    id: client.id,
    name: client.company || client.fullName || client.email,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${booking.title}`}
        subtitle="Update booking details and settings"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href={`/scheduling/${id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Cancel
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <BookingEditForm booking={bookingForForm} clients={clientsForForm} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Status */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Booking Status</h2>
            <div className="space-y-4">
              <div className={cn("rounded-lg p-3", statusStyles[booking.status].bg)}>
                <p className={cn("text-sm font-medium", statusStyles[booking.status].text)}>
                  Current: {statusStyles[booking.status].label}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {booking.status === "pending" && (
                  <form
                    action={async () => {
                      "use server";
                      await updateBookingStatus(id, "confirmed");
                      redirect(`/scheduling/${id}`);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-[var(--success)]/10 px-3 py-2 text-xs font-medium text-[var(--success)] transition-colors hover:bg-[var(--success)]/20"
                    >
                      Confirm
                    </button>
                  </form>
                )}
                {booking.status !== "completed" && booking.status !== "cancelled" && (
                  <form
                    action={async () => {
                      "use server";
                      await updateBookingStatus(id, "completed");
                      redirect(`/scheduling/${id}`);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20"
                    >
                      Complete
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          {bookingForForm.price > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pricing Summary</h2>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-foreground-muted">Session Fee</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(bookingForForm.price)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Client Info */}
          {bookingForForm.client.id && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold">
                  {(bookingForForm.client.name || "?").charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{bookingForForm.client.name || "Unknown"}</p>
                  <p className="text-xs text-foreground-muted">{bookingForForm.client.email}</p>
                </div>
              </div>
              <Link
                href={`/clients/${bookingForForm.client.id}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                View Client Profile
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/scheduling/${id}`}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <EyeIcon className="h-4 w-4 text-foreground-muted" />
                View Booking
              </Link>
              {bookingForForm.client.email && (
                <a
                  href={`mailto:${bookingForForm.client.email}`}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  <EmailIcon className="h-4 w-4 text-foreground-muted" />
                  Send Confirmation
                </a>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          {booking.status !== "cancelled" && (
            <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
              <h2 className="text-lg font-semibold text-[var(--error)] mb-4">Danger Zone</h2>
              <p className="text-sm text-foreground-secondary mb-4">
                Cancelling this booking will remove it from your schedule.
              </p>
              <form
                action={async () => {
                  "use server";
                  await updateBookingStatus(id, "cancelled");
                  redirect(`/scheduling/${id}`);
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
                >
                  <XIcon className="h-4 w-4" />
                  Cancel Booking
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon Components
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

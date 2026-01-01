export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo booking data
const demoBookings: Record<string, {
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
  createdAt: string;
}> = {
  "1": {
    id: "1",
    title: "Luxury Penthouse Shoot",
    type: "real_estate",
    status: "confirmed",
    client: { id: "1", name: "Premier Realty", email: "contact@premierrealty.com", phone: "(555) 123-4567" },
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "13:00",
    location: {
      address: "888 Skyline Tower, Penthouse A\nSan Francisco, CA 94105",
      notes: "Take elevator to 45th floor. Building manager will meet you in lobby with keys.",
    },
    notes: "Client wants drone shots of the terrace if weather permits. Bring wide-angle lens for living room. Property is staged and ready.",
    price: 85000,
    deposit: 25000,
    depositPaid: true,
    createdAt: "2024-12-15",
  },
  "2": {
    id: "2",
    title: "Corporate Team Photos",
    type: "headshots",
    status: "pending",
    client: { id: "2", name: "Tech Solutions Inc", email: "admin@techsolutions.com", phone: "(555) 234-5678" },
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    location: {
      address: "500 Innovation Drive, 3rd Floor\nPalo Alto, CA 94301",
      notes: "Parking validation available. Ask for Sarah at reception.",
    },
    notes: "25 team members for headshots. They'll provide a schedule. Bring gray and white backdrops. On-site hair/makeup will be available.",
    price: 325000,
    deposit: 100000,
    depositPaid: false,
    createdAt: "2024-12-20",
  },
  "3": {
    id: "3",
    title: "Restaurant Menu Shoot",
    type: "food",
    status: "confirmed",
    client: { id: "3", name: "Bella Cucina", email: "info@bellacucina.com", phone: "(555) 345-6789" },
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "18:00",
    location: {
      address: "789 Restaurant Row\nSan Francisco, CA 94108",
      notes: "Enter through back kitchen entrance. Chef Marco will have dishes ready.",
    },
    notes: "New spring menu items - approximately 12 dishes. Bring props for Italian styling. Natural light available from large windows.",
    price: 125000,
    deposit: 40000,
    depositPaid: true,
    createdAt: "2024-12-18",
  },
};

const defaultBooking = {
  id: "0",
  title: "Sample Booking",
  type: "other",
  status: "pending" as const,
  client: { id: "0", name: "Demo Client", email: "demo@example.com", phone: "(555) 000-0000" },
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "12:00",
  location: { address: "123 Main Street\nSan Francisco, CA 94102", notes: null },
  notes: null,
  price: 0,
  deposit: 0,
  depositPaid: false,
  createdAt: new Date().toISOString().split("T")[0],
};

const sessionTypes = [
  { value: "real_estate", label: "Real Estate Photography" },
  { value: "headshots", label: "Corporate Headshots" },
  { value: "food", label: "Food Photography" },
  { value: "event", label: "Event Photography" },
  { value: "wedding", label: "Wedding Photography" },
  { value: "portrait", label: "Portrait Session" },
  { value: "product", label: "Product Photography" },
  { value: "architecture", label: "Architecture & Interiors" },
  { value: "other", label: "Other" },
];

const demoClients = [
  { id: "1", name: "Premier Realty" },
  { id: "2", name: "Tech Solutions Inc" },
  { id: "3", name: "Bella Cucina" },
  { id: "5", name: "Sarah Mitchell" },
  { id: "6", name: "Design Studio Pro" },
];

interface BookingEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingEditPage({ params }: BookingEditPageProps) {
  const { id } = await params;
  const booking = demoBookings[id] || { ...defaultBooking, id };

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
            <button
              type="submit"
              form="edit-booking-form"
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Changes will not be saved. This is a preview of booking editing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1.5">
                      Session Type <span className="text-[var(--error)]">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      defaultValue={booking.type}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    >
                      {sessionTypes.map((type) => (
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
                      name="client"
                      defaultValue={booking.client.id}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    >
                      {demoClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
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

            {/* Pricing */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Pricing</h2>

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
                        defaultValue={booking.price / 100}
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
                        defaultValue={booking.deposit / 100}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="depositPaid"
                    name="depositPaid"
                    defaultChecked={booking.depositPaid}
                    className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="depositPaid" className="text-sm text-foreground">
                    Deposit has been paid
                  </label>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Status */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Booking Status</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={booking.status}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="pending">Pending Confirmation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className={cn("rounded-lg p-3", statusStyles[booking.status].bg)}>
                <p className={cn("text-sm font-medium", statusStyles[booking.status].text)}>
                  Current: {statusStyles[booking.status].label}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Session Fee</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(booking.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Deposit</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(booking.deposit)}</span>
              </div>
              <hr className="border-[var(--card-border)]" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Deposit Status</span>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                  booking.depositPaid ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"
                )}>
                  {booking.depositPaid ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Balance Due</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(booking.price - (booking.depositPaid ? booking.deposit : 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold">
                {booking.client.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{booking.client.name}</p>
                <p className="text-xs text-foreground-muted">{booking.client.email}</p>
              </div>
            </div>
            <Link
              href={`/clients/${booking.client.id}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              View Client Profile
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

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
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Send Confirmation
              </button>
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <CalendarIcon className="h-4 w-4 text-foreground-muted" />
                Add to Calendar
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
            <h2 className="text-lg font-semibold text-[var(--error)] mb-4">Danger Zone</h2>
            <p className="text-sm text-foreground-secondary mb-4">
              Cancelling this booking will notify the client and remove it from your schedule.
            </p>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XIcon className="h-4 w-4" />
              Cancel Booking
            </button>
          </div>
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

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

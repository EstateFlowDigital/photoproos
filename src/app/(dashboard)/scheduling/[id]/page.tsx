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
    type: "Real Estate Photography",
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
    type: "Corporate Headshots",
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
    type: "Food Photography",
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
  "4": {
    id: "4",
    title: "Product Launch Event",
    type: "Event Photography",
    status: "completed",
    client: { id: "7", name: "Innovate Tech", email: "events@innovatetech.com", phone: "(555) 567-8901" },
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "22:00",
    location: {
      address: "The Grand Ballroom\n100 Market Street, San Francisco, CA 94102",
      notes: "VIP entrance on 2nd Street side. Media credentials required.",
    },
    notes: "Tech product launch event. Focus on keynote speaker, product demos, and networking. 200+ attendees expected. Deliver same-day highlights for social media.",
    price: 200000,
    deposit: 75000,
    depositPaid: true,
    createdAt: "2024-12-10",
  },
};

const defaultBooking = {
  id: "0",
  title: "Sample Booking",
  type: "Photography Session",
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

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusStyles = {
    confirmed: { bg: "bg-[var(--success)]/10", text: "text-[var(--success)]", label: "Confirmed" },
    pending: { bg: "bg-[var(--warning)]/10", text: "text-[var(--warning)]", label: "Pending Confirmation" },
    completed: { bg: "bg-[var(--primary)]/10", text: "text-[var(--primary)]", label: "Completed" },
    cancelled: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Cancelled" },
  };

  const status = statusStyles[booking.status];
  const isPast = new Date(booking.date) < new Date();
  const isUpcoming = !isPast && booking.status !== "cancelled";

  return (
    <div className="space-y-6">
      <PageHeader
        title={booking.title}
        subtitle={`${booking.type} • ${formatDate(booking.date)}`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/scheduling"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            {isUpcoming && (
              <>
                <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
                  <EditIcon className="h-4 w-4" />
                  Reschedule
                </button>
                {booking.status === "pending" && (
                  <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90">
                    <CheckIcon className="h-4 w-4" />
                    Confirm Booking
                  </button>
                )}
              </>
            )}
            {booking.status === "completed" && (
              <Link
                href={`/galleries/new?client=${booking.client.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PhotoIcon className="h-4 w-4" />
                Create Gallery
              </Link>
            )}
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Viewing sample booking data. Actions are disabled.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div className={cn("rounded-xl border p-4 flex items-center justify-between", status.bg, "border-transparent")}>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", status.bg)}>
                {booking.status === "confirmed" && <CheckIcon className={cn("h-5 w-5", status.text)} />}
                {booking.status === "pending" && <ClockIcon className={cn("h-5 w-5", status.text)} />}
                {booking.status === "completed" && <CheckCircleIcon className={cn("h-5 w-5", status.text)} />}
                {booking.status === "cancelled" && <XIcon className={cn("h-5 w-5", status.text)} />}
              </div>
              <div>
                <p className={cn("font-semibold", status.text)}>{status.label}</p>
                <p className="text-sm text-foreground-secondary">
                  {isUpcoming ? "Upcoming shoot" : isPast && booking.status !== "cancelled" ? "Shoot completed" : "Booking cancelled"}
                </p>
              </div>
            </div>
            {isUpcoming && (
              <div className="text-right">
                <p className="text-sm text-foreground-muted">Starts in</p>
                <p className={cn("text-lg font-semibold", status.text)}>
                  {Math.ceil((new Date(booking.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Schedule</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Date</p>
                  <p className="font-medium text-foreground">{formatDate(booking.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Time</p>
                  <p className="font-medium text-foreground">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground whitespace-pre-line">{booking.location.address}</p>
                {booking.location.notes && (
                  <p className="mt-2 text-sm text-foreground-secondary">{booking.location.notes}</p>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(booking.location.address.replace(/\n/g, ", "))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Session Notes</h2>
            {booking.notes ? (
              <p className="text-sm text-foreground-secondary whitespace-pre-line">{booking.notes}</p>
            ) : (
              <p className="text-sm text-foreground-muted italic">No notes added yet</p>
            )}
            <button className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline">
              {booking.notes ? "Edit Notes" : "Add Notes"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-lg font-bold">
                {booking.client.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-foreground">{booking.client.name}</p>
                <p className="text-sm text-foreground-muted">{booking.client.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <a
                href={`tel:${booking.client.phone}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <PhoneIcon className="h-4 w-4 text-foreground-muted" />
                {booking.client.phone}
              </a>
              <a
                href={`mailto:${booking.client.email}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Send Email
              </a>
            </div>
            <Link
              href={`/clients/${booking.client.id}`}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              View Client Profile
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Session Fee</span>
                <span className="font-medium text-foreground">{formatCurrency(booking.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Deposit Required</span>
                <span className="font-medium text-foreground">{formatCurrency(booking.deposit)}</span>
              </div>
              <hr className="border-[var(--card-border)]" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Deposit Status</span>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                  booking.depositPaid ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"
                )}>
                  {booking.depositPaid ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Balance Due</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(booking.price - (booking.depositPaid ? booking.deposit : 0))}
                </span>
              </div>
            </div>
            {!booking.depositPaid && booking.status !== "cancelled" && (
              <button className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                Send Payment Request
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Send Reminder
              </button>
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <CalendarIcon className="h-4 w-4 text-foreground-muted" />
                Add to Calendar
              </button>
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <DuplicateIcon className="h-4 w-4 text-foreground-muted" />
                Duplicate Booking
              </button>
              {booking.status !== "cancelled" && booking.status !== "completed" && (
                <>
                  <hr className="border-[var(--card-border)]" />
                  <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10">
                    <XIcon className="h-4 w-4" />
                    Cancel Booking
                  </button>
                </>
              )}
            </div>
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
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

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

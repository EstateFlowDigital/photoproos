export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { BookingNewForm } from "./booking-new-form";
import { getClientsForBooking, getServicesForBooking, getScheduleStats } from "@/lib/actions/bookings";
import { getOrder } from "@/lib/actions/orders";

// Generate time slots
function generateTimeSlots(): Array<{ value: string; label: string }> {
  const slots: Array<{ value: string; label: string }> = [];
  for (let hour = 6; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const h = hour.toString().padStart(2, "0");
      const m = min.toString().padStart(2, "0");
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      slots.push({
        value: `${h}:${m}`,
        label: `${displayHour}:${m.padStart(2, "0")} ${ampm}`,
      });
    }
  }
  return slots;
}

interface PageProps {
  searchParams: Promise<{ fromOrder?: string }>;
}

export default async function NewBookingPage({ searchParams }: PageProps) {
  const { fromOrder } = await searchParams;
  const timeSlots = generateTimeSlots();

  // Fetch real data from database
  const [clients, services, scheduleStats] = await Promise.all([
    getClientsForBooking(),
    getServicesForBooking(),
    getScheduleStats(),
  ]);

  // If creating from an order, fetch the order data
  const orderData = fromOrder ? await getOrder(fromOrder) : null;

  // Map clients for dropdown
  const clientsForForm = clients.map((client) => ({
    id: client.id,
    name: client.company || client.fullName || client.email,
    contact: client.fullName || client.email,
  }));

  // Map services for form
  const servicesForForm = services.map((service) => ({
    id: service.id,
    name: service.name,
    category: service.category,
    priceCents: service.priceCents,
    duration: service.duration,
    description: service.description,
  }));

  // Build order data for form
  const orderDataForForm = orderData ? {
    orderId: orderData.id,
    orderNumber: orderData.orderNumber,
    clientId: orderData.client?.id,
    clientName: orderData.clientName,
    clientEmail: orderData.clientEmail,
    clientPhone: orderData.clientPhone,
    preferredDate: orderData.preferredDate,
    preferredTime: orderData.preferredTime,
    locationNotes: orderData.locationNotes,
    notes: orderData.clientNotes,
    items: orderData.items.map((item) => ({
      name: item.name,
      sqft: item.sqft,
      pricingTierName: item.pricingTierName,
    })),
  } : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={orderData ? `Booking from ${orderData.orderNumber}` : "New Booking"}
        subtitle={orderData ? "Schedule from order details" : "Schedule a new photography session"}
        actions={
          <Link
            href={orderData ? `/orders/${orderData.id}` : "/scheduling"}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {orderData ? "Back to Order" : "Back to Schedule"}
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <BookingNewForm
            clients={clientsForForm}
            timeSlots={timeSlots}
            services={servicesForForm}
            fromOrder={orderDataForForm}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Select a service package to auto-fill pricing based on your rates.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Add detailed location notes to help you navigate on shoot day.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Enable reminders to automatically notify your client before the session.</p>
              </div>
            </div>
          </div>

          {/* Your Schedule */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Schedule</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">This Week</span>
                <span className="text-sm font-medium text-foreground">
                  {scheduleStats.thisWeekCount} session{scheduleStats.thisWeekCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Next Session</span>
                <span className="text-sm font-medium text-foreground">{scheduleStats.nextAvailable}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Busiest Day</span>
                <span className="text-sm font-medium text-foreground">{scheduleStats.busiestDay}</span>
              </div>
            </div>
          </div>

          {/* Recent Clients */}
          {clientsForForm.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Clients</h2>
              <div className="space-y-3">
                {clientsForForm.slice(0, 4).map((client) => (
                  <div key={client.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                      {(client.name || "?").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{client.name || "Unknown"}</p>
                      <p className="text-xs text-foreground-muted truncate">{client.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

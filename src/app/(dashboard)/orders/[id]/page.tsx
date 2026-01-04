export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getOrder } from "@/lib/actions/orders";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import { OrderActions } from "./order-actions";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTimePreference(time: string | null): string {
  if (!time) return "Not specified";
  const timeMap: Record<string, string> = {
    morning: "Morning (8am - 12pm)",
    afternoon: "Afternoon (12pm - 5pm)",
    evening: "Evening (5pm - 8pm)",
  };
  return timeMap[time] || time;
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const clientName = order.clientName || "Guest";

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        subtitle={`Order from ${clientName}`}
        actions={
          <OrderActions
            orderId={order.id}
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            hasInvoice={!!order.invoice}
            hasBooking={!!order.booking}
          />
        }
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/orders" className="hover:text-foreground transition-colors">
          Orders
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">{order.orderNumber}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{order.orderNumber}</h2>
                <p className="text-foreground-muted mt-1">
                  Submitted on {formatDate(order.submittedAt || order.createdAt)}
                </p>
              </div>
              <span className={cn(
                "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                getStatusBadgeClasses(order.status)
              )}>
                {formatStatusLabel(order.status)}
              </span>
            </div>

            {/* Client Info */}
            <div className="border-t border-[var(--card-border)] pt-6 mb-6">
              <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-3">
                Customer
              </h3>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-medium text-white">
                  {clientName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{clientName}</p>
                  {order.clientEmail && (
                    <p className="text-sm text-foreground-muted">{order.clientEmail}</p>
                  )}
                  {order.clientPhone && (
                    <p className="text-sm text-foreground-muted">{order.clientPhone}</p>
                  )}
                  {order.clientCompany && (
                    <p className="text-sm text-foreground-muted mt-1">{order.clientCompany}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-[var(--card-border)] pt-6">
              <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-4">
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between py-3 border-b border-[var(--card-border)] last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          item.itemType === "bundle"
                            ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                            : "bg-[var(--background-secondary)] text-foreground-muted"
                        )}>
                          {item.itemType === "bundle" ? "Bundle" : "Service"}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-foreground-muted mt-1">{item.description}</p>
                      )}
                      {/* Sqft and Tier Info */}
                      {item.sqft && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs text-foreground-muted">
                            <SquareIcon className="h-3 w-3" />
                            {item.sqft.toLocaleString()} sqft
                          </span>
                          {item.pricingTierName && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs text-[var(--warning)]">
                              <TagIcon className="h-3 w-3" />
                              {item.pricingTierName}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-foreground-muted mt-1">
                        {item.quantity} × {formatCurrency(item.unitCents)}
                      </p>
                    </div>
                    <p className="font-medium text-foreground sm:ml-4">
                      {formatCurrency(item.totalCents)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-[var(--card-border)] space-y-2">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-foreground-muted">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(order.subtotalCents)}</span>
                </div>
                {(order.discountCents ?? 0) > 0 && (
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-foreground-muted">Discount</span>
                    <span className="text-[var(--success)]">-{formatCurrency(order.discountCents ?? 0)}</span>
                  </div>
                )}
                {order.taxCents > 0 && (
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-foreground-muted">Tax</span>
                    <span className="text-foreground">{formatCurrency(order.taxCents)}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 text-lg font-semibold pt-2 border-t border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatCurrency(order.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Preferences */}
          {(order.preferredDate || order.preferredTime || order.locationNotes || order.clientNotes) && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Scheduling Preferences</h3>
              <div className="space-y-4">
                {order.preferredDate && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-foreground-muted mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground-muted">Preferred Date</p>
                      <p className="text-foreground">{formatDate(order.preferredDate)}</p>
                    </div>
                  </div>
                )}
                {order.preferredTime && (
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-foreground-muted mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground-muted">Preferred Time</p>
                      <p className="text-foreground">{formatTimePreference(order.preferredTime)}</p>
                    </div>
                  </div>
                )}
                {order.flexibleDates && (
                  <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                    <CheckIcon className="h-4 w-4" />
                    Flexible on dates
                  </div>
                )}
                {order.locationNotes && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-foreground-muted mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground-muted">Location Notes</p>
                      <p className="text-foreground whitespace-pre-line">{order.locationNotes}</p>
                    </div>
                  </div>
                )}
                {order.clientNotes && (
                  <div className="flex items-start gap-3">
                    <NoteIcon className="h-5 w-5 text-foreground-muted mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground-muted">Customer Notes</p>
                      <p className="text-foreground whitespace-pre-line">{order.clientNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {order.internalNotes && (
            <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-6">
              <h3 className="font-semibold text-[var(--warning)] mb-2">Internal Notes</h3>
              <p className="text-foreground whitespace-pre-line">{order.internalNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Payment</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Status</span>
                <span className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                  getStatusBadgeClasses(order.status)
                )}>
                  {formatStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Amount</span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(order.totalCents)}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-foreground-muted">Paid On</span>
                  <span className="text-sm font-medium text-[var(--success)]">
                    {formatDate(order.paidAt)}
                  </span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-foreground-muted">Method</span>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {order.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Linked Records */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Linked Records</h3>
            <div className="space-y-3">
              {/* Invoice */}
              {order.invoice ? (
                <Link
                  href={`/invoices/${order.invoice.id}`}
                  className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <DocumentIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Invoice</p>
                    <p className="text-xs text-foreground-muted">{order.invoice.invoiceNumber}</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    getStatusBadgeClasses(order.invoice.status)
                  )}>
                    {formatStatusLabel(order.invoice.status)}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-3 -mx-3 text-foreground-muted">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                    <DocumentIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">No invoice</p>
                    <p className="text-xs">Create one from this order</p>
                  </div>
                </div>
              )}

              {/* Booking */}
              {order.booking ? (
                <Link
                  href={`/scheduling/${order.booking.id}`}
                  className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10 text-[var(--success)]">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Booking</p>
                    <p className="text-xs text-foreground-muted truncate">{order.booking.title}</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    getStatusBadgeClasses(order.booking.status)
                  )}>
                    {formatStatusLabel(order.booking.status)}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-3 -mx-3 text-foreground-muted">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">No booking</p>
                    <p className="text-xs">Schedule from this order</p>
                  </div>
                </div>
              )}

              {/* Client */}
              {order.client ? (
                <Link
                  href={`/clients/${order.client.id}`}
                  className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-xs font-medium text-white">
                    {order.client.fullName?.substring(0, 2).toUpperCase() || "??"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Linked Client</p>
                    <p className="text-xs text-foreground-muted truncate">{order.client.fullName}</p>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-foreground-muted" />
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-3 -mx-3 text-foreground-muted">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Guest order</p>
                    <p className="text-xs">Not linked to a client</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Page */}
          {order.orderPage && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Order Source</h3>
              <Link
                href={`/order-pages/${order.orderPage.id}`}
                className="flex items-center gap-3 p-3 -m-3 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                  <GlobeIcon className="h-4 w-4 text-foreground-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{order.orderPage.name}</p>
                  <p className="text-xs text-foreground-muted">/{order.orderPage.slug}</p>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-foreground-muted" />
              </Link>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)]">
                  <div className="h-2 w-2 rounded-full bg-foreground-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Order Submitted</p>
                  <p className="text-xs text-foreground-muted">
                    {formatDate(order.submittedAt || order.createdAt)}
                  </p>
                </div>
              </div>
              {order.paidAt && (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Received</p>
                    <p className="text-xs text-foreground-muted">{formatDate(order.paidAt)}</p>
                  </div>
                </div>
              )}
              {order.booking && (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Booking Created</p>
                    <p className="text-xs text-foreground-muted">
                      {formatDate(order.booking.startTime)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.505 2.365A41.369 41.369 0 0 1 9 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 0 0-.577-.069 43.141 43.141 0 0 0-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 0 1 5 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914Z" />
      <path d="M14 6c.762 0 1.52.02 2.271.062 1.057.059 1.914 1.015 1.687 2.092l-.089.428a42.8 42.8 0 0 1-.282 1.195c-.313 1.236-.705 2.397-1.187 3.472a17.968 17.968 0 0 1-1.166 2.348.75.75 0 0 1-1.285-.087l-.41-.724a4.503 4.503 0 0 1-.596-2.232V8.998c0-1.658 1.346-2.998 3.057-2.998Z" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 1-11-4.69v.001a2.75 2.75 0 0 0 1.5 2.439V9.25a.75.75 0 0 0 .75.75h.75v.75c0 .415.336.75.75.75h.75v1.25a.75.75 0 0 0 .22.53l1.5 1.5a.75.75 0 0 0 .53.22h.25a.75.75 0 0 0 .75-.75v-3.25a.75.75 0 0 0-.22-.53l-.5-.5a.75.75 0 0 0-.53-.22H9.81a.75.75 0 0 0-.53.22l-.5.5a.75.75 0 0 1-1.06-1.06l.5-.5a.75.75 0 0 0 .22-.53V7.25a.75.75 0 0 0-.75-.75H6.5v-.5a.75.75 0 0 0-.39-.659 1.25 1.25 0 0 1 1.14-2.226A6.475 6.475 0 0 1 16.5 10Z" clipRule="evenodd" />
    </svg>
  );
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v13A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-13ZM5 5.75A.75.75 0 0 1 5.75 5h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 5.75Z" clipRule="evenodd" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 8.38 3H5.5ZM6 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

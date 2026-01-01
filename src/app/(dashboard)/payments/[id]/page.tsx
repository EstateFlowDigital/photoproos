export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo payment data
const demoPayments: Record<string, {
  id: string;
  description: string;
  clientName: string;
  clientEmail: string;
  clientId: string;
  projectName: string;
  projectId: string;
  amountCents: number;
  feeCents: number;
  netCents: number;
  status: "paid" | "pending" | "overdue" | "refunded" | "failed";
  paymentMethod: string;
  last4: string;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  paidAt: Date | null;
  timeline: { action: string; date: Date; description: string }[];
}> = {
  "1": {
    id: "1",
    description: "Downtown Luxury Listing - Photo Gallery",
    clientName: "John Peterson",
    clientEmail: "john@premierrealty.com",
    clientId: "1",
    projectName: "Downtown Luxury Listing",
    projectId: "1",
    amountCents: 425000,
    feeCents: 12750,
    netCents: 412250,
    status: "paid",
    paymentMethod: "Visa",
    last4: "4242",
    stripePaymentIntentId: "pi_3QMxxxxxxxxxxxxxR",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    timeline: [
      { action: "Payment completed", date: new Date(Date.now() - 1000 * 60 * 60 * 2), description: "Payment was successfully processed" },
      { action: "Payment initiated", date: new Date(Date.now() - 1000 * 60 * 60 * 3), description: "Client initiated payment" },
      { action: "Gallery delivered", date: new Date(Date.now() - 1000 * 60 * 60 * 48), description: "Gallery was delivered to client" },
      { action: "Payment link created", date: new Date(Date.now() - 1000 * 60 * 60 * 48), description: "Payment link was generated" },
    ],
  },
  "2": {
    id: "2",
    description: "Corporate Headshots Q4",
    clientName: "Lisa Chen",
    clientEmail: "admin@techsolutions.com",
    clientId: "2",
    projectName: "Corporate Headshots Q4",
    projectId: "3",
    amountCents: 218000,
    feeCents: 0,
    netCents: 218000,
    status: "pending",
    paymentMethod: "",
    last4: "",
    stripePaymentIntentId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    paidAt: null,
    timeline: [
      { action: "Reminder sent", date: new Date(Date.now() - 1000 * 60 * 60 * 12), description: "Payment reminder email sent" },
      { action: "Gallery delivered", date: new Date(Date.now() - 1000 * 60 * 60 * 24), description: "Gallery was delivered to client" },
      { action: "Payment link created", date: new Date(Date.now() - 1000 * 60 * 60 * 24), description: "Payment link was generated" },
    ],
  },
  "3": {
    id: "3",
    description: "Restaurant Grand Opening",
    clientName: "Marco Rossi",
    clientEmail: "info@bellacucina.com",
    clientId: "3",
    projectName: "Restaurant Grand Opening",
    projectId: "4",
    amountCents: 189000,
    feeCents: 5670,
    netCents: 183330,
    status: "paid",
    paymentMethod: "Mastercard",
    last4: "5555",
    stripePaymentIntentId: "pi_3QNyxxxxxxxxxxxxZ",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    timeline: [
      { action: "Payment completed", date: new Date(Date.now() - 1000 * 60 * 60 * 48), description: "Payment was successfully processed" },
      { action: "Gallery delivered", date: new Date(Date.now() - 1000 * 60 * 60 * 72), description: "Gallery was delivered to client" },
    ],
  },
  "6": {
    id: "6",
    description: "Product Launch Event",
    clientName: "Alex Thompson",
    clientEmail: "alex@innovatetech.io",
    clientId: "7",
    projectName: "Product Launch Event",
    projectId: "6",
    amountCents: 120000,
    feeCents: 0,
    netCents: 120000,
    status: "overdue",
    paymentMethod: "",
    last4: "",
    stripePaymentIntentId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168),
    paidAt: null,
    timeline: [
      { action: "Payment overdue", date: new Date(Date.now() - 1000 * 60 * 60 * 24), description: "Payment is now 7 days overdue" },
      { action: "Reminder sent", date: new Date(Date.now() - 1000 * 60 * 60 * 96), description: "Payment reminder email sent" },
      { action: "Gallery delivered", date: new Date(Date.now() - 1000 * 60 * 60 * 168), description: "Gallery was delivered to client" },
    ],
  },
};

const defaultPayment = {
  id: "0",
  description: "Sample Payment",
  clientName: "Demo Client",
  clientEmail: "demo@example.com",
  clientId: "0",
  projectName: "Sample Gallery",
  projectId: "0",
  amountCents: 0,
  feeCents: 0,
  netCents: 0,
  status: "pending" as const,
  paymentMethod: "",
  last4: "",
  stripePaymentIntentId: null,
  createdAt: new Date(),
  paidAt: null,
  timeline: [],
};

interface PaymentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const { id } = await params;
  const payment = demoPayments[id] || { ...defaultPayment, id };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const statusStyles = {
    paid: { bg: "bg-[var(--success)]/10", text: "text-[var(--success)]", label: "Paid" },
    pending: { bg: "bg-[var(--warning)]/10", text: "text-[var(--warning)]", label: "Pending" },
    overdue: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Overdue" },
    refunded: { bg: "bg-[var(--foreground-muted)]/10", text: "text-foreground-muted", label: "Refunded" },
    failed: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Failed" },
  };

  const status = statusStyles[payment.status];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payment #${payment.id}`}
        subtitle={payment.description}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/payments"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            {payment.status === "paid" && (
              <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <ReceiptIcon className="h-4 w-4" />
                Download Receipt
              </button>
            )}
            {(payment.status === "pending" || payment.status === "overdue") && (
              <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                <EmailIcon className="h-4 w-4" />
                Send Reminder
              </button>
            )}
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Viewing sample payment data. Actions are disabled.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div className={cn("rounded-xl border p-4 flex items-center justify-between", status.bg, "border-transparent")}>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", status.bg)}>
                {payment.status === "paid" && <CheckIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "pending" && <ClockIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "overdue" && <AlertIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "refunded" && <RefundIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "failed" && <XIcon className={cn("h-5 w-5", status.text)} />}
              </div>
              <div>
                <p className={cn("font-semibold", status.text)}>{status.label}</p>
                <p className="text-sm text-foreground-secondary">
                  {payment.status === "paid" && `Paid on ${formatDate(payment.paidAt!)}`}
                  {payment.status === "pending" && `Created on ${formatDate(payment.createdAt)}`}
                  {payment.status === "overdue" && `${Math.ceil((Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days overdue`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(payment.amountCents)}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(payment.amountCents)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Processing Fee</p>
                  <p className="text-lg font-semibold text-foreground">
                    {payment.feeCents > 0 ? `-${formatCurrency(payment.feeCents)}` : "--"}
                  </p>
                </div>
              </div>
              <hr className="border-[var(--card-border)]" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Net Amount</p>
                <p className="text-xl font-bold text-[var(--success)]">{formatCurrency(payment.netCents)}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {payment.status === "paid" && payment.paymentMethod && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--background)]">
                  <CreditCardIcon className="h-6 w-6 text-foreground-muted" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{payment.paymentMethod} •••• {payment.last4}</p>
                  <p className="text-sm text-foreground-muted">Stripe Payment ID: {payment.stripePaymentIntentId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity</h2>
            <div className="space-y-4">
              {payment.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)]">
                      <ActivityIcon className="h-4 w-4 text-foreground-muted" />
                    </div>
                    {index < payment.timeline.length - 1 && (
                      <div className="absolute left-4 top-8 h-full w-px bg-[var(--card-border)]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-foreground">{event.action}</p>
                    <p className="text-xs text-foreground-muted">{event.description}</p>
                    <p className="mt-1 text-xs text-foreground-muted">{formatDateTime(event.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-lg font-bold">
                {payment.clientName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-foreground">{payment.clientName}</p>
                <p className="text-sm text-foreground-muted">{payment.clientEmail}</p>
              </div>
            </div>
            <Link
              href={`/clients/${payment.clientId}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              View Client Profile
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Gallery Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <PhotoIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{payment.projectName}</p>
                <p className="text-xs text-foreground-muted">Gallery #{payment.projectId}</p>
              </div>
            </div>
            <Link
              href={`/galleries/${payment.projectId}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              View Gallery
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-2">
              {payment.status === "paid" && (
                <>
                  <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                    <ReceiptIcon className="h-4 w-4 text-foreground-muted" />
                    Resend Receipt
                  </button>
                  <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                    <DownloadIcon className="h-4 w-4 text-foreground-muted" />
                    Download Invoice
                  </button>
                </>
              )}
              {(payment.status === "pending" || payment.status === "overdue") && (
                <>
                  <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                    <EmailIcon className="h-4 w-4 text-foreground-muted" />
                    Send Reminder
                  </button>
                  <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                    <LinkIcon className="h-4 w-4 text-foreground-muted" />
                    Copy Payment Link
                  </button>
                </>
              )}
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <ExportIcon className="h-4 w-4 text-foreground-muted" />
                Export to CSV
              </button>
            </div>
          </div>

          {/* Refund Section */}
          {payment.status === "paid" && (
            <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
              <h2 className="text-lg font-semibold text-[var(--error)] mb-4">Refund</h2>
              <p className="text-sm text-foreground-secondary mb-4">
                Issue a full or partial refund for this payment. This action cannot be undone.
              </p>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefundIcon className="h-4 w-4" />
                Issue Refund
              </button>
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

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656Z" clipRule="evenodd" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
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

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function RefundIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 0 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H6.75Z" clipRule="evenodd" />
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

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

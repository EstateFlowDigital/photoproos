export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getPayment } from "@/lib/actions/payments";
import { PaymentHeaderActions, PaymentSidebarActions } from "./payment-actions";

interface PaymentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const { id } = await params;

  const payment = await getPayment(id);

  if (!payment) {
    notFound();
  }

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

  const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: "bg-[var(--success)]/10", text: "text-[var(--success)]", label: "Paid" },
    pending: { bg: "bg-[var(--warning)]/10", text: "text-[var(--warning)]", label: "Pending" },
    overdue: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Overdue" },
    refunded: { bg: "bg-[var(--foreground-muted)]/10", text: "text-foreground-muted", label: "Refunded" },
    failed: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]", label: "Failed" },
  };

  const status = statusStyles[payment.status] || statusStyles.pending;

  // Calculate days since creation for overdue display
  const daysSinceCreation = Math.ceil((Date.now() - new Date(payment.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  // Get client info from project
  const client = payment.project?.client;
  const clientName = client?.company || client?.fullName || "Unknown Client";
  const clientEmail = client?.email || "";
  const clientId = client?.id;

  // Calculate fee (assuming 3% for demo - this would come from Stripe in production)
  const feeCents = payment.status === "paid" ? Math.round(payment.amountCents * 0.03) : 0;
  const netCents = payment.amountCents - feeCents;

  return (
    <div className="space-y-6" data-element="payments-detail-page">
      <PageHeader
        title={`Payment #${payment.id.slice(0, 8)}`}
        subtitle={payment.description || payment.project?.name || "Payment"}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/payments"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <PaymentHeaderActions
              paymentId={payment.id}
              status={payment.status}
              clientEmail={clientEmail}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div className={cn("rounded-xl border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", status.bg, "border-transparent")}>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", status.bg)}>
                {payment.status === "paid" && <CheckIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "pending" && <ClockIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "overdue" && <AlertIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "refunded" && <RefundIcon className={cn("h-5 w-5", status.text)} />}
                {payment.status === "failed" && <XIcon className={cn("h-5 w-5", status.text)} />}
              </div>
              <div>
                <p className={cn("font-semibold", status.text)}>{status.label}</p>
                <p className="text-sm text-foreground-secondary">
                  {payment.status === "paid" && payment.paidAt && `Paid on ${formatDate(new Date(payment.paidAt))}`}
                  {payment.status === "pending" && `Created on ${formatDate(new Date(payment.createdAt))}`}
                  {payment.status === "overdue" && `${daysSinceCreation} days overdue`}
                  {payment.status === "refunded" && `Refunded`}
                  {payment.status === "failed" && `Payment failed`}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
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
                    {feeCents > 0 ? `-${formatCurrency(feeCents)}` : "--"}
                  </p>
                </div>
              </div>
              <hr className="border-[var(--card-border)]" />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-foreground">Net Amount</p>
                <p className="text-xl font-bold text-[var(--success)]">{formatCurrency(netCents)}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {payment.status === "paid" && payment.stripePaymentIntentId && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background)]">
                  <CreditCardIcon className="h-6 w-6 text-foreground-muted" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Card Payment</p>
                  <p className="text-sm text-foreground-muted">Stripe: {payment.stripePaymentIntentId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity</h2>
            <div className="space-y-4">
              {payment.status === "paid" && payment.paidAt && (
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/10">
                      <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                    </div>
                    <div className="absolute left-4 top-8 h-full w-px bg-[var(--card-border)]" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-foreground">Payment completed</p>
                    <p className="text-xs text-foreground-muted">Payment was successfully processed</p>
                    <p className="mt-1 text-xs text-foreground-muted">{formatDateTime(new Date(payment.paidAt))}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <div className="relative">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background)]">
                    <ActivityIcon className="h-4 w-4 text-foreground-muted" />
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-foreground">Payment created</p>
                  <p className="text-xs text-foreground-muted">Invoice was generated for this payment</p>
                  <p className="mt-1 text-xs text-foreground-muted">{formatDateTime(new Date(payment.createdAt))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {clientId && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-lg font-bold">
                  {clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{clientName}</p>
                  <p className="text-sm text-foreground-muted">{clientEmail}</p>
                </div>
              </div>
              <Link
                href={`/clients/${clientId}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                View Client Profile
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Gallery Info */}
          {payment.project && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Gallery</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <PhotoIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{payment.project.name}</p>
                  <p className="text-xs text-foreground-muted">Gallery</p>
                </div>
              </div>
              <Link
                href={`/galleries/${payment.project.id}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                View Gallery
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Quick Actions & Refund - Client Component */}
          <PaymentSidebarActions
            paymentId={payment.id}
            status={payment.status}
            clientEmail={clientEmail}
            amountCents={payment.amountCents}
            description={payment.description || payment.project?.name || "Payment"}
            hasStripeId={!!payment.stripePaymentIntentId}
          />
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

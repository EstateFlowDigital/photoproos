export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import type { InvoiceStatus, LineItemType } from "@prisma/client";
import { InvoiceActions } from "./invoice-actions";

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
  }).format(date);
}

const lineItemTypeLabels: Record<LineItemType, string> = {
  service: "Service",
  travel: "Travel",
  custom: "Custom",
  discount: "Discount",
  tax: "Tax",
};

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      organizationId: auth.organizationId,
    },
    include: {
      client: true,
      lineItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          booking: {
            select: {
              id: true,
              title: true,
              startTime: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const isOverdue = invoice.status === "sent" && new Date(invoice.dueDate) < new Date();
  const displayStatus = isOverdue && invoice.status !== "overdue" ? "overdue" : invoice.status;
  const statusLabel = isOverdue && invoice.status !== "overdue"
    ? "Overdue"
    : formatStatusLabel(invoice.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoiceNumber}
        subtitle={`Invoice for ${invoice.clientName || "Unknown Client"}`}
        actions={
          <InvoiceActions
            invoiceId={invoice.id}
            currentStatus={invoice.status}
            clientEmail={invoice.clientEmail}
          />
        }
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/invoices" className="hover:text-foreground transition-colors">
          Invoices
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">{invoice.invoiceNumber}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{invoice.invoiceNumber}</h2>
                <p className="text-foreground-muted mt-1">
                  Issued on {formatDate(invoice.issueDate)}
                </p>
              </div>
              <span className={cn(
                "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                getStatusBadgeClasses(displayStatus),
                invoice.status === "cancelled" && "line-through"
              )}>
                {statusLabel}
              </span>
            </div>

            {/* Client Info */}
            <div className="border-t border-[var(--card-border)] pt-6 mb-6">
              <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-3">
                Bill To
              </h3>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
                  {(invoice.clientName || "?").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{invoice.clientName}</p>
                  {invoice.clientEmail && (
                    <p className="text-sm text-foreground-muted">{invoice.clientEmail}</p>
                  )}
                  {invoice.clientAddress && (
                    <p className="text-sm text-foreground-muted mt-1 whitespace-pre-line">
                      {invoice.clientAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-t border-[var(--card-border)] pt-6">
              <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-4">
                Line Items
              </h3>
              <div className="space-y-3">
                {invoice.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between py-3 border-b border-[var(--card-border)] last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{item.description}</p>
                        <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs text-foreground-muted">
                          {lineItemTypeLabels[item.itemType]}
                        </span>
                      </div>
                      {item.booking && (
                        <Link
                          href={`/scheduling/${item.booking.id}`}
                          className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block"
                        >
                          {item.booking.title}
                        </Link>
                      )}
                      <p className="text-sm text-foreground-muted mt-1">
                        {item.quantity} × {formatCurrency(item.unitCents)}
                      </p>
                    </div>
                    <p className="font-medium text-foreground ml-4">
                      {formatCurrency(item.totalCents)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-[var(--card-border)] space-y-2">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-foreground-muted">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(invoice.subtotalCents)}</span>
                </div>
                {invoice.discountCents > 0 && (
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-foreground-muted">Discount</span>
                    <span className="text-green-400">-{formatCurrency(invoice.discountCents)}</span>
                  </div>
                )}
                {invoice.taxCents > 0 && (
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-foreground-muted">Tax</span>
                    <span className="text-foreground">{formatCurrency(invoice.taxCents)}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 text-lg font-semibold pt-2 border-t border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatCurrency(invoice.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              {invoice.notes && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-2">
                    Notes
                  </h3>
                  <p className="text-foreground whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-2">
                    Terms & Conditions
                  </h3>
                  <p className="text-foreground-muted text-sm whitespace-pre-line">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Due Date</span>
                <span className={cn(
                  "text-sm font-medium",
                  isOverdue ? "text-red-400" : "text-foreground"
                )}>
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Amount Due</span>
                <span className="text-sm font-medium text-foreground">
                  {invoice.status === "paid" ? formatCurrency(0) : formatCurrency(invoice.totalCents)}
                </span>
              </div>
              {invoice.paidAt && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-foreground-muted">Paid On</span>
                  <span className="text-sm font-medium text-green-400">
                    {formatDate(invoice.paidAt)}
                  </span>
                </div>
              )}
            </div>

            {invoice.paymentLinkUrl && (
              <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                <a
                  href={invoice.paymentLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  <LinkIcon className="h-4 w-4" />
                  View Payment Link
                </a>
              </div>
            )}
          </div>

          {/* Client Card */}
          {invoice.client && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Client</h3>
              <Link
                href={`/clients/${invoice.client.id}`}
                className="flex items-center gap-3 p-3 -m-3 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
                  {(invoice.client.fullName || invoice.client.email).substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {invoice.client.fullName || invoice.client.email}
                  </p>
                  {invoice.client.company && (
                    <p className="text-sm text-foreground-muted truncate">{invoice.client.company}</p>
                  )}
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
                  <p className="text-sm font-medium text-foreground">Created</p>
                  <p className="text-xs text-foreground-muted">{formatDate(invoice.createdAt)}</p>
                </div>
              </div>
              {invoice.status !== "draft" && (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sent</p>
                    <p className="text-xs text-foreground-muted">{formatDate(invoice.issueDate)}</p>
                  </div>
                </div>
              )}
              {invoice.paidAt && (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Paid</p>
                    <p className="text-xs text-foreground-muted">{formatDate(invoice.paidAt)}</p>
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

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}

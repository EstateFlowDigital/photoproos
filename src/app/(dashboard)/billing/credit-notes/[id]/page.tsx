import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CreditNoteActions } from "./credit-note-actions";
import type { CreditNoteStatus } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CreditNoteDetailPage({ params }: Props) {
  const { id } = await params;
  const organizationId = await requireOrganizationId();

  const creditNote = await prisma.creditNote.findFirst({
    where: { id, organizationId },
    include: {
      client: {
        select: { id: true, fullName: true, company: true, email: true },
      },
      invoice: {
        select: { id: true, invoiceNumber: true, totalCents: true },
      },
      appliedToInvoice: {
        select: { id: true, invoiceNumber: true, totalCents: true },
      },
    },
  });

  if (!creditNote) {
    notFound();
  }

  // Fetch available invoices for applying the credit (only for issued credit notes)
  const availableInvoices = creditNote.status === "issued"
    ? await prisma.invoice.findMany({
        where: {
          organizationId,
          clientId: creditNote.clientId || undefined,
          status: { in: ["sent", "overdue"] },
        },
        select: {
          id: true,
          invoiceNumber: true,
          totalCents: true,
          paidAmountCents: true,
          clientName: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const availableCredit = creditNote.amountCents - creditNote.appliedAmountCents - creditNote.refundedAmountCents;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const getStatusBadge = (status: CreditNoteStatus) => {
    const styles: Record<CreditNoteStatus, string> = {
      draft: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
      issued: "bg-[var(--primary)]/10 text-[var(--primary)]",
      applied: "bg-[var(--success)]/10 text-[var(--success)]",
      refunded: "bg-[var(--warning)]/10 text-[var(--warning)]",
      voided: "bg-[var(--error)]/10 text-[var(--error)]",
    };

    const labels: Record<CreditNoteStatus, string> = {
      draft: "Draft",
      issued: "Issued",
      applied: "Applied",
      refunded: "Refunded",
      voided: "Voided",
    };

    return (
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-element="billing-credit-notes-detail-page">
      <PageHeader
        title={creditNote.creditNoteNumber}
        subtitle="Credit note details"
        actions={
          <Link
            href="/billing/credit-notes"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Back to List
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Note Header */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{creditNote.creditNoteNumber}</h2>
                <p className="mt-1 text-foreground-muted">
                  Created on {new Date(creditNote.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {getStatusBadge(creditNote.status)}
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                {formatCurrency(creditNote.amountCents)}
              </span>
              <span className="text-lg text-foreground-muted">credit</span>
            </div>

            {/* Credit Breakdown */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                <p className="text-sm text-foreground-muted">Applied</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(creditNote.appliedAmountCents)}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                <p className="text-sm text-foreground-muted">Refunded</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(creditNote.refundedAmountCents)}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                <p className="text-sm text-foreground-muted">Available</p>
                <p className={`text-lg font-semibold ${availableCredit > 0 ? "text-[var(--success)]" : "text-foreground-muted"}`}>
                  {formatCurrency(availableCredit)}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Details</h3>
            <dl className="space-y-4">
              {creditNote.reason && (
                <div>
                  <dt className="text-sm text-foreground-muted">Reason</dt>
                  <dd className="mt-1 text-foreground capitalize">{creditNote.reason.replace("_", " ")}</dd>
                </div>
              )}
              {creditNote.description && (
                <div>
                  <dt className="text-sm text-foreground-muted">Description</dt>
                  <dd className="mt-1 text-foreground">{creditNote.description}</dd>
                </div>
              )}
              {creditNote.notes && (
                <div>
                  <dt className="text-sm text-foreground-muted">Internal Notes</dt>
                  <dd className="mt-1 text-foreground whitespace-pre-wrap">{creditNote.notes}</dd>
                </div>
              )}
              {creditNote.issueDate && (
                <div>
                  <dt className="text-sm text-foreground-muted">Issue Date</dt>
                  <dd className="mt-1 text-foreground">
                    {new Date(creditNote.issueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Related Invoice */}
          {creditNote.invoice && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Related Invoice</h3>
              <Link
                href={`/invoices/${creditNote.invoice.id}`}
                className="flex items-start justify-between gap-4 flex-wrap rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 transition-colors hover:bg-[var(--background-hover)]"
              >
                <div>
                  <p className="font-medium text-foreground">{creditNote.invoice.invoiceNumber}</p>
                  <p className="text-sm text-foreground-muted">
                    Original invoice this credit relates to
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(creditNote.invoice.totalCents)}
                </span>
              </Link>
            </div>
          )}

          {/* Applied To Invoice */}
          {creditNote.appliedToInvoice && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Applied To</h3>
              <Link
                href={`/invoices/${creditNote.appliedToInvoice.id}`}
                className="flex items-start justify-between gap-4 flex-wrap rounded-lg border border-[var(--card-border)] bg-[var(--success)]/10 p-4 transition-colors hover:bg-[var(--success)]/20"
              >
                <div>
                  <p className="font-medium text-foreground">{creditNote.appliedToInvoice.invoiceNumber}</p>
                  <p className="text-sm text-foreground-muted">
                    Credit applied on {creditNote.appliedAt
                      ? new Date(creditNote.appliedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <span className="text-sm font-medium text-[var(--success)]">
                  -{formatCurrency(creditNote.appliedAmountCents)}
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {creditNote.client ? (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Client</h3>
              <Link
                href={`/clients/${creditNote.client.id}`}
                className="block rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 transition-colors hover:bg-[var(--background-hover)]"
              >
                <p className="font-medium text-foreground">
                  {creditNote.client.fullName || creditNote.client.company || "Unknown"}
                </p>
                {creditNote.client.company && creditNote.client.fullName && (
                  <p className="text-sm text-foreground-muted">{creditNote.client.company}</p>
                )}
                <p className="text-sm text-foreground-muted">{creditNote.client.email}</p>
              </Link>
            </div>
          ) : creditNote.clientName ? (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Client</h3>
              <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                <p className="font-medium text-foreground">{creditNote.clientName}</p>
                {creditNote.clientEmail && (
                  <p className="text-sm text-foreground-muted">{creditNote.clientEmail}</p>
                )}
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            <CreditNoteActions
              creditNote={{
                id: creditNote.id,
                creditNoteNumber: creditNote.creditNoteNumber,
                status: creditNote.status,
                amountCents: creditNote.amountCents,
                appliedAmountCents: creditNote.appliedAmountCents,
                refundedAmountCents: creditNote.refundedAmountCents,
                clientId: creditNote.clientId,
              }}
              availableInvoices={availableInvoices}
            />
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--foreground-muted)]" />
                <div>
                  <p className="text-sm font-medium text-foreground">Created</p>
                  <p className="text-xs text-foreground-muted">
                    {new Date(creditNote.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {creditNote.issueDate && creditNote.status !== "draft" && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Issued</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(creditNote.issueDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {creditNote.appliedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[var(--success)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Applied</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(creditNote.appliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {creditNote.refundedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[var(--warning)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Refunded</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(creditNote.refundedAt).toLocaleString()}
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

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { notFound } from "next/navigation";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import Link from "next/link";
import { EstimateActions } from "./estimate-actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EstimateDetailPage({ params }: Props) {
  const { id } = await params;
  const organizationId = await requireOrganizationId();

  const estimate = await prisma.estimate.findFirst({
    where: { id, organizationId },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      client: {
        select: { id: true, fullName: true, company: true, email: true, phone: true },
      },
      convertedToInvoice: {
        select: { id: true, invoiceNumber: true },
      },
    },
  });

  if (!estimate) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-[var(--background-secondary)] text-foreground-muted",
      sent: "bg-[var(--primary)]/10 text-[var(--primary)]",
      viewed: "bg-[var(--ai)]/10 text-[var(--ai)]",
      approved: "bg-[var(--success)]/10 text-[var(--success)]",
      rejected: "bg-[var(--error)]/10 text-[var(--error)]",
      expired: "bg-[var(--warning)]/10 text-[var(--warning)]",
      converted: "bg-[var(--success)]/10 text-[var(--success)]",
    };

    const labels: Record<string, string> = {
      draft: "Draft",
      sent: "Sent",
      viewed: "Viewed",
      approved: "Approved",
      rejected: "Rejected",
      expired: "Expired",
      converted: "Converted",
    };

    return (
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const isExpired = estimate.validUntil < new Date() && !["approved", "rejected", "converted"].includes(estimate.status);

  return (
    <div className="flex flex-col gap-6 p-6" data-element="billing-estimates-detail-page">
      <PageHeader
        title={`Estimate ${estimate.estimateNumber}`}
        subtitle={estimate.title || "Estimate details"}
        actions={<EstimateActions estimate={estimate} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          {estimate.status === "converted" && estimate.convertedToInvoice && (
            <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/5 p-4">
              <div className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-[var(--success)]" />
                <div>
                  <p className="text-sm font-medium text-foreground">Converted to Invoice</p>
                  <Link
                    href={`/invoices/${estimate.convertedToInvoice.id}`}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    View {estimate.convertedToInvoice.invoiceNumber}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isExpired && estimate.status !== "converted" && (
            <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4">
              <div className="flex items-center gap-3">
                <AlertIcon className="h-5 w-5 text-[var(--warning)]" />
                <p className="text-sm font-medium text-foreground">
                  This estimate expired on {new Date(estimate.validUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div className="border-b border-[var(--card-border)] px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
            </div>
            <div className="divide-y divide-[var(--card-border)]">
              {estimate.lineItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.description}</p>
                    <p className="text-sm text-foreground-muted">
                      {item.quantity} x {formatCurrency(item.unitCents)}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(item.totalCents)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal</span>
                <span className="text-foreground">{formatCurrency(estimate.subtotalCents)}</span>
              </div>
              {estimate.discountCents > 0 && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-foreground-muted">Discount</span>
                  <span className="text-[var(--success)]">-{formatCurrency(estimate.discountCents)}</span>
                </div>
              )}
              {estimate.taxCents > 0 && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-foreground-muted">Tax</span>
                  <span className="text-foreground">{formatCurrency(estimate.taxCents)}</span>
                </div>
              )}
              <div className="flex justify-between mt-4 pt-4 border-t border-[var(--card-border)]">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">{formatCurrency(estimate.totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(estimate.description || estimate.notes || estimate.terms) && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              {estimate.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-2">
                    Description
                  </h3>
                  <p className="text-foreground whitespace-pre-wrap">{estimate.description}</p>
                </div>
              )}
              {estimate.notes && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-2">Notes</h3>
                  <p className="text-foreground whitespace-pre-wrap">{estimate.notes}</p>
                </div>
              )}
              {estimate.terms && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-2">
                    Terms & Conditions
                  </h3>
                  <p className="text-foreground-muted whitespace-pre-wrap text-sm">{estimate.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Dates */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Status</h3>
              {getStatusBadge(isExpired && estimate.status !== "converted" ? "expired" : estimate.status)}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Created</span>
                <span className="text-foreground">{new Date(estimate.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Valid Until</span>
                <span className={`${isExpired ? "text-[var(--error)]" : "text-foreground"}`}>
                  {new Date(estimate.validUntil).toLocaleDateString()}
                </span>
              </div>
              {estimate.viewedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Viewed</span>
                  <span className="text-foreground">{new Date(estimate.viewedAt).toLocaleDateString()}</span>
                </div>
              )}
              {estimate.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Approved</span>
                  <span className="text-[var(--success)]">{new Date(estimate.approvedAt).toLocaleDateString()}</span>
                </div>
              )}
              {estimate.rejectedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Rejected</span>
                  <span className="text-[var(--error)]">{new Date(estimate.rejectedAt).toLocaleDateString()}</span>
                </div>
              )}
              {estimate.convertedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Converted</span>
                  <span className="text-[var(--success)]">{new Date(estimate.convertedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Client</h3>
            {estimate.client ? (
              <div className="space-y-2">
                <Link
                  href={`/clients/${estimate.client.id}`}
                  className="font-medium text-[var(--primary)] hover:underline"
                >
                  {estimate.client.fullName || estimate.client.company || "Unknown"}
                </Link>
                <p className="text-sm text-foreground-muted">{estimate.client.email}</p>
                {estimate.client.phone && <p className="text-sm text-foreground-muted">{estimate.client.phone}</p>}
              </div>
            ) : estimate.clientName || estimate.clientEmail ? (
              <div className="space-y-2">
                {estimate.clientName && <p className="font-medium text-foreground">{estimate.clientName}</p>}
                {estimate.clientEmail && <p className="text-sm text-foreground-muted">{estimate.clientEmail}</p>}
                {estimate.clientAddress && (
                  <p className="text-sm text-foreground-muted whitespace-pre-wrap">{estimate.clientAddress}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No client assigned</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-2">
              {estimate.status === "draft" && (
                <Link
                  href={`/billing/estimates/${estimate.id}/edit`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  <EditIcon className="h-4 w-4" />
                  Edit Estimate
                </Link>
              )}
              <Link
                href={`/billing/estimates/new?duplicate=${estimate.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <CopyIcon className="h-4 w-4" />
                Duplicate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

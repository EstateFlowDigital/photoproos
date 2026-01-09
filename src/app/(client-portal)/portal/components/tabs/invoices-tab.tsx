"use client";

import { ReceiptIcon, CreditCardIcon, DownloadIcon, LoadingSpinner } from "../icons";
import { EmptyState } from "../empty-state";
import { formatPrice, formatDate } from "../utils";
import type { InvoiceData } from "../types";

interface InvoicesTabProps {
  invoices: InvoiceData[];
  payingInvoice: string | null;
  downloadingInvoicePdf: string | null;
  onPayment: (invoiceId: string) => void;
  onPdfDownload: (invoiceId: string) => void;
}

export function InvoicesTab({
  invoices,
  payingInvoice,
  downloadingInvoicePdf,
  onPayment,
  onPdfDownload,
}: InvoicesTabProps) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptIcon className="h-12 w-12" />}
        illustration="invoice"
        title="No invoices yet"
        description="Your invoices will appear here when your photographer sends them. You'll be able to view details, download PDFs, and pay securely online."
      />
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <InvoiceCard
          key={invoice.id}
          invoice={invoice}
          isPaying={payingInvoice === invoice.id}
          isDownloading={downloadingInvoicePdf === invoice.id}
          onPayment={() => onPayment(invoice.id)}
          onPdfDownload={() => onPdfDownload(invoice.id)}
        />
      ))}
    </div>
  );
}

interface InvoiceCardProps {
  invoice: InvoiceData;
  isPaying: boolean;
  isDownloading: boolean;
  onPayment: () => void;
  onPdfDownload: () => void;
}

function InvoiceCard({ invoice, isPaying, isDownloading, onPayment, onPdfDownload }: InvoiceCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
          <ReceiptIcon className="h-5 w-5 text-[var(--foreground-muted)]" />
        </div>
        <div>
          <h3 className="font-medium text-[var(--foreground)]">{invoice.invoiceNumber}</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {invoice.dueDate && `Due ${formatDate(invoice.dueDate)}`}
            {invoice.paidAt && ` • Paid ${formatDate(invoice.paidAt)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-lg font-bold text-[var(--foreground)]">{formatPrice(invoice.amount)}</p>
        <InvoiceStatusBadge status={invoice.status} />
        <button
          onClick={onPdfDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-border)] disabled:opacity-50"
          title="Download PDF"
        >
          {isDownloading ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <DownloadIcon className="h-4 w-4" />
          )}
        </button>
        {invoice.status !== "paid" && (
          <button
            onClick={onPayment}
            disabled={isPaying}
            className="flex items-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
          >
            {isPaying ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <CreditCardIcon className="h-4 w-4" />
            )}
            {isPaying ? "Processing..." : "Pay Now"}
          </button>
        )}
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const statusStyles = {
    paid: "bg-[var(--success)]/20 text-[var(--success)]",
    overdue: "bg-[var(--error)]/20 text-[var(--error)]",
    default: "bg-[var(--warning)]/20 text-[var(--warning)]",
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.default;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

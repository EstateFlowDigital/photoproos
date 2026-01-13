"use client";

import { useState } from "react";
import { CreditCard, Receipt, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";
import { getInvoicePaymentLink, getInvoicePdfDownload } from "@/lib/actions/portal-downloads";
import { useToast } from "@/components/ui/toast";
import type { InvoiceData } from "../components/types";

interface PortalPaymentsClientProps {
  invoices: InvoiceData[];
}

export function PortalPaymentsClient({ invoices }: PortalPaymentsClientProps) {
  const { showToast } = useToast();
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all");

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === "all") return true;
    if (filter === "unpaid") return invoice.status !== "paid";
    if (filter === "paid") return invoice.status === "paid";
    return true;
  });

  const unpaidInvoices = invoices.filter((i) => i.status !== "paid");
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.amount, 0);

  const handlePayment = async (invoiceId: string) => {
    setPayingInvoice(invoiceId);
    try {
      const result = await getInvoicePaymentLink(invoiceId);
      if (result.success && result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        showToast(result.error || "Unable to process payment", "error");
      }
    } catch {
      showToast("Unable to process payment", "error");
    } finally {
      setPayingInvoice(null);
    }
  };

  const handlePdfDownload = async (invoiceId: string) => {
    setDownloadingPdf(invoiceId);
    try {
      const result = await getInvoicePdfDownload(invoiceId);
      if (result.success && result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, "_blank");
        showToast("Receipt downloaded", "success");
      } else {
        showToast(result.error || "Download failed", "error");
      }
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloadingPdf(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-element="portal-payments-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="mt-1 text-foreground-muted">
          View payment history and pay outstanding invoices
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Receipt className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Total Invoices</p>
              <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <Clock className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Outstanding</p>
              <p className="text-2xl font-bold text-[var(--warning)]">
                ${(totalUnpaid / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Total Paid</p>
              <p className="text-2xl font-bold text-[var(--success)]">
                ${(totalPaid / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {invoices.length > 0 && (
        <div className="mb-6 flex gap-2">
          <FilterButton
            label="All"
            count={invoices.length}
            isActive={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {unpaidInvoices.length > 0 && (
            <FilterButton
              label="Unpaid"
              count={unpaidInvoices.length}
              isActive={filter === "unpaid"}
              onClick={() => setFilter("unpaid")}
              variant="warning"
            />
          )}
          {paidInvoices.length > 0 && (
            <FilterButton
              label="Paid"
              count={paidInvoices.length}
              isActive={filter === "paid"}
              onClick={() => setFilter("paid")}
              variant="success"
            />
          )}
        </div>
      )}

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <EmptyState />
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-foreground-muted">No invoices match the current filter.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-2 text-sm text-[var(--primary)] hover:underline"
          >
            Show all invoices
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              isPaying={payingInvoice === invoice.id}
              isDownloading={downloadingPdf === invoice.id}
              onPayment={() => handlePayment(invoice.id)}
              onDownload={() => handlePdfDownload(invoice.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface InvoiceCardProps {
  invoice: InvoiceData;
  isPaying: boolean;
  isDownloading: boolean;
  onPayment: () => void;
  onDownload: () => void;
}

function InvoiceCard({ invoice, isPaying, isDownloading, onPayment, onDownload }: InvoiceCardProps) {
  const statusConfig = getStatusConfig(invoice.status);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
            <Receipt className="h-5 w-5 text-foreground-muted" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{invoice.invoiceNumber}</h3>
            <p className="text-sm text-foreground-muted">
              {invoice.dueDate && `Due ${formatDate(invoice.dueDate)}`}
              {invoice.paidAt && ` • Paid ${formatDate(invoice.paidAt)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg font-bold text-foreground">{formatPrice(invoice.amount)}</p>

          {/* Status Badge */}
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.style}`}>
            <statusConfig.icon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </span>

          {/* Download Receipt */}
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--card-border)] disabled:opacity-50"
            title="Download receipt"
          >
            {isDownloading ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>

          {/* Pay Button */}
          {invoice.status !== "paid" && (
            <button
              onClick={onPayment}
              disabled={isPaying}
              className="flex items-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
            >
              {isPaying ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {isPaying ? "Processing..." : "Pay Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        icon: CheckCircle2,
        style: "bg-[var(--success)]/10 text-[var(--success)]",
      };
    case "overdue":
      return {
        label: "Overdue",
        icon: AlertCircle,
        style: "bg-[var(--error)]/10 text-[var(--error)]",
      };
    default:
      return {
        label: "Pending",
        icon: Clock,
        style: "bg-[var(--warning)]/10 text-[var(--warning)]",
      };
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
      <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
        <CreditCard className="h-8 w-8 text-foreground-muted" />
      </div>
      <p className="mt-4 text-lg font-medium text-foreground">No payments yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-foreground-muted">
        Your payment history will appear here once you have invoices. You&apos;ll be able to
        pay outstanding balances and download receipts.
      </p>
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  variant?: "default" | "warning" | "success";
}

function FilterButton({ label, count, isActive, onClick, variant = "default" }: FilterButtonProps) {
  const variantStyles = {
    default: isActive
      ? "bg-[var(--foreground)] text-[var(--background)]"
      : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)]",
    warning: isActive
      ? "bg-[var(--warning)] text-white"
      : "bg-[var(--warning)]/10 text-[var(--warning)] hover:bg-[var(--warning)]/20",
    success: isActive
      ? "bg-[var(--success)] text-white"
      : "bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border border-[var(--card-border)] px-3 py-1.5 text-sm font-medium transition-colors ${variantStyles[variant]}`}
    >
      {label}
      <span className="opacity-70">{count}</span>
    </button>
  );
}

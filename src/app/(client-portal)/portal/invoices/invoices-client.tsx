"use client";

import { useState } from "react";
import { InvoicesTab } from "../components/tabs/invoices-tab";
import { getInvoicePaymentLink, getInvoicePdfDownload } from "@/lib/actions/portal-downloads";
import { useToast } from "@/components/ui/toast";
import type { InvoiceData } from "../components/types";

interface PortalInvoicesClientProps {
  invoices: InvoiceData[];
}

export function PortalInvoicesClient({ invoices }: PortalInvoicesClientProps) {
  const { showToast } = useToast();
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [downloadingInvoicePdf, setDownloadingInvoicePdf] = useState<string | null>(null);

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
    setDownloadingInvoicePdf(invoiceId);
    try {
      const result = await getInvoicePdfDownload(invoiceId);
      if (result.success && result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, "_blank");
        showToast("PDF downloaded", "success");
      } else {
        showToast(result.error || "Download failed", "error");
      }
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloadingInvoicePdf(null);
    }
  };

  // Calculate stats
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid");
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-element="portal-invoices-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
        <p className="mt-1 text-foreground-muted">
          View and pay your invoices, download PDFs
        </p>
      </div>

      {/* Stats */}
      {invoices.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Total Invoices</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{invoices.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Paid</p>
            <p className="mt-1 text-2xl font-bold text-[var(--success)]">{paidInvoices.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-[var(--warning)]">
              ${(totalUnpaid / 100).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <InvoicesTab
        invoices={invoices}
        payingInvoice={payingInvoice}
        downloadingInvoicePdf={downloadingInvoicePdf}
        onPayment={handlePayment}
        onPdfDownload={handlePdfDownload}
      />
    </div>
  );
}

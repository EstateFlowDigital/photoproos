"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  sendPaymentReminder,
  getPaymentLinkUrl,
  getPaymentReceiptData,
  exportPaymentsToCSV,
  issueRefund,
} from "@/lib/actions/payments";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@prisma/client";

interface PaymentActionsProps {
  paymentId: string;
  status: PaymentStatus;
  clientEmail: string | null;
  amountCents: number;
  description: string;
  paidAt: Date | null;
  hasStripeId: boolean;
}

export function PaymentActions({
  paymentId,
  status,
  clientEmail,
  amountCents,
  description,
  paidAt,
  hasStripeId,
}: PaymentActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Download Receipt as text file (could be PDF with a library)
  const handleDownloadReceipt = async () => {
    setIsLoading(true);
    try {
      const result = await getPaymentReceiptData(paymentId);
      if (!result.success || !result.data) {
        showToast(result.error || "Failed to get receipt data", "error");
        return;
      }

      const data = result.data;
      const receiptContent = `
=====================================
         PAYMENT RECEIPT
=====================================

Receipt Number: ${data.receiptNumber}
Date: ${data.paidAt ? formatDate(new Date(data.paidAt)) : "N/A"}

FROM:
${data.organization}

TO:
${data.client.name}
${data.client.email}
${data.client.company ? `Company: ${data.client.company}` : ""}

-------------------------------------
PAYMENT DETAILS
-------------------------------------
Description: ${data.description}
Amount: ${formatCurrency(data.amount)}

${data.stripePaymentIntentId ? `Transaction ID: ${data.stripePaymentIntentId}` : ""}

=====================================
      Thank you for your payment!
=====================================
`.trim();

      // Create and download the file
      const blob = new Blob([receiptContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${data.receiptNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Receipt downloaded", "success");
    } catch {
      showToast("Failed to download receipt", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Send reminder email
  const handleSendReminder = async () => {
    if (!clientEmail) {
      showToast("No client email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPaymentReminder(paymentId);
      if (result.success) {
        showToast(`Reminder sent to ${clientEmail}`, "success");
      } else {
        showToast(result.error || "Failed to send reminder", "error");
      }
    } catch {
      showToast("Failed to send reminder", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy payment link
  const handleCopyPaymentLink = async () => {
    setIsLoading(true);
    try {
      const result = await getPaymentLinkUrl(paymentId);
      if (result.success && result.url) {
        await navigator.clipboard.writeText(result.url);
        showToast("Payment link copied to clipboard", "success");
      } else {
        showToast(result.error || "Failed to get payment link", "error");
      }
    } catch {
      showToast("Failed to copy payment link", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      const result = await exportPaymentsToCSV([paymentId]);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payment-${paymentId.slice(0, 8)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast("CSV exported", "success");
      } else {
        showToast(result.error || "Failed to export", "error");
      }
    } catch {
      showToast("Failed to export", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Issue refund
  const handleRefund = async () => {
    if (!hasStripeId) {
      showToast("No Stripe payment to refund. Manual refund required.", "error");
      setShowRefundModal(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await issueRefund(paymentId, undefined, refundReason);
      if (result.success) {
        showToast("Refund processed successfully", "success");
        setShowRefundModal(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to process refund", "error");
      }
    } catch {
      showToast("Failed to process refund", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {status === "paid" && (
          <button
            onClick={handleDownloadReceipt}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
          >
            <ReceiptIcon className="h-4 w-4" />
            Download Receipt
          </button>
        )}
        {(status === "pending" || status === "overdue") && (
          <button
            onClick={handleSendReminder}
            disabled={isLoading || !clientEmail}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            <EmailIcon className="h-4 w-4" />
            Send Reminder
          </button>
        )}
      </div>

      {/* Sidebar Quick Actions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
        <div className="space-y-2">
          {status === "paid" && (
            <>
              <button
                onClick={handleSendReminder}
                disabled={isLoading}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <ReceiptIcon className="h-4 w-4 text-foreground-muted" />
                Resend Receipt
              </button>
              <button
                onClick={handleDownloadReceipt}
                disabled={isLoading}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <DownloadIcon className="h-4 w-4 text-foreground-muted" />
                Download Invoice
              </button>
            </>
          )}
          {(status === "pending" || status === "overdue") && (
            <>
              <button
                onClick={handleSendReminder}
                disabled={isLoading || !clientEmail}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Send Reminder
              </button>
              <button
                onClick={handleCopyPaymentLink}
                disabled={isLoading}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <LinkIcon className="h-4 w-4 text-foreground-muted" />
                Copy Payment Link
              </button>
            </>
          )}
          <button
            onClick={handleExportCSV}
            disabled={isLoading}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
          >
            <ExportIcon className="h-4 w-4 text-foreground-muted" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Refund Section */}
      {status === "paid" && (
        <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
          <h2 className="text-lg font-semibold text-[var(--error)] mb-4">Refund</h2>
          <p className="text-sm text-foreground-secondary mb-4">
            Issue a full or partial refund for this payment. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowRefundModal(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/40 px-4 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
          >
            <RefundIcon className="h-4 w-4" />
            Issue Refund
          </button>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowRefundModal(false)}
          />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Issue Refund</h3>
            <p className="text-sm text-foreground-muted mb-4">
              You are about to refund {formatCurrency(amountCents)} for "{description}".
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Reason (optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter a reason for this refund..."
                rows={3}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            {!hasStripeId && (
              <div className="mb-4 rounded-lg bg-[var(--warning)]/10 p-3 text-sm text-[var(--warning)]">
                This payment doesn't have a Stripe transaction. The refund will be marked but not processed through Stripe.
              </div>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={() => setShowRefundModal(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingIcon className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Refund"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Sidebar Actions wrapper component
export function PaymentSidebarActions({
  paymentId,
  status,
  clientEmail,
  amountCents,
  description,
  hasStripeId,
}: Omit<PaymentActionsProps, "paidAt">) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleDownloadReceipt = async () => {
    setIsLoading(true);
    try {
      const result = await getPaymentReceiptData(paymentId);
      if (!result.success || !result.data) {
        showToast(result.error || "Failed to get receipt data", "error");
        return;
      }

      const data = result.data;
      const receiptContent = `
=====================================
         PAYMENT RECEIPT
=====================================

Receipt Number: ${data.receiptNumber}
Date: ${data.paidAt ? formatDate(new Date(data.paidAt)) : "N/A"}

FROM:
${data.organization}

TO:
${data.client.name}
${data.client.email}
${data.client.company ? `Company: ${data.client.company}` : ""}

-------------------------------------
PAYMENT DETAILS
-------------------------------------
Description: ${data.description}
Amount: ${formatCurrency(data.amount)}

${data.stripePaymentIntentId ? `Transaction ID: ${data.stripePaymentIntentId}` : ""}

=====================================
      Thank you for your payment!
=====================================
`.trim();

      const blob = new Blob([receiptContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${data.receiptNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Receipt downloaded", "success");
    } catch {
      showToast("Failed to download receipt", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!clientEmail) {
      showToast("No client email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPaymentReminder(paymentId);
      if (result.success) {
        showToast(`Reminder sent to ${clientEmail}`, "success");
      } else {
        showToast(result.error || "Failed to send reminder", "error");
      }
    } catch {
      showToast("Failed to send reminder", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    setIsLoading(true);
    try {
      const result = await getPaymentLinkUrl(paymentId);
      if (result.success && result.url) {
        await navigator.clipboard.writeText(result.url);
        showToast("Payment link copied to clipboard", "success");
      } else {
        showToast(result.error || "Failed to get payment link", "error");
      }
    } catch {
      showToast("Failed to copy payment link", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      const result = await exportPaymentsToCSV([paymentId]);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payment-${paymentId.slice(0, 8)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast("CSV exported", "success");
      } else {
        showToast(result.error || "Failed to export", "error");
      }
    } catch {
      showToast("Failed to export", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    setIsLoading(true);
    try {
      const result = await issueRefund(paymentId, undefined, refundReason);
      if (result.success) {
        showToast("Refund processed successfully", "success");
        setShowRefundModal(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to process refund", "error");
      }
    } catch {
      showToast("Failed to process refund", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Quick Actions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
        <div className="space-y-2">
          {status === "paid" && (
            <>
              <button
                onClick={handleSendReminder}
                disabled={isLoading}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <ReceiptIcon className="h-4 w-4 text-foreground-muted" />
                Resend Receipt
              </button>
              <button
                onClick={handleDownloadReceipt}
                disabled={isLoading}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <DownloadIcon className="h-4 w-4 text-foreground-muted" />
                Download Invoice
              </button>
            </>
          )}
          {(status === "pending" || status === "overdue") && (
            <>
              <button
                onClick={handleSendReminder}
                disabled={isLoading || !clientEmail}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Send Reminder
              </button>
              <button
                onClick={handleCopyPaymentLink}
                disabled={isLoading}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                <LinkIcon className="h-4 w-4 text-foreground-muted" />
                Copy Payment Link
              </button>
            </>
          )}
          <button
            onClick={handleExportCSV}
            disabled={isLoading}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
          >
            <ExportIcon className="h-4 w-4 text-foreground-muted" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Refund Section */}
      {status === "paid" && (
        <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
          <h2 className="text-lg font-semibold text-[var(--error)] mb-4">Refund</h2>
          <p className="text-sm text-foreground-secondary mb-4">
            Issue a full or partial refund for this payment. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowRefundModal(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/40 px-4 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
          >
            <RefundIcon className="h-4 w-4" />
            Issue Refund
          </button>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowRefundModal(false)}
          />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Issue Refund</h3>
            <p className="text-sm text-foreground-muted mb-4">
              You are about to refund {formatCurrency(amountCents)} for "{description}".
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Reason (optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter a reason for this refund..."
                rows={3}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            {!hasStripeId && (
              <div className="mb-4 rounded-lg bg-[var(--warning)]/10 p-3 text-sm text-[var(--warning)]">
                This payment doesn't have a Stripe transaction. The refund will be marked but not processed through Stripe.
              </div>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={() => setShowRefundModal(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingIcon className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Refund"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Header Actions component
export function PaymentHeaderActions({
  paymentId,
  status,
  clientEmail,
}: {
  paymentId: string;
  status: PaymentStatus;
  clientEmail: string | null;
}) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleDownloadReceipt = async () => {
    setIsLoading(true);
    try {
      const result = await getPaymentReceiptData(paymentId);
      if (!result.success || !result.data) {
        showToast(result.error || "Failed to get receipt data", "error");
        return;
      }

      const data = result.data;
      const receiptContent = `
=====================================
         PAYMENT RECEIPT
=====================================

Receipt Number: ${data.receiptNumber}
Date: ${data.paidAt ? formatDate(new Date(data.paidAt)) : "N/A"}

FROM:
${data.organization}

TO:
${data.client.name}
${data.client.email}
${data.client.company ? `Company: ${data.client.company}` : ""}

-------------------------------------
PAYMENT DETAILS
-------------------------------------
Description: ${data.description}
Amount: ${formatCurrency(data.amount)}

${data.stripePaymentIntentId ? `Transaction ID: ${data.stripePaymentIntentId}` : ""}

=====================================
      Thank you for your payment!
=====================================
`.trim();

      const blob = new Blob([receiptContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${data.receiptNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Receipt downloaded", "success");
    } catch {
      showToast("Failed to download receipt", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!clientEmail) {
      showToast("No client email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPaymentReminder(paymentId);
      if (result.success) {
        showToast(`Reminder sent to ${clientEmail}`, "success");
      } else {
        showToast(result.error || "Failed to send reminder", "error");
      }
    } catch {
      showToast("Failed to send reminder", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "paid" && (
        <button
          onClick={handleDownloadReceipt}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
        >
          <ReceiptIcon className="h-4 w-4" />
          Download Receipt
        </button>
      )}
      {(status === "pending" || status === "overdue") && (
        <button
          onClick={handleSendReminder}
          disabled={isLoading || !clientEmail}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          <EmailIcon className="h-4 w-4" />
          Send Reminder
        </button>
      )}
    </div>
  );
}

// Icons
function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
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

function RefundIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 0 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H6.75Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

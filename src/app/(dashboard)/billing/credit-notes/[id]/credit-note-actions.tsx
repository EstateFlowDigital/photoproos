"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  issueCreditNote,
  applyCreditNoteToInvoice,
  markCreditNoteRefunded,
  voidCreditNote,
  deleteCreditNote,
} from "@/lib/actions/credit-notes";
import type { CreditNoteStatus } from "@prisma/client";

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  status: CreditNoteStatus;
  amountCents: number;
  appliedAmountCents: number;
  refundedAmountCents: number;
  clientId: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalCents: number;
  paidAmountCents: number;
  clientName: string | null;
}

interface CreditNoteActionsProps {
  creditNote: CreditNote;
  availableInvoices: Invoice[];
}

export function CreditNoteActions({ creditNote, availableInvoices }: CreditNoteActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [applyAmount, setApplyAmount] = useState(0);

  const availableCredit = creditNote.amountCents - creditNote.appliedAmountCents - creditNote.refundedAmountCents;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const handleIssue = async () => {
    setIsLoading("issue");
    const result = await issueCreditNote(creditNote.id);
    if (result.success) {
      showToast("Credit note issued successfully", "success");
      router.refresh();
    } else {
      showToast(result.error || "Failed to issue credit note", "error");
    }
    setIsLoading(null);
  };

  const handleApply = async () => {
    if (!selectedInvoiceId) {
      showToast("Please select an invoice", "error");
      return;
    }

    setIsLoading("apply");
    const result = await applyCreditNoteToInvoice(
      creditNote.id,
      selectedInvoiceId,
      applyAmount > 0 ? applyAmount : undefined
    );
    if (result.success) {
      showToast(`Applied ${formatCurrency(result.data.appliedAmountCents)} to invoice`, "success");
      setShowApplyModal(false);
      router.refresh();
    } else {
      showToast(result.error || "Failed to apply credit note", "error");
    }
    setIsLoading(null);
  };

  const handleRefund = async () => {
    if (!confirm("Mark this credit note as refunded? This indicates you've refunded the client directly.")) {
      return;
    }

    setIsLoading("refund");
    const result = await markCreditNoteRefunded(creditNote.id);
    if (result.success) {
      showToast("Credit note marked as refunded", "success");
      router.refresh();
    } else {
      showToast(result.error || "Failed to mark as refunded", "error");
    }
    setIsLoading(null);
  };

  const handleVoid = async () => {
    if (!confirm("Are you sure you want to void this credit note? This cannot be undone.")) {
      return;
    }

    setIsLoading("void");
    const result = await voidCreditNote(creditNote.id);
    if (result.success) {
      showToast("Credit note voided", "success");
      router.refresh();
    } else {
      showToast(result.error || "Failed to void credit note", "error");
    }
    setIsLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this credit note? This cannot be undone.")) {
      return;
    }

    setIsLoading("delete");
    const result = await deleteCreditNote(creditNote.id);
    if (result.success) {
      showToast("Credit note deleted", "success");
      router.push("/billing/credit-notes");
    } else {
      showToast(result.error || "Failed to delete credit note", "error");
    }
    setIsLoading(null);
  };

  const selectedInvoice = availableInvoices.find((inv) => inv.id === selectedInvoiceId);
  const maxApplyAmount = selectedInvoice
    ? Math.min(availableCredit, selectedInvoice.totalCents - selectedInvoice.paidAmountCents)
    : availableCredit;

  return (
    <>
      <div className="space-y-3">
        {/* Draft actions */}
        {creditNote.status === "draft" && (
          <>
            <button
              onClick={handleIssue}
              disabled={isLoading !== null}
              className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {isLoading === "issue" ? "Issuing..." : "Issue Credit Note"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading !== null}
              className="w-full rounded-lg border border-[var(--error)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50"
            >
              {isLoading === "delete" ? "Deleting..." : "Delete Draft"}
            </button>
          </>
        )}

        {/* Issued actions */}
        {creditNote.status === "issued" && availableCredit > 0 && (
          <>
            <button
              onClick={() => {
                setApplyAmount(0);
                setSelectedInvoiceId("");
                setShowApplyModal(true);
              }}
              disabled={isLoading !== null || availableInvoices.length === 0}
              className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              Apply to Invoice
            </button>
            <button
              onClick={handleRefund}
              disabled={isLoading !== null}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              {isLoading === "refund" ? "Processing..." : "Mark as Refunded"}
            </button>
            <button
              onClick={handleVoid}
              disabled={isLoading !== null}
              className="w-full rounded-lg border border-[var(--error)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50"
            >
              {isLoading === "void" ? "Voiding..." : "Void Credit Note"}
            </button>
          </>
        )}

        {/* No actions available */}
        {(creditNote.status === "applied" ||
          creditNote.status === "refunded" ||
          creditNote.status === "voided") && (
          <p className="text-center text-sm text-foreground-muted py-2">
            No actions available for this credit note.
          </p>
        )}

        {availableInvoices.length === 0 && creditNote.status === "issued" && (
          <p className="text-xs text-foreground-muted text-center">
            No outstanding invoices available for this client.
          </p>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Apply Credit Note</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select Invoice
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    setApplyAmount(0);
                  }}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">Select an invoice...</option>
                  {availableInvoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {invoice.clientName || "Unknown"} (Balance: {formatCurrency(invoice.totalCents - invoice.paidAmountCents)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <>
                  <div className="rounded-lg bg-[var(--background-secondary)] p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Invoice Balance:</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(selectedInvoice.totalCents - selectedInvoice.paidAmountCents)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-foreground-muted">Available Credit:</span>
                      <span className="font-medium text-[var(--success)]">
                        {formatCurrency(availableCredit)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 pt-1 border-t border-[var(--card-border)]">
                      <span className="text-foreground-muted">Max to Apply:</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(maxApplyAmount)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Amount to Apply (optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={(maxApplyAmount / 100).toFixed(2)}
                        value={applyAmount ? (applyAmount / 100).toFixed(2) : ""}
                        onChange={(e) => setApplyAmount(Math.round(parseFloat(e.target.value || "0") * 100))}
                        placeholder={`Max: ${(maxApplyAmount / 100).toFixed(2)}`}
                        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <p className="mt-1 text-xs text-foreground-muted">
                      Leave blank to apply the maximum amount.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowApplyModal(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedInvoiceId || isLoading === "apply"}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isLoading === "apply" ? "Applying..." : `Apply ${formatCurrency(applyAmount || maxApplyAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

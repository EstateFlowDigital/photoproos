"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  addDeposit,
  applyToInvoice,
  refundFromRetainer,
  updateRetainer,
} from "@/lib/actions/retainers";

interface Retainer {
  id: string;
  clientId: string;
  balanceCents: number;
  isActive: boolean;
  lowBalanceThresholdCents: number | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalCents: number;
  paidAmountCents: number;
  clientName: string | null;
}

interface RetainerActionsProps {
  retainer: Retainer;
  availableInvoices: Invoice[];
}

export function RetainerActions({ retainer, availableInvoices }: RetainerActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [applyAmount, setApplyAmount] = useState(0);

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundDescription, setRefundDescription] = useState("");

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [thresholdAmount, setThresholdAmount] = useState(
    retainer.lowBalanceThresholdCents ? (retainer.lowBalanceThresholdCents / 100).toFixed(2) : ""
  );

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const handleDeposit = async () => {
    const amountCents = Math.round(parseFloat(depositAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setIsLoading("deposit");
    const result = await addDeposit(retainer.id, {
      amountCents,
      description: depositDescription || "Manual deposit",
    });

    if (result.success) {
      showToast(`Deposited ${formatCurrency(amountCents)}`, "success");
      setShowDepositModal(false);
      setDepositAmount("");
      setDepositDescription("");
      router.refresh();
    } else {
      showToast(result.error || "Failed to add deposit", "error");
    }
    setIsLoading(null);
  };

  const handleApply = async () => {
    if (!selectedInvoiceId) {
      showToast("Please select an invoice", "error");
      return;
    }

    const selectedInvoice = availableInvoices.find((inv) => inv.id === selectedInvoiceId);
    if (!selectedInvoice) return;

    const maxAmount = Math.min(retainer.balanceCents, selectedInvoice.totalCents - selectedInvoice.paidAmountCents);
    const finalAmount = applyAmount > 0 ? Math.min(applyAmount, maxAmount) : maxAmount;

    if (finalAmount <= 0) {
      showToast("Invalid amount", "error");
      return;
    }

    setIsLoading("apply");
    const result = await applyToInvoice(retainer.id, {
      invoiceId: selectedInvoiceId,
      amountCents: finalAmount,
      description: `Applied to ${selectedInvoice.invoiceNumber}`,
    });

    if (result.success) {
      showToast(`Applied ${formatCurrency(finalAmount)} to invoice`, "success");
      setShowApplyModal(false);
      setSelectedInvoiceId("");
      setApplyAmount(0);
      router.refresh();
    } else {
      showToast(result.error || "Failed to apply to invoice", "error");
    }
    setIsLoading(null);
  };

  const handleRefund = async () => {
    const amountCents = Math.round(parseFloat(refundAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    if (amountCents > retainer.balanceCents) {
      showToast("Refund amount exceeds balance", "error");
      return;
    }

    setIsLoading("refund");
    const result = await refundFromRetainer(
      retainer.id,
      amountCents,
      refundDescription || "Refund to client"
    );

    if (result.success) {
      showToast(`Refunded ${formatCurrency(amountCents)}`, "success");
      setShowRefundModal(false);
      setRefundAmount("");
      setRefundDescription("");
      router.refresh();
    } else {
      showToast(result.error || "Failed to process refund", "error");
    }
    setIsLoading(null);
  };

  const handleUpdateSettings = async () => {
    const thresholdCents = thresholdAmount ? Math.round(parseFloat(thresholdAmount) * 100) : null;

    setIsLoading("settings");
    const result = await updateRetainer(retainer.id, {
      lowBalanceThresholdCents: thresholdCents,
    });

    if (result.success) {
      showToast("Settings updated", "success");
      setShowSettingsModal(false);
      router.refresh();
    } else {
      showToast(result.error || "Failed to update settings", "error");
    }
    setIsLoading(null);
  };

  const handleToggleActive = async () => {
    const action = retainer.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this retainer?`)) return;

    setIsLoading("toggle");
    const result = await updateRetainer(retainer.id, {
      isActive: !retainer.isActive,
    });

    if (result.success) {
      showToast(`Retainer ${action}d`, "success");
      router.refresh();
    } else {
      showToast(result.error || `Failed to ${action} retainer`, "error");
    }
    setIsLoading(null);
  };

  const selectedInvoice = availableInvoices.find((inv) => inv.id === selectedInvoiceId);
  const maxApplyAmount = selectedInvoice
    ? Math.min(retainer.balanceCents, selectedInvoice.totalCents - selectedInvoice.paidAmountCents)
    : retainer.balanceCents;

  return (
    <>
      <div className="space-y-3">
        {retainer.isActive && (
          <>
            <button
              onClick={() => setShowDepositModal(true)}
              disabled={isLoading !== null}
              className="w-full rounded-lg bg-[var(--success)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
            >
              Add Deposit
            </button>

            {retainer.balanceCents > 0 && availableInvoices.length > 0 && (
              <button
                onClick={() => {
                  setApplyAmount(0);
                  setSelectedInvoiceId("");
                  setShowApplyModal(true);
                }}
                disabled={isLoading !== null}
                className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                Apply to Invoice
              </button>
            )}

            {retainer.balanceCents > 0 && (
              <button
                onClick={() => setShowRefundModal(true)}
                disabled={isLoading !== null}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Process Refund
              </button>
            )}
          </>
        )}

        <button
          onClick={() => setShowSettingsModal(true)}
          disabled={isLoading !== null}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
        >
          Settings
        </button>

        <button
          onClick={handleToggleActive}
          disabled={isLoading !== null}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            retainer.isActive
              ? "border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)]/10"
              : "border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)]/10"
          }`}
        >
          {isLoading === "toggle" ? "Processing..." : retainer.isActive ? "Deactivate" : "Activate"}
        </button>

        {availableInvoices.length === 0 && retainer.balanceCents > 0 && retainer.isActive && (
          <p className="text-xs text-foreground-muted text-center">
            No outstanding invoices available for this client.
          </p>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add Deposit</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                  placeholder="e.g., Monthly retainer"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowDepositModal(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || isLoading === "deposit"}
                className="rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
              >
                {isLoading === "deposit" ? "Adding..." : "Add Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Apply to Invoice</h3>

            <div className="space-y-4">
              <div className="rounded-lg bg-[var(--background-secondary)] p-3 text-sm">
                <span className="text-foreground-muted">Available Balance: </span>
                <span className="font-medium text-[var(--success)]">{formatCurrency(retainer.balanceCents)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Select Invoice</label>
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
                      {invoice.invoiceNumber} - Balance: {formatCurrency(invoice.totalCents - invoice.paidAmountCents)}
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
                    <div className="flex justify-between mt-1 pt-1 border-t border-[var(--card-border)]">
                      <span className="text-foreground-muted">Max to Apply:</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(maxApplyAmount)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Amount (optional)</label>
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
                    <p className="mt-1 text-xs text-foreground-muted">Leave blank to apply maximum.</p>
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

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Process Refund</h3>

            <div className="space-y-4">
              <div className="rounded-lg bg-[var(--background-secondary)] p-3 text-sm">
                <span className="text-foreground-muted">Available Balance: </span>
                <span className="font-medium text-[var(--success)]">{formatCurrency(retainer.balanceCents)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Refund Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={(retainer.balanceCents / 100).toFixed(2)}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={refundDescription}
                  onChange={(e) => setRefundDescription(e.target.value)}
                  placeholder="e.g., Client requested refund"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowRefundModal(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={!refundAmount || isLoading === "refund"}
                className="rounded-lg bg-[var(--warning)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--warning)]/90 disabled:opacity-50"
              >
                {isLoading === "refund" ? "Processing..." : "Process Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Retainer Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Low Balance Alert Threshold</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={thresholdAmount}
                    onChange={(e) => setThresholdAmount(e.target.value)}
                    placeholder="Not set"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <p className="mt-1 text-xs text-foreground-muted">
                  Get alerted when balance falls below this amount. Leave empty to disable.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSettings}
                disabled={isLoading === "settings"}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isLoading === "settings" ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { recordInvoicePayment } from "@/lib/actions/invoice-payments";

interface RecordPaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  outstandingBalance: number;
  currency: string;
  onClose: () => void;
}

function formatCurrency(cents: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function RecordPaymentModal({
  invoiceId,
  invoiceNumber,
  outstandingBalance,
  currency,
  onClose,
}: RecordPaymentModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountCents) || amountCents <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    if (amountCents > outstandingBalance) {
      showToast(
        `Amount cannot exceed outstanding balance of ${formatCurrency(outstandingBalance, currency)}`,
        "error"
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await recordInvoicePayment({
        invoiceId,
        amountCents,
        notes: notes || undefined,
      });

      if (result.success) {
        const isFullyPaid = result.data.newBalance <= 0;
        showToast(
          isFullyPaid
            ? "Payment recorded - Invoice fully paid!"
            : `Payment of ${formatCurrency(amountCents, currency)} recorded`,
          "success"
        );
        router.refresh();
        onClose();
      } else {
        showToast(result.error || "Failed to record payment", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayFullAmount = () => {
    setAmount((outstandingBalance / 100).toFixed(2));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-foreground">
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-foreground-muted">
              Invoice {invoiceNumber}
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              Outstanding: {formatCurrency(outstandingBalance, currency)}
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                $
              </span>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                max={(outstandingBalance / 100).toFixed(2)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2.5 pl-8 pr-3 text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                required
              />
            </div>
            <button
              type="button"
              onClick={handlePayFullAmount}
              className="mt-2 text-sm text-[var(--primary)] hover:underline"
            >
              Pay full amount
            </button>
          </div>

          <div className="mb-6">
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Notes (Optional)
            </label>
            <input
              type="text"
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Check #1234, Cash payment, etc."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

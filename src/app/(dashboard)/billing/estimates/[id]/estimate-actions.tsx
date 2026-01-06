"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  sendEstimate,
  deleteEstimate,
  convertEstimateToInvoice,
} from "@/lib/actions/estimates";
import type { Estimate, EstimateLineItem } from "@prisma/client";

interface EstimateActionsProps {
  estimate: Estimate & {
    lineItems: EstimateLineItem[];
    client?: { id: string; fullName: string | null; email: string } | null;
    convertedToInvoice?: { id: string; invoiceNumber: string } | null;
  };
}

export function EstimateActions({ estimate }: EstimateActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const handleSend = async () => {
    setIsLoading("send");
    try {
      const result = await sendEstimate(estimate.id);
      if (result.success) {
        showToast("Estimate sent successfully", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to send estimate", "error");
      }
    } catch {
      showToast("Failed to send estimate", "error");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this estimate? This cannot be undone.")) {
      return;
    }

    setIsLoading("delete");
    try {
      const result = await deleteEstimate(estimate.id);
      if (result.success) {
        showToast("Estimate deleted", "success");
        router.push("/billing/estimates");
      } else {
        showToast(result.error || "Failed to delete estimate", "error");
      }
    } catch {
      showToast("Failed to delete estimate", "error");
    } finally {
      setIsLoading(null);
    }
  };

  const handleConvert = async () => {
    setIsLoading("convert");
    try {
      const result = await convertEstimateToInvoice(estimate.id);
      if (result.success) {
        showToast("Converted to invoice successfully", "success");
        router.push(`/invoices/${result.data.invoiceId}`);
      } else {
        showToast(result.error || "Failed to convert estimate", "error");
      }
    } catch {
      showToast("Failed to convert estimate", "error");
    } finally {
      setIsLoading(null);
      setShowConvertModal(false);
    }
  };

  const canSend = estimate.status === "draft";
  const canConvert = estimate.status === "approved";
  const canDelete = estimate.status === "draft";
  const isExpired = estimate.validUntil < new Date() && !["approved", "rejected", "converted"].includes(estimate.status);

  return (
    <>
      <div className="flex items-center gap-2">
        {canSend && !isExpired && (
          <button
            onClick={handleSend}
            disabled={isLoading === "send"}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {isLoading === "send" ? (
              <LoadingIcon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
            Send to Client
          </button>
        )}

        {canConvert && (
          <button
            onClick={() => setShowConvertModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90"
          >
            <ConvertIcon className="h-4 w-4" />
            Convert to Invoice
          </button>
        )}

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading === "delete"}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/5 px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50"
          >
            {isLoading === "delete" ? (
              <LoadingIcon className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
            Delete
          </button>
        )}
      </div>

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground mb-2">Convert to Invoice</h2>
            <p className="text-sm text-foreground-muted mb-4">
              This will create a new invoice with all line items from this estimate. The estimate will be marked as
              converted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConvertModal(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={isLoading === "convert"}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
              >
                {isLoading === "convert" ? (
                  <LoadingIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <ConvertIcon className="h-4 w-4" />
                )}
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Icons
function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function ConvertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

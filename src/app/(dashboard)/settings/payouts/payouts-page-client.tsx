"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createPayoutBatch, processPayoutBatch, cancelPayoutBatch } from "@/lib/actions/payouts";
import type { PayoutBatchWithRelations } from "@/lib/actions/payouts";

// Local interface matching the actual return type from getPendingPayouts
interface PendingPayout {
  userId: string;
  userFullName: string | null;
  userEmail: string | null;
  totalAmountCents: number;
  earningsCount: number;
  hasStripeConnect: boolean;
  stripeConnectOnboarded: boolean;
}

// Stats interface matching getPayoutStats return type
interface Stats {
  totalPaidOut: number;
  pendingAmount: number;
  totalBatches: number;
  completedBatches: number;
  failedBatches: number;
  photographersWithPendingPayouts: number;
}

interface PayoutsPageClientProps {
  batches: PayoutBatchWithRelations[];
  pendingPayouts: PendingPayout[];
  stats: Stats;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusStyles = {
  pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
  processing: "bg-blue-500/10 text-blue-400",
  completed: "bg-[var(--success)]/10 text-[var(--success)]",
  failed: "bg-[var(--error)]/10 text-[var(--error)]",
  cancelled: "bg-gray-500/10 text-gray-400",
};

export function PayoutsPageClient({
  batches,
  pendingPayouts,
  stats,
}: PayoutsPageClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPhotographers, setSelectedPhotographers] = useState<string[]>([]);

  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.totalAmountCents, 0);

  const handleCreateBatch = async () => {
    if (selectedPhotographers.length === 0 && pendingPayouts.length === 0) return;

    setIsCreatingBatch(true);
    try {
      const photographerIds = selectedPhotographers.length > 0
        ? selectedPhotographers
        : pendingPayouts.map((p) => p.userId);

      const today = new Date();
      const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);

      await createPayoutBatch({
        photographerIds,
        periodStart,
        periodEnd: today,
      });

      setSelectedPhotographers([]);
      router.refresh();
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleProcessBatch = async (batchId: string) => {
    const confirmed = await confirm({
      title: "Process payout batch",
      description: "Process this payout batch? This will send money to photographers via Stripe.",
      confirmText: "Process",
    });
    if (!confirmed) return;

    setIsProcessing(batchId);
    try {
      await processPayoutBatch(batchId);
      router.refresh();
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelBatch = async (batchId: string) => {
    const confirmed = await confirm({
      title: "Cancel payout batch",
      description: "Cancel this payout batch? Earnings will return to approved status.",
      confirmText: "Cancel batch",
      variant: "destructive",
    });
    if (!confirmed) return;

    setIsProcessing(batchId);
    try {
      await cancelPayoutBatch(batchId);
      router.refresh();
    } finally {
      setIsProcessing(null);
    }
  };

  const togglePhotographer = (userId: string) => {
    setSelectedPhotographers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedPhotographers(pendingPayouts.map((p) => p.userId));
  };

  const selectNone = () => {
    setSelectedPhotographers([]);
  };

  return (
    <>
      {/* Stats */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Paid Out</p>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.totalPaidOut)}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Pending Payouts</p>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{formatCurrency(stats.pendingAmount)}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Completed Batches</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.completedBatches}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Batches</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalBatches}</p>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ready to Pay</h2>
            <p className="text-sm text-foreground-muted">
              {pendingPayouts.length} photographer{pendingPayouts.length !== 1 ? "s" : ""} with approved earnings
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {pendingPayouts.length > 0 && (
              <>
                <button
                  onClick={selectedPhotographers.length === pendingPayouts.length ? selectNone : selectAll}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {selectedPhotographers.length === pendingPayouts.length ? "Deselect All" : "Select All"}
                </button>
                <Button
                  variant="primary"
                  onClick={handleCreateBatch}
                  disabled={isCreatingBatch}
                >
                  {isCreatingBatch ? "Creating..." : "Create Payout Batch"}
                </Button>
              </>
            )}
          </div>
        </div>

        {pendingPayouts.length > 0 ? (
          <div className="space-y-3">
            {pendingPayouts.map((payout) => (
              <div
                key={payout.userId}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-4 cursor-pointer transition-colors sm:flex-row sm:items-center sm:justify-between",
                  selectedPhotographers.includes(payout.userId)
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--card-border)] bg-[var(--background)] hover:bg-[var(--background-hover)]"
                )}
                onClick={() => togglePhotographer(payout.userId)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <Checkbox
                    checked={selectedPhotographers.includes(payout.userId)}
                    onCheckedChange={() => {}}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                    {(payout.userFullName || payout.userEmail || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{payout.userFullName || payout.userEmail}</p>
                      {!payout.stripeConnectOnboarded && (
                        <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs text-[var(--warning)]">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted">{payout.userEmail}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-semibold text-[var(--success)]">
                    {formatCurrency(payout.totalAmountCents)}
                  </p>
                  <p className="text-sm text-foreground-muted">{payout.earningsCount} earnings</p>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 border-t border-[var(--card-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground-muted">
                {selectedPhotographers.length > 0
                  ? `${selectedPhotographers.length} selected`
                  : "Select photographers to create a payout batch"}
              </p>
              <p className="text-lg font-bold text-foreground">
                Total: {formatCurrency(
                  selectedPhotographers.length > 0
                    ? pendingPayouts
                        .filter((p) => selectedPhotographers.includes(p.userId))
                        .reduce((sum, p) => sum + p.totalAmountCents, 0)
                    : totalPending
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-8 text-center">
            <CheckCircleIcon className="mx-auto h-8 w-8 text-[var(--success)]" />
            <p className="mt-2 text-sm text-foreground">All caught up!</p>
            <p className="mt-1 text-xs text-foreground-muted">
              No pending earnings to pay out
            </p>
          </div>
        )}
      </div>

      {/* Payout History */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Payout History</h2>

        {batches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-[var(--card-border)]">
                <tr>
                  <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Batch
                  </th>
                  <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Period
                  </th>
                  <th className="py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Recipients
                  </th>
                  <th className="py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Amount
                  </th>
                  <th className="py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-[var(--background-hover)]">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-foreground">{batch.batchNumber}</p>
                        <p className="text-xs text-foreground-muted">{formatDate(batch.createdAt)}</p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-foreground-secondary">
                      {formatDate(batch.periodStart)} - {formatDate(batch.periodEnd)}
                    </td>
                    <td className="py-4 text-center text-sm text-foreground-secondary">
                      {batch.itemCount}
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-medium text-foreground">{formatCurrency(batch.totalAmountCents)}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        statusStyles[batch.status as keyof typeof statusStyles]
                      )}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {batch.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleProcessBatch(batch.id)}
                              disabled={isProcessing === batch.id}
                              className="rounded-lg bg-[var(--success)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
                            >
                              {isProcessing === batch.id ? "Processing..." : "Process"}
                            </button>
                            <button
                              onClick={() => handleCancelBatch(batch.id)}
                              disabled={isProcessing === batch.id}
                              className="rounded-lg bg-[var(--error)]/10 px-3 py-1.5 text-xs font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {batch.status === "failed" && batch.failedReason && (
                          <span className="text-xs text-[var(--error)]" title={batch.failedReason}>
                            Error
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-8 text-center">
            <ClockIcon className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-2 text-sm text-foreground">No payout history yet</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Payout batches will appear here after creation
            </p>
          </div>
        )}
      </div>

      {/* Stripe Connect Info */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Stripe Connect</h2>
        <p className="text-sm text-foreground-secondary mb-4">
          Photographers must connect their Stripe account to receive payouts. They can do this from their earnings dashboard.
        </p>
        <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:gap-4">
          <StripeIcon className="h-8 w-8 text-[#635bff]" />
          <div>
            <p className="text-sm font-medium text-foreground">Payments powered by Stripe Connect</p>
            <p className="text-xs text-foreground-muted">
              Instant payouts, 1099 tax reporting, and secure payments
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Icon Components
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" className={className}>
      <path fill="currentColor" d="M13.3 8.9c0-1.4 1.1-1.9 3-1.9 2.7 0 6.1.8 8.8 2.3V2.4c-2.9-1.2-5.9-1.6-8.8-1.6C10.9.8 7 3.5 7 8.5c0 8.3 11.4 7 11.4 10.6 0 1.7-1.5 2.2-3.5 2.2-3 0-6.9-1.2-10-2.9v7c3.4 1.5 6.8 2.1 10 2.1 5.5 0 9.3-2.5 9.3-8 .1-8.9-11.4-7.4-11.4-10.6z"/>
    </svg>
  );
}

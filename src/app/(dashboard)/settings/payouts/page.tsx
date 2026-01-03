export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { getPayoutBatches, getPendingPayouts, getPayoutStats } from "@/lib/actions/payouts";
import { PayoutsPageClient } from "./payouts-page-client";

export default async function PayoutsPage() {
  const [batchesResult, pendingResult, statsResult] = await Promise.all([
    getPayoutBatches(),
    getPendingPayouts(),
    getPayoutStats(),
  ]);

  const batches = batchesResult.success ? batchesResult.data : [];
  const pendingPayouts = pendingResult.success ? pendingResult.data : [];
  const stats = statsResult.success
    ? statsResult.data
    : { totalPaidOut: 0, pendingAmount: 0, totalBatches: 0, completedBatches: 0, failedBatches: 0, photographersWithPendingPayouts: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts"
        subtitle="Process and track photographer payouts"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/settings/photographer-pay"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Pay Rates
            </Link>
          </div>
        }
      />

      <PayoutsPageClient
        batches={batches}
        pendingPayouts={pendingPayouts}
        stats={stats}
      />
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

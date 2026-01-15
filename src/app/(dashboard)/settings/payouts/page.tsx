import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payout Settings | PhotoProOS",
  description: "Manage how you receive payments from clients.",
};

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPayoutBatches, getPendingPayouts, getPayoutStats } from "@/lib/actions/payouts";
import { PayoutsPageClient } from "./payouts-page-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

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
    <div data-element="settings-payouts-page" className="space-y-6">
      <PageHeader
        title="Payouts"
        subtitle="Process and track photographer payouts"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings/photographer-pay">
              <ArrowLeftIcon className="h-4 w-4" />
              Pay Rates
            </Link>
          </Button>
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

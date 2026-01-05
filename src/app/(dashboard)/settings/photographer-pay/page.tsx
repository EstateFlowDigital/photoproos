export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTeamMembers } from "@/lib/actions/settings";
import { getPhotographerRates, getEarningStats } from "@/lib/actions/photographer-pay";
import { getServices } from "@/lib/actions/services";
import { PhotographerPayClient } from "./photographer-pay-client";

export default async function PhotographerPayPage() {
  const [members, ratesResult, statsResult, services] = await Promise.all([
    getTeamMembers(),
    getPhotographerRates(),
    getEarningStats(),
    getServices(),
  ]);

  const rates = ratesResult.success ? ratesResult.data : [];
  const stats = statsResult.success
    ? statsResult.data
    : { totalEarned: 0, pendingAmount: 0, approvedAmount: 0, paidAmount: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Photographer Pay"
        subtitle="Configure pay rates and track earnings for team members"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/settings">
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="primary" asChild>
              <Link href="/settings/payouts">
                <PayoutIcon className="h-4 w-4" />
                Manage Payouts
              </Link>
            </Button>
          </div>
        }
      />

      <PhotographerPayClient
        members={members}
        rates={rates}
        stats={stats}
        services={services}
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

function PayoutIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z" clipRule="evenodd" />
    </svg>
  );
}

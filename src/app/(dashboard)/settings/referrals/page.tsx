import { Metadata } from "next";
import { ReferralsClient } from "./referrals-client";
import {
  getReferralProgram,
  getReferrers,
  getReferrals,
  getReferralStats,
} from "@/lib/actions/referrals";
import { getClients } from "@/lib/actions/clients";

export const metadata: Metadata = {
  title: "Referral Program | Settings",
  description: "Manage your agent referral program",
};

export default async function ReferralsPage() {
  const [programResult, referrersResult, referralsResult, statsResult, clients] =
    await Promise.all([
      getReferralProgram(),
      getReferrers(),
      getReferrals(),
      getReferralStats(),
      getClients(),
    ]);

  const program = programResult.success ? programResult.data : null;
  const referrers = referrersResult.success ? referrersResult.data : [];
  const referrals = referralsResult.success ? referralsResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;

  const mappedClients = (clients || []).map((c) => ({
    id: c.id,
    name: c.fullName,
    email: c.email,
  }));

  return (
    <ReferralsClient
      initialProgram={program}
      initialReferrers={referrers || []}
      initialReferrals={referrals || []}
      stats={stats}
      clients={mappedClients}
    />
  );
}

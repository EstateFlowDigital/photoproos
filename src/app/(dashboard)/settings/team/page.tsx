import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Settings | PhotoProOS",
  description: "Manage team members, roles, and access permissions.",
};

export const dynamic = "force-dynamic";

import { getTeamMembers, getBillingStats } from "@/lib/actions/settings";
import { getPendingInvitations } from "@/lib/actions/invitations";
import { TeamPageClient } from "./team-page-client";

export default async function TeamSettingsPage() {
  const [members, billingStats, pendingInvitations] = await Promise.all([
    getTeamMembers(),
    getBillingStats(),
    getPendingInvitations(),
  ]);

  const memberLimit = billingStats?.usage?.members?.limit || 1;

  return (
    <div data-element="settings-team-page">
      <TeamPageClient
        members={members}
        pendingInvitations={pendingInvitations}
        memberLimit={memberLimit}
      />
    </div>
  );
}

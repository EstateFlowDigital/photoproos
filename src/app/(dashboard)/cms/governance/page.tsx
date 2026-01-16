import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Governance | CMS Admin",
  description: "Manage content governance policies and check violations.",
};

export const dynamic = "force-dynamic";

import { GovernancePageClient } from "./governance-client";
import { getGovernancePolicies, getGovernanceStats, getGovernanceDashboardData } from "@/lib/actions/cms-governance";

export default async function GovernancePage() {
  const [policiesResult, statsResult, dashboardResult] = await Promise.all([
    getGovernancePolicies(),
    getGovernanceStats(),
    getGovernanceDashboardData(),
  ]);

  const policies = policiesResult.success ? policiesResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;
  const dashboard = dashboardResult.success ? dashboardResult.data : null;

  return (
    <GovernancePageClient
      initialPolicies={policies || []}
      initialStats={stats}
      initialDashboard={dashboard}
    />
  );
}

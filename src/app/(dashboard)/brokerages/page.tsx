export const dynamic = "force-dynamic";

import { getBrokerages, getBrokerageStats } from "@/lib/actions/brokerages";
import { BrokeragesPageClient } from "./brokerages-page-client";

export default async function BrokeragesPage() {
  const [brokeragesResult, statsResult] = await Promise.all([
    getBrokerages({ includeInactive: true }),
    getBrokerageStats(),
  ]);

  const brokerages = brokeragesResult.success ? brokeragesResult.data : [];
  const stats = statsResult.success
    ? statsResult.data
    : { totalBrokerages: 0, activeBrokerages: 0, totalAgents: 0, totalRevenue: 0 };

  return (
    <div className="space-y-6">
      <BrokeragesPageClient brokerages={brokerages} stats={stats} />
    </div>
  );
}

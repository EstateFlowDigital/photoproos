import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lead Analytics | PhotoProOS",
  description: "Analyze lead sources and conversion rates.",
};

export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { getLeadsAnalytics } from "@/lib/actions/leads-analytics";
import { LeadsAnalyticsClient } from "./leads-analytics-client";

export default async function LeadsAnalyticsPage() {
  const result = await getLeadsAnalytics();

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6" data-element="leads-analytics-page">
        <Breadcrumb
          items={[
            { label: "Leads", href: "/leads" },
            { label: "Analytics" },
          ]}
        />
        <PageHeader
          title="Leads Analytics"
          subtitle="Track lead performance and conversion metrics"
        />
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-foreground-muted">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-element="leads-analytics-page">
      <Breadcrumb
        items={[
          { label: "Leads", href: "/leads" },
          { label: "Analytics" },
        ]}
      />
      <PageHeader
        title="Leads Analytics"
        subtitle="Track lead performance and conversion metrics"
      />
      <LeadsAnalyticsClient analytics={result.data} />
    </div>
  );
}

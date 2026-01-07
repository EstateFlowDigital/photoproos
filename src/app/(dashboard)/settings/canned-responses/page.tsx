export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { getCannedResponses } from "@/lib/actions/canned-responses";
import { CannedResponsesClient } from "./canned-responses-client";

export default async function CannedResponsesPage() {
  const result = await getCannedResponses({ includeInactive: true });
  const responses = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/settings" },
          { label: "Canned Responses" },
        ]}
      />

      <PageHeader
        title="Canned Responses"
        subtitle="Create quick reply templates to speed up your messaging workflow"
      />

      <CannedResponsesClient responses={responses || []} />
    </div>
  );
}

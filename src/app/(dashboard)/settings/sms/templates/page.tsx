export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSMSTemplates } from "@/lib/actions/sms";
import { SMSTemplatesClient } from "./sms-templates-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function SMSTemplatesPage() {
  const result = await getSMSTemplates();
  const templates = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/settings" },
          { label: "SMS", href: "/settings/sms" },
          { label: "Templates" },
        ]}
      />

      <PageHeader
        title="SMS Templates"
        subtitle="Customize message templates for automated notifications"
        actions={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings/sms">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to SMS Settings
            </Link>
          </Button>
        }
      />

      <SMSTemplatesClient templates={templates || []} />
    </div>
  );
}

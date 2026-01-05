export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSMSTemplates } from "@/lib/actions/sms";
import { SMSTemplatesClient } from "./sms-templates-client";

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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import { MailchimpSettingsClient } from "./mailchimp-settings-client";

export default async function MailchimpSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mailchimp Integration"
        subtitle="Sync your clients with Mailchimp for email marketing campaigns"
        actions={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings/integrations">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Integrations
            </Link>
          </Button>
        }
      />

      <MailchimpSettingsClient />
    </div>
  );
}

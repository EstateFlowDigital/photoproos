export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { getApiKeys } from "@/lib/actions/api-keys";
import { ZapierSettingsClient } from "./zapier-settings-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function ZapierSettingsPage() {
  const apiKeysResult = await getApiKeys();
  const apiKeys = apiKeysResult.success && apiKeysResult.apiKeys ? apiKeysResult.apiKeys : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zapier Integration"
        subtitle="Connect PhotoProOS with 5000+ apps via Zapier"
        actions={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings/integrations">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Integrations
            </Link>
          </Button>
        }
      />

      <ZapierSettingsClient apiKeys={apiKeys} />
    </div>
  );
}

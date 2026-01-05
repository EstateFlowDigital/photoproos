export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDropboxConfig } from "@/lib/actions/dropbox";
import { DropboxSettingsClient } from "./dropbox-settings-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function DropboxSettingsPage() {
  const configResult = await getDropboxConfig();
  const config = configResult.success ? configResult.data : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dropbox Integration"
        subtitle="Sync photos and deliverables with Dropbox"
        actions={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings/integrations">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Integrations
            </Link>
          </Button>
        }
      />

      <DropboxSettingsClient initialConfig={config} />
    </div>
  );
}

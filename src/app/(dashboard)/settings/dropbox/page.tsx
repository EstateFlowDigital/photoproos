export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDropboxConfig } from "@/lib/actions/dropbox";
import { DropboxSettingsClient } from "./dropbox-settings-client";

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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

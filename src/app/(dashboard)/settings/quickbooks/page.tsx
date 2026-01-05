export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { QuickBooksSettingsClient } from "./quickbooks-settings-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function QuickBooksSettingsPage() {
  // QuickBooks is a "coming soon" integration, so we don't have real config yet
  // In the future, this would fetch from getQuickBooksConfig()
  const config = null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="QuickBooks Integration"
        subtitle="Sync invoices and payments to QuickBooks Online"
        actions={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings/integrations">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Integrations
            </Link>
          </Button>
        }
      />

      <QuickBooksSettingsClient initialConfig={config} />
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { QuickBooksSettingsClient } from "./quickbooks-settings-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import { getQuickBooksConfig, getQuickBooksSyncHistory } from "@/lib/actions/quickbooks";

export default async function QuickBooksSettingsPage() {
  const [configResult, historyResult] = await Promise.all([
    getQuickBooksConfig(),
    getQuickBooksSyncHistory(20),
  ]);

  const config = configResult.success ? configResult.data : null;
  const syncHistory = historyResult.success ? historyResult.data : [];

  return (
    <div data-element="settings-quickbooks-page" className="space-y-6">
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

      <Suspense fallback={<div>Loading...</div>}>
        <QuickBooksSettingsClient
          initialConfig={config}
          initialSyncHistory={syncHistory}
        />
      </Suspense>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getConnectAccountDetails } from "@/lib/actions/stripe-connect";
import { getTaxSettings, getCurrencySettings } from "@/lib/actions/settings";
import { PaymentsSettingsClient } from "./payments-settings-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function PaymentsSettingsPage() {
  const [accountDetails, taxSettings, currencySettings] = await Promise.all([
    getConnectAccountDetails(),
    getTaxSettings(),
    getCurrencySettings(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Settings"
        subtitle="Connect your Stripe account to accept payments from clients"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <PaymentsSettingsClient
        initialStatus={accountDetails.success ? accountDetails.data : null}
        initialTaxSettings={
          taxSettings.success && taxSettings.data
            ? {
                defaultTaxRate: taxSettings.data.defaultTaxRate,
                taxLabel: taxSettings.data.taxLabel,
              }
            : null
        }
        initialCurrency={
          currencySettings.success && currencySettings.data
            ? currencySettings.data.currency
            : "USD"
        }
      />
    </div>
  );
}

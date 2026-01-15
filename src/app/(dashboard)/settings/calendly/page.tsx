import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendly Integration | PhotoProOS",
  description: "Connect and sync with Calendly.",
};

export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { CalendlySettingsClient } from "./calendly-settings-client";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function CalendlySettingsPage() {
  // For now, Calendly is a coming soon integration
  // When implemented, we would fetch the config here similar to other integrations
  const config = null;

  return (
    <div data-element="settings-calendly-page" className="space-y-6">
      <PageHeader
        title="Calendly Integration"
        subtitle="Import bookings from your Calendly scheduling pages"
        actions={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings/integrations">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Integrations
            </Link>
          </Button>
        }
      />

      <CalendlySettingsClient initialConfig={config} />
    </div>
  );
}

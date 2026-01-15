import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Settings | PhotoProOS",
  description: "Configure travel fees and service area boundaries.",
};

export const dynamic = "force-dynamic";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { getOrganizationSettings } from "@/lib/actions/settings";
import { TravelSettingsForm } from "./travel-settings-form";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

export default async function TravelSettingsPage() {
  const org = await getOrganizationSettings();

  const settings = {
    homeBaseAddress: org?.homeBaseLocation?.formattedAddress || null,
    homeBaseLat: org?.homeBaseLocation?.latitude || null,
    homeBaseLng: org?.homeBaseLocation?.longitude || null,
    homeBaseLocationId: org?.homeBaseLocationId || null,
    travelFeePerMile: org?.travelFeePerMile || 65, // Default 65 cents/mile
    freeThresholdMiles: org?.travelFeeThreshold || 15, // Default 15 miles free
  };

  return (
    <div data-element="settings-travel-page" className="space-y-6">
      <PageHeader
        title="Travel & Mileage"
        subtitle="Configure travel fees, mileage rates, and home base location"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <TravelSettingsForm settings={settings} />
    </div>
  );
}

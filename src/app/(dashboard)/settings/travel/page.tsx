export const dynamic = "force-dynamic";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { getOrganizationSettings } from "@/lib/actions/settings";
import { TravelSettingsForm } from "./travel-settings-form";

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
    <div className="space-y-6">
      <PageHeader
        title="Travel & Mileage"
        subtitle="Configure travel fees, mileage rates, and home base location"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      <TravelSettingsForm settings={settings} />
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

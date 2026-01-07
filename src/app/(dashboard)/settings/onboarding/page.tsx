export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getOnboardingChecklistItems } from "@/lib/actions/onboarding-checklist";
import { OnboardingSettingsClient } from "./onboarding-settings-client";

export default async function OnboardingSettingsPage() {
  const result = await getOnboardingChecklistItems();

  const items = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Checklist"
        subtitle="Customize the getting started checklist that appears on your dashboard"
      />

      <OnboardingSettingsClient initialItems={items} />
    </div>
  );
}

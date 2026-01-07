export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import {
  getOnboardingChecklistItems,
  getChecklistItemsWithStatus,
  getOnboardingProgress,
} from "@/lib/actions/onboarding-checklist";
import { OnboardingSettingsClient } from "./onboarding-settings-client";

export default async function OnboardingSettingsPage() {
  // Fetch both raw items and items with completion status, plus progress data
  const [itemsResult, statusResult, progressResult] = await Promise.all([
    getOnboardingChecklistItems(),
    getChecklistItemsWithStatus(),
    getOnboardingProgress(),
  ]);

  const items = itemsResult.success && itemsResult.data ? itemsResult.data : [];
  const itemsWithStatus =
    statusResult.success && statusResult.data ? statusResult.data : [];
  const progress = progressResult.success && progressResult.data ? progressResult.data : null;

  // Calculate completion stats
  const enabledItems = itemsWithStatus.filter((item) => item.isEnabled);
  const completedItems = enabledItems.filter((item) => item.isCompleted);
  const completionRate =
    enabledItems.length > 0
      ? Math.round((completedItems.length / enabledItems.length) * 100)
      : 0;

  // Find first incomplete item for "Resume Setup"
  const firstIncomplete = enabledItems.find((item) => !item.isCompleted);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Checklist"
        subtitle="Customize the getting started checklist that appears on your dashboard"
      />

      <OnboardingSettingsClient
        initialItems={items}
        completionStats={{
          total: enabledItems.length,
          completed: completedItems.length,
          completionRate,
          firstIncompleteHref: firstIncomplete?.href || null,
          firstIncompleteLabel: firstIncomplete?.label || null,
        }}
        progressData={progress}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getAllWalkthroughPreferences } from "@/lib/actions/walkthrough";
import { WalkthroughSettingsClient } from "./walkthrough-settings-client";
import { WALKTHROUGH_PAGES, type WalkthroughPageId } from "@/lib/walkthrough-types";

export default async function WalkthroughSettingsPage() {
  const result = await getAllWalkthroughPreferences();

  // Convert preferences array to a map for easier lookup
  const preferencesMap = new Map<WalkthroughPageId, {
    state: "open" | "minimized" | "hidden" | "dismissed";
    dismissedAt: Date | null;
    hiddenAt: Date | null;
  }>();

  if (result.success && result.data) {
    result.data.forEach((pref) => {
      preferencesMap.set(pref.pageId as WalkthroughPageId, {
        state: pref.state,
        dismissedAt: pref.dismissedAt,
        hiddenAt: pref.hiddenAt,
      });
    });
  }

  // Build full walkthrough list with preferences
  const walkthroughsWithPrefs = WALKTHROUGH_PAGES.map((walkthrough) => {
    const pref = preferencesMap.get(walkthrough.pageId);
    return {
      ...walkthrough,
      state: pref?.state ?? "open" as const,
      dismissedAt: pref?.dismissedAt ?? null,
      hiddenAt: pref?.hiddenAt ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Walkthroughs & Guides"
        subtitle="Control which tutorials and guides appear throughout the app"
      />

      <WalkthroughSettingsClient walkthroughs={walkthroughsWithPrefs} />
    </div>
  );
}

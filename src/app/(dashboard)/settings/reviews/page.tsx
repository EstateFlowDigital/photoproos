import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Settings | PhotoProOS",
  description: "Configure client review collection and display.",
};

export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import {
  getReviewPlatforms,
  getReviewGateSettings,
  getReviewStats,
} from "@/lib/actions/review-gate";
import { ReviewsSettingsClient } from "./reviews-settings-client";

export default async function ReviewsSettingsPage() {
  const [platformsResult, settingsResult, statsResult] = await Promise.all([
    getReviewPlatforms({ includeInactive: true }),
    getReviewGateSettings(),
    getReviewStats(),
  ]);

  const platforms = platformsResult.success ? platformsResult.data : [];
  const settings = settingsResult.success
    ? settingsResult.data
    : {
        reviewGateEnabled: false,
        reviewGateDeliveryEmailEnabled: true,
        reviewGateFollowupEnabled: false,
        reviewGateFollowupDays: 7,
        reviewGateChatEnabled: true,
        reviewGateGalleryPromptEnabled: false,
      };
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div data-element="settings-reviews-page" className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/settings" },
          { label: "Reviews" },
        ]}
      />

      <PageHeader
        title="Review Collection"
        subtitle="Collect internal feedback and route happy clients to public review platforms"
      />

      <ReviewsSettingsClient
        platforms={platforms}
        settings={settings}
        stats={stats}
      />
    </div>
  );
}

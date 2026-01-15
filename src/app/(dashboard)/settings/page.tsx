import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | PhotoProOS",
  description: "Configure your PhotoProOS account settings and preferences.",
};

export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { SETTINGS_PAGE_CATEGORIES } from "@/lib/constants/settings-navigation";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";
import { RecentSettingsSection } from "@/components/settings/recent-settings";
import { PinnedSettingsSection } from "@/components/settings/pinned-settings";
import { SettingCardWithPin } from "@/components/settings/settings-card-with-pin";
import { CollapsibleSettingsSection } from "@/components/settings/collapsible-settings-section";
import {
  UserIcon,
  PaletteIcon,
  CreditCardIcon,
  StripeIcon,
  UsersIcon,
  SparklesIcon,
} from "@/components/ui/settings-icons";
import { SettingsPageClient } from "./settings-page-client";

// ============================================================================
// Page
// ============================================================================

export default async function SettingsPage() {
  // Fetch organization info for the client components
  const auth = await getAuthContext();
  let organizationName = "your organization";
  let organizationId: string | undefined;

  if (auth) {
    organizationId = auth.organizationId;
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: { name: true },
    });
    if (organization?.name) {
      organizationName = organization.name;
    }
  }

  // Fetch walkthrough preference
  const walkthroughPreferenceResult = await getWalkthroughPreference("settings");
  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div data-element="settings-page" className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Walkthrough */}
      <WalkthroughWrapper
        pageId="settings"
        initialState={walkthroughState}
      />

      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {/* Quick Navigation */}
      <PageContextNav
        items={[
          { label: "Appearance", href: "/settings/appearance", icon: <SparklesIcon className="h-4 w-4" /> },
          { label: "Profile", href: "/settings/profile", icon: <UserIcon className="h-4 w-4" /> },
          { label: "Billing", href: "/settings/billing", icon: <CreditCardIcon className="h-4 w-4" /> },
          { label: "Team", href: "/settings/team", icon: <UsersIcon className="h-4 w-4" /> },
          { label: "Branding", href: "/settings/branding", icon: <PaletteIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          { label: "Stripe", href: "/settings/payments", icon: <StripeIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Pinned Settings */}
      <PinnedSettingsSection />

      {/* Recently Visited */}
      <RecentSettingsSection />

      {/* Settings Categories */}
      <div className="space-y-10">
        {SETTINGS_PAGE_CATEGORIES.map((category) => (
          <CollapsibleSettingsSection
            key={category.id}
            id={category.id}
            title={category.label}
            description={category.description}
            itemCount={category.items.length}
            defaultOpen={category.id === "personal" || category.id === "business"}
          >
            {category.items.map((item) => (
              <SettingCardWithPin
                key={item.id}
                title={item.label}
                description={item.description}
                href={item.href}
                iconName={item.iconName}
              />
            ))}
          </CollapsibleSettingsSection>
        ))}
      </div>

      {/* Onboarding & Danger Zone */}
      <SettingsPageClient
        organizationName={organizationName}
        organizationId={organizationId}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getAppearancePreferences } from "@/lib/actions/appearance";
import { THEME_PRESETS, FONT_OPTIONS, DENSITY_OPTIONS } from "@/lib/appearance-types";
import { AppearanceSettingsForm } from "./appearance-settings-form";

export default async function AppearanceSettingsPage() {
  const result = await getAppearancePreferences();

  const preferences = result.success && result.data
    ? result.data
    : {
        dashboardTheme: "default",
        dashboardAccent: "#3b82f6",
        sidebarCompact: false,
        fontFamily: "system",
        density: "comfortable",
      };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appearance"
        subtitle="Personalize your dashboard look and feel"
      />

      <AppearanceSettingsForm
        initialPreferences={preferences}
        themePresets={THEME_PRESETS}
        fontOptions={FONT_OPTIONS}
        densityOptions={DENSITY_OPTIONS}
      />
    </div>
  );
}

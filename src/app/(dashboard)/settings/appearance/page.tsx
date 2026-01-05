export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getAppearancePreferences } from "@/lib/actions/appearance";
import { THEME_PRESETS, FONT_OPTIONS, DENSITY_OPTIONS, FONT_SIZE_OPTIONS, SIDEBAR_POSITION_OPTIONS, DEFAULT_APPEARANCE, type AppearancePreferences } from "@/lib/appearance-types";
import { AppearanceSettingsForm } from "./appearance-settings-form";

export default async function AppearanceSettingsPage() {
  const result = await getAppearancePreferences();

  const preferences: AppearancePreferences = result.success && result.data
    ? { ...DEFAULT_APPEARANCE, ...result.data }
    : DEFAULT_APPEARANCE;

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
        fontSizeOptions={FONT_SIZE_OPTIONS}
        sidebarPositionOptions={SIDEBAR_POSITION_OPTIONS}
      />
    </div>
  );
}

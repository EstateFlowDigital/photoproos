"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { THEME_PRESETS, FONT_OPTIONS, DENSITY_OPTIONS, DEFAULT_APPEARANCE, type AppearancePreferences } from "@/lib/appearance-types";

/**
 * Get user's appearance preferences
 */
export async function getAppearancePreferences(): Promise<{
  success: boolean;
  data?: AppearancePreferences;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        dashboardTheme: true,
        dashboardAccent: true,
        sidebarCompact: true,
        fontFamily: true,
        density: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        dashboardTheme: user.dashboardTheme,
        dashboardAccent: user.dashboardAccent,
        sidebarCompact: user.sidebarCompact,
        fontFamily: user.fontFamily,
        density: user.density,
      },
    };
  } catch (error) {
    console.error("Error fetching appearance preferences:", error);
    return { success: false, error: "Failed to fetch preferences" };
  }
}

/**
 * Update user's appearance preferences
 */
export async function updateAppearancePreferences(
  preferences: Partial<AppearancePreferences>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate accent color format
    if (preferences.dashboardAccent) {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(preferences.dashboardAccent)) {
        return { success: false, error: "Invalid color format" };
      }
    }

    // Validate theme preset
    if (preferences.dashboardTheme) {
      const validThemes = THEME_PRESETS.map((p) => p.id);
      if (!validThemes.includes(preferences.dashboardTheme)) {
        return { success: false, error: "Invalid theme preset" };
      }
    }

    // Validate font family
    if (preferences.fontFamily) {
      const validFonts = FONT_OPTIONS.map((f) => f.id as string);
      if (!validFonts.includes(preferences.fontFamily)) {
        return { success: false, error: "Invalid font family" };
      }
    }

    // Validate density
    if (preferences.density) {
      const validDensities = DENSITY_OPTIONS.map((d) => d.id as string);
      if (!validDensities.includes(preferences.density)) {
        return { success: false, error: "Invalid density option" };
      }
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        ...(preferences.dashboardTheme !== undefined && {
          dashboardTheme: preferences.dashboardTheme,
        }),
        ...(preferences.dashboardAccent !== undefined && {
          dashboardAccent: preferences.dashboardAccent,
        }),
        ...(preferences.sidebarCompact !== undefined && {
          sidebarCompact: preferences.sidebarCompact,
        }),
        ...(preferences.fontFamily !== undefined && {
          fontFamily: preferences.fontFamily,
        }),
        ...(preferences.density !== undefined && {
          density: preferences.density,
        }),
      },
    });

    revalidatePath("/settings/appearance");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating appearance preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

/**
 * Apply theme preset (updates both theme and accent color)
 */
export async function applyThemePreset(
  presetId: string
): Promise<{ success: boolean; error?: string }> {
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return { success: false, error: "Invalid theme preset" };
  }

  return updateAppearancePreferences({
    dashboardTheme: presetId,
    dashboardAccent: preset.accent,
  });
}

/**
 * Reset all appearance preferences to defaults
 */
export async function resetAppearancePreferences(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        dashboardTheme: DEFAULT_APPEARANCE.dashboardTheme,
        dashboardAccent: DEFAULT_APPEARANCE.dashboardAccent,
        sidebarCompact: DEFAULT_APPEARANCE.sidebarCompact,
        fontFamily: DEFAULT_APPEARANCE.fontFamily,
        density: DEFAULT_APPEARANCE.density,
      },
    });

    revalidatePath("/settings/appearance");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error resetting appearance preferences:", error);
    return { success: false, error: "Failed to reset preferences" };
  }
}

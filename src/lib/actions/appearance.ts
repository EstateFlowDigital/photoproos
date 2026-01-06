"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { THEME_PRESETS, FONT_OPTIONS, DENSITY_OPTIONS, FONT_SIZE_OPTIONS, SIDEBAR_POSITION_OPTIONS, DEFAULT_APPEARANCE, type AppearancePreferences } from "@/lib/appearance-types";
import { type ActionResult, success, ok, fail } from "@/lib/types/action-result";

/**
 * Get user's appearance preferences
 */
export async function getAppearancePreferences(): Promise<ActionResult<AppearancePreferences>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        dashboardTheme: true,
        dashboardAccent: true,
        sidebarCompact: true,
        sidebarPosition: true,
        fontFamily: true,
        density: true,
        fontSize: true,
        highContrast: true,
        reduceMotion: true,
        autoThemeEnabled: true,
        autoThemeDarkStart: true,
        autoThemeDarkEnd: true,
      },
    });

    if (!user) {
      return fail("User not found");
    }

    return success({
      dashboardTheme: user.dashboardTheme,
      dashboardAccent: user.dashboardAccent,
      sidebarCompact: user.sidebarCompact,
      sidebarPosition: user.sidebarPosition,
      fontFamily: user.fontFamily,
      density: user.density,
      fontSize: user.fontSize,
      highContrast: user.highContrast,
      reduceMotion: user.reduceMotion,
      autoThemeEnabled: user.autoThemeEnabled,
      autoThemeDarkStart: user.autoThemeDarkStart,
      autoThemeDarkEnd: user.autoThemeDarkEnd,
    });
  } catch (error) {
    console.error("Error fetching appearance preferences:", error);
    return fail("Failed to fetch preferences");
  }
}

/**
 * Update user's appearance preferences
 */
export async function updateAppearancePreferences(
  preferences: Partial<AppearancePreferences>
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Validate accent color format
    if (preferences.dashboardAccent) {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(preferences.dashboardAccent)) {
        return fail("Invalid color format");
      }
    }

    // Validate theme preset
    if (preferences.dashboardTheme) {
      const validThemes = THEME_PRESETS.map((p) => p.id);
      if (!validThemes.includes(preferences.dashboardTheme)) {
        return fail("Invalid theme preset");
      }
    }

    // Validate font family
    if (preferences.fontFamily) {
      const validFonts = FONT_OPTIONS.map((f) => f.id as string);
      if (!validFonts.includes(preferences.fontFamily)) {
        return fail("Invalid font family");
      }
    }

    // Validate density
    if (preferences.density) {
      const validDensities = DENSITY_OPTIONS.map((d) => d.id as string);
      if (!validDensities.includes(preferences.density)) {
        return fail("Invalid density option");
      }
    }

    // Validate font size
    if (preferences.fontSize) {
      const validFontSizes = FONT_SIZE_OPTIONS.map((f) => f.id as string);
      if (!validFontSizes.includes(preferences.fontSize)) {
        return fail("Invalid font size option");
      }
    }

    // Validate sidebar position
    if (preferences.sidebarPosition) {
      const validPositions = SIDEBAR_POSITION_OPTIONS.map((p) => p.id as string);
      if (!validPositions.includes(preferences.sidebarPosition)) {
        return fail("Invalid sidebar position");
      }
    }

    // Validate time format for auto theme
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (preferences.autoThemeDarkStart && !timeRegex.test(preferences.autoThemeDarkStart)) {
      return fail("Invalid time format for dark mode start");
    }
    if (preferences.autoThemeDarkEnd && !timeRegex.test(preferences.autoThemeDarkEnd)) {
      return fail("Invalid time format for dark mode end");
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
        ...(preferences.sidebarPosition !== undefined && {
          sidebarPosition: preferences.sidebarPosition,
        }),
        ...(preferences.fontFamily !== undefined && {
          fontFamily: preferences.fontFamily,
        }),
        ...(preferences.density !== undefined && {
          density: preferences.density,
        }),
        ...(preferences.fontSize !== undefined && {
          fontSize: preferences.fontSize,
        }),
        ...(preferences.highContrast !== undefined && {
          highContrast: preferences.highContrast,
        }),
        ...(preferences.reduceMotion !== undefined && {
          reduceMotion: preferences.reduceMotion,
        }),
        ...(preferences.autoThemeEnabled !== undefined && {
          autoThemeEnabled: preferences.autoThemeEnabled,
        }),
        ...(preferences.autoThemeDarkStart !== undefined && {
          autoThemeDarkStart: preferences.autoThemeDarkStart,
        }),
        ...(preferences.autoThemeDarkEnd !== undefined && {
          autoThemeDarkEnd: preferences.autoThemeDarkEnd,
        }),
      },
    });

    revalidatePath("/settings/appearance");
    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error updating appearance preferences:", error);
    return fail("Failed to update preferences");
  }
}

/**
 * Apply theme preset (updates both theme and accent color)
 */
export async function applyThemePreset(
  presetId: string
): Promise<ActionResult<void>> {
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return fail("Invalid theme preset");
  }

  return updateAppearancePreferences({
    dashboardTheme: presetId,
    dashboardAccent: preset.accent,
  });
}

/**
 * Reset all appearance preferences to defaults
 */
export async function resetAppearancePreferences(): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        dashboardTheme: DEFAULT_APPEARANCE.dashboardTheme,
        dashboardAccent: DEFAULT_APPEARANCE.dashboardAccent,
        sidebarCompact: DEFAULT_APPEARANCE.sidebarCompact,
        sidebarPosition: DEFAULT_APPEARANCE.sidebarPosition,
        fontFamily: DEFAULT_APPEARANCE.fontFamily,
        density: DEFAULT_APPEARANCE.density,
        fontSize: DEFAULT_APPEARANCE.fontSize,
        highContrast: DEFAULT_APPEARANCE.highContrast,
        reduceMotion: DEFAULT_APPEARANCE.reduceMotion,
        autoThemeEnabled: DEFAULT_APPEARANCE.autoThemeEnabled,
        autoThemeDarkStart: DEFAULT_APPEARANCE.autoThemeDarkStart,
        autoThemeDarkEnd: DEFAULT_APPEARANCE.autoThemeDarkEnd,
      },
    });

    revalidatePath("/settings/appearance");
    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error resetting appearance preferences:", error);
    return fail("Failed to reset preferences");
  }
}

"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { THEME_PRESETS, type AppearancePreferences } from "@/lib/appearance-types";

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

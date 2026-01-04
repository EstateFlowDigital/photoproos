"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AppearancePreferences {
  dashboardTheme: string;
  dashboardAccent: string;
  sidebarCompact: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  accent: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Classic Blue",
    description: "Professional and trustworthy",
    accent: "#3b82f6",
    preview: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      background: "#0a0a0a",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Sleek and modern dark theme",
    accent: "#6366f1",
    preview: {
      primary: "#6366f1",
      secondary: "#818cf8",
      background: "#0a0a0a",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural and calming greens",
    accent: "#22c55e",
    preview: {
      primary: "#22c55e",
      secondary: "#4ade80",
      background: "#0a0a0a",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm and energetic oranges",
    accent: "#f97316",
    preview: {
      primary: "#f97316",
      secondary: "#fb923c",
      background: "#0a0a0a",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool and refreshing teals",
    accent: "#14b8a6",
    preview: {
      primary: "#14b8a6",
      secondary: "#2dd4bf",
      background: "#0a0a0a",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Creative and elegant purples",
    accent: "#a855f7",
    preview: {
      primary: "#a855f7",
      secondary: "#c084fc",
      background: "#0a0a0a",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Soft and sophisticated pinks",
    accent: "#ec4899",
    preview: {
      primary: "#ec4899",
      secondary: "#f472b6",
      background: "#0a0a0a",
    },
  },
  {
    id: "ember",
    name: "Ember",
    description: "Bold and passionate reds",
    accent: "#ef4444",
    preview: {
      primary: "#ef4444",
      secondary: "#f87171",
      background: "#0a0a0a",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Minimal and neutral grays",
    accent: "#64748b",
    preview: {
      primary: "#64748b",
      secondary: "#94a3b8",
      background: "#0a0a0a",
    },
  },
  {
    id: "custom",
    name: "Custom",
    description: "Choose your own accent color",
    accent: "#3b82f6",
    preview: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      background: "#0a0a0a",
    },
  },
];

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

"use server";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { VideoProvider, TourProvider } from "@prisma/client";

// ============================================================================
// Types
// ============================================================================

interface VideoSettingsData {
  defaultProvider: VideoProvider;
  vimeoEnabled: boolean;
  vimeoAccessToken: string | null;
  vimeoUserId: string | null;
  vimeoFolderId: string | null;
  vimeoPrivacy: string | null;
  youtubeEnabled: boolean;
  youtubeRefreshToken: string | null;
  youtubeChannelId: string | null;
  youtubePlaylistId: string | null;
  youtubePrivacy: string | null;
  bunnyEnabled: boolean;
  bunnyApiKey: string | null;
  bunnyLibraryId: string | null;
  bunnyCdnUrl: string | null;
  muxEnabled: boolean;
  muxAccessTokenId: string | null;
  muxSecretKey: string | null;
  muxEnvironmentId: string | null;
  cloudflareEnabled: boolean;
  cloudflareAccountId: string | null;
  cloudflareApiToken: string | null;
  wistiaEnabled: boolean;
  wistiaApiToken: string | null;
  wistiaProjectId: string | null;
  hideControls: boolean;
  hideTitle: boolean;
  hideBranding: boolean;
  hideRelatedVideos: boolean;
  enableAutoplay: boolean;
  enableLoop: boolean;
  startMuted: boolean;
  enableResponsiveEmbed: boolean;
  autoUploadEnabled: boolean;
  autoUploadQuality: string | null;
}

interface TourSettingsData {
  defaultProvider: TourProvider;
  matterportEnabled: boolean;
  matterportSdkKey: string | null;
  matterportApiKey: string | null;
  iguideEnabled: boolean;
  iguideApiKey: string | null;
  cupixEnabled: boolean;
  cupixApiKey: string | null;
  zillow3dEnabled: boolean;
  showMinimap: boolean;
  showFloorPlan: boolean;
  showMeasurement: boolean;
  autoRotate: boolean;
  hideNavigation: boolean;
  startInDollhouse: boolean;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const videoProviderSchema = z.enum([
  "vimeo",
  "youtube",
  "bunny",
  "mux",
  "cloudflare",
  "wistia",
  "sprout",
  "direct",
]);

const tourProviderSchema = z.enum([
  "matterport",
  "iguide",
  "cupix",
  "zillow_3d",
  "ricoh",
  "kuula",
  "other",
]);

const updateVideoSettingsSchema = z.object({
  defaultProvider: videoProviderSchema,
  vimeoEnabled: z.boolean(),
  vimeoAccessToken: z.string().nullable().optional(),
  youtubeEnabled: z.boolean(),
  youtubeRefreshToken: z.string().nullable().optional(),
  bunnyEnabled: z.boolean(),
  bunnyApiKey: z.string().nullable().optional(),
  bunnyLibraryId: z.string().nullable().optional(),
  muxEnabled: z.boolean(),
  muxAccessTokenId: z.string().nullable().optional(),
  muxSecretKey: z.string().nullable().optional(),
  cloudflareEnabled: z.boolean(),
  cloudflareAccountId: z.string().nullable().optional(),
  cloudflareApiToken: z.string().nullable().optional(),
  wistiaEnabled: z.boolean(),
  wistiaApiToken: z.string().nullable().optional(),
  hideControls: z.boolean(),
  hideTitle: z.boolean(),
  hideBranding: z.boolean(),
  hideRelatedVideos: z.boolean(),
  enableAutoplay: z.boolean(),
  enableLoop: z.boolean(),
  startMuted: z.boolean(),
  enableResponsiveEmbed: z.boolean(),
  autoUploadEnabled: z.boolean(),
});

const updateTourSettingsSchema = z.object({
  defaultProvider: tourProviderSchema,
  matterportEnabled: z.boolean(),
  matterportSdkKey: z.string().nullable().optional(),
  matterportApiKey: z.string().nullable().optional(),
  iguideEnabled: z.boolean(),
  iguideApiKey: z.string().nullable().optional(),
  cupixEnabled: z.boolean(),
  cupixApiKey: z.string().nullable().optional(),
  zillow3dEnabled: z.boolean(),
  showMinimap: z.boolean(),
  showFloorPlan: z.boolean(),
  showMeasurement: z.boolean(),
  autoRotate: z.boolean(),
  hideNavigation: z.boolean(),
  startInDollhouse: z.boolean(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get video settings for the organization
 */
export async function getVideoSettings(): Promise<{
  success: boolean;
  data?: VideoSettingsData;
  error?: string;
}> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    let settings = await prisma.organizationVideoSettings.findUnique({
      where: { organizationId: auth.organizationId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.organizationVideoSettings.create({
        data: {
          organizationId: auth.organizationId,
        },
      });
    }

    return {
      success: true,
      data: {
        defaultProvider: settings.defaultProvider,
        vimeoEnabled: settings.vimeoEnabled,
        vimeoAccessToken: settings.vimeoAccessToken,
        vimeoUserId: settings.vimeoUserId,
        vimeoFolderId: settings.vimeoFolderId,
        vimeoPrivacy: settings.vimeoPrivacy,
        youtubeEnabled: settings.youtubeEnabled,
        youtubeRefreshToken: settings.youtubeRefreshToken,
        youtubeChannelId: settings.youtubeChannelId,
        youtubePlaylistId: settings.youtubePlaylistId,
        youtubePrivacy: settings.youtubePrivacy,
        bunnyEnabled: settings.bunnyEnabled,
        bunnyApiKey: settings.bunnyApiKey,
        bunnyLibraryId: settings.bunnyLibraryId,
        bunnyCdnUrl: settings.bunnyCdnUrl,
        muxEnabled: settings.muxEnabled,
        muxAccessTokenId: settings.muxAccessTokenId,
        muxSecretKey: settings.muxSecretKey,
        muxEnvironmentId: settings.muxEnvironmentId,
        cloudflareEnabled: settings.cloudflareEnabled,
        cloudflareAccountId: settings.cloudflareAccountId,
        cloudflareApiToken: settings.cloudflareApiToken,
        wistiaEnabled: settings.wistiaEnabled,
        wistiaApiToken: settings.wistiaApiToken,
        wistiaProjectId: settings.wistiaProjectId,
        hideControls: settings.hideControls,
        hideTitle: settings.hideTitle,
        hideBranding: settings.hideBranding,
        hideRelatedVideos: settings.hideRelatedVideos,
        enableAutoplay: settings.enableAutoplay,
        enableLoop: settings.enableLoop,
        startMuted: settings.startMuted,
        enableResponsiveEmbed: settings.enableResponsiveEmbed,
        autoUploadEnabled: settings.autoUploadEnabled,
        autoUploadQuality: settings.autoUploadQuality,
      },
    };
  } catch (error) {
    console.error("Failed to get video settings:", error);
    return { success: false, error: "Failed to get video settings" };
  }
}

/**
 * Update video settings for the organization
 */
export async function updateVideoSettings(
  data: z.infer<typeof updateVideoSettingsSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateVideoSettingsSchema.parse(data);

    await prisma.organizationVideoSettings.upsert({
      where: { organizationId: auth.organizationId },
      update: validated,
      create: {
        organizationId: auth.organizationId,
        ...validated,
      },
    });

    revalidatePath("/settings/media");
    return { success: true };
  } catch (error) {
    console.error("Failed to update video settings:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to update video settings" };
  }
}

/**
 * Get tour settings for the organization
 */
export async function getTourSettings(): Promise<{
  success: boolean;
  data?: TourSettingsData;
  error?: string;
}> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    let settings = await prisma.organizationTourSettings.findUnique({
      where: { organizationId: auth.organizationId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.organizationTourSettings.create({
        data: {
          organizationId: auth.organizationId,
        },
      });
    }

    return {
      success: true,
      data: {
        defaultProvider: settings.defaultProvider,
        matterportEnabled: settings.matterportEnabled,
        matterportSdkKey: settings.matterportSdkKey,
        matterportApiKey: settings.matterportApiKey,
        iguideEnabled: settings.iguideEnabled,
        iguideApiKey: settings.iguideApiKey,
        cupixEnabled: settings.cupixEnabled,
        cupixApiKey: settings.cupixApiKey,
        zillow3dEnabled: settings.zillow3dEnabled,
        showMinimap: settings.showMinimap,
        showFloorPlan: settings.showFloorPlan,
        showMeasurement: settings.showMeasurement,
        autoRotate: settings.autoRotate,
        hideNavigation: settings.hideNavigation,
        startInDollhouse: settings.startInDollhouse,
      },
    };
  } catch (error) {
    console.error("Failed to get tour settings:", error);
    return { success: false, error: "Failed to get tour settings" };
  }
}

/**
 * Update tour settings for the organization
 */
export async function updateTourSettings(
  data: z.infer<typeof updateTourSettingsSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateTourSettingsSchema.parse(data);

    await prisma.organizationTourSettings.upsert({
      where: { organizationId: auth.organizationId },
      update: validated,
      create: {
        organizationId: auth.organizationId,
        ...validated,
      },
    });

    revalidatePath("/settings/media");
    return { success: true };
  } catch (error) {
    console.error("Failed to update tour settings:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to update tour settings" };
  }
}

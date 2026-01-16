"use server";

import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

interface ExportedSettings {
  version: string;
  exportedAt: string;
  organizationName: string;
  settings: {
    branding: BrandingSettings | null;
    notifications: NotificationSettings | null;
    workflow: WorkflowSettings | null;
    travel: TravelSettings | null;
    sms: SmsSettings | null;
    reviews: ReviewSettings | null;
    gamification: GamificationSettings | null;
  };
}

interface BrandingSettings {
  logoUrl: string | null;
  logoLightUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  portalMode: string;
  invoiceLogoUrl: string | null;
  hidePlatformBranding: boolean;
  autoArchiveExpiredGalleries: boolean;
}

interface NotificationSettings {
  notificationPreferences: unknown;
  enableDigestEmails: boolean;
  digestEmailFrequency: string;
  digestEmailTime: string;
  digestEmailDayOfWeek: number;
  quietHoursEnabled: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
}

interface WorkflowSettings {
  defaultPaymentTerms: number;
  defaultGalleryExpiry: number;
  autoSendInvoices: boolean;
  autoSendReminders: boolean;
  requireContractSignature: boolean;
  enableClientPortal: boolean;
  industries: string[];
}

interface TravelSettings {
  travelFeePerMile: number;
  travelFeeThreshold: number;
  homeBaseAddress: string | null;
  homeBaseLat: number | null;
  homeBaseLng: number | null;
}

interface SmsSettings {
  smsEnabled: boolean;
  smsFromNumber: string | null;
}

interface ReviewSettings {
  reviewGateEnabled: boolean;
  reviewGateThreshold: number;
  reviewGateFollowupEnabled: boolean;
  reviewGateFollowupDays: number;
}

interface GamificationSettings {
  gamificationEnabled: boolean;
}

// ============================================================================
// Export Settings
// ============================================================================

/**
 * Export all organization settings as JSON
 */
export async function exportSettings(): Promise<
  ActionResult<ExportedSettings>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Organization not found");
    }

    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        name: true,
        // Branding
        logoUrl: true,
        logoLightUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        portalMode: true,
        invoiceLogoUrl: true,
        hidePlatformBranding: true,
        autoArchiveExpiredGalleries: true,
        // Notifications
        notificationPreferences: true,
        enableDigestEmails: true,
        digestEmailFrequency: true,
        digestEmailTime: true,
        digestEmailDayOfWeek: true,
        quietHoursEnabled: true,
        quietHoursFrom: true,
        quietHoursTo: true,
        // Workflow
        defaultPaymentTerms: true,
        defaultGalleryExpiry: true,
        autoSendInvoices: true,
        autoSendReminders: true,
        requireContractSignature: true,
        enableClientPortal: true,
        industries: true,
        // Travel
        travelFeePerMile: true,
        travelFeeThreshold: true,
        homeBaseAddress: true,
        homeBaseLat: true,
        homeBaseLng: true,
        // SMS
        smsEnabled: true,
        smsFromNumber: true,
        // Reviews
        reviewGateEnabled: true,
        reviewGateThreshold: true,
        reviewGateFollowupEnabled: true,
        reviewGateFollowupDays: true,
        // Gamification
        gamificationEnabled: true,
      },
    });

    if (!organization) {
      return fail("Organization not found");
    }

    const exportData: ExportedSettings = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      organizationName: organization.name,
      settings: {
        branding: {
          logoUrl: organization.logoUrl,
          logoLightUrl: organization.logoLightUrl,
          faviconUrl: organization.faviconUrl,
          primaryColor: organization.primaryColor,
          secondaryColor: organization.secondaryColor,
          accentColor: organization.accentColor,
          portalMode: organization.portalMode,
          invoiceLogoUrl: organization.invoiceLogoUrl,
          hidePlatformBranding: organization.hidePlatformBranding,
          autoArchiveExpiredGalleries: organization.autoArchiveExpiredGalleries,
        },
        notifications: {
          notificationPreferences: organization.notificationPreferences,
          enableDigestEmails: organization.enableDigestEmails,
          digestEmailFrequency: organization.digestEmailFrequency,
          digestEmailTime: organization.digestEmailTime,
          digestEmailDayOfWeek: organization.digestEmailDayOfWeek,
          quietHoursEnabled: organization.quietHoursEnabled,
          quietHoursFrom: organization.quietHoursFrom,
          quietHoursTo: organization.quietHoursTo,
        },
        workflow: {
          defaultPaymentTerms: organization.defaultPaymentTerms,
          defaultGalleryExpiry: organization.defaultGalleryExpiry,
          autoSendInvoices: organization.autoSendInvoices,
          autoSendReminders: organization.autoSendReminders,
          requireContractSignature: organization.requireContractSignature,
          enableClientPortal: organization.enableClientPortal,
          industries: organization.industries,
        },
        travel: {
          travelFeePerMile: organization.travelFeePerMile,
          travelFeeThreshold: organization.travelFeeThreshold,
          homeBaseAddress: organization.homeBaseAddress,
          homeBaseLat: organization.homeBaseLat,
          homeBaseLng: organization.homeBaseLng,
        },
        sms: {
          smsEnabled: organization.smsEnabled,
          smsFromNumber: organization.smsFromNumber,
        },
        reviews: {
          reviewGateEnabled: organization.reviewGateEnabled,
          reviewGateThreshold: organization.reviewGateThreshold,
          reviewGateFollowupEnabled: organization.reviewGateFollowupEnabled,
          reviewGateFollowupDays: organization.reviewGateFollowupDays,
        },
        gamification: {
          gamificationEnabled: organization.gamificationEnabled,
        },
      },
    };

    return success(exportData);
  } catch (error) {
    console.error("Error exporting settings:", error);
    return fail("Failed to export settings");
  }
}

// ============================================================================
// Import Settings
// ============================================================================

interface ImportOptions {
  branding?: boolean;
  notifications?: boolean;
  workflow?: boolean;
  travel?: boolean;
  sms?: boolean;
  reviews?: boolean;
  gamification?: boolean;
}

/**
 * Import organization settings from JSON
 */
export async function importSettings(
  data: ExportedSettings,
  options: ImportOptions = {
    branding: true,
    notifications: true,
    workflow: true,
    travel: true,
    sms: true,
    reviews: true,
    gamification: true,
  }
): Promise<ActionResult<{ imported: string[] }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Organization not found");
    }

    // Validate version
    if (data.version !== "1.0") {
      return fail(`Unsupported export version: ${data.version}`);
    }

    // Build update object based on options
    const updateData: Record<string, unknown> = {};
    const imported: string[] = [];

    if (options.branding && data.settings.branding) {
      const b = data.settings.branding;
      // Note: We don't import logo URLs since they might be invalid/expired
      Object.assign(updateData, {
        primaryColor: b.primaryColor,
        secondaryColor: b.secondaryColor,
        accentColor: b.accentColor,
        portalMode: b.portalMode,
        hidePlatformBranding: b.hidePlatformBranding,
        autoArchiveExpiredGalleries: b.autoArchiveExpiredGalleries,
      });
      imported.push("branding");
    }

    if (options.notifications && data.settings.notifications) {
      const n = data.settings.notifications;
      Object.assign(updateData, {
        notificationPreferences: n.notificationPreferences,
        enableDigestEmails: n.enableDigestEmails,
        digestEmailFrequency: n.digestEmailFrequency,
        digestEmailTime: n.digestEmailTime,
        digestEmailDayOfWeek: n.digestEmailDayOfWeek,
        quietHoursEnabled: n.quietHoursEnabled,
        quietHoursFrom: n.quietHoursFrom,
        quietHoursTo: n.quietHoursTo,
      });
      imported.push("notifications");
    }

    if (options.workflow && data.settings.workflow) {
      const w = data.settings.workflow;
      Object.assign(updateData, {
        defaultPaymentTerms: w.defaultPaymentTerms,
        defaultGalleryExpiry: w.defaultGalleryExpiry,
        autoSendInvoices: w.autoSendInvoices,
        autoSendReminders: w.autoSendReminders,
        requireContractSignature: w.requireContractSignature,
        enableClientPortal: w.enableClientPortal,
        industries: w.industries,
      });
      imported.push("workflow");
    }

    if (options.travel && data.settings.travel) {
      const t = data.settings.travel;
      Object.assign(updateData, {
        travelFeePerMile: t.travelFeePerMile,
        travelFeeThreshold: t.travelFeeThreshold,
        homeBaseAddress: t.homeBaseAddress,
        homeBaseLat: t.homeBaseLat,
        homeBaseLng: t.homeBaseLng,
      });
      imported.push("travel");
    }

    if (options.sms && data.settings.sms) {
      const s = data.settings.sms;
      Object.assign(updateData, {
        smsEnabled: s.smsEnabled,
        // Note: We don't import smsFromNumber since it requires verification
      });
      imported.push("sms");
    }

    if (options.reviews && data.settings.reviews) {
      const r = data.settings.reviews;
      Object.assign(updateData, {
        reviewGateEnabled: r.reviewGateEnabled,
        reviewGateThreshold: r.reviewGateThreshold,
        reviewGateFollowupEnabled: r.reviewGateFollowupEnabled,
        reviewGateFollowupDays: r.reviewGateFollowupDays,
      });
      imported.push("reviews");
    }

    if (options.gamification && data.settings.gamification) {
      const g = data.settings.gamification;
      Object.assign(updateData, {
        gamificationEnabled: g.gamificationEnabled,
      });
      imported.push("gamification");
    }

    // Update organization
    if (Object.keys(updateData).length > 0) {
      await prisma.organization.update({
        where: { id: auth.organizationId },
        data: updateData,
      });
    }

    revalidatePath("/settings");
    return success({ imported });
  } catch (error) {
    console.error("Error importing settings:", error);
    return fail("Failed to import settings");
  }
}

/**
 * Validate import data before importing
 */
export async function validateImportData(
  data: unknown
): Promise<ActionResult<{ valid: boolean; errors: string[] }>> {
  try {
    const errors: string[] = [];

    // Check basic structure
    if (!data || typeof data !== "object") {
      return success({ valid: false, errors: ["Invalid data format"] });
    }

    const obj = data as Record<string, unknown>;

    // Check version
    if (!obj.version || typeof obj.version !== "string") {
      errors.push("Missing or invalid version");
    } else if (obj.version !== "1.0") {
      errors.push(`Unsupported version: ${obj.version}`);
    }

    // Check settings object
    if (!obj.settings || typeof obj.settings !== "object") {
      errors.push("Missing settings object");
    }

    return success({ valid: errors.length === 0, errors });
  } catch {
    return fail("Failed to validate import data");
  }
}

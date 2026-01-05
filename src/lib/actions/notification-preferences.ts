"use server";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

// Types for notification preferences
export interface NotificationPreferences {
  email: {
    galleryDelivered: boolean;
    galleryViewed: boolean;
    paymentReceived: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    bookingCanceled: boolean;
    invoiceOverdue: boolean;
    contractSigned: boolean;
    clientFeedback: boolean;
    questionnaireCompleted: boolean;
  };
  push: {
    galleryDelivered: boolean;
    galleryViewed: boolean;
    paymentReceived: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    bookingCanceled: boolean;
    invoiceOverdue: boolean;
    contractSigned: boolean;
    clientFeedback: boolean;
    questionnaireCompleted: boolean;
  };
}

export interface DigestSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "none";
  time: string; // HH:MM format
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
}

export interface QuietHoursSettings {
  enabled: boolean;
  from: string; // HH:MM format
  to: string; // HH:MM format
}

export const defaultNotificationPreferences: NotificationPreferences = {
  email: {
    galleryDelivered: true,
    galleryViewed: true,
    paymentReceived: true,
    newBooking: true,
    bookingReminder: true,
    bookingCanceled: true,
    invoiceOverdue: true,
    contractSigned: true,
    clientFeedback: true,
    questionnaireCompleted: true,
  },
  push: {
    galleryDelivered: true,
    galleryViewed: false,
    paymentReceived: true,
    newBooking: true,
    bookingReminder: true,
    bookingCanceled: true,
    invoiceOverdue: true,
    contractSigned: true,
    clientFeedback: true,
    questionnaireCompleted: false,
  },
};

export const defaultDigestSettings: DigestSettings = {
  enabled: true,
  frequency: "daily",
  time: "08:00",
  dayOfWeek: 0, // Sunday
};

export const defaultQuietHours: QuietHoursSettings = {
  enabled: false,
  from: "22:00",
  to: "07:00",
};

/**
 * Get notification preferences for the current organization
 */
export async function getNotificationPreferences(): Promise<{
  success: boolean;
  data?: {
    preferences: NotificationPreferences;
    digest: DigestSettings;
    quietHours: QuietHoursSettings;
  };
  error?: string;
}> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Organization not found" };
    }
    const organizationId = auth.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        notificationPreferences: true,
        enableDigestEmails: true,
        digestEmailFrequency: true,
        digestEmailTime: true,
        digestEmailDayOfWeek: true,
        quietHoursEnabled: true,
        quietHoursFrom: true,
        quietHoursTo: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Parse notification preferences from JSON or use defaults
    const preferences: NotificationPreferences =
      organization.notificationPreferences
        ? (organization.notificationPreferences as unknown as NotificationPreferences)
        : defaultNotificationPreferences;

    // Build digest settings
    const digest: DigestSettings = {
      enabled: organization.enableDigestEmails ?? true,
      frequency: (organization.digestEmailFrequency as DigestSettings["frequency"]) ?? "daily",
      time: organization.digestEmailTime ?? "08:00",
      dayOfWeek: organization.digestEmailDayOfWeek ?? 0,
    };

    // Build quiet hours settings
    const quietHours: QuietHoursSettings = {
      enabled: organization.quietHoursEnabled ?? false,
      from: organization.quietHoursFrom ?? "22:00",
      to: organization.quietHoursTo ?? "07:00",
    };

    return {
      success: true,
      data: { preferences, digest, quietHours },
    };
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return { success: false, error: "Failed to get notification preferences" };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Organization not found" };
    }

    await prisma.organization.update({
      where: { id: auth.organizationId },
      data: {
        notificationPreferences: preferences as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return { success: false, error: "Failed to update notification preferences" };
  }
}

/**
 * Update email digest settings
 */
export async function updateDigestSettings(
  settings: DigestSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Organization not found" };
    }

    await prisma.organization.update({
      where: { id: auth.organizationId },
      data: {
        enableDigestEmails: settings.enabled,
        digestEmailFrequency: settings.frequency,
        digestEmailTime: settings.time,
        digestEmailDayOfWeek: settings.dayOfWeek,
      },
    });

    revalidatePath("/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error updating digest settings:", error);
    return { success: false, error: "Failed to update digest settings" };
  }
}

/**
 * Update quiet hours settings
 */
export async function updateQuietHoursSettings(
  settings: QuietHoursSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Organization not found" };
    }

    await prisma.organization.update({
      where: { id: auth.organizationId },
      data: {
        quietHoursEnabled: settings.enabled,
        quietHoursFrom: settings.from,
        quietHoursTo: settings.to,
      },
    });

    revalidatePath("/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error updating quiet hours settings:", error);
    return { success: false, error: "Failed to update quiet hours settings" };
  }
}

/**
 * Update all notification settings at once
 */
export async function updateAllNotificationSettings(data: {
  preferences: NotificationPreferences;
  digest: DigestSettings;
  quietHours: QuietHoursSettings;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Organization not found" };
    }

    await prisma.organization.update({
      where: { id: auth.organizationId },
      data: {
        notificationPreferences: data.preferences as unknown as Prisma.InputJsonValue,
        enableDigestEmails: data.digest.enabled,
        digestEmailFrequency: data.digest.frequency,
        digestEmailTime: data.digest.time,
        digestEmailDayOfWeek: data.digest.dayOfWeek,
        quietHoursEnabled: data.quietHours.enabled,
        quietHoursFrom: data.quietHours.from,
        quietHoursTo: data.quietHours.to,
      },
    });

    revalidatePath("/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
}

/**
 * Check if a notification should be sent based on preferences
 */
export async function shouldSendNotification(
  organizationId: string,
  type: keyof NotificationPreferences["email"],
  channel: "email" | "push"
): Promise<boolean> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        notificationPreferences: true,
        quietHoursEnabled: true,
        quietHoursFrom: true,
        quietHoursTo: true,
      },
    });

    if (!organization) return false;

    // Check quiet hours
    if (organization.quietHoursEnabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const from = organization.quietHoursFrom ?? "22:00";
      const to = organization.quietHoursTo ?? "07:00";

      // Handle overnight quiet hours (e.g., 22:00 to 07:00)
      if (from > to) {
        // Overnight period
        if (currentTime >= from || currentTime < to) {
          return false; // Within quiet hours
        }
      } else {
        // Same day period
        if (currentTime >= from && currentTime < to) {
          return false; // Within quiet hours
        }
      }
    }

    // Check notification preferences
    const preferences = organization.notificationPreferences as unknown as NotificationPreferences | null;
    if (!preferences) return true; // Default to sending if no preferences set

    return preferences[channel]?.[type] ?? true;
  } catch (error) {
    console.error("Error checking notification preferences:", error);
    return true; // Default to sending on error
  }
}

"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendSMS, sendTemplatedSMS } from "@/lib/sms/send";
import { templateVariables, defaultTemplates } from "@/lib/sms/templates";
import type { SMSTemplateType, SMSDeliveryStatus } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SMSSettings {
  smsEnabled: boolean;
  twilioAccountSid: string | null;
  twilioAuthToken: string | null;
  twilioPhoneNumber: string | null;
}

interface SMSTemplateWithStats {
  id: string;
  name: string;
  templateType: SMSTemplateType;
  content: string;
  availableVariables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    smsLogs: number;
  };
}

interface SMSLogWithRelations {
  id: string;
  toPhone: string;
  fromPhone: string;
  content: string;
  deliveryStatus: SMSDeliveryStatus;
  errorMessage: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  template: {
    id: string;
    name: string;
    templateType: SMSTemplateType;
  } | null;
}

interface SMSStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id ?? null;
}

// ============================================================================
// SMS SETTINGS
// ============================================================================

export async function getSMSSettings(): Promise<ActionResult<SMSSettings>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        smsEnabled: true,
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
      },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    return {
      success: true,
      data: {
        smsEnabled: org.smsEnabled,
        twilioAccountSid: org.twilioAccountSid,
        twilioAuthToken: org.twilioAuthToken ? "••••••••" : null, // Mask the token
        twilioPhoneNumber: org.twilioPhoneNumber,
      },
    };
  } catch (err) {
    console.error("Failed to get SMS settings:", err);
    return { success: false, error: "Failed to get SMS settings" };
  }
}

export async function updateSMSSettings(data: {
  smsEnabled?: boolean;
  twilioAccountSid?: string | null;
  twilioAuthToken?: string | null;
  twilioPhoneNumber?: string | null;
}): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        smsEnabled: data.smsEnabled,
        twilioAccountSid: data.twilioAccountSid,
        // Only update auth token if provided and not masked
        ...(data.twilioAuthToken && !data.twilioAuthToken.startsWith("••")
          ? { twilioAuthToken: data.twilioAuthToken }
          : {}),
        twilioPhoneNumber: data.twilioPhoneNumber,
      },
    });

    revalidatePath("/settings/sms");
    return { success: true };
  } catch (err) {
    console.error("Failed to update SMS settings:", err);
    return { success: false, error: "Failed to update SMS settings" };
  }
}

// ============================================================================
// SMS TEMPLATES
// ============================================================================

export async function getSMSTemplates(): Promise<ActionResult<SMSTemplateWithStats[]>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const templates = await prisma.sMSTemplate.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { smsLogs: true },
        },
      },
      orderBy: [{ templateType: "asc" }, { isDefault: "desc" }],
    });

    return { success: true, data: templates };
  } catch (err) {
    console.error("Failed to get SMS templates:", err);
    return { success: false, error: "Failed to get SMS templates" };
  }
}

export async function getSMSTemplate(id: string): Promise<ActionResult<SMSTemplateWithStats>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const template = await prisma.sMSTemplate.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { smsLogs: true },
        },
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, data: template };
  } catch (err) {
    console.error("Failed to get SMS template:", err);
    return { success: false, error: "Failed to get SMS template" };
  }
}

export async function createSMSTemplate(data: {
  name: string;
  templateType: SMSTemplateType;
  content: string;
  isActive?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const template = await prisma.sMSTemplate.create({
      data: {
        organizationId,
        name: data.name,
        templateType: data.templateType,
        content: data.content,
        availableVariables: templateVariables[data.templateType],
        isActive: data.isActive ?? true,
        isDefault: false,
      },
    });

    revalidatePath("/settings/sms/templates");
    return { success: true, data: { id: template.id } };
  } catch (err) {
    console.error("Failed to create SMS template:", err);
    return { success: false, error: "Failed to create SMS template" };
  }
}

export async function updateSMSTemplate(
  id: string,
  data: {
    name?: string;
    content?: string;
    isActive?: boolean;
  }
): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.sMSTemplate.updateMany({
      where: { id, organizationId },
      data,
    });

    revalidatePath("/settings/sms/templates");
    return { success: true };
  } catch (err) {
    console.error("Failed to update SMS template:", err);
    return { success: false, error: "Failed to update SMS template" };
  }
}

export async function deleteSMSTemplate(id: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.sMSTemplate.deleteMany({
      where: { id, organizationId },
    });

    revalidatePath("/settings/sms/templates");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete SMS template:", err);
    return { success: false, error: "Failed to delete SMS template" };
  }
}

export async function seedDefaultTemplates(): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    // Create default templates for each type
    const templateTypes = Object.keys(defaultTemplates) as SMSTemplateType[];

    for (const templateType of templateTypes) {
      if (templateType === "custom") continue; // Skip custom type

      const existing = await prisma.sMSTemplate.findFirst({
        where: { organizationId, templateType, isDefault: true },
      });

      if (!existing) {
        const defaultTemplate = defaultTemplates[templateType];
        await prisma.sMSTemplate.create({
          data: {
            organizationId,
            name: defaultTemplate.name,
            templateType,
            content: defaultTemplate.content,
            availableVariables: templateVariables[templateType],
            isActive: true,
            isDefault: true,
          },
        });
      }
    }

    revalidatePath("/settings/sms/templates");
    return { success: true };
  } catch (err) {
    console.error("Failed to seed default templates:", err);
    return { success: false, error: "Failed to seed default templates" };
  }
}

// ============================================================================
// SMS LOGS
// ============================================================================

export async function getSMSLogs(options?: {
  limit?: number;
  offset?: number;
  status?: SMSDeliveryStatus;
  bookingId?: string;
  clientId?: string;
}): Promise<ActionResult<{ logs: SMSLogWithRelations[]; total: number }>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const { limit = 50, offset = 0, status, bookingId, clientId } = options || {};

    const where = {
      organizationId,
      ...(status ? { deliveryStatus: status } : {}),
      ...(bookingId ? { bookingId } : {}),
      ...(clientId ? { clientId } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.sMSLog.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              templateType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.sMSLog.count({ where }),
    ]);

    return { success: true, data: { logs, total } };
  } catch (err) {
    console.error("Failed to get SMS logs:", err);
    return { success: false, error: "Failed to get SMS logs" };
  }
}

export async function getSMSStats(): Promise<ActionResult<SMSStats>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const [totalSent, delivered, failed, pending] = await Promise.all([
      prisma.sMSLog.count({ where: { organizationId } }),
      prisma.sMSLog.count({ where: { organizationId, deliveryStatus: "delivered" } }),
      prisma.sMSLog.count({
        where: { organizationId, deliveryStatus: { in: ["failed", "undelivered"] } },
      }),
      prisma.sMSLog.count({
        where: { organizationId, deliveryStatus: { in: ["queued", "sent"] } },
      }),
    ]);

    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;

    return {
      success: true,
      data: {
        totalSent,
        delivered,
        failed,
        pending,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
      },
    };
  } catch (err) {
    console.error("Failed to get SMS stats:", err);
    return { success: false, error: "Failed to get SMS stats" };
  }
}

// ============================================================================
// SEND SMS
// ============================================================================

export async function sendManualSMS(data: {
  to: string;
  message: string;
  bookingId?: string;
  clientId?: string;
}): Promise<ActionResult<{ smsLogId: string }>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const result = await sendSMS({
      organizationId,
      to: data.to,
      message: data.message,
      bookingId: data.bookingId,
      clientId: data.clientId,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/settings/sms");
    return { success: true, data: { smsLogId: result.smsLogId! } };
  } catch (err) {
    console.error("Failed to send SMS:", err);
    return { success: false, error: "Failed to send SMS" };
  }
}

export async function sendBookingConfirmationSMS(bookingId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get booking details
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, organizationId },
      include: {
        client: true,
        service: true,
        locationRef: true,
        assignedUser: true,
        organization: {
          select: { name: true, publicName: true },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const clientPhone = booking.clientPhone || booking.client?.phone;
    if (!clientPhone) {
      return { success: false, error: "Client has no phone number" };
    }

    const variables: Record<string, string> = {
      clientName: booking.clientName || booking.client?.fullName || "Client",
      bookingDate: booking.startTime.toLocaleDateString(),
      bookingTime: booking.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      serviceName: booking.service?.name || booking.title,
      locationAddress: booking.locationRef?.formattedAddress || booking.location || "",
      photographerName: booking.assignedUser?.fullName || "Your photographer",
      photographerPhone: booking.assignedUser?.phone || "",
      companyName: booking.organization.publicName || booking.organization.name,
    };

    const result = await sendTemplatedSMS({
      organizationId,
      to: clientPhone,
      templateType: "booking_confirmation",
      variables,
      bookingId,
      clientId: booking.clientId || undefined,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send booking confirmation SMS:", err);
    return { success: false, error: "Failed to send booking confirmation SMS" };
  }
}

export async function sendPhotographerEnRouteSMS(
  bookingId: string,
  etaMinutes: number
): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get booking details
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, organizationId },
      include: {
        client: true,
        assignedUser: true,
        organization: {
          select: { name: true, publicName: true },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const clientPhone = booking.clientPhone || booking.client?.phone;
    if (!clientPhone) {
      return { success: false, error: "Client has no phone number" };
    }

    // Generate tracking link (this would be a public route)
    const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL}/track/${bookingId}`;

    const variables: Record<string, string> = {
      clientName: booking.clientName || booking.client?.fullName || "Client",
      photographerName: booking.assignedUser?.fullName || "Your photographer",
      etaMinutes: etaMinutes.toString(),
      trackingLink,
      companyName: booking.organization.publicName || booking.organization.name,
    };

    const result = await sendTemplatedSMS({
      organizationId,
      to: clientPhone,
      templateType: "photographer_en_route",
      variables,
      bookingId,
      clientId: booking.clientId || undefined,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send en route SMS:", err);
    return { success: false, error: "Failed to send en route SMS" };
  }
}

export async function sendGalleryReadySMS(projectId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get project details
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
      include: {
        client: true,
        assets: { select: { id: true } },
        deliveryLinks: { where: { isActive: true }, take: 1 },
        organization: {
          select: { name: true, publicName: true },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (!project.client?.phone) {
      return { success: false, error: "Client has no phone number" };
    }

    const deliveryLink = project.deliveryLinks[0];
    const galleryLink = deliveryLink
      ? `${process.env.NEXT_PUBLIC_APP_URL}/g/${deliveryLink.slug}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/galleries/${project.id}`;

    const variables: Record<string, string> = {
      clientName: project.client.fullName || "Client",
      galleryName: project.name,
      galleryLink,
      photoCount: project.assets.length.toString(),
      companyName: project.organization.publicName || project.organization.name,
    };

    const result = await sendTemplatedSMS({
      organizationId,
      to: project.client.phone,
      templateType: "gallery_ready",
      variables,
      clientId: project.clientId || undefined,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send gallery ready SMS:", err);
    return { success: false, error: "Failed to send gallery ready SMS" };
  }
}

// ============================================================================
// TEST SMS
// ============================================================================

export async function sendTestSMS(phoneNumber: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    const result = await sendSMS({
      organizationId,
      to: phoneNumber,
      message: "This is a test message from PhotoProOS. Your SMS integration is working correctly!",
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send test SMS:", err);
    return { success: false, error: "Failed to send test SMS" };
  }
}

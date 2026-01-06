"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import {
  sendSMSToClient,
  sendSMSDirect,
  DEFAULT_TEMPLATES,
  TEMPLATE_VARIABLES,
} from "@/lib/sms/send";
import type { SMSTemplateType, SMSDeliveryStatus } from "@prisma/client";
import { ok, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// SMS SETTINGS
// ============================================================================

export interface SMSSettings {
  smsEnabled: boolean;
  twilioAccountSid: string | null;
  twilioAuthToken: string | null;
  twilioPhoneNumber: string | null;
  hasTwilioCredentials: boolean;
}

export interface SMSStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
}

/**
 * Get SMS settings for the organization
 */
export async function getSMSSettings(): Promise<ActionResult<SMSSettings>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        smsEnabled: true,
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    return {
      success: true,
      data: {
        smsEnabled: organization.smsEnabled,
        twilioAccountSid: organization.twilioAccountSid,
        twilioAuthToken: organization.twilioAuthToken ? "••••••••" : null, // Mask the token
        twilioPhoneNumber: organization.twilioPhoneNumber,
        hasTwilioCredentials: !!(
          organization.twilioAccountSid &&
          organization.twilioAuthToken &&
          organization.twilioPhoneNumber
        ),
      },
    };
  } catch (error) {
    console.error("Error getting SMS settings:", error);
    return { success: false, error: "Failed to get SMS settings" };
  }
}

/**
 * Get SMS statistics for the organization
 */
export async function getSMSStats(): Promise<ActionResult<SMSStats>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const [totalSent, delivered, failed, pending] = await Promise.all([
      prisma.sMSLog.count({ where: { organizationId } }),
      prisma.sMSLog.count({
        where: { organizationId, deliveryStatus: "delivered" },
      }),
      prisma.sMSLog.count({
        where: {
          organizationId,
          deliveryStatus: { in: ["failed", "undelivered"] },
        },
      }),
      prisma.sMSLog.count({
        where: {
          organizationId,
          deliveryStatus: { in: ["queued", "sent"] },
        },
      }),
    ]);

    const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0;

    return {
      success: true,
      data: {
        totalSent,
        delivered,
        failed,
        pending,
        deliveryRate,
      },
    };
  } catch (error) {
    console.error("Error getting SMS stats:", error);
    return { success: false, error: "Failed to get SMS stats" };
  }
}

/**
 * Update SMS settings for the organization
 */
export async function updateSMSSettings(data: {
  smsEnabled?: boolean;
  twilioAccountSid?: string | null;
  twilioAuthToken?: string | null;
  twilioPhoneNumber?: string | null;
}): Promise<ActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        smsEnabled: data.smsEnabled,
        twilioAccountSid: data.twilioAccountSid || null,
        twilioAuthToken: data.twilioAuthToken || null,
        twilioPhoneNumber: data.twilioPhoneNumber || null,
      },
    });

    revalidatePath("/settings/sms");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating SMS settings:", error);
    return { success: false, error: "Failed to update SMS settings" };
  }
}

/**
 * Test SMS configuration by sending a test message
 */
export async function sendTestSMS(toPhone: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const result = await sendSMSDirect({
      organizationId,
      toPhone,
      content:
        "This is a test message from PhotoProOS to verify your SMS configuration is working correctly.",
    });

    if (!result.success) {
      return { success: false, error: result.error || "Failed to send test SMS" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error sending test SMS:", error);
    return { success: false, error: "Failed to send test SMS" };
  }
}

// ============================================================================
// SMS TEMPLATES
// ============================================================================

export interface SMSTemplateData {
  id: string;
  name: string;
  templateType: SMSTemplateType;
  content: string;
  availableVariables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all SMS templates for the organization
 */
export async function getSMSTemplates(): Promise<
  ActionResult<
    Array<
      SMSTemplateData & {
        _count: { smsLogs: number };
      }
    >
  >
> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const templates = await prisma.sMSTemplate.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { smsLogs: true },
        },
      },
      orderBy: [{ templateType: "asc" }, { createdAt: "desc" }],
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error("Error getting SMS templates:", error);
    return { success: false, error: "Failed to get SMS templates" };
  }
}

/**
 * Seed default SMS templates for the organization
 */
export async function seedDefaultTemplates(): Promise<ActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const templateTypes: SMSTemplateType[] = [
      "booking_confirmation",
      "booking_reminder",
      "photographer_en_route",
      "photographer_arrived",
      "gallery_ready",
      "invoice_sent",
      "payment_received",
    ];

    const templateLabels: Record<SMSTemplateType, string> = {
      booking_confirmation: "Booking Confirmation",
      booking_reminder: "Booking Reminder",
      photographer_en_route: "Photographer En Route",
      photographer_arrived: "Photographer Arrived",
      gallery_ready: "Gallery Ready",
      invoice_sent: "Invoice Sent",
      payment_received: "Payment Received",
      custom: "Custom Message",
    };

    // Check existing templates
    const existingTemplates = await prisma.sMSTemplate.findMany({
      where: { organizationId },
      select: { templateType: true },
    });

    const existingTypes = new Set(existingTemplates.map((t) => t.templateType));

    // Create templates that don't exist yet
    const templatesToCreate = templateTypes.filter(
      (type) => !existingTypes.has(type)
    );

    if (templatesToCreate.length === 0) {
      return { success: true, data: undefined };
    }

    await prisma.sMSTemplate.createMany({
      data: templatesToCreate.map((type) => ({
        organizationId,
        name: templateLabels[type],
        templateType: type,
        content: DEFAULT_TEMPLATES[type],
        availableVariables: TEMPLATE_VARIABLES[type],
        isActive: true,
        isDefault: true,
      })),
    });

    revalidatePath("/settings/sms");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error seeding default templates:", error);
    return { success: false, error: "Failed to create default templates" };
  }
}

/**
 * Get available template types with their default content
 */
export async function getTemplateTypes(): Promise<
  ActionResult<
    Array<{
      type: SMSTemplateType;
      label: string;
      defaultContent: string;
      variables: string[];
    }>
  >
> {
  const types: Array<{
    type: SMSTemplateType;
    label: string;
    defaultContent: string;
    variables: string[];
  }> = [
    {
      type: "booking_confirmation",
      label: "Booking Confirmation",
      defaultContent: DEFAULT_TEMPLATES.booking_confirmation,
      variables: TEMPLATE_VARIABLES.booking_confirmation,
    },
    {
      type: "booking_reminder",
      label: "Booking Reminder",
      defaultContent: DEFAULT_TEMPLATES.booking_reminder,
      variables: TEMPLATE_VARIABLES.booking_reminder,
    },
    {
      type: "photographer_en_route",
      label: "Photographer En Route",
      defaultContent: DEFAULT_TEMPLATES.photographer_en_route,
      variables: TEMPLATE_VARIABLES.photographer_en_route,
    },
    {
      type: "photographer_arrived",
      label: "Photographer Arrived",
      defaultContent: DEFAULT_TEMPLATES.photographer_arrived,
      variables: TEMPLATE_VARIABLES.photographer_arrived,
    },
    {
      type: "gallery_ready",
      label: "Gallery Ready",
      defaultContent: DEFAULT_TEMPLATES.gallery_ready,
      variables: TEMPLATE_VARIABLES.gallery_ready,
    },
    {
      type: "invoice_sent",
      label: "Invoice Sent",
      defaultContent: DEFAULT_TEMPLATES.invoice_sent,
      variables: TEMPLATE_VARIABLES.invoice_sent,
    },
    {
      type: "payment_received",
      label: "Payment Received",
      defaultContent: DEFAULT_TEMPLATES.payment_received,
      variables: TEMPLATE_VARIABLES.payment_received,
    },
    {
      type: "custom",
      label: "Custom Message",
      defaultContent: "",
      variables: [],
    },
  ];

  return { success: true, data: types };
}

/**
 * Create or update an SMS template
 */
export async function upsertSMSTemplate(data: {
  id?: string;
  name: string;
  templateType: SMSTemplateType;
  content: string;
  isActive?: boolean;
}): Promise<ActionResult<SMSTemplateData>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const variables = TEMPLATE_VARIABLES[data.templateType] || [];

    if (data.id) {
      // Update existing template
      const template = await prisma.sMSTemplate.update({
        where: { id: data.id, organizationId },
        data: {
          name: data.name,
          content: data.content,
          availableVariables: variables,
          isActive: data.isActive ?? true,
        },
      });
      revalidatePath("/settings/sms");
      return { success: true, data: template };
    } else {
      // Create new template
      const template = await prisma.sMSTemplate.create({
        data: {
          organizationId,
          name: data.name,
          templateType: data.templateType,
          content: data.content,
          availableVariables: variables,
          isActive: data.isActive ?? true,
          isDefault: false,
        },
      });
      revalidatePath("/settings/sms");
      return { success: true, data: template };
    }
  } catch (error) {
    console.error("Error upserting SMS template:", error);
    return { success: false, error: "Failed to save SMS template" };
  }
}

/**
 * Delete an SMS template
 */
export async function deleteSMSTemplate(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.sMSTemplate.delete({
      where: { id, organizationId },
    });

    revalidatePath("/settings/sms");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting SMS template:", error);
    return { success: false, error: "Failed to delete SMS template" };
  }
}

// ============================================================================
// SMS LOGS
// ============================================================================

export interface SMSLogData {
  id: string;
  toPhone: string;
  fromPhone: string;
  content: string;
  deliveryStatus: SMSDeliveryStatus;
  errorMessage: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  booking: { id: string; title: string } | null;
  client: { id: string; fullName: string | null; email: string } | null;
  template: { name: string; templateType: SMSTemplateType } | null;
}

/**
 * Get SMS logs for the organization
 */
export async function getSMSLogs(params?: {
  limit?: number;
  offset?: number;
  status?: SMSDeliveryStatus;
}): Promise<ActionResult<{ logs: SMSLogData[]; total: number }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const where: {
      organizationId: string;
      deliveryStatus?: SMSDeliveryStatus;
    } = {
      organizationId,
    };

    if (params?.status) {
      where.deliveryStatus = params.status;
    }

    const [logs, total] = await Promise.all([
      prisma.sMSLog.findMany({
        where,
        include: {
          booking: { select: { id: true, title: true } },
          client: { select: { id: true, fullName: true, email: true } },
          template: { select: { name: true, templateType: true } },
        },
        orderBy: { createdAt: "desc" },
        take: params?.limit || 50,
        skip: params?.offset || 0,
      }),
      prisma.sMSLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        logs: logs.map((log) => ({
          ...log,
          deliveryStatus: log.deliveryStatus,
          booking: log.booking
            ? { id: log.booking.id, title: log.booking.title }
            : null,
          client: log.client,
          template: log.template,
        })),
        total,
      },
    };
  } catch (error) {
    console.error("Error getting SMS logs:", error);
    return { success: false, error: "Failed to get SMS logs" };
  }
}

// ============================================================================
// SEND SMS (Manual)
// ============================================================================

/**
 * Send an SMS to a client using a template
 */
export async function sendSMSToClientAction(data: {
  clientId: string;
  templateType: SMSTemplateType;
  variables: Record<string, string>;
  bookingId?: string;
  customContent?: string;
}): Promise<ActionResult<{ smsLogId: string }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const result = await sendSMSToClient({
      organizationId,
      clientId: data.clientId,
      templateType: data.templateType,
      variables: data.variables,
      bookingId: data.bookingId,
      customContent: data.customContent,
    });

    if (!result.success) {
      return { success: false, error: result.error || "Failed to send SMS" };
    }

    revalidatePath("/settings/sms");
    return { success: true, data: { smsLogId: result.smsLogId! } };
  } catch (error) {
    console.error("Error sending SMS to client:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}

/**
 * Send a custom SMS to a phone number
 */
export async function sendCustomSMS(data: {
  toPhone: string;
  content: string;
  clientId?: string;
  bookingId?: string;
}): Promise<ActionResult<{ smsLogId: string }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const result = await sendSMSDirect({
      organizationId,
      toPhone: data.toPhone,
      content: data.content,
      clientId: data.clientId,
      bookingId: data.bookingId,
    });

    if (!result.success) {
      return { success: false, error: result.error || "Failed to send SMS" };
    }

    revalidatePath("/settings/sms");
    return { success: true, data: { smsLogId: result.smsLogId! } };
  } catch (error) {
    console.error("Error sending custom SMS:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}

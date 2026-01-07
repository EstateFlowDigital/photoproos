import type { ActivityType } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface ActivityData {
  id: string;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
  // Related entity IDs for navigation
  projectId: string | null;
  clientId: string | null;
  paymentId: string | null;
  bookingId: string | null;
  invoiceId: string | null;
  contractId: string | null;
}

/**
 * Get activity link URL based on type and related entity
 */
export function getActivityLinkUrl(activity: ActivityData): string | null {
  // Priority order for navigation
  if (activity.invoiceId) return `/invoices/${activity.invoiceId}`;
  if (activity.paymentId) return `/payments`;
  if (activity.bookingId) return `/scheduling/${activity.bookingId}`;
  if (activity.contractId) return `/contracts/${activity.contractId}`;
  if (activity.clientId) return `/clients/${activity.clientId}`;
  if (activity.projectId) return `/projects`;

  return null;
}

/**
 * Get icon name for activity type
 */
export function getActivityIcon(type: ActivityType): string {
  const iconMap: Record<ActivityType, string> = {
    gallery_created: "photo",
    gallery_delivered: "send",
    gallery_viewed: "eye",
    gallery_paid: "currency",
    photo_viewed: "eye",
    payment_received: "currency",
    payment_failed: "error",
    client_added: "user",
    client_created: "user",
    client_updated: "user",
    client_merged: "users",
    booking_created: "calendar",
    booking_confirmed: "check",
    booking_cancelled: "x",
    invoice_created: "document",
    invoice_sent: "document",
    invoice_paid: "check",
    invoice_voided: "x",
    invoice_split: "document",
    invoice_updated: "document",
    invoice_reminder_sent: "mail",
    contract_sent: "document",
    contract_signed: "check",
    email_sent: "mail",
    file_uploaded: "upload",
    file_downloaded: "download",
    settings_updated: "settings",
    order_created: "cart",
    order_paid: "currency",
    selections_submitted: "check",
    message_sent: "mail",
    estimate_created: "document",
    estimate_updated: "document",
    estimate_sent: "send",
    estimate_approved: "check",
    estimate_rejected: "x",
    estimate_converted: "currency",
    retainer_created: "wallet",
    retainer_deposit: "currency",
    retainer_usage: "currency",
    retainer_refund: "currency",
    retainer_updated: "wallet",
  };

  return iconMap[type] || "info";
}

/**
 * Log an activity to the activity log
 *
 * This is a shared utility function for logging activities across the app.
 * Activities are used for audit trails and the notifications center.
 */
export async function logActivity(params: {
  organizationId: string;
  type: ActivityType;
  description: string;
  userId?: string;
  projectId?: string;
  clientId?: string;
  paymentId?: string;
  bookingId?: string;
  invoiceId?: string;
  contractId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        organizationId: params.organizationId,
        type: params.type,
        description: params.description,
        userId: params.userId,
        projectId: params.projectId,
        clientId: params.clientId,
        paymentId: params.paymentId,
        bookingId: params.bookingId,
        invoiceId: params.invoiceId,
        contractId: params.contractId,
        metadata: params.metadata as object | undefined,
      },
    });
  } catch (error) {
    console.error("[Activity] Failed to log activity:", error);
    // Don't throw - activity logging should never break the main operation
  }
}

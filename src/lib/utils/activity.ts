import type { ActivityType } from "@prisma/client";
import { prisma } from "@/lib/db";

// Re-export types and pure functions from the client-safe types file
// Use this file for server-side code that needs logActivity
// Use @/lib/types/activity for client-side code that only needs types
export type { ActivityData } from "@/lib/types/activity";
export { getActivityLinkUrl, getActivityIcon } from "@/lib/types/activity";

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

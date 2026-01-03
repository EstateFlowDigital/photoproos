import type { ActivityType } from "@prisma/client";

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
    payment_received: "currency",
    payment_failed: "error",
    client_added: "user",
    booking_created: "calendar",
    booking_confirmed: "check",
    invoice_sent: "document",
    invoice_paid: "check",
    contract_sent: "document",
    contract_signed: "check",
    email_sent: "mail",
    file_uploaded: "upload",
    file_downloaded: "download",
    settings_updated: "settings",
  };

  return iconMap[type] || "info";
}

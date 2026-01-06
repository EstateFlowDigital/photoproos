"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CommunicationType, CommunicationDirection } from "@prisma/client";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, type ActionResult } from "@/lib/types/action-result";

export interface CreateCommunicationInput {
  clientId: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  subject?: string;
  content: string;
  sentAt?: Date;
  bookingId?: string;
  projectId?: string;
  invoiceId?: string;
}

export interface UpdateCommunicationInput {
  id: string;
  subject?: string;
  content?: string;
  sentAt?: Date;
  readAt?: Date;
}

// =============================================================================
// Communication Actions
// =============================================================================

/**
 * Get all communications for a client
 */
export async function getClientCommunications(
  clientId: string,
  filters?: {
    type?: CommunicationType;
    direction?: CommunicationDirection;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
  }
) {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
      select: { id: true },
    });

    if (!client) {
      return { success: false as const, error: "Client not found" };
    }

    const communications = await prisma.clientCommunication.findMany({
      where: {
        clientId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.direction && { direction: filters.direction }),
        ...(filters?.fromDate && { createdAt: { gte: filters.fromDate } }),
        ...(filters?.toDate && { createdAt: { lte: filters.toDate } }),
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit,
    });

    return { success: true as const, data: communications };
  } catch (error) {
    console.error("[ClientCommunication] Error fetching communications:", error);
    return { success: false as const, error: "Failed to fetch communications" };
  }
}

/**
 * Get a single communication by ID
 */
export async function getCommunication(id: string) {
  try {
    const organizationId = await requireOrganizationId();

    const communication = await prisma.clientCommunication.findFirst({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            organizationId: true,
          },
        },
      },
    });

    if (!communication || communication.client.organizationId !== organizationId) {
      return { success: false as const, error: "Communication not found" };
    }

    return { success: true as const, data: communication };
  } catch (error) {
    console.error("[ClientCommunication] Error fetching communication:", error);
    return { success: false as const, error: "Failed to fetch communication" };
  }
}

/**
 * Log a new communication with a client
 */
export async function createCommunication(
  input: CreateCommunicationInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, organizationId },
      select: { id: true },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    const communication = await prisma.clientCommunication.create({
      data: {
        clientId: input.clientId,
        type: input.type,
        direction: input.direction,
        subject: input.subject,
        content: input.content,
        sentAt: input.sentAt,
        createdById: userId,
        bookingId: input.bookingId,
        projectId: input.projectId,
        invoiceId: input.invoiceId,
      },
    });

    // Update client's last activity
    await prisma.client.update({
      where: { id: input.clientId },
      data: { lastActivityAt: new Date() },
    });

    revalidatePath(`/clients/${input.clientId}`);

    return { success: true, data: { id: communication.id } };
  } catch (error) {
    console.error("[ClientCommunication] Error creating communication:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to log communication" };
  }
}

/**
 * Update an existing communication
 */
export async function updateCommunication(
  input: UpdateCommunicationInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get communication with client to verify organization
    const existing = await prisma.clientCommunication.findFirst({
      where: { id: input.id },
      include: {
        client: {
          select: { organizationId: true, id: true },
        },
      },
    });

    if (!existing || existing.client.organizationId !== organizationId) {
      return { success: false, error: "Communication not found" };
    }

    const { id, ...updateData } = input;

    const communication = await prisma.clientCommunication.update({
      where: { id },
      data: {
        ...(updateData.subject !== undefined && { subject: updateData.subject }),
        ...(updateData.content !== undefined && { content: updateData.content }),
        ...(updateData.sentAt && { sentAt: updateData.sentAt }),
        ...(updateData.readAt && { readAt: updateData.readAt }),
      },
    });

    revalidatePath(`/clients/${existing.client.id}`);

    return { success: true, data: { id: communication.id } };
  } catch (error) {
    console.error("[ClientCommunication] Error updating communication:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update communication" };
  }
}

/**
 * Delete a communication
 */
export async function deleteCommunication(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Get communication with client to verify organization
    const existing = await prisma.clientCommunication.findFirst({
      where: { id },
      include: {
        client: {
          select: { organizationId: true, id: true },
        },
      },
    });

    if (!existing || existing.client.organizationId !== organizationId) {
      return { success: false, error: "Communication not found" };
    }

    await prisma.clientCommunication.delete({
      where: { id },
    });

    revalidatePath(`/clients/${existing.client.id}`);

    return ok();
  } catch (error) {
    console.error("[ClientCommunication] Error deleting communication:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete communication" };
  }
}

// =============================================================================
// Quick Actions
// =============================================================================

/**
 * Log a quick note for a client
 */
export async function addClientNote(
  clientId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  return createCommunication({
    clientId,
    type: "note",
    direction: "internal",
    content,
  });
}

/**
 * Log an email that was sent to a client
 */
export async function logEmailSent(
  clientId: string,
  subject: string,
  content: string,
  relatedTo?: { bookingId?: string; projectId?: string; invoiceId?: string }
): Promise<ActionResult<{ id: string }>> {
  return createCommunication({
    clientId,
    type: "email",
    direction: "outbound",
    subject,
    content,
    sentAt: new Date(),
    ...(relatedTo?.bookingId && { bookingId: relatedTo.bookingId }),
    ...(relatedTo?.projectId && { projectId: relatedTo.projectId }),
    ...(relatedTo?.invoiceId && { invoiceId: relatedTo.invoiceId }),
  });
}

/**
 * Log a phone call with a client
 */
export async function logPhoneCall(
  clientId: string,
  direction: "inbound" | "outbound",
  notes: string,
  subject?: string
): Promise<ActionResult<{ id: string }>> {
  return createCommunication({
    clientId,
    type: "call",
    direction,
    subject: subject || `Phone call (${direction})`,
    content: notes,
  });
}

/**
 * Log a meeting with a client
 */
export async function logMeeting(
  clientId: string,
  subject: string,
  notes: string,
  bookingId?: string
): Promise<ActionResult<{ id: string }>> {
  return createCommunication({
    clientId,
    type: "meeting",
    direction: "internal",
    subject,
    content: notes,
    bookingId,
  });
}

// =============================================================================
// Analytics
// =============================================================================

/**
 * Get communication stats for a client
 */
export async function getClientCommunicationStats(clientId: string) {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
      select: { id: true },
    });

    if (!client) {
      return { success: false as const, error: "Client not found" };
    }

    // Get counts by type
    const [totalCount, emailCount, callCount, meetingCount, noteCount, lastCommunication] = await Promise.all([
      prisma.clientCommunication.count({ where: { clientId } }),
      prisma.clientCommunication.count({ where: { clientId, type: "email" } }),
      prisma.clientCommunication.count({ where: { clientId, type: "call" } }),
      prisma.clientCommunication.count({ where: { clientId, type: "meeting" } }),
      prisma.clientCommunication.count({ where: { clientId, type: "note" } }),
      prisma.clientCommunication.findFirst({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, type: true },
      }),
    ]);

    return {
      success: true as const,
      data: {
        total: totalCount,
        byType: {
          email: emailCount,
          call: callCount,
          meeting: meetingCount,
          note: noteCount,
        },
        lastCommunication: lastCommunication
          ? {
              date: lastCommunication.createdAt,
              type: lastCommunication.type,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("[ClientCommunication] Error fetching stats:", error);
    return { success: false as const, error: "Failed to fetch communication stats" };
  }
}

/**
 * Get recent communications across all clients
 */
export async function getRecentCommunications(limit: number = 10) {
  try {
    const organizationId = await requireOrganizationId();

    const communications = await prisma.clientCommunication.findMany({
      where: {
        client: {
          organizationId,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { success: true as const, data: communications };
  } catch (error) {
    console.error("[ClientCommunication] Error fetching recent communications:", error);
    return { success: false as const, error: "Failed to fetch recent communications" };
  }
}

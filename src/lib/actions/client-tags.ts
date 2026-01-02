"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";

// =============================================================================
// Types
// =============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateTagInput {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagInput {
  id: string;
  name?: string;
  color?: string;
  description?: string;
}

// =============================================================================
// Tag CRUD Actions
// =============================================================================

/**
 * Get all tags for the organization
 */
export async function getClientTags() {
  try {
    const organizationId = await requireOrganizationId();

    const tags = await prisma.clientTag.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { clients: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true as const,
      data: tags.map((tag) => ({
        ...tag,
        clientCount: tag._count.clients,
      })),
    };
  } catch (error) {
    console.error("[ClientTags] Error fetching tags:", error);
    return { success: false as const, error: "Failed to fetch tags" };
  }
}

/**
 * Get a single tag by ID with its clients
 */
export async function getClientTag(id: string) {
  try {
    const organizationId = await requireOrganizationId();

    const tag = await prisma.clientTag.findFirst({
      where: { id, organizationId },
      include: {
        clients: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                company: true,
                industry: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      return { success: false as const, error: "Tag not found" };
    }

    return {
      success: true as const,
      data: {
        ...tag,
        clients: tag.clients.map((c) => c.client),
      },
    };
  } catch (error) {
    console.error("[ClientTags] Error fetching tag:", error);
    return { success: false as const, error: "Failed to fetch tag" };
  }
}

/**
 * Create a new tag
 */
export async function createClientTag(
  input: CreateTagInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Check for duplicate name
    const existing = await prisma.clientTag.findFirst({
      where: {
        organizationId,
        name: { equals: input.name, mode: "insensitive" },
      },
    });

    if (existing) {
      return { success: false, error: "A tag with this name already exists" };
    }

    const tag = await prisma.clientTag.create({
      data: {
        organizationId,
        name: input.name,
        color: input.color || "#6366f1",
        description: input.description,
      },
    });

    revalidatePath("/clients");
    revalidatePath("/settings/tags");

    return { success: true, data: { id: tag.id } };
  } catch (error) {
    console.error("[ClientTags] Error creating tag:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create tag" };
  }
}

/**
 * Update an existing tag
 */
export async function updateClientTag(
  input: UpdateTagInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify tag exists and belongs to organization
    const existing = await prisma.clientTag.findFirst({
      where: { id: input.id, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Tag not found" };
    }

    // Check for duplicate name if name is being changed
    if (input.name && input.name !== existing.name) {
      const duplicate = await prisma.clientTag.findFirst({
        where: {
          organizationId,
          name: { equals: input.name, mode: "insensitive" },
          id: { not: input.id },
        },
      });

      if (duplicate) {
        return { success: false, error: "A tag with this name already exists" };
      }
    }

    const { id, ...updateData } = input;

    const tag = await prisma.clientTag.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.color && { color: updateData.color }),
        ...(updateData.description !== undefined && { description: updateData.description }),
      },
    });

    revalidatePath("/clients");
    revalidatePath("/settings/tags");

    return { success: true, data: { id: tag.id } };
  } catch (error) {
    console.error("[ClientTags] Error updating tag:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update tag" };
  }
}

/**
 * Delete a tag
 */
export async function deleteClientTag(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify tag exists and belongs to organization
    const existing = await prisma.clientTag.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Tag not found" };
    }

    // Delete tag (cascade will remove assignments)
    await prisma.clientTag.delete({
      where: { id },
    });

    revalidatePath("/clients");
    revalidatePath("/settings/tags");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ClientTags] Error deleting tag:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete tag" };
  }
}

// =============================================================================
// Tag Assignment Actions
// =============================================================================

/**
 * Get tags for a specific client
 */
export async function getTagsForClient(clientId: string) {
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

    const assignments = await prisma.clientTagAssignment.findMany({
      where: { clientId },
      include: {
        tag: true,
      },
    });

    return {
      success: true as const,
      data: assignments.map((a) => a.tag),
    };
  } catch (error) {
    console.error("[ClientTags] Error fetching client tags:", error);
    return { success: false as const, error: "Failed to fetch client tags" };
  }
}

/**
 * Assign a tag to a client
 */
export async function assignTagToClient(
  clientId: string,
  tagId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
      select: { id: true },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Verify tag belongs to organization
    const tag = await prisma.clientTag.findFirst({
      where: { id: tagId, organizationId },
      select: { id: true },
    });

    if (!tag) {
      return { success: false, error: "Tag not found" };
    }

    // Check if already assigned
    const existing = await prisma.clientTagAssignment.findFirst({
      where: { clientId, tagId },
    });

    if (existing) {
      return { success: true, data: { id: existing.id } };
    }

    const assignment = await prisma.clientTagAssignment.create({
      data: {
        clientId,
        tagId,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");

    return { success: true, data: { id: assignment.id } };
  } catch (error) {
    console.error("[ClientTags] Error assigning tag:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to assign tag" };
  }
}

/**
 * Remove a tag from a client
 */
export async function removeTagFromClient(
  clientId: string,
  tagId: string
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
      select: { id: true },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Find and delete the assignment
    const assignment = await prisma.clientTagAssignment.findFirst({
      where: { clientId, tagId },
    });

    if (!assignment) {
      return { success: true, data: undefined }; // Already not assigned
    }

    await prisma.clientTagAssignment.delete({
      where: { id: assignment.id },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ClientTags] Error removing tag:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove tag" };
  }
}

/**
 * Set all tags for a client (replaces existing tags)
 */
export async function setClientTags(
  clientId: string,
  tagIds: string[]
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
      select: { id: true },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Verify all tags belong to organization
    const tags = await prisma.clientTag.findMany({
      where: {
        id: { in: tagIds },
        organizationId,
      },
      select: { id: true },
    });

    const validTagIds = tags.map((t) => t.id);

    // Use transaction to replace all tags
    await prisma.$transaction([
      // Delete existing assignments
      prisma.clientTagAssignment.deleteMany({
        where: { clientId },
      }),
      // Create new assignments
      ...validTagIds.map((tagId) =>
        prisma.clientTagAssignment.create({
          data: { clientId, tagId },
        })
      ),
    ]);

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ClientTags] Error setting tags:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set client tags" };
  }
}

// =============================================================================
// Bulk Actions
// =============================================================================

/**
 * Add a tag to multiple clients
 */
export async function bulkAssignTag(
  clientIds: string[],
  tagId: string
): Promise<ActionResult<{ assignedCount: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify tag belongs to organization
    const tag = await prisma.clientTag.findFirst({
      where: { id: tagId, organizationId },
      select: { id: true },
    });

    if (!tag) {
      return { success: false, error: "Tag not found" };
    }

    // Verify all clients belong to organization
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        organizationId,
      },
      select: { id: true },
    });

    const validClientIds = clients.map((c) => c.id);

    // Get existing assignments to avoid duplicates
    const existingAssignments = await prisma.clientTagAssignment.findMany({
      where: {
        clientId: { in: validClientIds },
        tagId,
      },
      select: { clientId: true },
    });

    const existingClientIds = new Set(existingAssignments.map((a) => a.clientId));
    const newClientIds = validClientIds.filter((id) => !existingClientIds.has(id));

    // Create new assignments
    await prisma.clientTagAssignment.createMany({
      data: newClientIds.map((clientId) => ({
        clientId,
        tagId,
      })),
    });

    revalidatePath("/clients");

    return { success: true, data: { assignedCount: newClientIds.length } };
  } catch (error) {
    console.error("[ClientTags] Error bulk assigning tag:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to assign tag to clients" };
  }
}

/**
 * Remove a tag from multiple clients
 */
export async function bulkRemoveTag(
  clientIds: string[],
  tagId: string
): Promise<ActionResult<{ removedCount: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify tag belongs to organization
    const tag = await prisma.clientTag.findFirst({
      where: { id: tagId, organizationId },
      select: { id: true },
    });

    if (!tag) {
      return { success: false, error: "Tag not found" };
    }

    // Verify all clients belong to organization
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        organizationId,
      },
      select: { id: true },
    });

    const validClientIds = clients.map((c) => c.id);

    // Delete assignments
    const result = await prisma.clientTagAssignment.deleteMany({
      where: {
        clientId: { in: validClientIds },
        tagId,
      },
    });

    revalidatePath("/clients");

    return { success: true, data: { removedCount: result.count } };
  } catch (error) {
    console.error("[ClientTags] Error bulk removing tag:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove tag from clients" };
  }
}

// =============================================================================
// Search & Filter
// =============================================================================

/**
 * Get clients by tag
 */
export async function getClientsByTag(tagId: string) {
  try {
    const organizationId = await requireOrganizationId();

    // Verify tag belongs to organization
    const tag = await prisma.clientTag.findFirst({
      where: { id: tagId, organizationId },
      select: { id: true, name: true },
    });

    if (!tag) {
      return { success: false as const, error: "Tag not found" };
    }

    const assignments = await prisma.clientTagAssignment.findMany({
      where: { tagId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            industry: true,
            lifetimeRevenueCents: true,
            totalProjects: true,
            isVIP: true,
          },
        },
      },
    });

    return {
      success: true as const,
      data: {
        tag,
        clients: assignments.map((a) => a.client),
      },
    };
  } catch (error) {
    console.error("[ClientTags] Error fetching clients by tag:", error);
    return { success: false as const, error: "Failed to fetch clients" };
  }
}

/**
 * Get clients by multiple tags (AND logic - must have all tags)
 */
export async function getClientsByTags(tagIds: string[]) {
  try {
    const organizationId = await requireOrganizationId();

    if (tagIds.length === 0) {
      return { success: false as const, error: "No tags specified" };
    }

    // Verify tags belong to organization
    const tags = await prisma.clientTag.findMany({
      where: {
        id: { in: tagIds },
        organizationId,
      },
      select: { id: true },
    });

    if (tags.length !== tagIds.length) {
      return { success: false as const, error: "Some tags not found" };
    }

    // Find clients that have ALL specified tags
    const clients = await prisma.client.findMany({
      where: {
        organizationId,
        AND: tagIds.map((tagId) => ({
          tags: {
            some: { tagId },
          },
        })),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        industry: true,
        lifetimeRevenueCents: true,
        totalProjects: true,
        isVIP: true,
      },
    });

    return { success: true as const, data: clients };
  } catch (error) {
    console.error("[ClientTags] Error fetching clients by tags:", error);
    return { success: false as const, error: "Failed to fetch clients" };
  }
}

// =============================================================================
// Preset Tags
// =============================================================================

/**
 * Create default starter tags for a new organization
 */
export async function createDefaultTags(): Promise<ActionResult<{ count: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    const defaultTags = [
      { name: "VIP", color: "#eab308", description: "High-value clients requiring priority service" },
      { name: "Repeat Client", color: "#22c55e", description: "Clients who have booked multiple times" },
      { name: "Referral Source", color: "#3b82f6", description: "Clients who refer other clients" },
      { name: "Follow Up", color: "#f97316", description: "Clients needing follow-up" },
      { name: "New Lead", color: "#8b5cf6", description: "Potential clients not yet converted" },
    ];

    // Check which tags already exist
    const existingTags = await prisma.clientTag.findMany({
      where: {
        organizationId,
        name: { in: defaultTags.map((t) => t.name) },
      },
      select: { name: true },
    });

    const existingNames = new Set(existingTags.map((t) => t.name));
    const newTags = defaultTags.filter((t) => !existingNames.has(t.name));

    if (newTags.length === 0) {
      return { success: true, data: { count: 0 } };
    }

    await prisma.clientTag.createMany({
      data: newTags.map((tag) => ({
        organizationId,
        ...tag,
      })),
    });

    revalidatePath("/clients");
    revalidatePath("/settings/tags");

    return { success: true, data: { count: newTags.length } };
  } catch (error) {
    console.error("[ClientTags] Error creating default tags:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create default tags" };
  }
}

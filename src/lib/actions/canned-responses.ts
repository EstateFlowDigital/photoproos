"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CannedResponseCategory } from "@prisma/client";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

export interface CannedResponseInput {
  title: string;
  content: string;
  shortcut?: string;
  category?: CannedResponseCategory;
  isPersonal?: boolean; // If true, only visible to this user
}

export interface UpdateCannedResponseInput {
  title?: string;
  content?: string;
  shortcut?: string;
  category?: CannedResponseCategory;
  isActive?: boolean;
  order?: number;
}

export interface CannedResponseWithUser {
  id: string;
  organizationId: string;
  userId: string | null;
  title: string;
  content: string;
  shortcut: string | null;
  category: CannedResponseCategory;
  isActive: boolean;
  order: number;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all canned responses for the organization
 * Includes both org-wide and personal responses for the current user
 */
export async function getCannedResponses(options?: {
  category?: CannedResponseCategory;
  includeInactive?: boolean;
}): Promise<ActionResult<CannedResponseWithUser[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const responses = await prisma.cannedResponse.findMany({
      where: {
        organizationId,
        ...(options?.includeInactive ? {} : { isActive: true }),
        ...(options?.category ? { category: options.category } : {}),
        OR: [
          { userId: null }, // Org-wide responses
          { userId }, // Personal responses for this user
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { category: "asc" },
        { order: "asc" },
        { usageCount: "desc" },
      ],
    });

    return success(responses);
  } catch (error) {
    console.error("Failed to get canned responses:", error);
    return fail("Failed to get canned responses");
  }
}

/**
 * Get canned responses by category for quick access
 */
export async function getCannedResponsesByCategory(
  category: CannedResponseCategory
): Promise<ActionResult<CannedResponseWithUser[]>> {
  return getCannedResponses({ category });
}

/**
 * Search canned responses by title or content
 */
export async function searchCannedResponses(
  query: string
): Promise<ActionResult<CannedResponseWithUser[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const responses = await prisma.cannedResponse.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { userId: null },
          { userId },
        ],
        AND: [
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
              { shortcut: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { usageCount: "desc" },
        { lastUsedAt: "desc" },
      ],
      take: 10,
    });

    return success(responses);
  } catch (error) {
    console.error("Failed to search canned responses:", error);
    return fail("Failed to search canned responses");
  }
}

/**
 * Get a single canned response by ID
 */
export async function getCannedResponse(
  id: string
): Promise<ActionResult<CannedResponseWithUser>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const response = await prisma.cannedResponse.findFirst({
      where: {
        id,
        organizationId,
        OR: [
          { userId: null },
          { userId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!response) {
      return fail("Canned response not found");
    }

    return success(response);
  } catch (error) {
    console.error("Failed to get canned response:", error);
    return fail("Failed to get canned response");
  }
}

/**
 * Create a new canned response
 */
export async function createCannedResponse(
  input: CannedResponseInput
): Promise<ActionResult<CannedResponseWithUser>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Validate shortcut uniqueness if provided
    if (input.shortcut) {
      const existing = await prisma.cannedResponse.findFirst({
        where: {
          organizationId,
          shortcut: input.shortcut,
          isActive: true,
          OR: [
            { userId: null },
            { userId },
          ],
        },
      });

      if (existing) {
        return fail(`Shortcut "${input.shortcut}" is already in use`);
      }
    }

    // Get max order for this category
    const maxOrder = await prisma.cannedResponse.aggregate({
      where: {
        organizationId,
        category: input.category || "general",
      },
      _max: { order: true },
    });

    const response = await prisma.cannedResponse.create({
      data: {
        organizationId,
        userId: input.isPersonal ? userId : null,
        title: input.title,
        content: input.content,
        shortcut: input.shortcut || null,
        category: input.category || "general",
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/messages");
    revalidatePath("/settings/canned-responses");

    return success(response);
  } catch (error) {
    console.error("Failed to create canned response:", error);
    return fail("Failed to create canned response");
  }
}

/**
 * Update a canned response
 */
export async function updateCannedResponse(
  id: string,
  input: UpdateCannedResponseInput
): Promise<ActionResult<CannedResponseWithUser>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Check if user can edit this response
    const existing = await prisma.cannedResponse.findFirst({
      where: {
        id,
        organizationId,
        OR: [
          { userId: null }, // Org-wide (anyone can edit)
          { userId }, // Personal (only owner can edit)
        ],
      },
    });

    if (!existing) {
      return fail("Canned response not found or you don't have permission to edit it");
    }

    // Validate shortcut uniqueness if being updated
    if (input.shortcut && input.shortcut !== existing.shortcut) {
      const shortcutExists = await prisma.cannedResponse.findFirst({
        where: {
          organizationId,
          shortcut: input.shortcut,
          isActive: true,
          id: { not: id },
          OR: [
            { userId: null },
            { userId },
          ],
        },
      });

      if (shortcutExists) {
        return fail(`Shortcut "${input.shortcut}" is already in use`);
      }
    }

    const response = await prisma.cannedResponse.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.shortcut !== undefined && { shortcut: input.shortcut || null }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.order !== undefined && { order: input.order }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/messages");
    revalidatePath("/settings/canned-responses");

    return success(response);
  } catch (error) {
    console.error("Failed to update canned response:", error);
    return fail("Failed to update canned response");
  }
}

/**
 * Delete a canned response
 */
export async function deleteCannedResponse(
  id: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Check if user can delete this response
    const existing = await prisma.cannedResponse.findFirst({
      where: {
        id,
        organizationId,
        OR: [
          { userId: null },
          { userId },
        ],
      },
    });

    if (!existing) {
      return fail("Canned response not found or you don't have permission to delete it");
    }

    await prisma.cannedResponse.delete({
      where: { id },
    });

    revalidatePath("/messages");
    revalidatePath("/settings/canned-responses");

    return ok(undefined);
  } catch (error) {
    console.error("Failed to delete canned response:", error);
    return fail("Failed to delete canned response");
  }
}

/**
 * Record usage of a canned response (for analytics and sorting)
 */
export async function recordCannedResponseUsage(
  id: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.cannedResponse.updateMany({
      where: {
        id,
        organizationId,
      },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return ok(undefined);
  } catch (error) {
    console.error("Failed to record canned response usage:", error);
    return fail("Failed to record usage");
  }
}

/**
 * Reorder canned responses within a category
 */
export async function reorderCannedResponses(
  orderedIds: string[]
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Update order for each response
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.cannedResponse.updateMany({
          where: {
            id,
            organizationId,
          },
          data: {
            order: index,
          },
        })
      )
    );

    revalidatePath("/settings/canned-responses");

    return ok(undefined);
  } catch (error) {
    console.error("Failed to reorder canned responses:", error);
    return fail("Failed to reorder canned responses");
  }
}

/**
 * Duplicate a canned response
 */
export async function duplicateCannedResponse(
  id: string,
  asPersonal?: boolean
): Promise<ActionResult<CannedResponseWithUser>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const original = await prisma.cannedResponse.findFirst({
      where: {
        id,
        organizationId,
        OR: [
          { userId: null },
          { userId },
        ],
      },
    });

    if (!original) {
      return fail("Canned response not found");
    }

    // Get max order for the category
    const maxOrder = await prisma.cannedResponse.aggregate({
      where: {
        organizationId,
        category: original.category,
      },
      _max: { order: true },
    });

    const duplicate = await prisma.cannedResponse.create({
      data: {
        organizationId,
        userId: asPersonal ? userId : null,
        title: `${original.title} (Copy)`,
        content: original.content,
        shortcut: null, // Don't copy shortcut to avoid conflicts
        category: original.category,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/settings/canned-responses");

    return success(duplicate);
  } catch (error) {
    console.error("Failed to duplicate canned response:", error);
    return fail("Failed to duplicate canned response");
  }
}

// =============================================================================
// Seed Data Helper
// =============================================================================

/**
 * Seed default canned responses for a new organization
 * Called during organization onboarding
 */
export async function seedDefaultCannedResponses(
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const defaultResponses: Array<{
      title: string;
      content: string;
      category: CannedResponseCategory;
      shortcut?: string;
    }> = [
      // Greeting Templates
      {
        title: "Welcome Inquiry",
        content:
          "Hi {name}! Thank you for reaching out about photography services. I'd love to learn more about your project. Could you share some details about what you're looking for and your timeline?",
        category: "greeting",
        shortcut: "/welcome",
      },
      {
        title: "Thank You for Booking",
        content:
          "Thank you so much for booking with me! I'm excited to work with you on this project. I'll be sending over the contract and invoice shortly. In the meantime, please let me know if you have any questions.",
        category: "greeting",
        shortcut: "/thanks",
      },

      // Booking Templates
      {
        title: "Booking Confirmation",
        content:
          "Great news! Your session is confirmed for {date}. Here's what to expect:\n\n• Arrive 10 minutes early\n• Wear solid colors (avoid busy patterns)\n• I'll have everything set up and ready\n\nSee you soon!",
        category: "booking",
        shortcut: "/confirm",
      },
      {
        title: "Session Reminder",
        content:
          "Just a friendly reminder that your photography session is coming up on {date}. Please let me know if you have any last-minute questions or need to make any changes.",
        category: "booking",
        shortcut: "/remind",
      },

      // Pricing Templates
      {
        title: "Pricing Information",
        content:
          "Thank you for your interest! Here's an overview of my packages:\n\n{packages}\n\nAll packages include professional editing and an online gallery. Would you like more details about any specific package?",
        category: "pricing",
        shortcut: "/pricing",
      },
      {
        title: "Custom Quote",
        content:
          "Based on your requirements, I've put together a custom quote for your project. The total investment would be {amount}. This includes:\n\n{details}\n\nLet me know if you'd like to proceed or have any questions!",
        category: "pricing",
        shortcut: "/quote",
      },

      // Scheduling Templates
      {
        title: "Availability Check",
        content:
          "I'd be happy to check my availability! What dates work best for you? I typically have openings on {days}. Let me know your preferences and I'll send you some options.",
        category: "scheduling",
        shortcut: "/avail",
      },
      {
        title: "Reschedule Request",
        content:
          "No problem at all! I understand things come up. Let's find a new date that works for you. I have openings on:\n\n{available_dates}\n\nWhich of these works best for you?",
        category: "scheduling",
        shortcut: "/resched",
      },

      // Delivery Templates
      {
        title: "Gallery Ready",
        content:
          "Exciting news! Your gallery is ready to view! You can access it here: {gallery_link}\n\nThe gallery includes all edited photos from your session. Let me know your favorites!",
        category: "delivery",
        shortcut: "/ready",
      },
      {
        title: "Delivery Timeline",
        content:
          "Great question! Here's my typical turnaround:\n\n• Sneak peeks: 24-48 hours\n• Full gallery: 1-2 weeks\n• Rush delivery available upon request\n\nI'll keep you updated on the progress!",
        category: "delivery",
        shortcut: "/timeline",
      },

      // Follow-up Templates
      {
        title: "Check-in",
        content:
          "Hi {name}! I wanted to check in and see if you had any questions about the gallery or if there's anything else I can help you with. Looking forward to hearing from you!",
        category: "follow_up",
        shortcut: "/checkin",
      },
      {
        title: "Review Request",
        content:
          "Hi {name}! I hope you're enjoying your photos! If you have a moment, I'd be so grateful if you could leave a review. It really helps others find my work. Here's the link: {review_link}\n\nThank you so much!",
        category: "follow_up",
        shortcut: "/review",
      },

      // Objection Handling
      {
        title: "Budget Discussion",
        content:
          "I completely understand budget is an important factor. I offer a range of packages to fit different needs. Would you like me to walk you through some options that might work better for your budget?",
        category: "objection",
        shortcut: "/budget",
      },

      // Support Templates
      {
        title: "Technical Help",
        content:
          "I'm sorry you're having trouble! Could you tell me a bit more about what you're experiencing? I'd be happy to help troubleshoot or walk you through the process step by step.",
        category: "support",
        shortcut: "/help",
      },
    ];

    // Create all default responses
    await prisma.cannedResponse.createMany({
      data: defaultResponses.map((response, index) => ({
        organizationId,
        userId: null, // Org-wide
        title: response.title,
        content: response.content,
        category: response.category,
        shortcut: response.shortcut || null,
        order: index,
        isActive: true,
      })),
    });

    return ok(undefined);
  } catch (error) {
    console.error("Failed to seed default canned responses:", error);
    return fail("Failed to seed default canned responses");
  }
}

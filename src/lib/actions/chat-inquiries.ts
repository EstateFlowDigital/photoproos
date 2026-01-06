"use server";

import { ok, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Submit a chat inquiry from the marketing website (public, no auth required)
 */
export async function submitChatInquiry(input: {
  name?: string;
  email?: string;
  message: string;
  category?: string;
  pageUrl?: string;
}): Promise<VoidActionResult> {
  try {
    // Validate required fields
    if (!input.message?.trim()) {
      return { success: false, error: "Message is required" };
    }

    // Validate email format if provided
    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        return { success: false, error: "Invalid email address" };
      }
    }

    // Determine category from message if not provided
    let category = input.category;
    if (!category) {
      const message = input.message.toLowerCase();
      if (message.includes("pricing") || message.includes("price") || message.includes("cost")) {
        category = "pricing";
      } else if (message.includes("feature") || message.includes("can you") || message.includes("does it")) {
        category = "features";
      } else if (message.includes("trial") || message.includes("free") || message.includes("demo")) {
        category = "trial";
      } else {
        category = "other";
      }
    }

    // Create the chat inquiry
    await prisma.websiteChatInquiry.create({
      data: {
        name: input.name?.trim() || null,
        email: input.email?.trim().toLowerCase() || null,
        message: input.message.trim(),
        category,
        pageUrl: input.pageUrl || null,
        source: "marketing_website",
        status: "new",
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error submitting chat inquiry:", error);
    return { success: false, error: "Failed to submit message" };
  }
}

/**
 * Get all chat inquiries (admin dashboard)
 * Note: This requires super-admin access in production
 */
export async function getChatInquiries(filters?: {
  status?: string;
  category?: string;
}) {
  // In production, this should check for super-admin access
  // For now, just require auth
  await requireAuth();

  return prisma.websiteChatInquiry.findMany({
    where: {
      ...(filters?.status && { status: filters.status as "new" | "contacted" | "qualified" | "closed" }),
      ...(filters?.category && { category: filters.category }),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

/**
 * Update chat inquiry status
 */
export async function updateChatInquiryStatus(
  inquiryId: string,
  status: "new" | "contacted" | "qualified" | "closed",
  notes?: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();

    await prisma.websiteChatInquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        ...(notes !== undefined && { notes }),
      },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/leads");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating chat inquiry status:", error);
    return { success: false, error: "Failed to update inquiry" };
  }
}

/**
 * Convert a chat inquiry to a client
 * Note: Chat inquiries may not have email, so this requires email
 */
export async function convertChatInquiryToClient(
  inquiryId: string,
  additionalData?: {
    email?: string; // Can override if inquiry had no email
    company?: string;
    industry?: string;
    notes?: string;
  }
): Promise<{ success: boolean; clientId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get the inquiry
    const inquiry = await prisma.websiteChatInquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      return { success: false, error: "Inquiry not found" };
    }

    // Determine email to use
    const email = additionalData?.email || inquiry.email;
    if (!email) {
      return { success: false, error: "Email is required to create a client" };
    }

    // Check if client with this email already exists
    const existingClient = await prisma.client.findFirst({
      where: {
        organizationId,
        email,
      },
    });

    if (existingClient) {
      // Update inquiry to closed
      await prisma.websiteChatInquiry.update({
        where: { id: inquiryId },
        data: {
          status: "closed",
          notes: `${inquiry.notes || ""}\n[Converted] Client already exists (ID: ${existingClient.id})`.trim(),
        },
      });

      revalidatePath("/leads");
      revalidatePath("/clients");
      return { success: true, clientId: existingClient.id };
    }

    // Create new client
    const client = await prisma.client.create({
      data: {
        organizationId,
        email,
        fullName: inquiry.name || "Unknown",
        phone: inquiry.phone,
        company: additionalData?.company,
        industry: (additionalData?.industry as "real_estate" | "wedding" | "portrait" | "commercial" | "architecture" | "food_hospitality" | "events" | "headshots" | "product" | "other") || "other",
        notes: additionalData?.notes || `Converted from website chat inquiry`,
        source: "chat_inquiry",
      },
    });

    // Update inquiry to closed
    await prisma.websiteChatInquiry.update({
      where: { id: inquiryId },
      data: {
        status: "closed",
        notes: `${inquiry.notes || ""}\n[Converted to client on ${new Date().toLocaleDateString()}]`.trim(),
      },
    });

    // Log activity
    const { logActivity } = await import("@/lib/utils/activity");
    await logActivity({
      organizationId,
      type: "client_added",
      description: `Client "${inquiry.name || email}" was created from chat inquiry`,
      clientId: client.id,
    });

    revalidatePath("/leads");
    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return { success: true, clientId: client.id };
  } catch (error) {
    console.error("Error converting chat inquiry to client:", error);
    return { success: false, error: "Failed to convert inquiry to client" };
  }
}

/**
 * Get inquiry counts by status (for dashboard stats)
 */
export async function getChatInquiryStats() {
  await requireAuth();

  const [total, newCount, contactedCount, qualifiedCount] = await Promise.all([
    prisma.websiteChatInquiry.count(),
    prisma.websiteChatInquiry.count({ where: { status: "new" } }),
    prisma.websiteChatInquiry.count({ where: { status: "contacted" } }),
    prisma.websiteChatInquiry.count({ where: { status: "qualified" } }),
  ]);

  return {
    total,
    new: newCount,
    contacted: contactedCount,
    qualified: qualifiedCount,
  };
}

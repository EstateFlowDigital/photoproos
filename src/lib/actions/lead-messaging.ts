"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/resend";
import { LeadMessageNotificationEmail } from "@/emails/lead-message-notification";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface MessageLeadInput {
  leadType: "portfolio" | "chat" | "booking";
  leadId: string;
  message: string;
  subject?: string;
}

interface MessageLeadResult {
  conversationId: string;
  clientId: string;
  messageId: string;
}

// Magic link expires in 24 hours for lead messages
const MAGIC_LINK_EXPIRY_HOURS = 24;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get lead information based on type
 */
async function getLeadInfo(
  leadType: MessageLeadInput["leadType"],
  leadId: string,
  organizationId: string
): Promise<{
  email: string;
  name: string;
  phone?: string | null;
} | null> {
  switch (leadType) {
    case "portfolio": {
      const inquiry = await prisma.portfolioInquiry.findFirst({
        where: { id: leadId },
        include: {
          portfolioWebsite: {
            select: { organizationId: true },
          },
        },
      });
      if (inquiry?.portfolioWebsite.organizationId !== organizationId) return null;
      return {
        email: inquiry.email,
        name: inquiry.name || "Guest",
        phone: inquiry.phone,
      };
    }
    case "chat": {
      const inquiry = await prisma.websiteChatInquiry.findFirst({
        where: { id: leadId, organizationId },
      });
      if (!inquiry) return null;
      return {
        email: inquiry.email || "",
        name: inquiry.name || "Guest",
        phone: inquiry.phone,
      };
    }
    case "booking": {
      const submission = await prisma.bookingFormSubmission.findFirst({
        where: { id: leadId },
        include: {
          bookingForm: {
            select: { organizationId: true },
          },
        },
      });
      if (submission?.bookingForm.organizationId !== organizationId) return null;
      return {
        email: submission.clientEmail || "",
        name: submission.clientName || "Guest",
        phone: submission.clientPhone,
      };
    }
    default:
      return null;
  }
}

/**
 * Find or create a client for the lead
 */
async function findOrCreateClient(
  organizationId: string,
  email: string,
  name: string,
  phone?: string | null
): Promise<string> {
  // Check if client already exists
  const existingClient = await prisma.client.findFirst({
    where: {
      organizationId,
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });

  if (existingClient) {
    return existingClient.id;
  }

  // Create new client
  const newClient = await prisma.client.create({
    data: {
      organizationId,
      email: email.toLowerCase(),
      fullName: name,
      phone: phone || null,
      source: "lead_message", // Track that this client came from lead messaging
    },
  });

  return newClient.id;
}

/**
 * Create or find an existing conversation for the client
 */
async function findOrCreateConversation(
  organizationId: string,
  clientId: string,
  userId: string
): Promise<string> {
  // Check for existing client_support conversation
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      organizationId,
      type: "client_support",
      clientId,
    },
  });

  if (existingConversation) {
    return existingConversation.id;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      organizationId,
      type: "client_support",
      clientId,
      participants: {
        create: [
          {
            userId,
            role: "owner",
          },
          {
            clientId,
            role: "member",
          },
        ],
      },
    },
  });

  return conversation.id;
}

/**
 * Generate a magic link for the client
 */
async function generateMagicLink(
  clientId: string,
  conversationId: string
): Promise<string> {
  // Generate a secure token
  const token = randomBytes(32).toString("hex");

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + MAGIC_LINK_EXPIRY_HOURS);

  // Delete any existing sessions
  await prisma.clientSession.deleteMany({
    where: { clientId },
  });

  // Create a new session with the magic link token
  await prisma.clientSession.create({
    data: {
      clientId,
      token,
      expiresAt,
    },
  });

  // Build the magic link URL with conversation redirect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/auth/client?token=${token}&redirect=/portal/messages/${conversationId}`;
}

// =============================================================================
// Server Actions
// =============================================================================

/**
 * Send a message to a lead
 * - Finds or creates a client record
 * - Creates a conversation if needed
 * - Sends the message
 * - Emails the lead with a magic link to respond
 */
export async function messageLeadAction(
  input: MessageLeadInput
): Promise<ActionResult<MessageLeadResult>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Get lead information
    const leadInfo = await getLeadInfo(input.leadType, input.leadId, organizationId);
    if (!leadInfo) {
      return fail("Lead not found");
    }

    if (!leadInfo.email) {
      return fail("Lead has no email address");
    }

    // Get organization and user info for email
    const [organization, user] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, logoUrl: true, primaryColor: true },
      }),
      prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: { fullName: true, email: true, avatarUrl: true },
      }),
    ]);

    if (!organization || !user) {
      return fail("Organization or user not found");
    }

    // Find or create client
    const clientId = await findOrCreateClient(
      organizationId,
      leadInfo.email,
      leadInfo.name,
      leadInfo.phone
    );

    // Find or create conversation
    const conversationId = await findOrCreateConversation(
      organizationId,
      clientId,
      userId
    );

    // Get the user's database ID for the message
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderUserId: dbUser?.id,
        senderName: user.fullName || "Team",
        senderAvatar: user.avatarUrl,
        content: input.message,
      },
    });

    // Update conversation's last message timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageId: message.id,
      },
    });

    // Generate magic link
    const magicLinkUrl = await generateMagicLink(clientId, conversationId);

    // Send email notification
    const emailResult = await sendEmail({
      to: leadInfo.email,
      subject: input.subject || `New message from ${organization.name}`,
      react: LeadMessageNotificationEmail({
        recipientName: leadInfo.name,
        senderName: user.fullName || "Team",
        senderCompany: organization.name,
        messagePreview: input.message.slice(0, 200) + (input.message.length > 200 ? "..." : ""),
        magicLinkUrl,
        logoUrl: organization.logoUrl || undefined,
        brandColor: organization.primaryColor || undefined,
      }),
    });

    if (!emailResult.success) {
      console.error("Failed to send lead notification email:", emailResult.error);
      // Don't fail the whole operation, the message was still sent
    }

    // Update lead status to contacted
    switch (input.leadType) {
      case "portfolio":
        await prisma.portfolioInquiry.update({
          where: { id: input.leadId },
          data: { status: "contacted" },
        });
        break;
      case "chat":
        await prisma.chatInquiry.update({
          where: { id: input.leadId },
          data: { status: "contacted" },
        });
        break;
      // Booking submissions don't have the same status field
    }

    revalidatePath("/leads");
    revalidatePath("/messages");

    return success({
      conversationId,
      clientId,
      messageId: message.id,
    });
  } catch (error) {
    console.error("Failed to message lead:", error);
    return fail("Failed to send message to lead");
  }
}

/**
 * Check if a lead has an existing conversation
 */
export async function getLeadConversation(
  leadType: MessageLeadInput["leadType"],
  leadId: string
): Promise<ActionResult<{ conversationId: string; clientId: string } | null>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get lead information
    const leadInfo = await getLeadInfo(leadType, leadId, organizationId);
    if (!leadInfo || !leadInfo.email) {
      return success(null);
    }

    // Find client
    const client = await prisma.client.findFirst({
      where: {
        organizationId,
        email: {
          equals: leadInfo.email,
          mode: "insensitive",
        },
      },
    });

    if (!client) {
      return success(null);
    }

    // Find conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        organizationId,
        type: "client_support",
        clientId: client.id,
      },
    });

    if (!conversation) {
      return success(null);
    }

    return success({
      conversationId: conversation.id,
      clientId: client.id,
    });
  } catch (error) {
    console.error("Failed to get lead conversation:", error);
    return fail("Failed to check for existing conversation");
  }
}

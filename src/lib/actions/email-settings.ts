"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ok } from "@/lib/types/action-result";

const emailSettingsSchema = z.object({
  emailSenderName: z.string().max(100).optional().nullable(),
  emailReplyTo: z.string().email().optional().nullable().or(z.literal("")),
  emailSignature: z.string().max(2000).optional().nullable(),
  enableQuestionnaireEmails: z.boolean(),
  enableDigestEmails: z.boolean(),
  digestEmailFrequency: z.enum(["daily", "weekly", "none"]),
  digestEmailTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
});

export type EmailSettings = z.infer<typeof emailSettingsSchema>;

/**
 * Get email settings for the current organization
 */
export async function getEmailSettings() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: {
        id: true,
        name: true,
        emailSenderName: true,
        emailReplyTo: true,
        emailSignature: true,
        enableQuestionnaireEmails: true,
        enableDigestEmails: true,
        digestEmailFrequency: true,
        digestEmailTime: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    return {
      success: true,
      settings: {
        emailSenderName: organization.emailSenderName || organization.name,
        emailReplyTo: organization.emailReplyTo,
        emailSignature: organization.emailSignature,
        enableQuestionnaireEmails: organization.enableQuestionnaireEmails,
        enableDigestEmails: organization.enableDigestEmails,
        digestEmailFrequency: organization.digestEmailFrequency || "daily",
        digestEmailTime: organization.digestEmailTime || "08:00",
      },
    };
  } catch (error) {
    console.error("Failed to get email settings:", error);
    return { success: false, error: "Failed to fetch email settings" };
  }
}

/**
 * Update email settings for the current organization
 */
export async function updateEmailSettings(data: EmailSettings) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Validate input
    const validated = emailSettingsSchema.parse(data);

    const organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        emailSenderName: validated.emailSenderName || null,
        emailReplyTo: validated.emailReplyTo || null,
        emailSignature: validated.emailSignature || null,
        enableQuestionnaireEmails: validated.enableQuestionnaireEmails,
        enableDigestEmails: validated.enableDigestEmails,
        digestEmailFrequency: validated.digestEmailFrequency,
        digestEmailTime: validated.digestEmailTime || "08:00",
      },
    });

    revalidatePath("/settings/email");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Failed to update email settings:", error);
    return { success: false, error: "Failed to update email settings" };
  }
}

/**
 * Send a test email to verify settings
 */
export async function sendTestEmail(toEmail: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: {
        name: true,
        emailSenderName: true,
        emailReplyTo: true,
        emailSignature: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Import send function
    const { sendEmail } = await import("@/lib/email/resend");

    const senderName = organization.emailSenderName || organization.name;
    const signature = organization.emailSignature
      ? `\n\n---\n${organization.emailSignature}`
      : "";

    const result = await sendEmail({
      to: toEmail,
      subject: `Test Email from ${senderName}`,
      text: `This is a test email from ${senderName}.\n\nIf you received this message, your email settings are configured correctly.${signature}`,
      replyTo: organization.emailReplyTo || undefined,
    });

    if (result.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: result.error || "Failed to send test email" };
    }
  } catch (error) {
    console.error("Failed to send test email:", error);
    return { success: false, error: "Failed to send test email" };
  }
}

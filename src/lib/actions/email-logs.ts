"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { EmailType, EmailStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ============================================================================
// EMAIL LOGGING ACTIONS
// ============================================================================

/**
 * Create an email log entry
 */
export async function createEmailLog(params: {
  organizationId: string;
  toEmail: string;
  toName?: string;
  clientId?: string;
  emailType: EmailType;
  subject: string;
  questionnaireId?: string;
  bookingId?: string;
  projectId?: string;
  invoiceId?: string;
  contractId?: string;
  galleryId?: string;
}) {
  try {
    const log = await prisma.emailLog.create({
      data: {
        organizationId: params.organizationId,
        toEmail: params.toEmail,
        toName: params.toName,
        clientId: params.clientId,
        emailType: params.emailType,
        subject: params.subject,
        status: "pending",
        questionnaireId: params.questionnaireId,
        bookingId: params.bookingId,
        projectId: params.projectId,
        invoiceId: params.invoiceId,
        contractId: params.contractId,
        galleryId: params.galleryId,
      },
    });

    return { success: true, logId: log.id };
  } catch (error) {
    console.error("Failed to create email log:", error);
    return { success: false, error: "Failed to create email log" };
  }
}

/**
 * Update email log status after sending
 */
export async function updateEmailLogStatus(
  logId: string,
  status: EmailStatus,
  resendId?: string,
  errorMessage?: string
) {
  try {
    const updateData: {
      status: EmailStatus;
      resendId?: string;
      errorMessage?: string;
      sentAt?: Date;
      failedAt?: Date;
    } = {
      status,
      resendId,
      errorMessage,
    };

    if (status === "sent" || status === "delivered") {
      updateData.sentAt = new Date();
    }
    if (status === "failed" || status === "bounced") {
      updateData.failedAt = new Date();
    }

    await prisma.emailLog.update({
      where: { id: logId },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update email log status:", error);
    return { success: false };
  }
}

/**
 * Get email logs for an organization
 */
export async function getEmailLogs(options?: {
  clientId?: string;
  emailType?: EmailType;
  status?: EmailStatus;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Build the where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId: organization.id,
    };

    if (options?.clientId) where.clientId = options.clientId;
    if (options?.emailType) where.emailType = options.emailType;
    if (options?.status) where.status = options.status;

    // Add search filter
    if (options?.search) {
      const searchTerm = options.search.trim();
      where.OR = [
        { toEmail: { contains: searchTerm, mode: "insensitive" } },
        { toName: { contains: searchTerm, mode: "insensitive" } },
        { subject: { contains: searchTerm, mode: "insensitive" } },
        { client: { fullName: { contains: searchTerm, mode: "insensitive" } } },
        { client: { email: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.emailLog.count({ where }),
    ]);

    return { success: true, logs, total };
  } catch (error) {
    console.error("Failed to get email logs:", error);
    return { success: false, error: "Failed to fetch email logs" };
  }
}

/**
 * Get email stats for organization dashboard
 */
export async function getEmailStats() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalSent, sentThisMonth, failed, byType] = await Promise.all([
      // Total emails sent all time
      prisma.emailLog.count({
        where: {
          organizationId: organization.id,
          status: { in: ["sent", "delivered"] },
        },
      }),
      // Sent in last 30 days
      prisma.emailLog.count({
        where: {
          organizationId: organization.id,
          status: { in: ["sent", "delivered"] },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // Failed emails
      prisma.emailLog.count({
        where: {
          organizationId: organization.id,
          status: { in: ["failed", "bounced"] },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // By type in last 30 days
      prisma.emailLog.groupBy({
        by: ["emailType"],
        where: {
          organizationId: organization.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        _count: { id: true },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalSent,
        sentThisMonth,
        failed,
        byType: byType.map((t) => ({
          type: t.emailType,
          count: t._count.id,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get email stats:", error);
    return { success: false, error: "Failed to fetch email stats" };
  }
}

/**
 * Convenience helper to log an email send and mark its status.
 */
export async function logEmailSent(params: {
  organizationId: string;
  toEmail: string;
  toName?: string;
  clientId?: string;
  projectId?: string;
  emailType: EmailType;
  subject: string;
  status?: EmailStatus;
}) {
  const { success, logId } = await createEmailLog({
    organizationId: params.organizationId,
    toEmail: params.toEmail,
    toName: params.toName,
    clientId: params.clientId,
    projectId: params.projectId,
    emailType: params.emailType,
    subject: params.subject,
  });

  if (success && logId && params.status) {
    await updateEmailLogStatus(logId, params.status);
  }

  return { success, logId };
}

/**
 * Get questionnaire email activity for a specific questionnaire
 */
export async function getQuestionnaireEmailActivity(questionnaireId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const logs = await prisma.emailLog.findMany({
      where: { questionnaireId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Failed to get questionnaire email activity:", error);
    return { success: false, error: "Failed to fetch email activity" };
  }
}

/**
 * Get email logs for a specific client
 */
export async function getClientEmailLogs(clientId: string, options?: { limit?: number }) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated", logs: [] };
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!organization) {
      return { success: false, error: "Organization not found", logs: [] };
    }

    const logs = await prisma.emailLog.findMany({
      where: {
        clientId,
        organizationId: organization.id,
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 10,
      select: {
        id: true,
        emailType: true,
        subject: true,
        status: true,
        createdAt: true,
        sentAt: true,
        errorMessage: true,
      },
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Failed to get client email logs:", error);
    return { success: false, error: "Failed to fetch email logs", logs: [] };
  }
}

/**
 * Check if a client has email delivery issues (bounced/failed)
 */
export async function getClientEmailHealth(clientId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { hasIssues: false, failedCount: 0, bouncedCount: 0 };
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [failedCount, bouncedCount] = await Promise.all([
      prisma.emailLog.count({
        where: {
          clientId,
          status: "failed",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.emailLog.count({
        where: {
          clientId,
          status: "bounced",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      hasIssues: failedCount > 0 || bouncedCount > 0,
      failedCount,
      bouncedCount,
    };
  } catch (error) {
    console.error("Failed to check client email health:", error);
    return { hasIssues: false, failedCount: 0, bouncedCount: 0 };
  }
}

/**
 * Get pending/overdue questionnaires for digest email
 */
export async function getQuestionnaireDigestData(organizationId: string) {
  try {
    const now = new Date();

    const questionnaires = await prisma.clientQuestionnaire.findMany({
      where: {
        organizationId,
        status: { in: ["pending", "in_progress"] },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const pending = questionnaires.filter((q) => q.status === "pending");
    const inProgress = questionnaires.filter((q) => q.status === "in_progress");
    const overdue = questionnaires.filter(
      (q) => q.dueDate && q.dueDate < now && q.status !== "completed"
    );

    return {
      success: true,
      data: {
        pending,
        inProgress,
        overdue,
        total: questionnaires.length,
      },
    };
  } catch (error) {
    console.error("Failed to get questionnaire digest data:", error);
    return { success: false, error: "Failed to fetch digest data" };
  }
}

/**
 * Resend a failed email
 */
export async function resendEmail(logId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get the email log with related data
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: logId },
      include: {
        organization: true,
        client: true,
        questionnaire: {
          include: {
            template: true,
            booking: true,
          },
        },
      },
    });

    if (!emailLog) {
      return { success: false, error: "Email log not found" };
    }

    // Verify organization access
    const organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
    });

    if (!organization || emailLog.organizationId !== organization.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Only allow resending failed or bounced emails
    if (!["failed", "bounced"].includes(emailLog.status)) {
      return { success: false, error: "Can only resend failed or bounced emails" };
    }

    // Fetch additional related data based on email type
    const project = emailLog.galleryId
      ? await prisma.project.findUnique({
          where: { id: emailLog.galleryId },
          include: { client: true },
        })
      : null;
    const booking = emailLog.bookingId
      ? await prisma.booking.findUnique({
          where: { id: emailLog.bookingId },
          include: { client: true, service: true },
        })
      : null;
    const contract = emailLog.contractId
      ? await prisma.contract.findUnique({
          where: { id: emailLog.contractId },
          include: { client: true, signers: true },
        })
      : null;
    const order = emailLog.invoiceId
      ? await prisma.order.findUnique({
          where: { id: emailLog.invoiceId },
          include: { items: true },
        })
      : null;

    // Import send functions dynamically to avoid circular dependency
    const {
      sendQuestionnaireAssignedEmail,
      sendQuestionnaireReminderEmail,
      sendQuestionnaireCompletedEmail,
      sendGalleryDeliveredEmail,
      sendBookingConfirmationEmail,
      sendOrderConfirmationEmail,
      sendContractSigningEmail,
    } = await import("@/lib/email/send");

    let result: { success: boolean; resendId?: string; error?: string };

    // Handle different email types
    switch (emailLog.emailType) {
      case "questionnaire_assigned": {
        if (!emailLog.questionnaire) {
          return { success: false, error: "Questionnaire not found for this email" };
        }

        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/questionnaires/${emailLog.questionnaire.id}`;

        result = await sendQuestionnaireAssignedEmail({
          to: emailLog.toEmail,
          clientName: emailLog.toName || emailLog.client?.fullName || "there",
          questionnaireName: emailLog.questionnaire.template.name,
          questionnaireDescription: emailLog.questionnaire.template.description || undefined,
          dueDate: emailLog.questionnaire.dueDate || undefined,
          portalUrl,
          photographerName: emailLog.organization.name,
          organizationName: emailLog.organization.name,
          bookingTitle: emailLog.questionnaire.booking?.title,
          bookingDate: emailLog.questionnaire.booking?.startTime,
        });
        break;
      }

      case "questionnaire_reminder": {
        if (!emailLog.questionnaire) {
          return { success: false, error: "Questionnaire not found for this email" };
        }

        const isOverdue = emailLog.questionnaire.dueDate
          ? emailLog.questionnaire.dueDate < new Date()
          : false;

        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/questionnaires/${emailLog.questionnaire.id}`;

        result = await sendQuestionnaireReminderEmail({
          to: emailLog.toEmail,
          clientName: emailLog.toName || emailLog.client?.fullName || "there",
          questionnaireName: emailLog.questionnaire.template.name,
          dueDate: emailLog.questionnaire.dueDate || undefined,
          isOverdue,
          portalUrl,
          photographerName: emailLog.organization.name,
          organizationName: emailLog.organization.name,
          bookingTitle: emailLog.questionnaire.booking?.title,
          bookingDate: emailLog.questionnaire.booking?.startTime,
          reminderCount: emailLog.questionnaire.remindersSent || 1,
        });
        break;
      }

      case "questionnaire_completed": {
        if (!emailLog.questionnaire) {
          return { success: false, error: "Questionnaire not found for this email" };
        }

        const viewResponsesUrl = `${process.env.NEXT_PUBLIC_APP_URL}/questionnaires/assigned/${emailLog.questionnaire.id}`;

        // Get response and agreement counts
        const [responseCount, agreementCount] = await Promise.all([
          prisma.clientQuestionnaireResponse.count({
            where: { questionnaireId: emailLog.questionnaire.id },
          }),
          prisma.clientQuestionnaireAgreement.count({
            where: { questionnaireId: emailLog.questionnaire.id, accepted: true },
          }),
        ]);

        result = await sendQuestionnaireCompletedEmail({
          to: emailLog.toEmail,
          photographerName: emailLog.toName || "there",
          clientName: emailLog.client?.fullName || "Client",
          clientEmail: emailLog.client?.email || "",
          questionnaireName: emailLog.questionnaire.template.name,
          responseCount,
          agreementCount,
          viewResponsesUrl,
          organizationName: emailLog.organization.name,
          bookingTitle: emailLog.questionnaire.booking?.title,
          bookingDate: emailLog.questionnaire.booking?.startTime,
          completedAt: emailLog.questionnaire.completedAt || new Date(),
        });
        break;
      }

      case "gallery_delivered": {
        if (!project) {
          return { success: false, error: "Gallery not found for this email" };
        }

        const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${project.id}`;

        result = await sendGalleryDeliveredEmail({
          to: emailLog.toEmail,
          clientName: emailLog.toName || project.client?.fullName || "there",
          galleryName: project.name,
          galleryUrl,
          photographerName: emailLog.organization.name,
          expiresAt: project.expiresAt || undefined,
        });
        break;
      }

      case "booking_confirmation": {
        if (!booking) {
          return { success: false, error: "Booking not found for this email" };
        }

        // Format time string from start/end times
        const startTimeDate = new Date(booking.startTime);
        const endTimeDate = new Date(booking.endTime);
        const timeFormatter = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const bookingTimeStr = `${timeFormatter.format(startTimeDate)} - ${timeFormatter.format(endTimeDate)}`;

        result = await sendBookingConfirmationEmail({
          to: emailLog.toEmail,
          clientName: emailLog.toName || booking.client?.fullName || "there",
          bookingTitle: booking.title,
          bookingDate: booking.startTime,
          bookingTime: bookingTimeStr,
          location: booking.location || undefined,
          photographerName: emailLog.organization.name,
          notes: booking.notes || undefined,
        });
        break;
      }

      case "order_confirmation": {
        if (!order || !order.items || order.items.length === 0) {
          return {
            success: false,
            error: "Order details not found. Cannot resend order confirmation without item details.",
          };
        }

        // Map order items to the expected format
        const orderItems = order.items.map((item) => ({
          name: item.name,
          itemType: item.itemType as "service" | "bundle",
          quantity: item.quantity,
          totalCents: item.totalCents,
        }));

        result = await sendOrderConfirmationEmail({
          to: emailLog.toEmail,
          clientName: emailLog.toName || order.clientName || "there",
          orderNumber: order.orderNumber,
          items: orderItems,
          subtotalCents: order.subtotalCents,
          taxCents: order.taxCents || 0,
          totalCents: order.totalCents,
          photographerName: emailLog.organization.name,
          clientNotes: order.clientNotes || undefined,
        });
        break;
      }

      case "contract_signing": {
        if (!contract) {
          return { success: false, error: "Contract not found for this email" };
        }

        // Find the signer for this email
        const contractSigner = contract.signers.find((s) => s.email === emailLog.toEmail);
        if (!contractSigner) {
          return { success: false, error: "Signer not found for this contract" };
        }

        const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${contractSigner.signingToken}`;

        result = await sendContractSigningEmail({
          to: emailLog.toEmail,
          signerName: contractSigner.name || emailLog.toName || "there",
          contractName: contract.name,
          signingUrl,
          photographerName: emailLog.organization.name,
          expiresAt: contract.expiresAt || undefined,
        });
        break;
      }

      case "payment_receipt": {
        // Payment receipts need invoice/payment data which isn't stored for security
        return {
          success: false,
          error: "Payment receipts cannot be resent. The original payment data is not stored for security reasons.",
        };
      }

      default:
        return { success: false, error: `Resending ${emailLog.emailType} emails is not yet supported` };
    }

    // Update the email log
    if (result.success) {
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: "sent",
          resendId: result.resendId,
          sentAt: new Date(),
          errorMessage: null,
          failedAt: null,
        },
      });
    } else {
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          errorMessage: result.error || "Resend failed",
          failedAt: new Date(),
        },
      });
    }

    revalidatePath("/settings/email-logs");
    return result;
  } catch (error) {
    console.error("Failed to resend email:", error);
    return { success: false, error: "Failed to resend email" };
  }
}

/**
 * Get a single email log by ID
 */
export async function getEmailLog(logId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const log = await prisma.emailLog.findUnique({
      where: { id: logId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        questionnaire: {
          include: {
            template: {
              select: { name: true },
            },
            booking: {
              select: { title: true, startTime: true },
            },
          },
        },
      },
    });

    if (!log || log.organizationId !== organization.id) {
      return { success: false, error: "Email log not found" };
    }

    return { success: true, log };
  } catch (error) {
    console.error("Failed to get email log:", error);
    return { success: false, error: "Failed to fetch email log" };
  }
}

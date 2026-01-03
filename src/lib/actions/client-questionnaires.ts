"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  assignQuestionnaireSchema,
  updateClientQuestionnaireSchema,
  approveQuestionnaireSchema,
  deleteClientQuestionnaireSchema,
  type AssignQuestionnaireInput,
  type UpdateClientQuestionnaireInput,
  type ApproveQuestionnaireInput,
  type ClientQuestionnaireFilters,
} from "@/lib/validations/questionnaires";
import { getAuthContext } from "@/lib/auth/clerk";
import type { ClientQuestionnaireStatus, LegalAgreementType, FormFieldType } from "@prisma/client";
import {
  sendQuestionnaireAssignedEmail,
  sendQuestionnaireReminderEmail,
} from "@/lib/email/send";
import {
  createEmailLog,
  updateEmailLogStatus,
} from "@/lib/actions/email-logs";

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ClientQuestionnaireWithRelations = {
  id: string;
  organizationId: string;
  clientId: string;
  templateId: string;
  bookingId: string | null;
  projectId: string | null;
  isRequired: boolean;
  dueDate: Date | null;
  status: ClientQuestionnaireStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  sendReminders: boolean;
  remindersSent: number;
  lastReminder: Date | null;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    fullName: string | null;
    email: string;
    phone: string | null;
  };
  template: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    fields: Array<{
      id: string;
      label: string;
      type: FormFieldType;
      placeholder: string | null;
      helpText: string | null;
      isRequired: boolean;
      sortOrder: number;
      section: string | null;
      sectionOrder: number;
      validation: unknown;
      conditionalOn: string | null;
      conditionalValue: string | null;
    }>;
    legalAgreements: Array<{
      id: string;
      agreementType: LegalAgreementType;
      title: string;
      content: string;
      isRequired: boolean;
      requiresSignature: boolean;
      sortOrder: number;
    }>;
  };
  booking: {
    id: string;
    title: string;
    startTime: Date;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  responses: Array<{
    id: string;
    fieldLabel: string;
    fieldType: string;
    value: unknown;
    createdAt: Date;
  }>;
  agreements: Array<{
    id: string;
    agreementType: LegalAgreementType;
    title: string;
    accepted: boolean;
    acceptedAt: Date | null;
    signatureData: string | null;
    signatureType: "drawn" | "typed" | "uploaded" | null;
    acceptedIp: string | null;
    acceptedUserAgent: string | null;
  }>;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getOrganizationId(): Promise<string> {
  const auth = await getAuthContext();
  if (!auth?.organizationId) {
    throw new Error("Unauthorized");
  }
  return auth.organizationId;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all client questionnaires for the organization
 */
export async function getClientQuestionnaires(
  filters?: ClientQuestionnaireFilters
): Promise<ActionResult<ClientQuestionnaireWithRelations[]>> {
  try {
    const organizationId = await getOrganizationId();

    const where = {
      organizationId,
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.templateId && { templateId: filters.templateId }),
      ...(filters?.bookingId && { bookingId: filters.bookingId }),
      ...(filters?.projectId && { projectId: filters.projectId }),
      ...(filters?.status && { status: filters.status as ClientQuestionnaireStatus }),
      ...(filters?.isRequired !== undefined && { isRequired: filters.isRequired }),
      ...(filters?.dueBefore && { dueDate: { lte: new Date(filters.dueBefore) } }),
      ...(filters?.dueAfter && { dueDate: { gte: new Date(filters.dueAfter) } }),
    };

    const questionnaires = await prisma.clientQuestionnaire.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        template: {
          include: {
            fields: {
              orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
            },
            legalAgreements: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        responses: {
          orderBy: { createdAt: "asc" },
        },
        agreements: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return { success: true, data: questionnaires as ClientQuestionnaireWithRelations[] };
  } catch (error) {
    console.error("Error fetching client questionnaires:", error);
    return { success: false, error: "Failed to fetch client questionnaires" };
  }
}

/**
 * Get questionnaires for a specific client
 */
export async function getClientQuestionnairesByClient(
  clientId: string
): Promise<ActionResult<ClientQuestionnaireWithRelations[]>> {
  try {
    const organizationId = await getOrganizationId();

    const questionnaires = await prisma.clientQuestionnaire.findMany({
      where: {
        organizationId,
        clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        template: {
          include: {
            fields: {
              orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
            },
            legalAgreements: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        responses: {
          orderBy: { createdAt: "asc" },
        },
        agreements: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });

    return { success: true, data: questionnaires as ClientQuestionnaireWithRelations[] };
  } catch (error) {
    console.error("Error fetching client questionnaires:", error);
    return { success: false, error: "Failed to fetch client questionnaires" };
  }
}

/**
 * Get a single client questionnaire by ID
 */
export async function getClientQuestionnaire(
  id: string
): Promise<ActionResult<ClientQuestionnaireWithRelations | null>> {
  try {
    const organizationId = await getOrganizationId();

    const questionnaire = await prisma.clientQuestionnaire.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        template: {
          include: {
            fields: {
              orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
            },
            legalAgreements: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        responses: {
          orderBy: { createdAt: "asc" },
        },
        agreements: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return { success: true, data: questionnaire as ClientQuestionnaireWithRelations | null };
  } catch (error) {
    console.error("Error fetching client questionnaire:", error);
    return { success: false, error: "Failed to fetch client questionnaire" };
  }
}

/**
 * Get questionnaire stats for dashboard
 */
export async function getQuestionnaireStats(): Promise<
  ActionResult<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    approved: number;
    overdue: number;
  }>
> {
  try {
    const organizationId = await getOrganizationId();
    const now = new Date();

    const [total, pending, inProgress, completed, approved, overdue] = await Promise.all([
      prisma.clientQuestionnaire.count({ where: { organizationId } }),
      prisma.clientQuestionnaire.count({
        where: { organizationId, status: "pending" },
      }),
      prisma.clientQuestionnaire.count({
        where: { organizationId, status: "in_progress" },
      }),
      prisma.clientQuestionnaire.count({
        where: { organizationId, status: "completed" },
      }),
      prisma.clientQuestionnaire.count({
        where: { organizationId, status: "approved" },
      }),
      prisma.clientQuestionnaire.count({
        where: {
          organizationId,
          status: { in: ["pending", "in_progress"] },
          dueDate: { lt: now },
        },
      }),
    ]);

    return {
      success: true,
      data: { total, pending, inProgress, completed, approved, overdue },
    };
  } catch (error) {
    console.error("Error fetching questionnaire stats:", error);
    return { success: false, error: "Failed to fetch questionnaire stats" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Assign a questionnaire to a client
 */
export async function assignQuestionnaireToClient(
  input: AssignQuestionnaireInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = assignQuestionnaireSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify client exists and belongs to organization
    const client = await prisma.client.findFirst({
      where: {
        id: validated.clientId,
        organizationId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailOptIn: true,
        questionnaireEmailsOptIn: true,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Check if client has opted out of emails
    const shouldSendEmail = client.emailOptIn && client.questionnaireEmailsOptIn;

    // Verify template exists and is accessible
    const template = await prisma.questionnaireTemplate.findFirst({
      where: {
        id: validated.templateId,
        OR: [{ isSystemTemplate: true }, { organizationId }],
        isActive: true,
      },
      include: {
        legalAgreements: true,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found or not available" };
    }

    // Verify booking exists if provided
    if (validated.bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: validated.bookingId,
          organizationId,
        },
      });

      if (!booking) {
        return { success: false, error: "Booking not found" };
      }
    }

    // Verify project exists if provided
    if (validated.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: validated.projectId,
          organizationId,
        },
      });

      if (!project) {
        return { success: false, error: "Project not found" };
      }
    }

    // Get organization info for the email
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        members: {
          where: { role: "owner" },
          include: { user: { select: { email: true, fullName: true } } },
          take: 1,
        },
      },
    });

    // Get booking info if linked
    let bookingInfo: { id: string; title: string; startTime: Date } | null = null;
    if (validated.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: validated.bookingId },
        select: { id: true, title: true, startTime: true },
      });
      if (booking) {
        bookingInfo = booking;
      }
    }

    // Create the client questionnaire with agreement records
    const questionnaire = await prisma.clientQuestionnaire.create({
      data: {
        organizationId,
        clientId: validated.clientId,
        templateId: validated.templateId,
        bookingId: validated.bookingId,
        projectId: validated.projectId,
        isRequired: validated.isRequired,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        sendReminders: validated.sendReminders,
        internalNotes: validated.internalNotes,
        personalNote: validated.personalNote,
        status: "pending",
        // Pre-create agreement records for tracking
        agreements: {
          create: template.legalAgreements.map((agreement) => ({
            agreementType: agreement.agreementType,
            title: agreement.title,
            content: agreement.content,
            accepted: false,
          })),
        },
      },
    });

    // Send email notification to client (if opted in)
    const ownerUser = organization?.members[0]?.user;
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/questionnaires/${questionnaire.id}`;
    const emailSubject = `${ownerUser?.fullName || organization?.name || "Your Photographer"} has sent you a questionnaire to complete`;

    if (shouldSendEmail) {
      // Create email log entry
      const logResult = await createEmailLog({
        organizationId,
        toEmail: client.email,
        toName: client.fullName || undefined,
        clientId: client.id,
        emailType: "questionnaire_assigned",
        subject: emailSubject,
        questionnaireId: questionnaire.id,
        bookingId: bookingInfo?.id,
      });

      try {
        const emailResult = await sendQuestionnaireAssignedEmail({
          to: client.email,
          clientId: client.id,
          clientName: client.fullName || "there",
          questionnaireName: template.name,
          questionnaireDescription: template.description || undefined,
          personalNote: validated.personalNote || undefined,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
          portalUrl,
          photographerName: ownerUser?.fullName || organization?.name || "Your Photographer",
          photographerEmail: ownerUser?.email,
          organizationName: organization?.name || "PhotoProOS",
          bookingTitle: bookingInfo?.title,
          bookingDate: bookingInfo?.startTime,
        });

        // Update log status
        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(
            logResult.logId,
            emailResult.success ? "sent" : "failed",
            emailResult.resendId,
            emailResult.error
          );
        }
      } catch (emailError) {
        // Log email error but don't fail the assignment
        console.error("Failed to send questionnaire assigned email:", emailError);
        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(
            logResult.logId,
            "failed",
            undefined,
            emailError instanceof Error ? emailError.message : "Unknown error"
          );
        }
      }
    } else {
      console.log(`Skipping questionnaire email for client ${client.id} - opted out`);
    }

    revalidatePath("/questionnaires");
    revalidatePath(`/clients/${validated.clientId}`);

    return { success: true, data: { id: questionnaire.id } };
  } catch (error) {
    console.error("Error assigning questionnaire:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to assign questionnaire" };
  }
}

/**
 * Update a client questionnaire
 */
export async function updateClientQuestionnaire(
  input: UpdateClientQuestionnaireInput
): Promise<ActionResult<void>> {
  try {
    const validated = updateClientQuestionnaireSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify questionnaire exists and belongs to organization
    const existing = await prisma.clientQuestionnaire.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Questionnaire not found" };
    }

    const { id, ...updateData } = validated;

    await prisma.clientQuestionnaire.update({
      where: { id },
      data: {
        ...(updateData.isRequired !== undefined && { isRequired: updateData.isRequired }),
        ...(updateData.dueDate !== undefined && {
          dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null,
        }),
        ...(updateData.sendReminders !== undefined && {
          sendReminders: updateData.sendReminders,
        }),
        ...(updateData.internalNotes !== undefined && {
          internalNotes: updateData.internalNotes,
        }),
        ...(updateData.status && { status: updateData.status as ClientQuestionnaireStatus }),
      },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating client questionnaire:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update questionnaire" };
  }
}

/**
 * Approve a completed questionnaire
 */
export async function approveQuestionnaire(
  input: ApproveQuestionnaireInput
): Promise<ActionResult<void>> {
  try {
    const validated = approveQuestionnaireSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify questionnaire exists, belongs to organization, and is completed
    const existing = await prisma.clientQuestionnaire.findFirst({
      where: {
        id: validated.id,
        organizationId,
        status: "completed",
      },
    });

    if (!existing) {
      return { success: false, error: "Questionnaire not found or not in completed status" };
    }

    await prisma.clientQuestionnaire.update({
      where: { id: validated.id },
      data: {
        status: "approved",
        internalNotes: validated.internalNotes ?? existing.internalNotes,
      },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error approving questionnaire:", error);
    return { success: false, error: "Failed to approve questionnaire" };
  }
}

/**
 * Delete a client questionnaire
 */
export async function deleteClientQuestionnaire(
  input: { id: string }
): Promise<ActionResult<void>> {
  try {
    const validated = deleteClientQuestionnaireSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify questionnaire exists and belongs to organization
    const existing = await prisma.clientQuestionnaire.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Questionnaire not found" };
    }

    await prisma.clientQuestionnaire.delete({
      where: { id: validated.id },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting client questionnaire:", error);
    return { success: false, error: "Failed to delete questionnaire" };
  }
}

/**
 * Send reminder for a questionnaire
 */
export async function sendQuestionnaireReminder(
  id: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify questionnaire exists and is pending/in_progress
    const questionnaire = await prisma.clientQuestionnaire.findFirst({
      where: {
        id,
        organizationId,
        status: { in: ["pending", "in_progress"] },
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
            emailOptIn: true,
            questionnaireEmailsOptIn: true,
          },
        },
        template: true,
        booking: {
          select: { title: true, startTime: true },
        },
      },
    });

    if (!questionnaire) {
      return { success: false, error: "Questionnaire not found or not in remindable status" };
    }

    // Check if client has opted out of emails
    if (!questionnaire.client.emailOptIn || !questionnaire.client.questionnaireEmailsOptIn) {
      return { success: false, error: "Client has opted out of questionnaire emails" };
    }

    // Get organization info for the email
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        members: {
          where: { role: "owner" },
          include: { user: { select: { email: true, fullName: true } } },
          take: 1,
        },
      },
    });

    // Check if overdue
    const isOverdue = questionnaire.dueDate
      ? new Date(questionnaire.dueDate) < new Date()
      : false;

    // Send email reminder
    const ownerUser = organization?.members[0]?.user;
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/questionnaires/${questionnaire.id}`;
    const photographerName = ownerUser?.fullName || organization?.name || "Your Photographer";
    const emailSubject = isOverdue
      ? `Overdue: Please complete your questionnaire for ${photographerName}`
      : `Reminder: Please complete your questionnaire for ${photographerName}`;

    // Create email log entry
    const logResult = await createEmailLog({
      organizationId,
      toEmail: questionnaire.client.email,
      toName: questionnaire.client.fullName || undefined,
      clientId: questionnaire.clientId,
      emailType: "questionnaire_reminder",
      subject: emailSubject,
      questionnaireId: questionnaire.id,
      bookingId: questionnaire.bookingId || undefined,
    });

    try {
      const emailResult = await sendQuestionnaireReminderEmail({
        to: questionnaire.client.email,
        clientId: questionnaire.client.id,
        clientName: questionnaire.client.fullName || "there",
        questionnaireName: questionnaire.template.name,
        dueDate: questionnaire.dueDate || undefined,
        isOverdue,
        portalUrl,
        photographerName,
        photographerEmail: ownerUser?.email,
        organizationName: organization?.name || "PhotoProOS",
        bookingTitle: questionnaire.booking?.title,
        bookingDate: questionnaire.booking?.startTime,
        reminderCount: questionnaire.remindersSent + 1,
      });

      // Update log status
      if (logResult.success && logResult.logId) {
        await updateEmailLogStatus(
          logResult.logId,
          emailResult.success ? "sent" : "failed",
          emailResult.resendId,
          emailResult.error
        );
      }

      if (!emailResult.success) {
        return { success: false, error: "Failed to send reminder email" };
      }
    } catch (emailError) {
      console.error("Failed to send questionnaire reminder email:", emailError);
      if (logResult.success && logResult.logId) {
        await updateEmailLogStatus(
          logResult.logId,
          "failed",
          undefined,
          emailError instanceof Error ? emailError.message : "Unknown error"
        );
      }
      return { success: false, error: "Failed to send reminder email" };
    }

    // Update reminder count after successful email send
    await prisma.clientQuestionnaire.update({
      where: { id },
      data: {
        remindersSent: { increment: 1 },
        lastReminder: new Date(),
      },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error sending questionnaire reminder:", error);
    return { success: false, error: "Failed to send reminder" };
  }
}

/**
 * Mark expired questionnaires
 */
export async function markExpiredQuestionnaires(): Promise<ActionResult<{ count: number }>> {
  try {
    const organizationId = await getOrganizationId();
    const now = new Date();

    const result = await prisma.clientQuestionnaire.updateMany({
      where: {
        organizationId,
        status: { in: ["pending", "in_progress"] },
        dueDate: { lt: now },
      },
      data: {
        status: "expired",
      },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error marking expired questionnaires:", error);
    return { success: false, error: "Failed to mark expired questionnaires" };
  }
}

/**
 * Send batch reminders for all pending/overdue questionnaires
 * Can optionally filter by status or limit the number of reminders
 */
export async function sendBatchReminders(options?: {
  overdueOnly?: boolean;
  limit?: number;
}): Promise<ActionResult<{ sent: number; failed: number; skipped: number }>> {
  try {
    const organizationId = await getOrganizationId();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find questionnaires that need reminders
    const whereClause: {
      organizationId: string;
      status: { in: ("pending" | "in_progress")[] };
      sendReminders: boolean;
      remindersSent: { lt: number };
      OR: ({ lastReminder: null } | { lastReminder: { lt: Date } })[];
      dueDate?: { lt: Date };
    } = {
      organizationId,
      status: { in: ["pending", "in_progress"] },
      sendReminders: true,
      remindersSent: { lt: 5 }, // Max 5 reminders
      OR: [{ lastReminder: null }, { lastReminder: { lt: oneDayAgo } }],
    };

    // If overdueOnly, only get overdue questionnaires
    if (options?.overdueOnly) {
      whereClause.dueDate = { lt: now };
    }

    const questionnaires = await prisma.clientQuestionnaire.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        template: {
          select: {
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
      take: options?.limit || 50,
      orderBy: { dueDate: "asc" },
    });

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        members: {
          where: { role: "owner" },
          include: { user: { select: { email: true, fullName: true } } },
          take: 1,
        },
      },
    });

    const results = { sent: 0, failed: 0, skipped: 0 };

    for (const questionnaire of questionnaires) {
      // Check if overdue
      const isOverdue = questionnaire.dueDate
        ? questionnaire.dueDate < now
        : false;

      const ownerUser = organization?.members[0]?.user;
      const photographerName = ownerUser?.fullName || organization?.name || "Your Photographer";
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/questionnaires/${questionnaire.id}`;

      const emailSubject = isOverdue
        ? `Overdue: Please complete your questionnaire for ${photographerName}`
        : `Reminder: Please complete your questionnaire for ${photographerName}`;

      // Create email log
      const logResult = await createEmailLog({
        organizationId,
        toEmail: questionnaire.client.email,
        toName: questionnaire.client.fullName || undefined,
        clientId: questionnaire.client.id,
        emailType: "questionnaire_reminder",
        subject: emailSubject,
        questionnaireId: questionnaire.id,
        bookingId: questionnaire.bookingId || undefined,
      });

      try {
        const emailResult = await sendQuestionnaireReminderEmail({
          to: questionnaire.client.email,
          clientId: questionnaire.client.id,
          clientName: questionnaire.client.fullName || "there",
          questionnaireName: questionnaire.template.name,
          dueDate: questionnaire.dueDate || undefined,
          isOverdue,
          portalUrl,
          photographerName,
          photographerEmail: ownerUser?.email,
          organizationName: organization?.name || "PhotoProOS",
          bookingTitle: questionnaire.booking?.title,
          bookingDate: questionnaire.booking?.startTime,
          reminderCount: questionnaire.remindersSent + 1,
        });

        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(
            logResult.logId,
            emailResult.success ? "sent" : "failed",
            emailResult.resendId,
            emailResult.error
          );
        }

        if (emailResult.success) {
          // Update reminder count
          await prisma.clientQuestionnaire.update({
            where: { id: questionnaire.id },
            data: {
              remindersSent: { increment: 1 },
              lastReminder: now,
            },
          });
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(
            logResult.logId,
            "failed",
            undefined,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    }

    revalidatePath("/questionnaires");

    return { success: true, data: results };
  } catch (error) {
    console.error("Error sending batch reminders:", error);
    return { success: false, error: "Failed to send batch reminders" };
  }
}

/**
 * Get count of questionnaires that can receive reminders
 */
export async function getRemindableQuestionnairesCount(): Promise<
  ActionResult<{ total: number; overdue: number; pending: number }>
> {
  try {
    const organizationId = await getOrganizationId();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const baseWhere = {
      organizationId,
      status: { in: ["pending" as const, "in_progress" as const] },
      sendReminders: true,
      remindersSent: { lt: 5 },
      OR: [{ lastReminder: null }, { lastReminder: { lt: oneDayAgo } }],
    };

    const [total, overdue] = await Promise.all([
      prisma.clientQuestionnaire.count({ where: baseWhere }),
      prisma.clientQuestionnaire.count({
        where: { ...baseWhere, dueDate: { lt: now } },
      }),
    ]);

    return {
      success: true,
      data: { total, overdue, pending: total - overdue },
    };
  } catch (error) {
    console.error("Error getting remindable questionnaires count:", error);
    return { success: false, error: "Failed to get count" };
  }
}

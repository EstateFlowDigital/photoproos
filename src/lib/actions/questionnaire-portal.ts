"use server";

import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import {
  submitQuestionnaireResponsesSchema,
  saveQuestionnaireProgressSchema,
  acceptAgreementSchema,
  type SubmitQuestionnaireResponsesInput,
  type SaveQuestionnaireProgressInput,
  type AcceptAgreementInput,
} from "@/lib/validations/questionnaires";
import type { ClientQuestionnaireStatus, LegalAgreementType, FormFieldType, SignatureType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PortalQuestionnaireWithRelations = {
  id: string;
  templateId: string;
  isRequired: boolean;
  dueDate: Date | null;
  status: ClientQuestionnaireStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  template: {
    id: string;
    name: string;
    description: string | null;
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
    content: string;
    accepted: boolean;
    acceptedAt: Date | null;
    signatureData: string | null;
    signatureType: SignatureType | null;
  }>;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get client ID from portal session token
 */
async function getPortalClientId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("portal_session")?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.clientSession.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
    select: { clientId: true },
  });

  return session?.clientId || null;
}

/**
 * Get client info for audit logging
 */
async function getClientInfo(): Promise<{ ip: string | null; userAgent: string | null }> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
  const userAgent = headersList.get("user-agent");

  return { ip, userAgent };
}

// ============================================================================
// READ OPERATIONS (Portal)
// ============================================================================

/**
 * Get questionnaires for the current portal client
 */
export async function getClientQuestionnairesForPortal(): Promise<
  ActionResult<PortalQuestionnaireWithRelations[]>
> {
  try {
    const clientId = await getPortalClientId();

    if (!clientId) {
      return { success: false, error: "Not authenticated" };
    }

    const questionnaires = await prisma.clientQuestionnaire.findMany({
      where: {
        clientId,
        status: { in: ["pending", "in_progress", "completed", "approved"] },
      },
      include: {
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

    return { success: true, data: questionnaires as PortalQuestionnaireWithRelations[] };
  } catch (error) {
    console.error("Error fetching portal questionnaires:", error);
    return { success: false, error: "Failed to fetch questionnaires" };
  }
}

/**
 * Get a single questionnaire for completion
 */
export async function getQuestionnaireForCompletion(
  id: string
): Promise<ActionResult<PortalQuestionnaireWithRelations | null>> {
  try {
    const clientId = await getPortalClientId();

    if (!clientId) {
      return { success: false, error: "Not authenticated" };
    }

    const questionnaire = await prisma.clientQuestionnaire.findFirst({
      where: {
        id,
        clientId,
        status: { in: ["pending", "in_progress"] },
      },
      include: {
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

    if (!questionnaire) {
      return { success: true, data: null };
    }

    // Mark as started if pending
    if (questionnaire.status === "pending") {
      await prisma.clientQuestionnaire.update({
        where: { id },
        data: {
          status: "in_progress",
          startedAt: new Date(),
        },
      });
    }

    return { success: true, data: questionnaire as PortalQuestionnaireWithRelations };
  } catch (error) {
    console.error("Error fetching questionnaire for completion:", error);
    return { success: false, error: "Failed to fetch questionnaire" };
  }
}

// ============================================================================
// WRITE OPERATIONS (Portal)
// ============================================================================

/**
 * Save questionnaire progress (auto-save)
 */
export async function saveQuestionnaireProgress(
  input: SaveQuestionnaireProgressInput
): Promise<ActionResult<void>> {
  try {
    const validated = saveQuestionnaireProgressSchema.parse(input);
    const clientId = await getPortalClientId();

    if (!clientId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify questionnaire belongs to client and is in progress
    const questionnaire = await prisma.clientQuestionnaire.findFirst({
      where: {
        id: validated.questionnaireId,
        clientId,
        status: { in: ["pending", "in_progress"] },
      },
    });

    if (!questionnaire) {
      return { success: false, error: "Questionnaire not found or already submitted" };
    }

    // Upsert responses
    await prisma.$transaction(async (tx) => {
      // Delete existing responses for this questionnaire
      await tx.clientQuestionnaireResponse.deleteMany({
        where: { questionnaireId: validated.questionnaireId },
      });

      // Create new responses
      if (validated.responses.length > 0) {
        await tx.clientQuestionnaireResponse.createMany({
          data: validated.responses.map((response) => ({
            questionnaireId: validated.questionnaireId,
            fieldLabel: response.fieldLabel,
            fieldType: response.fieldType,
            value: response.value as object,
          })),
        });
      }

      // Update status to in_progress if still pending
      if (questionnaire.status === "pending") {
        await tx.clientQuestionnaire.update({
          where: { id: validated.questionnaireId },
          data: {
            status: "in_progress",
            startedAt: new Date(),
          },
        });
      }
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error saving questionnaire progress:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to save progress" };
  }
}

/**
 * Accept a legal agreement
 */
export async function acceptAgreement(
  input: AcceptAgreementInput
): Promise<ActionResult<void>> {
  try {
    const validated = acceptAgreementSchema.parse(input);
    const clientId = await getPortalClientId();

    if (!clientId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify questionnaire belongs to client
    const questionnaire = await prisma.clientQuestionnaire.findFirst({
      where: {
        id: validated.questionnaireId,
        clientId,
        status: { in: ["pending", "in_progress"] },
      },
    });

    if (!questionnaire) {
      return { success: false, error: "Questionnaire not found or already submitted" };
    }

    // Get client info for audit
    const { ip, userAgent } = await getClientInfo();

    // Update agreement
    await prisma.clientQuestionnaireAgreement.update({
      where: { id: validated.agreementId },
      data: {
        accepted: true,
        acceptedAt: new Date(),
        signatureData: validated.signatureData,
        signatureType: validated.signatureType as SignatureType | null,
        acceptedIp: ip,
        acceptedUserAgent: userAgent,
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error accepting agreement:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to accept agreement" };
  }
}

/**
 * Submit questionnaire responses
 */
export async function submitQuestionnaireResponses(
  input: SubmitQuestionnaireResponsesInput
): Promise<ActionResult<void>> {
  try {
    const validated = submitQuestionnaireResponsesSchema.parse(input);
    const clientId = await getPortalClientId();

    if (!clientId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify questionnaire belongs to client and is in progress
    const questionnaire = await prisma.clientQuestionnaire.findFirst({
      where: {
        id: validated.questionnaireId,
        clientId,
        status: { in: ["pending", "in_progress"] },
      },
      include: {
        template: {
          include: {
            fields: true,
            legalAgreements: true,
          },
        },
        agreements: true,
      },
    });

    if (!questionnaire) {
      return { success: false, error: "Questionnaire not found or already submitted" };
    }

    // Validate required fields
    const requiredFields = questionnaire.template.fields.filter((f) => f.isRequired);
    const responseMap = new Map(
      validated.responses.map((r) => [r.fieldLabel, r.value])
    );

    for (const field of requiredFields) {
      const value = responseMap.get(field.label);
      if (value === undefined || value === null || value === "") {
        return {
          success: false,
          error: `Required field "${field.label}" is missing`,
        };
      }
    }

    // Validate required agreements are accepted
    const requiredAgreements = questionnaire.agreements.filter((a) => {
      const templateAgreement = questionnaire.template.legalAgreements.find(
        (ta) => ta.agreementType === a.agreementType
      );
      return templateAgreement?.isRequired;
    });

    for (const agreement of requiredAgreements) {
      if (!agreement.accepted) {
        return {
          success: false,
          error: `Required agreement "${agreement.title}" must be accepted`,
        };
      }
    }

    // Save final responses and mark as completed
    await prisma.$transaction(async (tx) => {
      // Delete existing responses
      await tx.clientQuestionnaireResponse.deleteMany({
        where: { questionnaireId: validated.questionnaireId },
      });

      // Create final responses
      if (validated.responses.length > 0) {
        await tx.clientQuestionnaireResponse.createMany({
          data: validated.responses.map((response) => ({
            questionnaireId: validated.questionnaireId,
            fieldLabel: response.fieldLabel,
            fieldType: response.fieldType,
            value: response.value as object,
          })),
        });
      }

      // Mark as completed
      await tx.clientQuestionnaire.update({
        where: { id: validated.questionnaireId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });
    });

    // TODO: Send notification to photographer

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error submitting questionnaire responses:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to submit questionnaire" };
  }
}

/**
 * Get questionnaire completion status
 */
export async function getQuestionnaireCompletionStatus(
  id: string
): Promise<
  ActionResult<{
    totalFields: number;
    completedFields: number;
    totalAgreements: number;
    acceptedAgreements: number;
    isComplete: boolean;
  }>
> {
  try {
    const clientId = await getPortalClientId();

    if (!clientId) {
      return { success: false, error: "Not authenticated" };
    }

    const questionnaire = await prisma.clientQuestionnaire.findFirst({
      where: {
        id,
        clientId,
      },
      include: {
        template: {
          include: {
            fields: true,
            legalAgreements: true,
          },
        },
        responses: true,
        agreements: true,
      },
    });

    if (!questionnaire) {
      return { success: false, error: "Questionnaire not found" };
    }

    const totalFields = questionnaire.template.fields.filter((f) => f.isRequired).length;
    const completedFields = questionnaire.responses.filter((r) => {
      const field = questionnaire.template.fields.find((f) => f.label === r.fieldLabel);
      return field?.isRequired && r.value !== null && r.value !== "";
    }).length;

    const totalAgreements = questionnaire.template.legalAgreements.filter(
      (a) => a.isRequired
    ).length;
    const acceptedAgreements = questionnaire.agreements.filter((a) => {
      const templateAgreement = questionnaire.template.legalAgreements.find(
        (ta) => ta.agreementType === a.agreementType
      );
      return templateAgreement?.isRequired && a.accepted;
    }).length;

    const isComplete =
      completedFields >= totalFields && acceptedAgreements >= totalAgreements;

    return {
      success: true,
      data: {
        totalFields,
        completedFields,
        totalAgreements,
        acceptedAgreements,
        isComplete,
      },
    };
  } catch (error) {
    console.error("Error getting completion status:", error);
    return { success: false, error: "Failed to get completion status" };
  }
}

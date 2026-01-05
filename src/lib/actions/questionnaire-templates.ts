"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createQuestionnaireTemplateSchema,
  updateQuestionnaireTemplateSchema,
  deleteQuestionnaireTemplateSchema,
  duplicateQuestionnaireTemplateSchema,
  updateQuestionnaireFieldsSchema,
  reorderQuestionnaireFieldsSchema,
  updateQuestionnaireAgreementsSchema,
  type CreateQuestionnaireTemplateInput,
  type UpdateQuestionnaireTemplateInput,
  type UpdateQuestionnaireFieldsInput,
  type ReorderQuestionnaireFieldsInput,
  type UpdateQuestionnaireAgreementsInput,
  type QuestionnaireTemplateFilters,
  type QuestionnaireField,
  type QuestionnaireAgreement,
} from "@/lib/validations/questionnaires";
import { getAuthContext } from "@/lib/auth/clerk";
import { Prisma, Industry, LegalAgreementType } from "@prisma/client";
import type { QuestionnaireTemplateWithRelations } from "./questionnaire-types";

// Re-export the type for consumers who import from this file
export type { QuestionnaireTemplateWithRelations } from "./questionnaire-types";

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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
 * Get all questionnaire templates (system + org-specific)
 */
export async function getQuestionnaireTemplates(
  filters?: QuestionnaireTemplateFilters
): Promise<ActionResult<QuestionnaireTemplateWithRelations[]>> {
  try {
    const organizationId = await getOrganizationId();

    const where = {
      AND: [
        // Show system templates OR org-specific templates
        {
          OR: [
            { isSystemTemplate: true },
            { organizationId },
          ],
        },
        // Apply filters
        filters?.industry ? { industry: filters.industry as Industry } : {},
        filters?.isSystemTemplate !== undefined
          ? { isSystemTemplate: filters.isSystemTemplate }
          : {},
        filters?.isActive !== undefined ? { isActive: filters.isActive } : {},
        filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" as const } },
                { description: { contains: filters.search, mode: "insensitive" as const } },
              ],
            }
          : {},
      ],
    };

    const templates = await prisma.questionnaireTemplate.findMany({
      where,
      include: {
        fields: {
          orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
        },
        legalAgreements: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { questionnaires: true },
        },
      },
      orderBy: [{ isSystemTemplate: "desc" }, { name: "asc" }],
    });

    return { success: true, data: templates as QuestionnaireTemplateWithRelations[] };
  } catch (error) {
    console.error("Error fetching questionnaire templates:", error);
    return { success: false, error: "Failed to fetch questionnaire templates" };
  }
}

/**
 * Get system templates (globally available templates)
 */
export async function getSystemTemplates(
  industry?: Industry
): Promise<ActionResult<QuestionnaireTemplateWithRelations[]>> {
  try {
    const templates = await prisma.questionnaireTemplate.findMany({
      where: {
        isSystemTemplate: true,
        isActive: true,
        ...(industry && { industry }),
      },
      include: {
        fields: {
          orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
        },
        legalAgreements: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { questionnaires: true },
        },
      },
      orderBy: [{ industry: "asc" }, { name: "asc" }],
    });

    return { success: true, data: templates as QuestionnaireTemplateWithRelations[] };
  } catch (error) {
    console.error("Error fetching system templates:", error);
    return { success: false, error: "Failed to fetch system templates" };
  }
}

/**
 * Get a single questionnaire template by ID
 */
export async function getQuestionnaireTemplate(
  id: string
): Promise<ActionResult<QuestionnaireTemplateWithRelations | null>> {
  try {
    const organizationId = await getOrganizationId();

    const template = await prisma.questionnaireTemplate.findFirst({
      where: {
        id,
        OR: [{ isSystemTemplate: true }, { organizationId }],
      },
      include: {
        fields: {
          orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
        },
        legalAgreements: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { questionnaires: true },
        },
      },
    });

    return { success: true, data: template as QuestionnaireTemplateWithRelations | null };
  } catch (error) {
    console.error("Error fetching questionnaire template:", error);
    return { success: false, error: "Failed to fetch questionnaire template" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new questionnaire template
 */
export async function createQuestionnaireTemplate(
  input: CreateQuestionnaireTemplateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createQuestionnaireTemplateSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Check for duplicate slug within organization
    const existingSlug = await prisma.questionnaireTemplate.findFirst({
      where: {
        organizationId,
        slug: validated.slug,
      },
    });

    if (existingSlug) {
      return { success: false, error: "A template with this slug already exists" };
    }

    const template = await prisma.questionnaireTemplate.create({
      data: {
        organizationId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        industry: validated.industry as Industry,
        isActive: validated.isActive,
        isSystemTemplate: false,
      },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: { id: template.id } };
  } catch (error) {
    console.error("Error creating questionnaire template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create questionnaire template" };
  }
}

/**
 * Update an existing questionnaire template
 */
export async function updateQuestionnaireTemplate(
  input: UpdateQuestionnaireTemplateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateQuestionnaireTemplateSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify template exists and belongs to organization (can't edit system templates)
    const existing = await prisma.questionnaireTemplate.findFirst({
      where: {
        id: validated.id,
        organizationId,
        isSystemTemplate: false,
      },
    });

    if (!existing) {
      return { success: false, error: "Template not found or cannot be edited" };
    }

    // Check for duplicate slug if slug is being changed
    if (validated.slug && validated.slug !== existing.slug) {
      const existingSlug = await prisma.questionnaireTemplate.findFirst({
        where: {
          organizationId,
          slug: validated.slug,
          id: { not: validated.id },
        },
      });

      if (existingSlug) {
        return { success: false, error: "A template with this slug already exists" };
      }
    }

    const { id, fields, ...updateData } = validated;

    // Use transaction to update template and fields together
    await prisma.$transaction(async (tx) => {
      // Update template properties
      await tx.questionnaireTemplate.update({
        where: { id },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.slug && { slug: updateData.slug }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.industry && { industry: updateData.industry as Industry }),
          ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        },
      });

      // Update fields if provided
      if (fields && fields.length > 0) {
        // Delete all existing fields and recreate them
        await tx.questionnaireField.deleteMany({
          where: { templateId: id },
        });

        // Create new fields
        await tx.questionnaireField.createMany({
          data: fields.map((field, idx) => ({
            templateId: id,
            label: field.label,
            type: field.type || "text",
            placeholder: field.placeholder ?? null,
            helpText: field.helpText ?? null,
            isRequired: field.isRequired ?? false,
            sortOrder: field.sortOrder ?? idx,
            section: field.section ?? null,
            sectionOrder: field.sectionOrder ?? 0,
            validation: field.validation ? (field.validation as Prisma.InputJsonValue) : Prisma.JsonNull,
            conditionalOn: field.conditionalOn ?? null,
            conditionalValue: field.conditionalValue ?? null,
          })),
        });
      }
    });

    revalidatePath("/questionnaires");
    revalidatePath(`/questionnaires/templates/${id}`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error updating questionnaire template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update questionnaire template" };
  }
}

/**
 * Duplicate a questionnaire template (works with system templates)
 */
export async function duplicateQuestionnaireTemplate(
  input: { id: string; newName?: string; newSlug?: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = duplicateQuestionnaireTemplateSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Get the source template (can be system or org-specific)
    const source = await prisma.questionnaireTemplate.findFirst({
      where: {
        id: validated.id,
        OR: [{ isSystemTemplate: true }, { organizationId }],
      },
      include: {
        fields: true,
        legalAgreements: true,
      },
    });

    if (!source) {
      return { success: false, error: "Source template not found" };
    }

    const newName = validated.newName || `${source.name} (Copy)`;
    const baseSlug = validated.newSlug || `${source.slug}-copy`;

    // Find unique slug
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (
      await prisma.questionnaireTemplate.findFirst({
        where: { organizationId, slug: uniqueSlug },
      })
    ) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the duplicate with fields and agreements
    const duplicate = await prisma.questionnaireTemplate.create({
      data: {
        organizationId,
        name: newName,
        slug: uniqueSlug,
        description: source.description,
        industry: source.industry,
        isActive: true,
        isSystemTemplate: false,
        fields: {
          create: source.fields.map((f) => ({
            label: f.label,
            type: f.type,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired,
            sortOrder: f.sortOrder,
            section: f.section,
            sectionOrder: f.sectionOrder,
            validation: f.validation || undefined,
            conditionalOn: f.conditionalOn,
            conditionalValue: f.conditionalValue,
          })),
        },
        legalAgreements: {
          create: source.legalAgreements.map((a) => ({
            agreementType: a.agreementType,
            title: a.title,
            content: a.content,
            isRequired: a.isRequired,
            requiresSignature: a.requiresSignature,
            sortOrder: a.sortOrder,
          })),
        },
      },
    });

    // Increment usage count on source template
    await prisma.questionnaireTemplate.update({
      where: { id: source.id },
      data: { usageCount: { increment: 1 } },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: { id: duplicate.id } };
  } catch (error) {
    console.error("Error duplicating questionnaire template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate questionnaire template" };
  }
}

/**
 * Delete a questionnaire template
 */
export async function deleteQuestionnaireTemplate(
  input: { id: string; force?: boolean }
): Promise<ActionResult<void>> {
  try {
    const validated = deleteQuestionnaireTemplateSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify template exists and belongs to organization (can't delete system templates)
    const existing = await prisma.questionnaireTemplate.findFirst({
      where: {
        id: validated.id,
        organizationId,
        isSystemTemplate: false,
      },
      include: {
        _count: {
          select: { questionnaires: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Template not found or cannot be deleted" };
    }

    // Check for active questionnaires
    if (existing._count.questionnaires > 0 && !validated.force) {
      return {
        success: false,
        error: `This template has ${existing._count.questionnaires} assigned questionnaire(s). Use force delete to remove.`,
      };
    }

    await prisma.questionnaireTemplate.delete({
      where: { id: validated.id },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting questionnaire template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete questionnaire template" };
  }
}

/**
 * Toggle template active status
 */
export async function toggleQuestionnaireTemplateStatus(
  id: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();

    const template = await prisma.questionnaireTemplate.findFirst({
      where: {
        id,
        organizationId,
        isSystemTemplate: false,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found or cannot be modified" };
    }

    await prisma.questionnaireTemplate.update({
      where: { id },
      data: { isActive: !template.isActive },
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error toggling template status:", error);
    return { success: false, error: "Failed to toggle template status" };
  }
}

// ============================================================================
// FIELD MANAGEMENT
// ============================================================================

/**
 * Update all fields for a template (bulk update)
 */
export async function updateQuestionnaireFields(
  input: UpdateQuestionnaireFieldsInput
): Promise<ActionResult<void>> {
  try {
    const validated = updateQuestionnaireFieldsSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify template exists and belongs to organization
    const template = await prisma.questionnaireTemplate.findFirst({
      where: {
        id: validated.templateId,
        organizationId,
        isSystemTemplate: false,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found or cannot be modified" };
    }

    // Delete existing fields and create new ones in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing fields
      await tx.questionnaireField.deleteMany({
        where: { templateId: validated.templateId },
      });

      // Create new fields
      if (validated.fields.length > 0) {
        await tx.questionnaireField.createMany({
          data: validated.fields.map((field, index) => ({
            templateId: validated.templateId,
            label: field.label,
            type: field.type || "text",
            placeholder: field.placeholder,
            helpText: field.helpText,
            isRequired: field.isRequired,
            sortOrder: field.sortOrder ?? index,
            section: field.section,
            sectionOrder: field.sectionOrder ?? 0,
            validation: field.validation ? (field.validation as Prisma.InputJsonValue) : Prisma.JsonNull,
            conditionalOn: field.conditionalOn,
            conditionalValue: field.conditionalValue,
          })),
        });
      }
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating questionnaire fields:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update questionnaire fields" };
  }
}

/**
 * Reorder fields within a template
 */
export async function reorderQuestionnaireFields(
  input: ReorderQuestionnaireFieldsInput
): Promise<ActionResult<void>> {
  try {
    const validated = reorderQuestionnaireFieldsSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify template exists and belongs to organization
    const template = await prisma.questionnaireTemplate.findFirst({
      where: {
        id: validated.templateId,
        organizationId,
        isSystemTemplate: false,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found or cannot be modified" };
    }

    // Update sort order for each field
    await prisma.$transaction(
      validated.fieldIds.map((fieldId, index) =>
        prisma.questionnaireField.update({
          where: { id: fieldId },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering questionnaire fields:", error);
    return { success: false, error: "Failed to reorder fields" };
  }
}

// ============================================================================
// AGREEMENT MANAGEMENT
// ============================================================================

/**
 * Update all legal agreements for a template (bulk update)
 */
export async function updateQuestionnaireAgreements(
  input: UpdateQuestionnaireAgreementsInput
): Promise<ActionResult<void>> {
  try {
    const validated = updateQuestionnaireAgreementsSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify template exists and belongs to organization
    const template = await prisma.questionnaireTemplate.findFirst({
      where: {
        id: validated.templateId,
        organizationId,
        isSystemTemplate: false,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found or cannot be modified" };
    }

    // Delete existing agreements and create new ones in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing agreements
      await tx.questionnaireTemplateAgreement.deleteMany({
        where: { templateId: validated.templateId },
      });

      // Create new agreements
      if (validated.agreements.length > 0) {
        await tx.questionnaireTemplateAgreement.createMany({
          data: validated.agreements.map((agreement, index) => ({
            templateId: validated.templateId,
            agreementType: agreement.agreementType as LegalAgreementType,
            title: agreement.title,
            content: agreement.content,
            isRequired: agreement.isRequired,
            requiresSignature: agreement.requiresSignature,
            sortOrder: agreement.sortOrder ?? index,
          })),
        });
      }
    });

    revalidatePath("/questionnaires");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating questionnaire agreements:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update questionnaire agreements" };
  }
}

// ============================================================================
// INDUSTRY TEMPLATE HELPERS
// ============================================================================

/**
 * Get templates grouped by industry
 */
export async function getTemplatesByIndustry(): Promise<
  ActionResult<Record<Industry, QuestionnaireTemplateWithRelations[]>>
> {
  try {
    const organizationId = await getOrganizationId();

    const templates = await prisma.questionnaireTemplate.findMany({
      where: {
        OR: [{ isSystemTemplate: true }, { organizationId }],
        isActive: true,
      },
      include: {
        fields: {
          orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
        },
        legalAgreements: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { questionnaires: true },
        },
      },
      orderBy: [{ isSystemTemplate: "desc" }, { name: "asc" }],
    });

    // Group by industry
    const grouped = templates.reduce((acc, template) => {
      const industry = template.industry as Industry;
      if (!acc[industry]) {
        acc[industry] = [];
      }
      acc[industry].push(template as QuestionnaireTemplateWithRelations);
      return acc;
    }, {} as Record<Industry, QuestionnaireTemplateWithRelations[]>);

    return { success: true, data: grouped };
  } catch (error) {
    console.error("Error fetching templates by industry:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface InvoiceTemplateInput {
  name: string;
  isDefault?: boolean;
  logoPosition?: "left" | "center" | "right";
  primaryColor?: string;
  accentColor?: string;
  headerText?: string;
  footerText?: string;
  paymentTerms?: string;
  notes?: string;
  fontFamily?: string;
  showLogo?: boolean;
  showPaymentLink?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id || null;
}

// =============================================================================
// Invoice Template Actions
// =============================================================================

/**
 * Create a new invoice template
 */
export async function createInvoiceTemplate(input: InvoiceTemplateInput) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    // If this is the default, unset other defaults
    if (input.isDefault) {
      await prisma.invoiceTemplate.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.invoiceTemplate.create({
      data: {
        organizationId,
        name: input.name,
        isDefault: input.isDefault || false,
        logoPosition: input.logoPosition || "left",
        primaryColor: input.primaryColor || "#3b82f6",
        accentColor: input.accentColor || "#8b5cf6",
        headerText: input.headerText,
        footerText: input.footerText,
        paymentTerms: input.paymentTerms,
        notes: input.notes,
        fontFamily: input.fontFamily || "Inter",
        showLogo: input.showLogo ?? true,
        showPaymentLink: input.showPaymentLink ?? true,
      },
    });

    revalidatePath("/settings/branding");
    return { success: true, data: template };
  } catch (error) {
    console.error("[Invoice Template] Error creating:", error);
    return fail("Failed to create invoice template");
  }
}

/**
 * Get all invoice templates for the organization
 */
export async function getInvoiceTemplates() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const templates = await prisma.invoiceTemplate.findMany({
      where: { organizationId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error("[Invoice Template] Error fetching:", error);
    return fail("Failed to fetch invoice templates");
  }
}

/**
 * Get a specific invoice template
 */
export async function getInvoiceTemplate(templateId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const template = await prisma.invoiceTemplate.findFirst({
      where: { id: templateId, organizationId },
    });

    if (!template) {
      return fail("Template not found");
    }

    return { success: true, data: template };
  } catch (error) {
    console.error("[Invoice Template] Error fetching:", error);
    return fail("Failed to fetch invoice template");
  }
}

/**
 * Update an invoice template
 */
export async function updateInvoiceTemplate(
  templateId: string,
  input: Partial<InvoiceTemplateInput>
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    // If setting as default, unset other defaults
    if (input.isDefault) {
      await prisma.invoiceTemplate.updateMany({
        where: { organizationId, isDefault: true, id: { not: templateId } },
        data: { isDefault: false },
      });
    }

    const template = await prisma.invoiceTemplate.update({
      where: { id: templateId, organizationId },
      data: {
        name: input.name,
        isDefault: input.isDefault,
        logoPosition: input.logoPosition,
        primaryColor: input.primaryColor,
        accentColor: input.accentColor,
        headerText: input.headerText,
        footerText: input.footerText,
        paymentTerms: input.paymentTerms,
        notes: input.notes,
        fontFamily: input.fontFamily,
        showLogo: input.showLogo,
        showPaymentLink: input.showPaymentLink,
      },
    });

    revalidatePath("/settings/branding");
    return { success: true, data: template };
  } catch (error) {
    console.error("[Invoice Template] Error updating:", error);
    return fail("Failed to update invoice template");
  }
}

/**
 * Delete an invoice template
 */
export async function deleteInvoiceTemplate(templateId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    await prisma.invoiceTemplate.delete({
      where: { id: templateId, organizationId },
    });

    revalidatePath("/settings/branding");
    return ok();
  } catch (error) {
    console.error("[Invoice Template] Error deleting:", error);
    return fail("Failed to delete invoice template");
  }
}

/**
 * Get the default template for the organization
 */
export async function getDefaultInvoiceTemplate() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const template = await prisma.invoiceTemplate.findFirst({
      where: { organizationId, isDefault: true },
    });

    // If no default, return org branding as fallback
    if (!template) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          name: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
        },
      });

      return {
        success: true,
        data: {
          id: null,
          name: "Default",
          isDefault: true,
          logoPosition: "left",
          primaryColor: org?.primaryColor || "#3b82f6",
          accentColor: org?.secondaryColor || "#8b5cf6",
          headerText: null,
          footerText: null,
          paymentTerms: "Due on Receipt",
          notes: null,
          fontFamily: "Inter",
          showLogo: true,
          showPaymentLink: true,
        },
      };
    }

    return { success: true, data: template };
  } catch (error) {
    console.error("[Invoice Template] Error fetching default:", error);
    return fail("Failed to fetch default template");
  }
}

/**
 * Duplicate an invoice template
 */
export async function duplicateInvoiceTemplate(templateId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const original = await prisma.invoiceTemplate.findFirst({
      where: { id: templateId, organizationId },
    });

    if (!original) {
      return fail("Template not found");
    }

    const duplicate = await prisma.invoiceTemplate.create({
      data: {
        organizationId,
        name: `${original.name} (Copy)`,
        isDefault: false,
        logoPosition: original.logoPosition,
        primaryColor: original.primaryColor,
        accentColor: original.accentColor,
        headerText: original.headerText,
        footerText: original.footerText,
        paymentTerms: original.paymentTerms,
        notes: original.notes,
        fontFamily: original.fontFamily,
        showLogo: original.showLogo,
        showPaymentLink: original.showPaymentLink,
      },
    });

    revalidatePath("/settings/branding");
    return { success: true, data: duplicate };
  } catch (error) {
    console.error("[Invoice Template] Error duplicating:", error);
    return fail("Failed to duplicate invoice template");
  }
}

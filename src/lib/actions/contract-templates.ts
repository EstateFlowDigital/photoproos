"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// =============================================================================
// Types
// =============================================================================

interface ContractTemplateInput {
  name: string;
  description?: string;
  content: string;
  isDefault?: boolean;
}

export interface ContractTemplateWithCount {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  content: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    contracts: number;
  };
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
// Contract Template Actions
// =============================================================================

/**
 * Create a new contract template
 */
export async function createContractTemplate(input: ContractTemplateInput) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // If this is the default, unset other defaults
    if (input.isDefault) {
      await prisma.contractTemplate.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.contractTemplate.create({
      data: {
        organizationId,
        name: input.name,
        description: input.description || null,
        content: input.content,
        isDefault: input.isDefault || false,
      },
    });

    revalidatePath("/contracts");
    revalidatePath("/contracts/templates");
    return { success: true, data: template };
  } catch (error) {
    console.error("[Contract Template] Error creating:", error);
    return { success: false, error: "Failed to create contract template" };
  }
}

/**
 * Get all contract templates for the organization
 */
export async function getContractTemplates() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found", data: [] };
  }

  try {
    const templates = await prisma.contractTemplate.findMany({
      where: { organizationId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error("[Contract Template] Error fetching:", error);
    return { success: false, error: "Failed to fetch contract templates", data: [] };
  }
}

/**
 * Get a specific contract template
 */
export async function getContractTemplate(templateId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const template = await prisma.contractTemplate.findFirst({
      where: { id: templateId, organizationId },
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, data: template };
  } catch (error) {
    console.error("[Contract Template] Error fetching:", error);
    return { success: false, error: "Failed to fetch contract template" };
  }
}

/**
 * Update a contract template
 */
export async function updateContractTemplate(
  templateId: string,
  input: Partial<ContractTemplateInput>
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // If setting as default, unset other defaults
    if (input.isDefault) {
      await prisma.contractTemplate.updateMany({
        where: { organizationId, isDefault: true, id: { not: templateId } },
        data: { isDefault: false },
      });
    }

    const template = await prisma.contractTemplate.update({
      where: { id: templateId, organizationId },
      data: {
        name: input.name,
        description: input.description,
        content: input.content,
        isDefault: input.isDefault,
      },
    });

    revalidatePath("/contracts");
    revalidatePath("/contracts/templates");
    revalidatePath(`/contracts/templates/${templateId}`);
    return { success: true, data: template };
  } catch (error) {
    console.error("[Contract Template] Error updating:", error);
    return { success: false, error: "Failed to update contract template" };
  }
}

/**
 * Delete a contract template
 */
export async function deleteContractTemplate(templateId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Check if template is in use
    const template = await prisma.contractTemplate.findFirst({
      where: { id: templateId, organizationId },
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    if (template._count.contracts > 0) {
      return {
        success: false,
        error: `Cannot delete template. It is used by ${template._count.contracts} contract(s).`,
      };
    }

    await prisma.contractTemplate.delete({
      where: { id: templateId, organizationId },
    });

    revalidatePath("/contracts");
    revalidatePath("/contracts/templates");
    return { success: true };
  } catch (error) {
    console.error("[Contract Template] Error deleting:", error);
    return { success: false, error: "Failed to delete contract template" };
  }
}

/**
 * Duplicate a contract template
 */
export async function duplicateContractTemplate(templateId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const original = await prisma.contractTemplate.findFirst({
      where: { id: templateId, organizationId },
    });

    if (!original) {
      return { success: false, error: "Template not found" };
    }

    const duplicate = await prisma.contractTemplate.create({
      data: {
        organizationId,
        name: `${original.name} (Copy)`,
        description: original.description,
        content: original.content,
        isDefault: false,
      },
    });

    revalidatePath("/contracts/templates");
    return { success: true, data: duplicate };
  } catch (error) {
    console.error("[Contract Template] Error duplicating:", error);
    return { success: false, error: "Failed to duplicate contract template" };
  }
}

/**
 * Get the default contract template
 */
export async function getDefaultContractTemplate() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const template = await prisma.contractTemplate.findFirst({
      where: { organizationId, isDefault: true },
    });

    return { success: true, data: template };
  } catch (error) {
    console.error("[Contract Template] Error fetching default:", error);
    return { success: false, error: "Failed to fetch default template" };
  }
}

/**
 * Seed default contract templates for a new organization
 */
export async function seedDefaultContractTemplates() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Check if any templates exist
    const existing = await prisma.contractTemplate.count({
      where: { organizationId },
    });

    if (existing > 0) {
      return { success: true, data: null, message: "Templates already exist" };
    }

    // Create default templates
    const defaultTemplates = [
      {
        name: "Standard Photography Contract",
        description: "A comprehensive contract for photography services",
        content: `PHOTOGRAPHY SERVICES AGREEMENT

This Photography Services Agreement ("Agreement") is entered into between:

Photographer: {{photographer_name}}
Client: {{client_name}}

1. SERVICES
The Photographer agrees to provide photography services as described in the attached scope of work.

2. DATE AND LOCATION
Date: {{session_date}}
Location: {{session_location}}

3. PAYMENT
Total Fee: {{total_amount}}
Deposit: {{deposit_amount}} (due upon signing)
Balance: Due {{balance_due_date}}

4. CANCELLATION POLICY
- Cancellation more than 14 days before: Full refund minus deposit
- Cancellation within 14 days: 50% of total fee
- Cancellation within 48 hours: Full fee due

5. IMAGE DELIVERY
Images will be delivered within {{delivery_timeframe}} of the session date.

6. COPYRIGHT & USAGE
The Photographer retains copyright to all images. Client receives a license for personal use.

7. LIABILITY
Photographer's liability is limited to the total amount paid under this agreement.

SIGNATURES

Photographer: ______________________ Date: __________

Client: ______________________ Date: __________`,
        isDefault: true,
      },
      {
        name: "Event Photography Contract",
        description: "Contract template for event photography",
        content: `EVENT PHOTOGRAPHY CONTRACT

Event: {{event_name}}
Date: {{event_date}}
Client: {{client_name}}

COVERAGE DETAILS
Start Time: {{start_time}}
End Time: {{end_time}}
Total Hours: {{total_hours}}

INVESTMENT
Coverage Fee: {{coverage_fee}}
Additional Hours: {{hourly_rate}}/hour

DELIVERABLES
- Online gallery with {{estimated_images}} edited images
- High-resolution digital downloads
- Delivery within {{delivery_weeks}} weeks

TERMS AND CONDITIONS
[Standard terms apply]

_______________________________
Client Signature & Date

_______________________________
Photographer Signature & Date`,
        isDefault: false,
      },
    ];

    for (const template of defaultTemplates) {
      await prisma.contractTemplate.create({
        data: {
          organizationId,
          ...template,
        },
      });
    }

    revalidatePath("/contracts/templates");
    return { success: true, data: defaultTemplates.length };
  } catch (error) {
    console.error("[Contract Template] Error seeding:", error);
    return { success: false, error: "Failed to seed contract templates" };
  }
}

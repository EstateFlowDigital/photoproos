"use server";

/**
 * Invoice Presets - Reusable line item templates for quick invoice creation
 * These templates store preset line items that can be applied when creating new invoices
 *
 * Note: For visual branding templates, see invoice-templates.ts
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { LineItemType, InvoiceTemplate, Prisma } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// Types
// ============================================================================

export interface PresetLineItem {
  itemType: LineItemType;
  description: string;
  quantity: number;
  unitCents: number;
}

export interface CreateInvoicePresetInput {
  name: string;
  description?: string;
  category?: string;
  defaultDueDays?: number;
  defaultNotes?: string;
  defaultTerms?: string;
  taxRate?: number;
  lineItems: PresetLineItem[];
  isDefault?: boolean;
}

export interface UpdateInvoicePresetInput {
  name?: string;
  description?: string;
  category?: string;
  defaultDueDays?: number;
  defaultNotes?: string;
  defaultTerms?: string;
  taxRate?: number;
  lineItems?: PresetLineItem[];
  isActive?: boolean;
  isDefault?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateTotals(lineItems: PresetLineItem[], taxRate?: number | null) {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCents,
    0
  );
  const taxCents = taxRate ? Math.round(subtotalCents * (taxRate / 100)) : 0;
  const totalCents = subtotalCents + taxCents;
  return { subtotalCents, taxCents, totalCents };
}

// ============================================================================
// Invoice Preset Actions
// ============================================================================

/**
 * Create a new invoice preset
 */
export async function createInvoicePreset(
  input: CreateInvoicePresetInput
): Promise<ActionResult<InvoiceTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const { subtotalCents, taxCents, totalCents } = calculateTotals(
    input.lineItems,
    input.taxRate
  );

  // If setting as default, unset other defaults
  if (input.isDefault) {
    await prisma.invoiceTemplate.updateMany({
      where: { organizationId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const preset = await prisma.invoiceTemplate.create({
    data: {
      organizationId,
      name: input.name,
      description: input.description,
      category: input.category,
      defaultDueDays: input.defaultDueDays ?? 30,
      defaultNotes: input.defaultNotes,
      defaultTerms: input.defaultTerms,
      taxRate: input.taxRate,
      lineItems: input.lineItems as unknown as Prisma.JsonArray,
      subtotalCents,
      taxCents,
      totalCents,
      isDefault: input.isDefault ?? false,
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/settings/invoice-presets");

  return success(preset);
}

/**
 * Get an invoice preset by ID
 */
export async function getInvoicePreset(
  presetId: string
): Promise<ActionResult<InvoiceTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const preset = await prisma.invoiceTemplate.findFirst({
    where: {
      id: presetId,
      organizationId,
    },
  });

  if (!preset) {
    return fail("Preset not found");
  }

  return success(preset);
}

/**
 * List all invoice presets for the organization
 */
export async function listInvoicePresets(options?: {
  category?: string;
  activeOnly?: boolean;
}): Promise<ActionResult<InvoiceTemplate[]>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const presets = await prisma.invoiceTemplate.findMany({
    where: {
      organizationId,
      ...(options?.category && { category: options.category }),
      ...(options?.activeOnly && { isActive: true }),
    },
    orderBy: [{ isDefault: "desc" }, { usageCount: "desc" }, { name: "asc" }],
  });

  return success(presets);
}

/**
 * Get all unique preset categories
 */
export async function getPresetCategories(): Promise<ActionResult<string[]>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const presets = await prisma.invoiceTemplate.findMany({
    where: {
      organizationId,
      category: { not: null },
    },
    select: { category: true },
    distinct: ["category"],
  });

  const categories = presets
    .map((p) => p.category)
    .filter((c): c is string => c !== null)
    .sort();

  return success(categories);
}

/**
 * Update an invoice preset
 */
export async function updateInvoicePreset(
  presetId: string,
  input: UpdateInvoicePresetInput
): Promise<ActionResult<InvoiceTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.invoiceTemplate.findFirst({
    where: { id: presetId, organizationId },
  });

  if (!existing) {
    return fail("Preset not found");
  }

  // Calculate new totals if line items are updated
  let totals = {};
  if (input.lineItems) {
    totals = calculateTotals(
      input.lineItems,
      input.taxRate ?? existing.taxRate
    );
  } else if (input.taxRate !== undefined) {
    // Recalculate with existing line items and new tax rate
    totals = calculateTotals(
      existing.lineItems as unknown as PresetLineItem[],
      input.taxRate
    );
  }

  // If setting as default, unset other defaults
  if (input.isDefault) {
    await prisma.invoiceTemplate.updateMany({
      where: {
        organizationId,
        isDefault: true,
        id: { not: presetId },
      },
      data: { isDefault: false },
    });
  }

  const preset = await prisma.invoiceTemplate.update({
    where: { id: presetId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.defaultDueDays !== undefined && {
        defaultDueDays: input.defaultDueDays,
      }),
      ...(input.defaultNotes !== undefined && {
        defaultNotes: input.defaultNotes,
      }),
      ...(input.defaultTerms !== undefined && {
        defaultTerms: input.defaultTerms,
      }),
      ...(input.taxRate !== undefined && { taxRate: input.taxRate }),
      ...(input.lineItems && {
        lineItems: input.lineItems as unknown as Prisma.JsonArray,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      ...totals,
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/settings/invoice-presets");

  return success(preset);
}

/**
 * Delete an invoice preset
 */
export async function deleteInvoicePreset(
  presetId: string
): Promise<ActionResult<void>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.invoiceTemplate.findFirst({
    where: { id: presetId, organizationId },
  });

  if (!existing) {
    return fail("Preset not found");
  }

  await prisma.invoiceTemplate.delete({
    where: { id: presetId },
  });

  revalidatePath("/invoices");
  revalidatePath("/settings/invoice-presets");

  return ok();
}

/**
 * Duplicate an invoice preset
 */
export async function duplicateInvoicePreset(
  presetId: string,
  newName?: string
): Promise<ActionResult<InvoiceTemplate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.invoiceTemplate.findFirst({
    where: { id: presetId, organizationId },
  });

  if (!existing) {
    return fail("Preset not found");
  }

  const preset = await prisma.invoiceTemplate.create({
    data: {
      organizationId,
      name: newName ?? `${existing.name} (Copy)`,
      description: existing.description,
      category: existing.category,
      defaultDueDays: existing.defaultDueDays,
      defaultNotes: existing.defaultNotes,
      defaultTerms: existing.defaultTerms,
      taxRate: existing.taxRate,
      lineItems: existing.lineItems as Prisma.JsonArray,
      subtotalCents: existing.subtotalCents,
      taxCents: existing.taxCents,
      totalCents: existing.totalCents,
      isDefault: false, // Copy is never default
      usageCount: 0, // Reset usage count
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/settings/invoice-presets");

  return success(preset);
}

/**
 * Get invoice data from a preset for creating a new invoice
 * Returns the data needed to populate a new invoice form
 */
export async function getInvoiceDataFromPreset(
  presetId: string
): Promise<
  ActionResult<{
    dueDate: Date;
    notes: string | null;
    terms: string | null;
    lineItems: {
      itemType: LineItemType;
      description: string;
      quantity: number;
      unitCents: number;
      totalCents: number;
    }[];
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
  }>
> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const preset = await prisma.invoiceTemplate.findFirst({
    where: { id: presetId, organizationId, isActive: true },
  });

  if (!preset) {
    return fail("Preset not found or inactive");
  }

  // Increment usage count
  await prisma.invoiceTemplate.update({
    where: { id: presetId },
    data: { usageCount: { increment: 1 } },
  });

  const presetLineItems = preset.lineItems as unknown as PresetLineItem[];
  const lineItems = presetLineItems.map((item) => ({
    itemType: item.itemType,
    description: item.description,
    quantity: item.quantity,
    unitCents: item.unitCents,
    totalCents: item.quantity * item.unitCents,
  }));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + preset.defaultDueDays);

  return success({
    dueDate,
    notes: preset.defaultNotes,
    terms: preset.defaultTerms,
    lineItems,
    subtotalCents: preset.subtotalCents,
    taxCents: preset.taxCents,
    totalCents: preset.totalCents,
  });
}

/**
 * Get the default preset for the organization
 */
export async function getDefaultInvoicePreset(): Promise<
  ActionResult<InvoiceTemplate | null>
> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const preset = await prisma.invoiceTemplate.findFirst({
    where: {
      organizationId,
      isDefault: true,
      isActive: true,
    },
  });

  return success(preset);
}

/**
 * Get the most used presets for quick access
 */
export async function getPopularInvoicePresets(
  limit: number = 5
): Promise<ActionResult<InvoiceTemplate[]>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const presets = await prisma.invoiceTemplate.findMany({
    where: {
      organizationId,
      isActive: true,
      usageCount: { gt: 0 },
    },
    orderBy: { usageCount: "desc" },
    take: limit,
  });

  return success(presets);
}

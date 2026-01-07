"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

export interface ChecklistItemData {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  order: number;
  isEnabled: boolean;
  isDefault: boolean;
  isCustom: boolean;
  completionType: string | null;
  completionValue: string | null;
  completed: boolean;
  skippedAt: Date | null;
  industries: string[];
  plans: string[];
}

export interface CreateChecklistItemInput {
  label: string;
  description: string;
  href: string;
  icon?: string;
  order?: number;
  completionType?: string;
  completionValue?: string;
  industries?: string[];
  plans?: string[];
}

export interface UpdateChecklistItemInput {
  label?: string;
  description?: string;
  href?: string;
  icon?: string;
  order?: number;
  isEnabled?: boolean;
  completionType?: string;
  completionValue?: string;
  completed?: boolean;
  industries?: string[];
  plans?: string[];
}

// ============================================================================
// DEFAULT CHECKLIST ITEMS
// ============================================================================

const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItemData, "id">[] = [
  {
    label: "Add your first client",
    description: "Start building your client database",
    href: "/clients/new",
    icon: "users",
    order: 0,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasClients",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create a service package",
    description: "Define your photography packages and pricing",
    href: "/services/new",
    icon: "tag",
    order: 1,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasServices",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create your first gallery",
    description: "Upload photos and deliver to clients",
    href: "/galleries/new",
    icon: "images",
    order: 2,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasGalleries",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create a property website",
    description: "Build your first property listing page",
    href: "/properties/new",
    icon: "building-2",
    order: 3,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasProperties",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: ["real_estate"],
    plans: [],
  },
  {
    label: "Customize your branding",
    description: "Add your logo and brand colors",
    href: "/settings/branding",
    icon: "palette",
    order: 4,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasBranding",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Set up payments",
    description: "Connect Stripe to accept payments",
    href: "/settings/payments",
    icon: "credit-card",
    order: 5,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasPaymentMethod",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Set up expense tracking",
    description: "Configure expense categories and approval workflow",
    href: "/settings/expenses",
    icon: "receipt",
    order: 6,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasExpenseSettings",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create an expense template",
    description: "Set up recurring expense templates for common costs",
    href: "/expenses/templates/new",
    icon: "repeat",
    order: 7,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasExpenseTemplates",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create a booking form",
    description: "Let clients book sessions online",
    href: "/booking-forms/new",
    icon: "calendar-plus",
    order: 8,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasBookingForms",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Set up your availability",
    description: "Configure your working hours for scheduling",
    href: "/settings/calendar",
    icon: "clock",
    order: 9,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasAvailability",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create a contract template",
    description: "Set up client agreements and terms",
    href: "/contracts/templates/new",
    icon: "file-text",
    order: 10,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasContractTemplates",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create an invoice template",
    description: "Customize your invoice branding and layout",
    href: "/invoices/templates/new",
    icon: "file-invoice",
    order: 11,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    completionType: "hasInvoiceTemplates",
    completionValue: null,
    completed: false,
    skippedAt: null,
    industries: [],
    plans: [],
  },
];

// ============================================================================
// GET CHECKLIST ITEMS
// ============================================================================

/**
 * Get all checklist items for the organization
 * If no items exist, seeds the default items
 */
export async function getOnboardingChecklistItems(): Promise<
  ActionResult<ChecklistItemData[]>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Check if items exist
    let items = await prisma.onboardingChecklistItem.findMany({
      where: { organizationId },
      orderBy: { order: "asc" },
    });

    // Seed defaults if no items exist
    if (items.length === 0) {
      await seedDefaultChecklistItems(organizationId);
      items = await prisma.onboardingChecklistItem.findMany({
        where: { organizationId },
        orderBy: { order: "asc" },
      });
    }

    return success(items as ChecklistItemData[]);
  } catch (error) {
    console.error("[OnboardingChecklist] Error fetching items:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch checklist items");
  }
}

/**
 * Get checklist items with completion status calculated
 */
export async function getChecklistItemsWithStatus(): Promise<
  ActionResult<(ChecklistItemData & { isCompleted: boolean; isSkipped: boolean })[]>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get items
    const itemsResult = await getOnboardingChecklistItems();
    if (!itemsResult.success) {
      return fail(itemsResult.error || "Failed to get items");
    }
    if (!itemsResult.data) {
      return fail("No checklist items data");
    }

    // Get organization data for completion checks
    const [org, propertyWebsitesCount] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          logoUrl: true,
          primaryColor: true,
          stripeConnectOnboarded: true,
          primaryIndustry: true,
          industries: true,
          expenseMileageRateCents: true,
          _count: {
            select: {
              clients: true,
              services: true,
              projects: true,
              recurringExpenseTemplates: true,
              bookingForms: true,
              bookingSlots: true,
              contractTemplates: true,
              invoiceTemplates: true,
            },
          },
        },
      }),
      // Count property websites through projects
      prisma.propertyWebsite.count({
        where: {
          project: { organizationId },
        },
      }),
    ]);

    if (!org) {
      return fail("Organization not found");
    }

    // Expense settings are "configured" if they've changed from default values
    // (mileage rate or expense templates exist)
    const hasExpenseSettings =
      org.expenseMileageRateCents !== 67 ||
      org._count.recurringExpenseTemplates > 0;

    // Calculate completion status for each item
    const completionStatus: Record<string, boolean> = {
      hasClients: org._count.clients > 0,
      hasServices: org._count.services > 0,
      hasGalleries: org._count.projects > 0,
      hasProperties: propertyWebsitesCount > 0,
      hasBranding: !!(org.logoUrl || org.primaryColor !== "#3b82f6"),
      hasPaymentMethod: org.stripeConnectOnboarded,
      hasExpenseSettings: hasExpenseSettings,
      hasExpenseTemplates: org._count.recurringExpenseTemplates > 0,
      hasBookingForms: org._count.bookingForms > 0,
      hasAvailability: org._count.bookingSlots > 0,
      hasContractTemplates: org._count.contractTemplates > 0,
      hasInvoiceTemplates: org._count.invoiceTemplates > 0,
    };

    // Filter and map items based on industry
    const orgIndustries = org.industries as string[];
    const filteredItems = itemsResult.data
      .filter((item) => {
        // Filter by industry if specified
        if (item.industries.length > 0) {
          return item.industries.some(
            (ind) =>
              orgIndustries.includes(ind) || org.primaryIndustry === ind
          );
        }
        return true;
      })
      .filter((item) => item.isEnabled)
      .map((item) => {
        const isSkipped = item.skippedAt !== null;
        const actuallyCompleted = item.completionType
          ? completionStatus[item.completionType] ?? item.completed
          : item.completed;

        return {
          ...item,
          isSkipped,
          // Treat skipped items as completed for progress tracking
          isCompleted: actuallyCompleted || isSkipped,
        };
      });

    return success(filteredItems);
  } catch (error) {
    console.error("[OnboardingChecklist] Error getting items with status:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get checklist items");
  }
}

// ============================================================================
// CREATE CHECKLIST ITEM
// ============================================================================

/**
 * Create a new custom checklist item
 */
export async function createChecklistItem(
  input: CreateChecklistItemInput
): Promise<ActionResult<ChecklistItemData>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get max order
    const maxOrder = await prisma.onboardingChecklistItem.aggregate({
      where: { organizationId },
      _max: { order: true },
    });

    const item = await prisma.onboardingChecklistItem.create({
      data: {
        organizationId,
        label: input.label,
        description: input.description,
        href: input.href,
        icon: input.icon || "check",
        order: input.order ?? (maxOrder._max.order ?? 0) + 1,
        isEnabled: true,
        isDefault: false,
        isCustom: true,
        completionType: input.completionType || "custom",
        completionValue: input.completionValue,
        completed: false,
        industries: input.industries || [],
        plans: input.plans || [],
      },
    });

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return success(item as ChecklistItemData);
  } catch (error) {
    console.error("[OnboardingChecklist] Error creating item:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create checklist item");
  }
}

// ============================================================================
// UPDATE CHECKLIST ITEM
// ============================================================================

/**
 * Update a checklist item
 */
export async function updateChecklistItem(
  itemId: string,
  input: UpdateChecklistItemInput
): Promise<ActionResult<ChecklistItemData>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify ownership
    const existing = await prisma.onboardingChecklistItem.findFirst({
      where: { id: itemId, organizationId },
    });

    if (!existing) {
      return fail("Checklist item not found");
    }

    const item = await prisma.onboardingChecklistItem.update({
      where: { id: itemId },
      data: {
        ...(input.label !== undefined && { label: input.label }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.href !== undefined && { href: input.href }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
        ...(input.completionType !== undefined && { completionType: input.completionType }),
        ...(input.completionValue !== undefined && { completionValue: input.completionValue }),
        ...(input.completed !== undefined && { completed: input.completed }),
        ...(input.industries !== undefined && { industries: input.industries }),
        ...(input.plans !== undefined && { plans: input.plans }),
      },
    });

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return success(item as ChecklistItemData);
  } catch (error) {
    console.error("[OnboardingChecklist] Error updating item:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update checklist item");
  }
}

// ============================================================================
// DELETE CHECKLIST ITEM
// ============================================================================

/**
 * Delete a checklist item (only custom items can be fully deleted)
 */
export async function deleteChecklistItem(
  itemId: string
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify ownership
    const existing = await prisma.onboardingChecklistItem.findFirst({
      where: { id: itemId, organizationId },
    });

    if (!existing) {
      return fail("Checklist item not found");
    }

    // Only allow deleting custom items
    if (!existing.isCustom) {
      return fail("Cannot delete default checklist items. Disable them instead.");
    }

    await prisma.onboardingChecklistItem.delete({
      where: { id: itemId },
    });

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return ok();
  } catch (error) {
    console.error("[OnboardingChecklist] Error deleting item:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete checklist item");
  }
}

// ============================================================================
// TOGGLE CHECKLIST ITEM
// ============================================================================

/**
 * Toggle a checklist item enabled/disabled
 */
export async function toggleChecklistItem(
  itemId: string
): Promise<ActionResult<ChecklistItemData>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify ownership
    const existing = await prisma.onboardingChecklistItem.findFirst({
      where: { id: itemId, organizationId },
    });

    if (!existing) {
      return fail("Checklist item not found");
    }

    const item = await prisma.onboardingChecklistItem.update({
      where: { id: itemId },
      data: { isEnabled: !existing.isEnabled },
    });

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return success(item as ChecklistItemData);
  } catch (error) {
    console.error("[OnboardingChecklist] Error toggling item:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to toggle checklist item");
  }
}

// ============================================================================
// REORDER CHECKLIST ITEMS
// ============================================================================

/**
 * Reorder checklist items
 */
export async function reorderChecklistItems(
  itemIds: string[]
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify all items belong to this organization
    const items = await prisma.onboardingChecklistItem.findMany({
      where: { organizationId, id: { in: itemIds } },
    });

    if (items.length !== itemIds.length) {
      return fail("Some items were not found");
    }

    // Update order for each item
    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.onboardingChecklistItem.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return ok();
  } catch (error) {
    console.error("[OnboardingChecklist] Error reordering items:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to reorder checklist items");
  }
}

// ============================================================================
// MARK ITEM COMPLETE
// ============================================================================

/**
 * Mark a custom checklist item as complete/incomplete
 */
export async function markChecklistItemComplete(
  itemId: string,
  completed: boolean
): Promise<ActionResult<ChecklistItemData>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify ownership
    const existing = await prisma.onboardingChecklistItem.findFirst({
      where: { id: itemId, organizationId },
    });

    if (!existing) {
      return fail("Checklist item not found");
    }

    // Only custom items can be manually marked complete
    if (existing.completionType !== "custom" && !existing.isCustom) {
      return fail("This item's completion is tracked automatically");
    }

    const item = await prisma.onboardingChecklistItem.update({
      where: { id: itemId },
      data: { completed },
    });

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return success(item as ChecklistItemData);
  } catch (error) {
    console.error("[OnboardingChecklist] Error marking item complete:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update checklist item");
  }
}

// ============================================================================
// SKIP CHECKLIST ITEM
// ============================================================================

/**
 * Skip or unskip a checklist item
 * Skipped items are treated as completed for progress tracking
 */
export async function skipChecklistItem(
  itemId: string,
  skip: boolean = true
): Promise<ActionResult<ChecklistItemData>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify ownership
    const existing = await prisma.onboardingChecklistItem.findFirst({
      where: { id: itemId, organizationId },
    });

    if (!existing) {
      return fail("Checklist item not found");
    }

    const item = await prisma.onboardingChecklistItem.update({
      where: { id: itemId },
      data: { skippedAt: skip ? new Date() : null },
    });

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return success(item as ChecklistItemData);
  } catch (error) {
    console.error("[OnboardingChecklist] Error skipping item:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to skip checklist item");
  }
}

// ============================================================================
// RESET TO DEFAULTS
// ============================================================================

/**
 * Reset checklist items to defaults
 */
export async function resetChecklistToDefaults(): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Delete all existing items
    await prisma.onboardingChecklistItem.deleteMany({
      where: { organizationId },
    });

    // Seed defaults
    await seedDefaultChecklistItems(organizationId);

    revalidatePath("/settings/onboarding");
    revalidatePath("/dashboard");

    return ok();
  } catch (error) {
    console.error("[OnboardingChecklist] Error resetting to defaults:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to reset checklist");
  }
}

// ============================================================================
// SEED DEFAULT ITEMS
// ============================================================================

/**
 * Seed default checklist items for an organization
 */
async function seedDefaultChecklistItems(organizationId: string): Promise<void> {
  await prisma.onboardingChecklistItem.createMany({
    data: DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
      ...item,
      organizationId,
      order: index,
    })),
  });
}

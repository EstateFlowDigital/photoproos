"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import {
  triggerOnboardingStepCompleted,
  triggerOnboardingComplete,
} from "@/lib/gamification/trigger";

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
  category: string;
  // Enhanced UX
  estimatedMinutes: number;
  videoUrl: string | null;
  tip: string | null;
  dependencies: string[];
  // Gamification
  xpReward: number;
  xpAwarded: boolean;
  // Completion
  completionType: string | null;
  completionValue: string | null;
  completed: boolean;
  skippedAt: Date | null;
  completedAt: Date | null;
  industries: string[];
  plans: string[];
}

// Categories for organizing onboarding steps
export type OnboardingCategory = "getting_started" | "payments" | "workflow" | "advanced";

export interface CreateChecklistItemInput {
  label: string;
  description: string;
  href: string;
  icon?: string;
  order?: number;
  category?: string;
  estimatedMinutes?: number;
  videoUrl?: string;
  tip?: string;
  dependencies?: string[];
  xpReward?: number;
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
  category?: string;
  estimatedMinutes?: number;
  videoUrl?: string;
  tip?: string;
  dependencies?: string[];
  xpReward?: number;
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
  // ==================== GETTING STARTED ====================
  {
    label: "Add your first client",
    description: "Start building your client database",
    href: "/clients/new",
    icon: "users",
    order: 0,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "getting_started",
    estimatedMinutes: 2,
    videoUrl: null,
    tip: "Add contact info now - you can add project details later when you create a gallery.",
    dependencies: [],
    xpReward: 50,
    xpAwarded: false,
    completionType: "hasClients",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
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
    category: "getting_started",
    estimatedMinutes: 5,
    videoUrl: null,
    tip: "Start with your most popular package. You can add more services anytime.",
    dependencies: [],
    xpReward: 75,
    xpAwarded: false,
    completionType: "hasServices",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Customize your branding",
    description: "Add your logo and brand colors",
    href: "/settings/branding",
    icon: "palette",
    order: 2,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "getting_started",
    estimatedMinutes: 3,
    videoUrl: null,
    tip: "Your branding appears on galleries, invoices, and client communications.",
    dependencies: [],
    xpReward: 50,
    xpAwarded: false,
    completionType: "hasBranding",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create your first gallery",
    description: "Upload photos and deliver to clients",
    href: "/galleries/new",
    icon: "images",
    order: 3,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "getting_started",
    estimatedMinutes: 10,
    videoUrl: null,
    tip: "You can upload photos in bulk or drag-and-drop. Galleries auto-save as you work.",
    dependencies: ["hasClients"],
    xpReward: 100,
    xpAwarded: false,
    completionType: "hasGalleries",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create a property website",
    description: "Build your first property listing page",
    href: "/properties/new",
    icon: "building-2",
    order: 4,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "getting_started",
    estimatedMinutes: 8,
    videoUrl: null,
    tip: "Property websites can be shared with agents and featured on MLS listings.",
    dependencies: ["hasGalleries"],
    xpReward: 100,
    xpAwarded: false,
    completionType: "hasProperties",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: ["real_estate"],
    plans: [],
  },

  // ==================== PAYMENTS ====================
  {
    label: "Set up payments",
    description: "Connect Stripe to accept payments",
    href: "/settings/payments",
    icon: "credit-card",
    order: 5,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "payments",
    estimatedMinutes: 5,
    videoUrl: null,
    tip: "Once connected, clients can pay invoices online and unlock galleries automatically.",
    dependencies: [],
    xpReward: 150,
    xpAwarded: false,
    completionType: "hasPaymentMethod",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create an invoice template",
    description: "Customize your invoice branding and layout",
    href: "/invoices/templates/new",
    icon: "file-invoice",
    order: 6,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "payments",
    estimatedMinutes: 5,
    videoUrl: null,
    tip: "Templates save time - create once, reuse for every client.",
    dependencies: ["hasPaymentMethod"],
    xpReward: 75,
    xpAwarded: false,
    completionType: "hasInvoiceTemplates",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },

  // ==================== WORKFLOW ====================
  {
    label: "Set up your availability",
    description: "Configure your working hours for scheduling",
    href: "/settings/calendar",
    icon: "clock",
    order: 7,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "workflow",
    estimatedMinutes: 3,
    videoUrl: null,
    tip: "Your availability controls when clients can book sessions through your booking forms.",
    dependencies: [],
    xpReward: 50,
    xpAwarded: false,
    completionType: "hasAvailability",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
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
    category: "workflow",
    estimatedMinutes: 8,
    videoUrl: null,
    tip: "Booking forms can collect deposits, require contracts, and sync to your calendar.",
    dependencies: ["hasAvailability", "hasServices"],
    xpReward: 100,
    xpAwarded: false,
    completionType: "hasBookingForms",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create a contract template",
    description: "Set up client agreements and terms",
    href: "/contracts/templates/new",
    icon: "file-text",
    order: 9,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "workflow",
    estimatedMinutes: 10,
    videoUrl: null,
    tip: "Contracts can be automatically sent with booking confirmations.",
    dependencies: [],
    xpReward: 100,
    xpAwarded: false,
    completionType: "hasContractTemplates",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },

  // ==================== ADVANCED ====================
  {
    label: "Set up expense tracking",
    description: "Configure expense categories and approval workflow",
    href: "/settings/expenses",
    icon: "receipt",
    order: 10,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "advanced",
    estimatedMinutes: 3,
    videoUrl: null,
    tip: "Track mileage, equipment, and other business expenses for tax time.",
    dependencies: [],
    xpReward: 50,
    xpAwarded: false,
    completionType: "hasExpenseSettings",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },
  {
    label: "Create an expense template",
    description: "Set up recurring expense templates for common costs",
    href: "/expenses/templates/new",
    icon: "repeat",
    order: 11,
    isEnabled: true,
    isDefault: true,
    isCustom: false,
    category: "advanced",
    estimatedMinutes: 3,
    videoUrl: null,
    tip: "Templates auto-fill expenses like gas, editing software, or equipment rentals.",
    dependencies: ["hasExpenseSettings"],
    xpReward: 50,
    xpAwarded: false,
    completionType: "hasExpenseTemplates",
    completionValue: null,
    completed: false,
    skippedAt: null,
    completedAt: null,
    industries: [],
    plans: [],
  },
];

// Import onboarding constants from shared constants file
// Use "@/lib/constants/onboarding" in components that need these values
import {
  ONBOARDING_XP_REWARDS,
  ONBOARDING_ACHIEVEMENTS,
} from "@/lib/constants/onboarding";

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

// ============================================================================
// GAMIFICATION INTEGRATION
// ============================================================================

/**
 * Award XP for completing an onboarding step
 * Also checks for milestone achievements
 */
export async function awardOnboardingXP(
  userId: string,
  itemId: string
): Promise<ActionResult<{ xpAwarded: number; milestoneReached?: string; totalProgress: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get the item
    const item = await prisma.onboardingChecklistItem.findFirst({
      where: { id: itemId, organizationId },
    });

    if (!item) {
      return fail("Checklist item not found");
    }

    // Check if XP was already awarded
    if (item.xpAwarded) {
      return success({ xpAwarded: 0, totalProgress: 0 });
    }

    // Award the XP
    const xpToAward = item.xpReward;

    await prisma.$transaction([
      // Mark XP as awarded on the item
      prisma.onboardingChecklistItem.update({
        where: { id: itemId },
        data: {
          xpAwarded: true,
          completedAt: new Date(),
        },
      }),
      // Add XP to user's profile
      prisma.gamificationProfile.upsert({
        where: { userId },
        create: {
          userId,
          totalXp: xpToAward,
        },
        update: {
          totalXp: { increment: xpToAward },
        },
      }),
    ]);

    // Check for milestone achievements
    const milestoneResult = await checkOnboardingMilestones(userId, organizationId);

    console.log(`[Onboarding] Awarded ${xpToAward} XP to user ${userId} for completing: ${item.label}`);

    return success({
      xpAwarded: xpToAward,
      milestoneReached: milestoneResult.milestone,
      totalProgress: milestoneResult.progress,
    });
  } catch (error) {
    console.error("[Onboarding] Error awarding XP:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to award XP");
  }
}

/**
 * Check for onboarding milestone achievements
 */
async function checkOnboardingMilestones(
  userId: string,
  organizationId: string
): Promise<{ milestone?: string; progress: number; bonusXp: number }> {
  try {
    // Get all enabled items with their completion status
    const items = await prisma.onboardingChecklistItem.findMany({
      where: { organizationId, isEnabled: true },
    });

    const completedCount = items.filter(
      (item) => item.xpAwarded || item.skippedAt !== null
    ).length;
    const totalCount = items.length;
    const progress = Math.round((completedCount / totalCount) * 100);

    // Check which milestone we just reached
    let milestone: string | undefined;
    let bonusXp = 0;

    // Get organization to check what milestones have been recorded
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        onboardingMilestones: true,
        createdAt: true,
      },
    });

    const milestones = (org?.onboardingMilestones as string[]) || [];

    // Check milestones in order
    if (progress >= 25 && !milestones.includes("25")) {
      milestone = "25";
      bonusXp = ONBOARDING_XP_REWARDS.MILESTONE_25;
    } else if (progress >= 50 && !milestones.includes("50")) {
      milestone = "50";
      bonusXp = ONBOARDING_XP_REWARDS.MILESTONE_50;
    } else if (progress >= 75 && !milestones.includes("75")) {
      milestone = "75";
      bonusXp = ONBOARDING_XP_REWARDS.MILESTONE_75;
    } else if (progress >= 100 && !milestones.includes("100")) {
      milestone = "100";
      bonusXp = ONBOARDING_XP_REWARDS.MILESTONE_100;

      // Check for speed bonus (completed within first week)
      if (org?.createdAt) {
        const daysSinceCreation = Math.floor(
          (Date.now() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreation <= 7 && !milestones.includes("speed")) {
          bonusXp += ONBOARDING_XP_REWARDS.SPEED_BONUS;
          // Record speed milestone too
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              onboardingMilestones: [...milestones, "speed"],
            },
          });
        }
      }
    }

    // Record milestone and award bonus XP
    if (milestone) {
      await prisma.$transaction([
        // Record milestone
        prisma.organization.update({
          where: { id: organizationId },
          data: {
            onboardingMilestones: [...milestones, milestone],
            ...(milestone === "100" ? {
              onboardingCompleted: true,
              onboardingCompletedAt: new Date(),
            } : {}),
          },
        }),
        // Award bonus XP
        prisma.gamificationProfile.update({
          where: { userId },
          data: {
            totalXp: { increment: bonusXp },
          },
        }),
      ]);

      console.log(`[Onboarding] User ${userId} reached ${milestone}% milestone! Bonus: ${bonusXp} XP`);

      // Fire gamification trigger for milestone achievements
      const isFirstStep = completedCount === 1;
      triggerOnboardingStepCompleted(userId, organizationId, progress, isFirstStep);

      // If 100% complete, fire completion trigger
      if (milestone === "100" && org?.createdAt) {
        const daysToComplete = Math.floor(
          (Date.now() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        triggerOnboardingComplete(userId, organizationId, daysToComplete);
      }
    }

    return { milestone, progress, bonusXp };
  } catch (error) {
    console.error("[Onboarding] Error checking milestones:", error);
    return { progress: 0, bonusXp: 0 };
  }
}

/**
 * Get onboarding progress with milestone info
 */
export async function getOnboardingProgress(): Promise<
  ActionResult<{
    completedCount: number;
    totalCount: number;
    progress: number;
    totalXpEarned: number;
    totalXpAvailable: number;
    milestonesReached: string[];
    nextMilestone: { percent: number; bonusXp: number } | null;
    estimatedTimeRemaining: number; // in minutes
    categorySummary: Record<string, { completed: number; total: number }>;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get all enabled items
    const items = await prisma.onboardingChecklistItem.findMany({
      where: { organizationId, isEnabled: true },
      orderBy: { order: "asc" },
    });

    // Get organization milestones
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { onboardingMilestones: true },
    });

    const milestonesReached = (org?.onboardingMilestones as string[]) || [];

    // Calculate stats
    const completedItems = items.filter(
      (item) => item.xpAwarded || item.skippedAt !== null
    );
    const completedCount = completedItems.length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Calculate XP
    const totalXpEarned = items
      .filter((item) => item.xpAwarded)
      .reduce((sum, item) => sum + item.xpReward, 0);
    const totalXpAvailable = items.reduce((sum, item) => sum + item.xpReward, 0);

    // Calculate time remaining
    const incompleteItems = items.filter(
      (item) => !item.xpAwarded && item.skippedAt === null
    );
    const estimatedTimeRemaining = incompleteItems.reduce(
      (sum, item) => sum + item.estimatedMinutes,
      0
    );

    // Calculate next milestone
    let nextMilestone: { percent: number; bonusXp: number } | null = null;
    if (progress < 25) {
      nextMilestone = { percent: 25, bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_25 };
    } else if (progress < 50) {
      nextMilestone = { percent: 50, bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_50 };
    } else if (progress < 75) {
      nextMilestone = { percent: 75, bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_75 };
    } else if (progress < 100) {
      nextMilestone = { percent: 100, bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_100 };
    }

    // Calculate category summary
    const categorySummary: Record<string, { completed: number; total: number }> = {};
    for (const item of items) {
      if (!categorySummary[item.category]) {
        categorySummary[item.category] = { completed: 0, total: 0 };
      }
      categorySummary[item.category].total++;
      if (item.xpAwarded || item.skippedAt !== null) {
        categorySummary[item.category].completed++;
      }
    }

    return success({
      completedCount,
      totalCount,
      progress,
      totalXpEarned,
      totalXpAvailable,
      milestonesReached,
      nextMilestone,
      estimatedTimeRemaining,
      categorySummary,
    });
  } catch (error) {
    console.error("[Onboarding] Error getting progress:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get onboarding progress");
  }
}

// Category labels are available from "@/lib/constants/onboarding"
// import { CATEGORY_LABELS } from "@/lib/constants/onboarding";

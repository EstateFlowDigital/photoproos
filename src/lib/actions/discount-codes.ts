"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface CreateDiscountCodeInput {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  maxUses?: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom?: Date;
  validUntil?: Date;
  applicableServices?: string[];
  applicableClients?: string[];
}

interface UpdateDiscountCodeInput extends Partial<CreateDiscountCodeInput> {
  isActive?: boolean;
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
// Discount Code Actions
// =============================================================================

/**
 * Create a new discount code
 */
export async function createDiscountCode(input: CreateDiscountCodeInput) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Check if code already exists
    const existing = await prisma.discountCode.findFirst({
      where: {
        organizationId,
        code: input.code.toUpperCase(),
      },
    });

    if (existing) {
      return { success: false, error: "Discount code already exists" };
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        organizationId,
        code: input.code.toUpperCase(),
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        maxUses: input.maxUses || 0,
        minPurchase: input.minPurchase || 0,
        maxDiscount: input.maxDiscount,
        validFrom: input.validFrom || new Date(),
        validUntil: input.validUntil,
        applicableServices: input.applicableServices || [],
        applicableClients: input.applicableClients || [],
      },
    });

    revalidatePath("/settings/payments");
    return { success: true, data: discountCode };
  } catch (error) {
    console.error("[Discount Code] Error creating:", error);
    return { success: false, error: "Failed to create discount code" };
  }
}

/**
 * Get all discount codes for the organization
 */
export async function getDiscountCodes() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const codes = await prisma.discountCode.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    return { success: true, data: codes };
  } catch (error) {
    console.error("[Discount Code] Error fetching:", error);
    return { success: false, error: "Failed to fetch discount codes" };
  }
}

/**
 * Update a discount code
 */
export async function updateDiscountCode(
  codeId: string,
  input: UpdateDiscountCodeInput
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const discountCode = await prisma.discountCode.update({
      where: {
        id: codeId,
        organizationId,
      },
      data: {
        code: input.code?.toUpperCase(),
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        maxUses: input.maxUses,
        minPurchase: input.minPurchase,
        maxDiscount: input.maxDiscount,
        validFrom: input.validFrom,
        validUntil: input.validUntil,
        isActive: input.isActive,
        applicableServices: input.applicableServices,
        applicableClients: input.applicableClients,
      },
    });

    revalidatePath("/settings/payments");
    return { success: true, data: discountCode };
  } catch (error) {
    console.error("[Discount Code] Error updating:", error);
    return { success: false, error: "Failed to update discount code" };
  }
}

/**
 * Delete a discount code
 */
export async function deleteDiscountCode(codeId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    await prisma.discountCode.delete({
      where: {
        id: codeId,
        organizationId,
      },
    });

    revalidatePath("/settings/payments");
    return ok();
  } catch (error) {
    console.error("[Discount Code] Error deleting:", error);
    return { success: false, error: "Failed to delete discount code" };
  }
}

/**
 * Validate and apply a discount code
 */
export async function validateDiscountCode(
  code: string,
  amountCents: number,
  clientEmail?: string,
  serviceId?: string
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        organizationId,
        code: code.toUpperCase(),
        isActive: true,
      },
    });

    if (!discountCode) {
      return { success: false, error: "Invalid discount code" };
    }

    // Check validity period
    const now = new Date();
    if (discountCode.validFrom > now) {
      return { success: false, error: "Discount code is not yet active" };
    }
    if (discountCode.validUntil && discountCode.validUntil < now) {
      return { success: false, error: "Discount code has expired" };
    }

    // Check usage limit
    if (discountCode.maxUses && discountCode.maxUses > 0) {
      if (discountCode.usedCount >= discountCode.maxUses) {
        return { success: false, error: "Discount code has reached its usage limit" };
      }
    }

    // Check minimum purchase
    if (discountCode.minPurchase && amountCents < discountCode.minPurchase) {
      const minAmount = (discountCode.minPurchase / 100).toFixed(2);
      return { success: false, error: `Minimum purchase of $${minAmount} required` };
    }

    // Check applicable services
    if (discountCode.applicableServices.length > 0 && serviceId) {
      if (!discountCode.applicableServices.includes(serviceId)) {
        return { success: false, error: "Discount code not valid for this service" };
      }
    }

    // Check applicable clients
    if (discountCode.applicableClients.length > 0 && clientEmail) {
      if (!discountCode.applicableClients.includes(clientEmail)) {
        return { success: false, error: "Discount code not valid for this client" };
      }
    }

    // Calculate discount
    let discountAmount: number;
    if (discountCode.discountType === "percentage") {
      discountAmount = Math.round((amountCents * discountCode.discountValue) / 100);
      // Apply max discount cap if set
      if (discountCode.maxDiscount && discountAmount > discountCode.maxDiscount) {
        discountAmount = discountCode.maxDiscount;
      }
    } else {
      discountAmount = discountCode.discountValue;
    }

    // Don't discount more than the total
    if (discountAmount > amountCents) {
      discountAmount = amountCents;
    }

    return {
      success: true,
      data: {
        discountCodeId: discountCode.id,
        discountAmount,
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        description: discountCode.description,
      },
    };
  } catch (error) {
    console.error("[Discount Code] Error validating:", error);
    return { success: false, error: "Failed to validate discount code" };
  }
}

/**
 * Record usage of a discount code
 */
export async function recordDiscountCodeUsage(
  discountCodeId: string,
  discountAmount: number,
  invoiceId?: string,
  paymentId?: string,
  clientEmail?: string
) {
  try {
    await prisma.$transaction([
      prisma.discountCodeUsage.create({
        data: {
          discountCodeId,
          invoiceId,
          paymentId,
          clientEmail,
          discountAmount,
        },
      }),
      prisma.discountCode.update({
        where: { id: discountCodeId },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return ok();
  } catch (error) {
    console.error("[Discount Code] Error recording usage:", error);
    return { success: false, error: "Failed to record discount code usage" };
  }
}

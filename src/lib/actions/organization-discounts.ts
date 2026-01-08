"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/auth-helper";
import type { DiscountType, DiscountAppliesTo, DiscountScope } from "@prisma/client";

// Types
export interface OrgDiscountListItem {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: DiscountAppliesTo;
  maxUses: number | null;
  usagePerUser: number;
  usedCount: number;
  isActive: boolean;
  isPublic: boolean;
  shareableSlug: string | null;
  qrCodeUrl: string | null;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  totalSavings: number;
}

export interface CreateOrgDiscountInput {
  code: string;
  name?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: DiscountAppliesTo;
  maxUses?: number;
  usagePerUser?: number;
  isActive?: boolean;
  isPublic?: boolean;
  validFrom?: Date;
  validUntil?: Date;
}

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get organization discounts
export async function getOrgDiscounts(options: {
  limit?: number;
  offset?: number;
  isActive?: boolean;
}): Promise<ActionResult<{ discounts: OrgDiscountListItem[]; total: number }>> {
  try {
    const { organizationId } = await requireAuth();

    const where = {
      organizationId,
      scope: "organization" as DiscountScope,
      ...(options.isActive !== undefined ? { isActive: options.isActive } : {}),
    };

    const [discounts, total] = await Promise.all([
      prisma.discountCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      prisma.discountCode.count({ where }),
    ]);

    return {
      success: true,
      data: {
        discounts: discounts.map((d) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          description: d.description,
          discountType: d.discountType,
          discountValue: d.discountValue,
          appliesTo: d.appliesTo,
          maxUses: d.maxUses,
          usagePerUser: d.usagePerUser,
          usedCount: d.usedCount,
          isActive: d.isActive,
          isPublic: d.isPublic,
          shareableSlug: d.shareableSlug,
          qrCodeUrl: d.qrCodeUrl,
          validFrom: d.validFrom,
          validUntil: d.validUntil,
          createdAt: d.createdAt,
          totalSavings: d.totalSavings,
        })),
        total,
      },
    };
  } catch (error) {
    console.error("[Org Discounts] Error fetching discounts:", error);
    return { success: false, error: "Failed to fetch discounts" };
  }
}

// Create organization discount
export async function createOrgDiscount(
  input: CreateOrgDiscountInput
): Promise<ActionResult<OrgDiscountListItem>> {
  try {
    const { organizationId, userId } = await requireAuth();

    // Check if code already exists for this org
    const existing = await prisma.discountCode.findFirst({
      where: {
        organizationId,
        code: input.code.toUpperCase(),
      },
    });

    if (existing) {
      return { success: false, error: "A discount code with this code already exists" };
    }

    // Generate shareable slug
    const shareableSlug = `${input.code.toLowerCase()}-${Date.now().toString(36)}`;

    const discount = await prisma.discountCode.create({
      data: {
        organizationId,
        createdByUserId: userId,
        scope: "organization",
        code: input.code.toUpperCase(),
        name: input.name || null,
        description: input.description || null,
        discountType: input.discountType,
        discountValue: input.discountValue,
        appliesTo: input.appliesTo,
        maxUses: input.maxUses || null,
        usagePerUser: input.usagePerUser || 1,
        isActive: input.isActive ?? true,
        isPublic: input.isPublic ?? false,
        shareableSlug,
        validFrom: input.validFrom || null,
        validUntil: input.validUntil || null,
      },
    });

    return {
      success: true,
      data: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        description: discount.description,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        appliesTo: discount.appliesTo,
        maxUses: discount.maxUses,
        usagePerUser: discount.usagePerUser,
        usedCount: discount.usedCount,
        isActive: discount.isActive,
        isPublic: discount.isPublic,
        shareableSlug: discount.shareableSlug,
        qrCodeUrl: discount.qrCodeUrl,
        validFrom: discount.validFrom,
        validUntil: discount.validUntil,
        createdAt: discount.createdAt,
        totalSavings: discount.totalSavings,
      },
    };
  } catch (error) {
    console.error("[Org Discounts] Error creating discount:", error);
    return { success: false, error: "Failed to create discount" };
  }
}

// Update organization discount
export async function updateOrgDiscount(
  id: string,
  input: Partial<CreateOrgDiscountInput>
): Promise<ActionResult<OrgDiscountListItem>> {
  try {
    const { organizationId } = await requireAuth();

    // Verify ownership
    const existing = await prisma.discountCode.findFirst({
      where: { id, organizationId, scope: "organization" },
    });

    if (!existing) {
      return { success: false, error: "Discount not found" };
    }

    // Check for duplicate code if code is being changed
    if (input.code && input.code.toUpperCase() !== existing.code) {
      const duplicate = await prisma.discountCode.findFirst({
        where: {
          organizationId,
          code: input.code.toUpperCase(),
          NOT: { id },
        },
      });

      if (duplicate) {
        return { success: false, error: "A discount code with this code already exists" };
      }
    }

    const discount = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(input.code && { code: input.code.toUpperCase() }),
        ...(input.name !== undefined && { name: input.name || null }),
        ...(input.description !== undefined && { description: input.description || null }),
        ...(input.discountType && { discountType: input.discountType }),
        ...(input.discountValue !== undefined && { discountValue: input.discountValue }),
        ...(input.appliesTo && { appliesTo: input.appliesTo }),
        ...(input.maxUses !== undefined && { maxUses: input.maxUses || null }),
        ...(input.usagePerUser !== undefined && { usagePerUser: input.usagePerUser || 1 }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
        ...(input.validFrom !== undefined && { validFrom: input.validFrom || null }),
        ...(input.validUntil !== undefined && { validUntil: input.validUntil || null }),
      },
    });

    return {
      success: true,
      data: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        description: discount.description,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        appliesTo: discount.appliesTo,
        maxUses: discount.maxUses,
        usagePerUser: discount.usagePerUser,
        usedCount: discount.usedCount,
        isActive: discount.isActive,
        isPublic: discount.isPublic,
        shareableSlug: discount.shareableSlug,
        qrCodeUrl: discount.qrCodeUrl,
        validFrom: discount.validFrom,
        validUntil: discount.validUntil,
        createdAt: discount.createdAt,
        totalSavings: discount.totalSavings,
      },
    };
  } catch (error) {
    console.error("[Org Discounts] Error updating discount:", error);
    return { success: false, error: "Failed to update discount" };
  }
}

// Delete organization discount
export async function deleteOrgDiscount(id: string): Promise<ActionResult<void>> {
  try {
    const { organizationId } = await requireAuth();

    // Verify ownership
    const existing = await prisma.discountCode.findFirst({
      where: { id, organizationId, scope: "organization" },
    });

    if (!existing) {
      return { success: false, error: "Discount not found" };
    }

    await prisma.discountCode.delete({ where: { id } });

    return { success: true };
  } catch (error) {
    console.error("[Org Discounts] Error deleting discount:", error);
    return { success: false, error: "Failed to delete discount" };
  }
}

// Toggle discount active status
export async function toggleOrgDiscountActive(
  id: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    const { organizationId } = await requireAuth();

    const existing = await prisma.discountCode.findFirst({
      where: { id, organizationId, scope: "organization" },
    });

    if (!existing) {
      return { success: false, error: "Discount not found" };
    }

    const discount = await prisma.discountCode.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: { isActive: true },
    });

    return { success: true, data: { isActive: discount.isActive } };
  } catch (error) {
    console.error("[Org Discounts] Error toggling discount:", error);
    return { success: false, error: "Failed to toggle discount" };
  }
}

// Generate QR code for discount
export async function generateOrgDiscountQrCode(
  id: string,
  baseUrl: string
): Promise<ActionResult<{ qrCodeUrl: string }>> {
  try {
    const { organizationId } = await requireAuth();

    const discount = await prisma.discountCode.findFirst({
      where: { id, organizationId, scope: "organization" },
    });

    if (!discount) {
      return { success: false, error: "Discount not found" };
    }

    // Generate or use existing shareable slug
    let shareableSlug = discount.shareableSlug;
    if (!shareableSlug) {
      shareableSlug = `${discount.code.toLowerCase()}-${Date.now().toString(36)}`;
      await prisma.discountCode.update({
        where: { id },
        data: { shareableSlug },
      });
    }

    // Generate QR code URL using a QR code API
    const discountUrl = `${baseUrl}/discount/${shareableSlug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(discountUrl)}`;

    // Store QR code URL
    await prisma.discountCode.update({
      where: { id },
      data: { qrCodeUrl },
    });

    return { success: true, data: { qrCodeUrl } };
  } catch (error) {
    console.error("[Org Discounts] Error generating QR code:", error);
    return { success: false, error: "Failed to generate QR code" };
  }
}

// Get discount stats for organization
export async function getOrgDiscountStats(): Promise<
  ActionResult<{
    totalDiscounts: number;
    activeDiscounts: number;
    totalRedemptions: number;
    totalSavings: number;
  }>
> {
  try {
    const { organizationId } = await requireAuth();

    const [totalDiscounts, activeDiscounts, discountsWithStats] = await Promise.all([
      prisma.discountCode.count({
        where: { organizationId, scope: "organization" },
      }),
      prisma.discountCode.count({
        where: { organizationId, scope: "organization", isActive: true },
      }),
      prisma.discountCode.aggregate({
        where: { organizationId, scope: "organization" },
        _sum: {
          usedCount: true,
          totalSavings: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalDiscounts,
        activeDiscounts,
        totalRedemptions: discountsWithStats._sum.usedCount || 0,
        totalSavings: discountsWithStats._sum.totalSavings || 0,
      },
    };
  } catch (error) {
    console.error("[Org Discounts] Error fetching stats:", error);
    return { success: false, error: "Failed to fetch discount stats" };
  }
}

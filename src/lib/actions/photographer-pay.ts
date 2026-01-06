"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import type { EarningStatus } from "@prisma/client";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// Types
// ============================================================================

export interface PhotographerRateWithRelations {
  id: string;
  organizationId: string;
  userId: string;
  serviceId: string | null;
  rateType: string;
  rateValue: number;
  minPayCents: number | null;
  maxPayCents: number | null;
  bookingTypeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotographerEarningWithRelations {
  id: string;
  organizationId: string;
  userId: string;
  bookingId: string | null;
  invoiceId: string | null;
  description: string;
  amountCents: number;
  status: EarningStatus;
  rateType: string | null;
  rateValue: number | null;
  baseAmountCents: number | null;
  payoutItemId: string | null;
  earnedAt: Date;
  approvedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRateInput {
  userId: string;
  serviceId?: string | null;
  rateType: "percentage" | "fixed" | "hourly";
  rateValue: number;
  minPayCents?: number | null;
  maxPayCents?: number | null;
  bookingTypeId?: string | null;
}

export interface UpdateRateInput extends Partial<Omit<CreateRateInput, "userId">> {
  id: string;
}

// ============================================================================
// Rate Operations
// ============================================================================

/**
 * Get all photographer rates for the organization
 */
export async function getPhotographerRates(options?: {
  userId?: string;
  serviceId?: string;
}): Promise<ActionResult<PhotographerRateWithRelations[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const rates = await prisma.photographerRate.findMany({
      where: {
        organizationId,
        ...(options?.userId && { userId: options.userId }),
        ...(options?.serviceId && { serviceId: options.serviceId }),
      },
      orderBy: [{ userId: "asc" }, { serviceId: "asc" }],
    });

    return success(rates);
  } catch (error) {
    console.error("[PhotographerPay] Error fetching rates:", error);
    return fail("Failed to fetch photographer rates");
  }
}

/**
 * Get a photographer's rate for a specific service
 */
export async function getPhotographerRateForService(
  userId: string,
  serviceId: string
): Promise<ActionResult<PhotographerRateWithRelations | null>> {
  try {
    const organizationId = await requireOrganizationId();

    // First try to find a service-specific rate
    let rate = await prisma.photographerRate.findFirst({
      where: { organizationId, userId, serviceId },
    });

    // If not found, try the default rate (serviceId is null)
    if (!rate) {
      rate = await prisma.photographerRate.findFirst({
        where: { organizationId, userId, serviceId: null },
      });
    }

    return success(rate);
  } catch (error) {
    console.error("[PhotographerPay] Error fetching rate:", error);
    return fail("Failed to fetch photographer rate");
  }
}

/**
 * Create or update a photographer rate
 */
export async function upsertPhotographerRate(
  input: CreateRateInput
): Promise<ActionResult<PhotographerRateWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();
    const serviceId = input.serviceId ?? null;

    // Check if rate already exists (handle nullable serviceId)
    const existing = await prisma.photographerRate.findFirst({
      where: {
        organizationId,
        userId: input.userId,
        serviceId,
      },
    });

    let rate;

    if (existing) {
      // Update existing rate
      rate = await prisma.photographerRate.update({
        where: { id: existing.id },
        data: {
          rateType: input.rateType,
          rateValue: input.rateValue,
          minPayCents: input.minPayCents ?? null,
          maxPayCents: input.maxPayCents ?? null,
          bookingTypeId: input.bookingTypeId ?? null,
        },
      });
    } else {
      // Create new rate
      rate = await prisma.photographerRate.create({
        data: {
          organizationId,
          userId: input.userId,
          serviceId,
          rateType: input.rateType,
          rateValue: input.rateValue,
          minPayCents: input.minPayCents ?? null,
          maxPayCents: input.maxPayCents ?? null,
          bookingTypeId: input.bookingTypeId ?? null,
        },
      });
    }

    revalidatePath("/settings/photographer-pay");
    return success(rate);
  } catch (error) {
    console.error("[PhotographerPay] Error upserting rate:", error);
    return fail("Failed to save photographer rate");
  }
}

/**
 * Delete a photographer rate
 */
export async function deletePhotographerRate(id: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const rate = await prisma.photographerRate.findFirst({
      where: { id, organizationId },
    });

    if (!rate) {
      return fail("Rate not found");
    }

    await prisma.photographerRate.delete({ where: { id } });

    revalidatePath("/settings/photographer-pay");
    return ok();
  } catch (error) {
    console.error("[PhotographerPay] Error deleting rate:", error);
    return fail("Failed to delete photographer rate");
  }
}

// ============================================================================
// Earnings Operations
// ============================================================================

/**
 * Get photographer earnings
 */
export async function getPhotographerEarnings(options?: {
  userId?: string;
  status?: EarningStatus;
  startDate?: Date;
  endDate?: Date;
}): Promise<ActionResult<PhotographerEarningWithRelations[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const earnings = await prisma.photographerEarning.findMany({
      where: {
        organizationId,
        ...(options?.userId && { userId: options.userId }),
        ...(options?.status && { status: options.status }),
        ...(options?.startDate && { earnedAt: { gte: options.startDate } }),
        ...(options?.endDate && { earnedAt: { lte: options.endDate } }),
      },
      orderBy: { earnedAt: "desc" },
    });

    return success(earnings);
  } catch (error) {
    console.error("[PhotographerPay] Error fetching earnings:", error);
    return fail("Failed to fetch photographer earnings");
  }
}

/**
 * Get current user's earnings (for photographer dashboard)
 */
export async function getMyEarnings(options?: {
  status?: EarningStatus;
  startDate?: Date;
  endDate?: Date;
}): Promise<ActionResult<PhotographerEarningWithRelations[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const earnings = await prisma.photographerEarning.findMany({
      where: {
        organizationId,
        userId,
        ...(options?.status && { status: options.status }),
        ...(options?.startDate && { earnedAt: { gte: options.startDate } }),
        ...(options?.endDate && { earnedAt: { lte: options.endDate } }),
      },
      orderBy: { earnedAt: "desc" },
    });

    return success(earnings);
  } catch (error) {
    console.error("[PhotographerPay] Error fetching my earnings:", error);
    return fail("Failed to fetch earnings");
  }
}

/**
 * Calculate earnings for a completed booking
 */
export async function calculateBookingEarnings(
  bookingId: string,
  photographerId: string,
  invoiceAmountCents: number
): Promise<ActionResult<{ amountCents: number; rateType: string; rateValue: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get the booking to find the service
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, organizationId },
      select: { serviceId: true },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    // Get the photographer's rate
    const rateResult = await getPhotographerRateForService(
      photographerId,
      booking.serviceId || ""
    );

    if (!rateResult.success) {
      return fail(rateResult.error);
    }

    const rate = rateResult.data;

    // No rate configured - default to 0
    if (!rate) {
      return success({
        amountCents: 0,
        rateType: "none",
        rateValue: 0,
      });
    }

    let amountCents = 0;

    switch (rate.rateType) {
      case "percentage":
        amountCents = Math.round(invoiceAmountCents * (rate.rateValue / 100));
        break;
      case "fixed":
        amountCents = rate.rateValue;
        break;
      case "hourly":
        // Would need booking duration - for now use fixed
        amountCents = rate.rateValue;
        break;
    }

    // Apply min/max constraints
    if (rate.minPayCents && amountCents < rate.minPayCents) {
      amountCents = rate.minPayCents;
    }
    if (rate.maxPayCents && amountCents > rate.maxPayCents) {
      amountCents = rate.maxPayCents;
    }

    return success({
      amountCents,
      rateType: rate.rateType,
      rateValue: rate.rateValue,
    });
  } catch (error) {
    console.error("[PhotographerPay] Error calculating earnings:", error);
    return fail("Failed to calculate earnings");
  }
}

/**
 * Record earnings for a photographer
 */
export async function recordPhotographerEarning(input: {
  userId: string;
  bookingId?: string;
  invoiceId?: string;
  description: string;
  amountCents: number;
  rateType?: string;
  rateValue?: number;
  baseAmountCents?: number;
}): Promise<ActionResult<PhotographerEarningWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    const earning = await prisma.photographerEarning.create({
      data: {
        organizationId,
        userId: input.userId,
        bookingId: input.bookingId || null,
        invoiceId: input.invoiceId || null,
        description: input.description,
        amountCents: input.amountCents,
        status: "pending",
        rateType: input.rateType || null,
        rateValue: input.rateValue || null,
        baseAmountCents: input.baseAmountCents || null,
        earnedAt: new Date(),
      },
    });

    revalidatePath("/my-earnings");
    return success(earning);
  } catch (error) {
    console.error("[PhotographerPay] Error recording earning:", error);
    return fail("Failed to record earning");
  }
}

/**
 * Approve earnings for payout
 */
export async function approveEarnings(earningIds: string[]): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.photographerEarning.updateMany({
      where: {
        id: { in: earningIds },
        organizationId,
        status: "pending",
      },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    revalidatePath("/settings/photographer-pay");
    return ok();
  } catch (error) {
    console.error("[PhotographerPay] Error approving earnings:", error);
    return fail("Failed to approve earnings");
  }
}

// ============================================================================
// Stats
// ============================================================================

/**
 * Get earning statistics
 */
export async function getEarningStats(options?: {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<
  ActionResult<{
    totalEarned: number;
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const where = {
      organizationId,
      ...(options?.userId && { userId: options.userId }),
      ...(options?.startDate && { earnedAt: { gte: options.startDate } }),
      ...(options?.endDate && { earnedAt: { lte: options.endDate } }),
    };

    const [pending, approved, paid] = await Promise.all([
      prisma.photographerEarning.aggregate({
        where: { ...where, status: "pending" },
        _sum: { amountCents: true },
      }),
      prisma.photographerEarning.aggregate({
        where: { ...where, status: "approved" },
        _sum: { amountCents: true },
      }),
      prisma.photographerEarning.aggregate({
        where: { ...where, status: "paid" },
        _sum: { amountCents: true },
      }),
    ]);

    const totalEarned =
      (pending._sum.amountCents || 0) +
      (approved._sum.amountCents || 0) +
      (paid._sum.amountCents || 0);

    return success({
      totalEarned,
      pendingAmount: pending._sum.amountCents || 0,
      approvedAmount: approved._sum.amountCents || 0,
      paidAmount: paid._sum.amountCents || 0,
    });
  } catch (error) {
    console.error("[PhotographerPay] Error fetching stats:", error);
    return fail("Failed to fetch earning statistics");
  }
}

/**
 * Get my earning statistics (for photographer dashboard)
 */
export async function getMyEarningStats(): Promise<
  ActionResult<{
    totalEarned: number;
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
    currentMonthEarned: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const allTimeResult = await getEarningStats({ userId });
    if (!allTimeResult.success) {
      return fail(allTimeResult.error);
    }

    const currentMonthAggregate = await prisma.photographerEarning.aggregate({
      where: {
        organizationId,
        userId,
        earnedAt: { gte: startOfMonth },
      },
      _sum: { amountCents: true },
    });

    return success({
      ...allTimeResult.data,
      currentMonthEarned: currentMonthAggregate._sum.amountCents || 0,
    });
  } catch (error) {
    console.error("[PhotographerPay] Error fetching my stats:", error);
    return fail("Failed to fetch earning statistics");
  }
}

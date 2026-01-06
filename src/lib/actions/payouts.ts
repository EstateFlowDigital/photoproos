"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import type { PayoutStatus, EarningStatus } from "@prisma/client";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// Types
// ============================================================================

export interface PayoutBatchWithRelations {
  id: string;
  organizationId: string;
  batchNumber: string;
  status: PayoutStatus;
  periodStart: Date;
  periodEnd: Date;
  totalAmountCents: number;
  itemCount: number;
  processedAt: Date | null;
  failedReason: string | null;
  stripeTransferId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: PayoutItemWithRelations[];
}

export interface PayoutItemWithRelations {
  id: string;
  batchId: string;
  userId: string;
  amountCents: number;
  description: string | null;
  status: PayoutStatus;
  stripeTransferId: string | null;
  stripePayoutId: string | null;
  failedReason: string | null;
  processedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    fullName: string | null;
    email: string | null;
    stripeConnectAccountId: string | null;
    stripeConnectOnboarded: boolean;
  };
  earnings?: Array<{
    id: string;
    description: string;
    amountCents: number;
  }>;
}

export interface CreatePayoutBatchInput {
  photographerIds?: string[]; // If empty, include all with approved earnings
  periodStart?: Date;
  periodEnd?: Date;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all payout batches
 */
export async function getPayoutBatches(options?: {
  status?: PayoutStatus;
  limit?: number;
}): Promise<ActionResult<PayoutBatchWithRelations[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const batches = await prisma.payoutBatch.findMany({
      where: {
        organizationId,
        ...(options?.status && { status: options.status }),
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit,
    });

    return success(batches);
  } catch (error) {
    console.error("[Payouts] Error fetching batches:", error);
    return fail("Failed to fetch payout batches");
  }
}

/**
 * Get a single payout batch with items
 */
export async function getPayoutBatch(
  batchId: string
): Promise<ActionResult<PayoutBatchWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    const batch = await prisma.payoutBatch.findFirst({
      where: { id: batchId, organizationId },
      include: {
        items: {
          include: {
            earnings: {
              select: {
                id: true,
                description: true,
                amountCents: true,
              },
            },
          },
        },
      },
    });

    if (!batch) {
      return fail("Payout batch not found");
    }

    // Fetch user data separately for each item
    const userIds = batch.items.map((item) => item.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const itemsWithUsers = batch.items.map((item) => ({
      ...item,
      user: userMap.get(item.userId),
    }));

    return success({ ...batch, items: itemsWithUsers });
  } catch (error) {
    console.error("[Payouts] Error fetching batch:", error);
    return fail("Failed to fetch payout batch");
  }
}

/**
 * Get pending payouts for photographers (not yet in a batch)
 */
export async function getPendingPayouts(): Promise<
  ActionResult<
    Array<{
      userId: string;
      userFullName: string | null;
      userEmail: string | null;
      totalAmountCents: number;
      earningsCount: number;
      hasStripeConnect: boolean;
      stripeConnectOnboarded: boolean;
    }>
  >
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get all approved earnings not in a payout
    const earnings = await prisma.photographerEarning.findMany({
      where: {
        organizationId,
        status: "approved",
        payoutItemId: null,
      },
    });

    // Get unique user IDs
    const userIds = [...new Set(earnings.map((e) => e.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Group by photographer
    const grouped = new Map<
      string,
      {
        userId: string;
        userFullName: string | null;
        userEmail: string | null;
        totalAmountCents: number;
        earningsCount: number;
        hasStripeConnect: boolean;
        stripeConnectOnboarded: boolean;
      }
    >();

    for (const earning of earnings) {
      const user = userMap.get(earning.userId);
      const existing = grouped.get(earning.userId);
      if (existing) {
        existing.totalAmountCents += earning.amountCents;
        existing.earningsCount += 1;
      } else {
        grouped.set(earning.userId, {
          userId: earning.userId,
          userFullName: user?.fullName ?? null,
          userEmail: user?.email ?? null,
          totalAmountCents: earning.amountCents,
          earningsCount: 1,
          hasStripeConnect: !!user?.stripeConnectAccountId,
          stripeConnectOnboarded: user?.stripeConnectOnboarded ?? false,
        });
      }
    }

    return success(Array.from(grouped.values()));
  } catch (error) {
    console.error("[Payouts] Error fetching pending payouts:", error);
    return fail("Failed to fetch pending payouts");
  }
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new payout batch
 */
export async function createPayoutBatch(
  input: CreatePayoutBatchInput
): Promise<ActionResult<PayoutBatchWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get approved earnings
    const earningsWhere = {
      organizationId,
      status: "approved" as EarningStatus,
      payoutItemId: null,
      ...(input.photographerIds?.length
        ? { userId: { in: input.photographerIds } }
        : {}),
    };

    const earnings = await prisma.photographerEarning.findMany({
      where: earningsWhere,
    });

    if (earnings.length === 0) {
      return fail("No approved earnings to process");
    }

    // Get unique user IDs and their Connect status
    const userIds = [...new Set(earnings.map((e) => e.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Group earnings by photographer
    const earningsByUser = new Map<string, typeof earnings>();
    for (const earning of earnings) {
      const existing = earningsByUser.get(earning.userId) || [];
      existing.push(earning);
      earningsByUser.set(earning.userId, existing);
    }

    // Filter out photographers without Connect onboarding
    const photographersWithoutConnect: string[] = [];
    for (const userId of earningsByUser.keys()) {
      const user = userMap.get(userId);
      if (!user?.stripeConnectOnboarded) {
        photographersWithoutConnect.push(userId);
      }
    }

    if (photographersWithoutConnect.length > 0) {
      for (const userId of photographersWithoutConnect) {
        earningsByUser.delete(userId);
      }

      if (earningsByUser.size === 0) {
        return fail("No photographers have completed Stripe Connect onboarding",);
      }
    }

    // Calculate totals
    let totalAmount = 0;
    for (const userEarnings of earningsByUser.values()) {
      for (const e of userEarnings) {
        totalAmount += e.amountCents;
      }
    }

    // Generate batch number
    const batchCount = await prisma.payoutBatch.count({
      where: { organizationId },
    });
    const batchNumber = `PAY-${String(batchCount + 1).padStart(5, "0")}`;

    // Period dates
    const periodStart = input.periodStart ?? new Date(new Date().setDate(1)); // Start of month
    const periodEnd = input.periodEnd ?? new Date();

    // Create batch with items
    const batch = await prisma.payoutBatch.create({
      data: {
        organizationId,
        batchNumber,
        status: "pending",
        periodStart,
        periodEnd,
        totalAmountCents: totalAmount,
        itemCount: earningsByUser.size,
        items: {
          create: Array.from(earningsByUser.entries()).map(([userId, userEarnings]) => {
            const user = userMap.get(userId);
            return {
              userId,
              amountCents: userEarnings.reduce((sum, e) => sum + e.amountCents, 0),
              description: `Payout for ${userEarnings.length} job${userEarnings.length > 1 ? "s" : ""}`,
              status: "pending",
              earnings: {
                connect: userEarnings.map((e) => ({ id: e.id })),
              },
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            earnings: {
              select: {
                id: true,
                description: true,
                amountCents: true,
              },
            },
          },
        },
      },
    });

    // Add user data to items
    const itemsWithUsers = batch.items.map((item) => ({
      ...item,
      user: userMap.get(item.userId),
    }));

    revalidatePath("/settings/payouts");
    return success({ ...batch, items: itemsWithUsers });
  } catch (error) {
    console.error("[Payouts] Error creating batch:", error);
    return fail("Failed to create payout batch");
  }
}

/**
 * Process a payout batch (sends money via Stripe Connect)
 */
export async function processPayoutBatch(
  batchId: string
): Promise<ActionResult<PayoutBatchWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    const batch = await prisma.payoutBatch.findFirst({
      where: { id: batchId, organizationId },
      include: {
        items: {
          include: {
            earnings: true,
          },
        },
      },
    });

    if (!batch) {
      return fail("Payout batch not found");
    }

    if (batch.status !== "pending") {
      return fail(`Batch is already ${batch.status}`);
    }

    // Get user data for items
    const userIds = batch.items.map((item) => item.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Update batch to processing
    await prisma.payoutBatch.update({
      where: { id: batchId },
      data: { status: "processing" },
    });

    // Process each item
    const failedItems: string[] = [];
    const { getStripe } = await import("@/lib/stripe");
    const stripeClient = getStripe();

    for (const item of batch.items) {
      const user = userMap.get(item.userId);
      if (!user?.stripeConnectAccountId || !user.stripeConnectOnboarded) {
        // Mark item as failed
        await prisma.payoutItem.update({
          where: { id: item.id },
          data: {
            status: "failed",
            failedReason: "Photographer has not completed Stripe Connect setup",
          },
        });
        failedItems.push(item.id);
        continue;
      }

      try {
        // Create Stripe transfer
        const transfer = await stripeClient.transfers.create({
          amount: item.amountCents,
          currency: "usd",
          destination: user.stripeConnectAccountId,
          metadata: {
            payoutBatchId: batchId,
            payoutItemId: item.id,
            organizationId,
          },
        });

        // Update item with transfer info
        await prisma.payoutItem.update({
          where: { id: item.id },
          data: {
            status: "completed",
            stripeTransferId: transfer.id,
            processedAt: new Date(),
            paidAt: new Date(),
          },
        });

        // Update earnings to paid status
        await prisma.photographerEarning.updateMany({
          where: {
            id: { in: item.earnings.map((e) => e.id) },
          },
          data: {
            status: "paid",
            paidAt: new Date(),
          },
        });
      } catch (stripeError) {
        console.error(`[Payouts] Stripe transfer failed for item ${item.id}:`, stripeError);
        await prisma.payoutItem.update({
          where: { id: item.id },
          data: {
            status: "failed",
            failedReason: stripeError instanceof Error ? stripeError.message : "Transfer failed",
          },
        });
        failedItems.push(item.id);
      }
    }

    // Update batch status
    const finalStatus: PayoutStatus =
      failedItems.length === batch.items.length
        ? "failed"
        : "completed";

    const updatedBatch = await prisma.payoutBatch.update({
      where: { id: batchId },
      data: {
        status: finalStatus,
        processedAt: new Date(),
        ...(failedItems.length === batch.items.length && {
          failedReason: "All transfers failed",
        }),
      },
      include: {
        items: {
          include: {
            earnings: {
              select: {
                id: true,
                description: true,
                amountCents: true,
              },
            },
          },
        },
      },
    });

    // Add user data to items
    const itemsWithUsers = updatedBatch.items.map((item) => ({
      ...item,
      user: userMap.get(item.userId),
    }));

    revalidatePath("/settings/payouts");
    revalidatePath("/my-earnings");
    return success({ ...updatedBatch, items: itemsWithUsers });
  } catch (error) {
    console.error("[Payouts] Error processing batch:", error);

    // Mark batch as failed
    await prisma.payoutBatch.update({
      where: { id: batchId },
      data: {
        status: "failed",
        failedReason: error instanceof Error ? error.message : "Processing failed",
      },
    });

    return fail("Failed to process payout batch");
  }
}

/**
 * Cancel a pending payout batch
 */
export async function cancelPayoutBatch(batchId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const batch = await prisma.payoutBatch.findFirst({
      where: { id: batchId, organizationId },
      include: {
        items: {
          include: {
            earnings: true,
          },
        },
      },
    });

    if (!batch) {
      return fail("Payout batch not found");
    }

    if (batch.status !== "pending") {
      return fail("Can only cancel pending batches");
    }

    // Disconnect earnings from payout items
    for (const item of batch.items) {
      await prisma.photographerEarning.updateMany({
        where: {
          id: { in: item.earnings.map((e) => e.id) },
        },
        data: {
          payoutItemId: null,
        },
      });
    }

    // Delete batch and items (cascade)
    await prisma.payoutBatch.delete({
      where: { id: batchId },
    });

    revalidatePath("/settings/payouts");
    return ok();
  } catch (error) {
    console.error("[Payouts] Error canceling batch:", error);
    return fail("Failed to cancel payout batch");
  }
}

// ============================================================================
// Stats
// ============================================================================

/**
 * Get payout statistics
 */
export async function getPayoutStats(): Promise<
  ActionResult<{
    totalPaidOut: number;
    pendingAmount: number;
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
    photographersWithPendingPayouts: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const [
      totalPaid,
      pendingEarnings,
      batchCounts,
      photographersWithPending,
    ] = await Promise.all([
      // Total paid out
      prisma.photographerEarning.aggregate({
        where: { organizationId, status: "paid" },
        _sum: { amountCents: true },
      }),
      // Pending approved earnings
      prisma.photographerEarning.aggregate({
        where: { organizationId, status: "approved", payoutItemId: null },
        _sum: { amountCents: true },
      }),
      // Batch counts by status
      prisma.payoutBatch.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: true,
      }),
      // Unique photographers with pending payouts
      prisma.photographerEarning.groupBy({
        by: ["userId"],
        where: { organizationId, status: "approved", payoutItemId: null },
      }),
    ]);

    const completedBatches = batchCounts.find((b) => b.status === "completed")?._count ?? 0;
    const failedBatches = batchCounts.find((b) => b.status === "failed")?._count ?? 0;
    const totalBatches = batchCounts.reduce((sum, b) => sum + b._count, 0);

    return {
      success: true,
      data: {
        totalPaidOut: totalPaid._sum.amountCents ?? 0,
        pendingAmount: pendingEarnings._sum.amountCents ?? 0,
        totalBatches,
        completedBatches,
        failedBatches,
        photographersWithPendingPayouts: photographersWithPending.length,
      },
    };
  } catch (error) {
    console.error("[Payouts] Error fetching stats:", error);
    return fail("Failed to fetch payout statistics");
  }
}

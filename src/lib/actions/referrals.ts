"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import { ReferralStatus, ReferralRewardType } from "@prisma/client";
import { nanoid } from "nanoid";

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ReferralProgram = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  requiresApproval: boolean;
  rewardType: ReferralRewardType;
  rewardValue: number;
  maxRewardCents: number | null;
  referredDiscount: number | null;
  referredDiscountCents: number | null;
  referralValidDays: number;
  rewardExpirationDays: number | null;
  termsUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Referrer = {
  id: string;
  programId: string;
  clientId: string | null;
  name: string;
  email: string;
  phone: string | null;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarned: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Referral = {
  id: string;
  programId: string;
  referrerId: string;
  referredName: string;
  referredEmail: string;
  referredPhone: string | null;
  status: ReferralStatus;
  clientId: string | null;
  bookingId: string | null;
  invoiceId: string | null;
  source: string | null;
  landingPage: string | null;
  submittedAt: Date;
  qualifiedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  referrer?: Referrer;
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getReferralProgram(): Promise<ActionResult<ReferralProgram | null>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await prisma.referralProgram.findUnique({
      where: { organizationId: auth.organizationId },
    });

    return { success: true, data: program };
  } catch (error) {
    console.error("Error getting referral program:", error);
    return { success: false, error: "Failed to get referral program" };
  }
}

export async function getReferrers(): Promise<ActionResult<Referrer[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await prisma.referralProgram.findUnique({
      where: { organizationId: auth.organizationId },
      include: { referrers: { orderBy: { createdAt: "desc" } } },
    });

    return { success: true, data: program?.referrers || [] };
  } catch (error) {
    console.error("Error getting referrers:", error);
    return { success: false, error: "Failed to get referrers" };
  }
}

export async function getReferrals(): Promise<ActionResult<Referral[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await prisma.referralProgram.findUnique({
      where: { organizationId: auth.organizationId },
      include: {
        referrals: {
          include: { referrer: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, data: program?.referrals || [] };
  } catch (error) {
    console.error("Error getting referrals:", error);
    return { success: false, error: "Failed to get referrals" };
  }
}

export async function getReferralStats(): Promise<
  ActionResult<{
    totalReferrers: number;
    activeReferrers: number;
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    totalRewardsEarned: number;
    conversionRate: number;
  }>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await prisma.referralProgram.findUnique({
      where: { organizationId: auth.organizationId },
      include: { referrers: true, referrals: true },
    });

    if (!program) {
      return {
        success: true,
        data: {
          totalReferrers: 0,
          activeReferrers: 0,
          totalReferrals: 0,
          pendingReferrals: 0,
          completedReferrals: 0,
          totalRewardsEarned: 0,
          conversionRate: 0,
        },
      };
    }

    const totalReferrers = program.referrers.length;
    const activeReferrers = program.referrers.filter((r) => r.isActive).length;
    const totalReferrals = program.referrals.length;
    const pendingReferrals = program.referrals.filter(
      (r) => r.status === "pending" || r.status === "qualified"
    ).length;
    const completedReferrals = program.referrals.filter(
      (r) => r.status === "completed"
    ).length;
    const totalRewardsEarned = program.referrers.reduce(
      (sum, r) => sum + r.totalEarned,
      0
    );
    const conversionRate =
      totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;

    return {
      success: true,
      data: {
        totalReferrers,
        activeReferrers,
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        totalRewardsEarned,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return { success: false, error: "Failed to get referral stats" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function upsertReferralProgram(data: {
  name: string;
  description?: string;
  rewardType: "percentage" | "fixed" | "credit" | "gift_card";
  rewardValue: number;
  minimumOrderCents?: number;
  expirationDays?: number;
  termsAndConditions?: string;
  isActive?: boolean;
}): Promise<ActionResult<ReferralProgram>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await prisma.referralProgram.upsert({
      where: { organizationId: auth.organizationId },
      create: {
        organizationId: auth.organizationId,
        name: data.name,
        description: data.description,
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        referralValidDays: data.expirationDays || 90,
        termsUrl: data.termsAndConditions,
        isActive: data.isActive ?? false,
      },
      update: {
        name: data.name,
        description: data.description,
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        referralValidDays: data.expirationDays || 90,
        termsUrl: data.termsAndConditions,
      },
    });

    revalidatePath("/settings/referrals");
    return { success: true, data: program };
  } catch (error) {
    console.error("Error upserting referral program:", error);
    return { success: false, error: "Failed to save referral program" };
  }
}

export async function toggleReferralProgram(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await prisma.referralProgram.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!program) {
      return { success: false, error: "Program not found" };
    }

    await prisma.referralProgram.update({
      where: { id: program.id },
      data: { isActive: !program.isActive },
    });

    revalidatePath("/settings/referrals");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error toggling referral program:", error);
    return { success: false, error: "Failed to toggle program status" };
  }
}

export async function createReferrer(data: {
  name: string;
  email: string;
  phone?: string;
  clientId?: string;
}): Promise<ActionResult<Referrer>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const program = await prisma.referralProgram.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!program) {
      return { success: false, error: "Referral program not found" };
    }

    const referralCode = nanoid(8).toUpperCase();

    const referrer = await prisma.referrer.create({
      data: {
        programId: program.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        clientId: data.clientId || null,
        referralCode,
      },
    });

    revalidatePath("/settings/referrals");
    return { success: true, data: referrer };
  } catch (error) {
    console.error("Error creating referrer:", error);
    return { success: false, error: "Failed to create referrer" };
  }
}

export async function toggleReferrerStatus(
  referrerId: string
): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const referrer = await prisma.referrer.findFirst({
      where: {
        id: referrerId,
        program: { organizationId: auth.organizationId },
      },
    });

    if (!referrer) {
      return { success: false, error: "Referrer not found" };
    }

    await prisma.referrer.update({
      where: { id: referrerId },
      data: { isActive: !referrer.isActive },
    });

    revalidatePath("/settings/referrals");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error toggling referrer status:", error);
    return { success: false, error: "Failed to toggle referrer status" };
  }
}

export async function deleteReferrer(
  referrerId: string
): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const referrer = await prisma.referrer.findFirst({
      where: {
        id: referrerId,
        program: { organizationId: auth.organizationId },
      },
    });

    if (!referrer) {
      return { success: false, error: "Referrer not found" };
    }

    await prisma.referrer.delete({ where: { id: referrerId } });

    revalidatePath("/settings/referrals");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting referrer:", error);
    return { success: false, error: "Failed to delete referrer" };
  }
}

export async function regenerateReferralCode(
  referrerId: string
): Promise<ActionResult<{ code: string }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const referrer = await prisma.referrer.findFirst({
      where: {
        id: referrerId,
        program: { organizationId: auth.organizationId },
      },
    });

    if (!referrer) {
      return { success: false, error: "Referrer not found" };
    }

    const newCode = nanoid(8).toUpperCase();

    await prisma.referrer.update({
      where: { id: referrerId },
      data: { referralCode: newCode },
    });

    revalidatePath("/settings/referrals");
    return { success: true, data: { code: newCode } };
  } catch (error) {
    console.error("Error regenerating referral code:", error);
    return { success: false, error: "Failed to regenerate code" };
  }
}

export async function updateReferralStatus(
  referralId: string,
  status: ReferralStatus
): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const referral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        program: { organizationId: auth.organizationId },
      },
    });

    if (!referral) {
      return { success: false, error: "Referral not found" };
    }

    const updateData: { status: ReferralStatus; qualifiedAt?: Date; completedAt?: Date } = {
      status,
    };

    if (status === "qualified" && !referral.qualifiedAt) {
      updateData.qualifiedAt = new Date();
    }

    if (status === "completed" && !referral.completedAt) {
      updateData.completedAt = new Date();

      await prisma.referrer.update({
        where: { id: referral.referrerId },
        data: { successfulReferrals: { increment: 1 } },
      });
    }

    await prisma.referral.update({
      where: { id: referralId },
      data: updateData,
    });

    revalidatePath("/settings/referrals");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating referral status:", error);
    return { success: false, error: "Failed to update referral status" };
  }
}

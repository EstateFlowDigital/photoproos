"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { PlatformReferralStatus, PlatformRewardType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PlatformReferrerProfile = {
  id: string;
  userId: string;
  referralCode: string;
  referralUrl: string | null;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnedCents: number;
  pendingCreditCents: number;
  isActive: boolean;
  createdAt: Date;
};

export type PlatformReferralItem = {
  id: string;
  referredEmail: string;
  referredName: string | null;
  status: PlatformReferralStatus;
  signedUpAt: Date | null;
  subscribedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
};

export type PlatformReferralStats = {
  totalReferrals: number;
  pendingReferrals: number;
  signedUpReferrals: number;
  subscribedReferrals: number;
  totalEarnedCents: number;
  pendingCreditCents: number;
  conversionRate: number;
};

export type PlatformReward = {
  id: string;
  rewardType: PlatformRewardType;
  valueCents: number;
  description: string | null;
  isApplied: boolean;
  appliedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  return prisma.user.findFirst({
    where: { clerkUserId },
    select: { id: true, email: true, fullName: true },
  });
}

function generateReferralCode(): string {
  // Generate a short, memorable code like "PHOTO-ABC123"
  const prefix = "LENS";
  const suffix = nanoid(6).toUpperCase();
  return `${prefix}-${suffix}`;
}

async function getPlatformSettings() {
  let settings = await prisma.platformReferralSettings.findUnique({
    where: { id: "default" },
  });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.platformReferralSettings.create({
      data: {
        id: "default",
        isActive: true,
        referralLinkValidDays: 30,
        referrerRewardType: "account_credit",
        referrerRewardValue: 2500, // $25
        referredTrialDays: 21,
        referredDiscountPercent: 20, // 20% off first month
        referredDiscountMonths: 1,
      },
    });
  }

  return settings;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get or create the current user's referral profile
 */
export async function getMyReferralProfile(): Promise<ActionResult<PlatformReferrerProfile>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has a referral profile
    let profile = await prisma.platformReferrer.findUnique({
      where: { userId: user.id },
    });

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.platformReferrer.create({
        data: {
          userId: user.id,
          referralCode: generateReferralCode(),
          isActive: true,
        },
      });
    }

    return {
      success: true,
      data: {
        id: profile.id,
        userId: profile.userId,
        referralCode: profile.referralCode,
        referralUrl: profile.referralUrl,
        totalReferrals: profile.totalReferrals,
        successfulReferrals: profile.successfulReferrals,
        totalEarnedCents: profile.totalEarnedCents,
        pendingCreditCents: profile.pendingCreditCents,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
      },
    };
  } catch (error) {
    console.error("[PlatformReferrals] Error getting profile:", error);
    return { success: false, error: "Failed to get referral profile" };
  }
}

/**
 * Get the current user's referral stats
 */
export async function getMyReferralStats(): Promise<ActionResult<PlatformReferralStats>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.platformReferrer.findUnique({
      where: { userId: user.id },
      include: {
        referrals: {
          select: { status: true },
        },
      },
    });

    if (!profile) {
      return {
        success: true,
        data: {
          totalReferrals: 0,
          pendingReferrals: 0,
          signedUpReferrals: 0,
          subscribedReferrals: 0,
          totalEarnedCents: 0,
          pendingCreditCents: 0,
          conversionRate: 0,
        },
      };
    }

    const pendingReferrals = profile.referrals.filter(
      (r) => r.status === "pending"
    ).length;
    const signedUpReferrals = profile.referrals.filter(
      (r) => r.status === "signed_up"
    ).length;
    const subscribedReferrals = profile.referrals.filter(
      (r) => r.status === "subscribed"
    ).length;

    const conversionRate =
      profile.totalReferrals > 0
        ? (profile.successfulReferrals / profile.totalReferrals) * 100
        : 0;

    return {
      success: true,
      data: {
        totalReferrals: profile.totalReferrals,
        pendingReferrals,
        signedUpReferrals,
        subscribedReferrals,
        totalEarnedCents: profile.totalEarnedCents,
        pendingCreditCents: profile.pendingCreditCents,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
    };
  } catch (error) {
    console.error("[PlatformReferrals] Error getting stats:", error);
    return { success: false, error: "Failed to get referral stats" };
  }
}

/**
 * Get the current user's referrals list
 */
export async function getMyReferrals(): Promise<ActionResult<PlatformReferralItem[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.platformReferrer.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return { success: true, data: [] };
    }

    const referrals = await prisma.platformReferral.findMany({
      where: { referrerId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: referrals.map((r) => ({
        id: r.id,
        referredEmail: r.referredEmail,
        referredName: r.referredName,
        status: r.status,
        signedUpAt: r.signedUpAt,
        subscribedAt: r.subscribedAt,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
      })),
    };
  } catch (error) {
    console.error("[PlatformReferrals] Error getting referrals:", error);
    return { success: false, error: "Failed to get referrals" };
  }
}

/**
 * Get the current user's rewards
 */
export async function getMyRewards(): Promise<ActionResult<PlatformReward[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.platformReferrer.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return { success: true, data: [] };
    }

    const rewards = await prisma.platformReferralReward.findMany({
      where: { referrerId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: rewards.map((r) => ({
        id: r.id,
        rewardType: r.rewardType,
        valueCents: r.valueCents,
        description: r.description,
        isApplied: r.isApplied,
        appliedAt: r.appliedAt,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
      })),
    };
  } catch (error) {
    console.error("[PlatformReferrals] Error getting rewards:", error);
    return { success: false, error: "Failed to get rewards" };
  }
}

/**
 * Get the referral link for the current user
 */
export async function getMyReferralLink(): Promise<ActionResult<string>> {
  try {
    const profileResult = await getMyReferralProfile();
    if (!profileResult.success) {
      return profileResult;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://listinglens.com";
    const referralLink = `${baseUrl}/signup?ref=${profileResult.data.referralCode}`;

    return { success: true, data: referralLink };
  } catch (error) {
    console.error("[PlatformReferrals] Error getting referral link:", error);
    return { success: false, error: "Failed to get referral link" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Send a referral invite via email
 */
export async function sendReferralInvite(
  email: string,
  name?: string
): Promise<ActionResult<{ referralId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get platform settings
    const settings = await getPlatformSettings();
    if (!settings.isActive) {
      return { success: false, error: "Referral program is currently paused" };
    }

    // Get or create profile
    const profileResult = await getMyReferralProfile();
    if (!profileResult.success) {
      return { success: false, error: profileResult.error };
    }

    // Check if this email was already referred
    const existingReferral = await prisma.platformReferral.findFirst({
      where: {
        referrerId: profileResult.data.id,
        referredEmail: email.toLowerCase(),
        status: { not: "expired" },
      },
    });

    if (existingReferral) {
      return { success: false, error: "You've already invited this email" };
    }

    // Check if this email is already a user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "This email is already registered" };
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + settings.referralLinkValidDays);

    // Create the referral
    const referral = await prisma.platformReferral.create({
      data: {
        referrerId: profileResult.data.id,
        referredEmail: email.toLowerCase(),
        referredName: name || null,
        status: "pending",
        expiresAt,
        source: "email_invite",
      },
    });

    // Update referrer stats
    await prisma.platformReferrer.update({
      where: { id: profileResult.data.id },
      data: { totalReferrals: { increment: 1 } },
    });

    // Update global stats
    await prisma.platformReferralSettings.update({
      where: { id: "default" },
      data: { totalReferrals: { increment: 1 } },
    });

    // TODO: Send the actual email with the referral link
    // For now, we'll just create the referral record

    revalidatePath("/settings/referrals");

    return { success: true, data: { referralId: referral.id } };
  } catch (error) {
    console.error("[PlatformReferrals] Error sending invite:", error);
    return { success: false, error: "Failed to send invite" };
  }
}

/**
 * Track when someone clicks a referral link
 */
export async function trackReferralClick(
  referralCode: string,
  metadata?: {
    landingPage?: string;
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
  }
): Promise<ActionResult<{ referrerId: string }>> {
  try {
    // Find the referrer by code
    const referrer = await prisma.platformReferrer.findUnique({
      where: { referralCode },
    });

    if (!referrer || !referrer.isActive) {
      return { success: false, error: "Invalid referral code" };
    }

    // Store click data in session/cookie on the client side
    // This function just validates the code and returns the referrer ID

    return { success: true, data: { referrerId: referrer.id } };
  } catch (error) {
    console.error("[PlatformReferrals] Error tracking click:", error);
    return { success: false, error: "Failed to track click" };
  }
}

/**
 * Called when a referred user signs up
 */
export async function processReferralSignup(
  referralCode: string,
  newUserId: string,
  newOrgId?: string
): Promise<ActionResult> {
  try {
    // Find the referrer
    const referrer = await prisma.platformReferrer.findUnique({
      where: { referralCode },
    });

    if (!referrer || !referrer.isActive) {
      return { success: false, error: "Invalid referral code" };
    }

    const newUser = await prisma.user.findUnique({
      where: { id: newUserId },
      select: { email: true, fullName: true },
    });

    if (!newUser) {
      return { success: false, error: "User not found" };
    }

    // Check for existing referral or create one
    let referral = await prisma.platformReferral.findFirst({
      where: {
        referrerId: referrer.id,
        referredEmail: newUser.email.toLowerCase(),
        status: "pending",
      },
    });

    const settings = await getPlatformSettings();

    if (referral) {
      // Update existing referral
      await prisma.platformReferral.update({
        where: { id: referral.id },
        data: {
          status: "signed_up",
          referredUserId: newUserId,
          referredOrganizationId: newOrgId,
          signedUpAt: new Date(),
        },
      });
    } else {
      // Create new referral (direct link signup)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + settings.referralLinkValidDays);

      referral = await prisma.platformReferral.create({
        data: {
          referrerId: referrer.id,
          referredEmail: newUser.email.toLowerCase(),
          referredName: newUser.fullName,
          status: "signed_up",
          referredUserId: newUserId,
          referredOrganizationId: newOrgId,
          signedUpAt: new Date(),
          expiresAt,
          source: "direct_link",
        },
      });

      // Update referrer stats for new referral
      await prisma.platformReferrer.update({
        where: { id: referrer.id },
        data: { totalReferrals: { increment: 1 } },
      });
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[PlatformReferrals] Error processing signup:", error);
    return { success: false, error: "Failed to process referral signup" };
  }
}

/**
 * Called when a referred user subscribes (converts)
 */
export async function processReferralConversion(
  userId: string
): Promise<ActionResult> {
  try {
    // Find the referral for this user
    const referral = await prisma.platformReferral.findFirst({
      where: {
        referredUserId: userId,
        status: "signed_up",
      },
      include: { referrer: true },
    });

    if (!referral) {
      // Not a referred user, that's okay
      return { success: true, data: undefined };
    }

    const settings = await getPlatformSettings();

    // Update referral status
    await prisma.platformReferral.update({
      where: { id: referral.id },
      data: {
        status: "subscribed",
        subscribedAt: new Date(),
      },
    });

    // Create reward for the referrer
    const reward = await prisma.platformReferralReward.create({
      data: {
        referrerId: referral.referrerId,
        referralId: referral.id,
        rewardType: settings.referrerRewardType,
        valueCents: settings.referrerRewardValue,
        description: `Referral reward for ${referral.referredName || referral.referredEmail}`,
        expiresAt: settings.rewardExpirationDays
          ? new Date(Date.now() + settings.rewardExpirationDays * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    // Update referrer stats
    await prisma.platformReferrer.update({
      where: { id: referral.referrerId },
      data: {
        successfulReferrals: { increment: 1 },
        pendingCreditCents: { increment: settings.referrerRewardValue },
      },
    });

    // Update global stats
    await prisma.platformReferralSettings.update({
      where: { id: "default" },
      data: { totalConversions: { increment: 1 } },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[PlatformReferrals] Error processing conversion:", error);
    return { success: false, error: "Failed to process conversion" };
  }
}

/**
 * Apply a reward (mark as used)
 */
export async function applyReward(
  rewardId: string
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.platformReferrer.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return { success: false, error: "No referral profile found" };
    }

    const reward = await prisma.platformReferralReward.findFirst({
      where: {
        id: rewardId,
        referrerId: profile.id,
        isApplied: false,
      },
    });

    if (!reward) {
      return { success: false, error: "Reward not found or already applied" };
    }

    // Check if expired
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return { success: false, error: "Reward has expired" };
    }

    // Mark as applied
    await prisma.platformReferralReward.update({
      where: { id: rewardId },
      data: {
        isApplied: true,
        appliedAt: new Date(),
      },
    });

    // Update referrer stats
    await prisma.platformReferrer.update({
      where: { id: profile.id },
      data: {
        pendingCreditCents: { decrement: reward.valueCents },
        totalEarnedCents: { increment: reward.valueCents },
      },
    });

    // Update global stats
    await prisma.platformReferralSettings.update({
      where: { id: "default" },
      data: { totalRewardsIssuedCents: { increment: reward.valueCents } },
    });

    revalidatePath("/settings/referrals");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[PlatformReferrals] Error applying reward:", error);
    return { success: false, error: "Failed to apply reward" };
  }
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

/**
 * Get platform referral settings (admin only)
 */
export async function getPlatformReferralSettings(): Promise<ActionResult<Awaited<ReturnType<typeof getPlatformSettings>>>> {
  try {
    const settings = await getPlatformSettings();
    return { success: true, data: settings };
  } catch (error) {
    console.error("[PlatformReferrals] Error getting settings:", error);
    return { success: false, error: "Failed to get settings" };
  }
}

/**
 * Update platform referral settings (admin only)
 */
export async function updatePlatformReferralSettings(
  updates: {
    isActive?: boolean;
    referralLinkValidDays?: number;
    referrerRewardType?: PlatformRewardType;
    referrerRewardValue?: number;
    referrerMaxRewardsPerMonth?: number | null;
    referredTrialDays?: number;
    referredDiscountPercent?: number | null;
    referredDiscountMonths?: number;
  }
): Promise<ActionResult> {
  try {
    // TODO: Add admin check here

    await prisma.platformReferralSettings.upsert({
      where: { id: "default" },
      update: updates,
      create: {
        id: "default",
        ...updates,
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[PlatformReferrals] Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

/**
 * Get leaderboard of top referrers
 */
export async function getReferralLeaderboard(
  limit: number = 10
): Promise<ActionResult<Array<{
  rank: number;
  name: string;
  successfulReferrals: number;
  totalEarnedCents: number;
}>>> {
  try {
    const topReferrers = await prisma.platformReferrer.findMany({
      where: {
        isActive: true,
        successfulReferrals: { gt: 0 },
      },
      orderBy: { successfulReferrals: "desc" },
      take: limit,
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });

    return {
      success: true,
      data: topReferrers.map((r, index) => ({
        rank: index + 1,
        name: r.user.fullName || r.user.email.split("@")[0],
        successfulReferrals: r.successfulReferrals,
        totalEarnedCents: r.totalEarnedCents,
      })),
    };
  } catch (error) {
    console.error("[PlatformReferrals] Error getting leaderboard:", error);
    return { success: false, error: "Failed to get leaderboard" };
  }
}

/**
 * Process a referral from a stored code (called from client after signup)
 * This is called when the user visits the dashboard after signing up via a referral link
 */
export async function processReferralFromCode(
  referralCode: string
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if this user already has a processed referral
    const existingReferral = await prisma.platformReferral.findFirst({
      where: {
        referredUserId: user.id,
        status: { in: ["signed_up", "subscribed"] },
      },
    });

    if (existingReferral) {
      return { success: false, error: "Referral already processed for this user" };
    }

    // Find the referrer by code
    const referrer = await prisma.platformReferrer.findUnique({
      where: { referralCode },
    });

    if (!referrer || !referrer.isActive) {
      return { success: false, error: "Invalid referral code" };
    }

    // Make sure referrer isn't referring themselves
    if (referrer.userId === user.id) {
      return { success: false, error: "Cannot refer yourself" };
    }

    // Get user's organization if any
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });

    const settings = await getPlatformSettings();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + settings.referralLinkValidDays);

    // Check if there's a pending referral for this email
    const pendingReferral = await prisma.platformReferral.findFirst({
      where: {
        referrerId: referrer.id,
        referredEmail: user.email.toLowerCase(),
        status: "pending",
      },
    });

    if (pendingReferral) {
      // Update the pending referral
      await prisma.platformReferral.update({
        where: { id: pendingReferral.id },
        data: {
          status: "signed_up",
          referredUserId: user.id,
          referredOrganizationId: membership?.organizationId,
          signedUpAt: new Date(),
        },
      });
    } else {
      // Create new referral (direct link signup)
      await prisma.platformReferral.create({
        data: {
          referrerId: referrer.id,
          referredEmail: user.email.toLowerCase(),
          referredName: user.fullName,
          status: "signed_up",
          referredUserId: user.id,
          referredOrganizationId: membership?.organizationId,
          signedUpAt: new Date(),
          expiresAt,
          source: "direct_link",
        },
      });

      // Update referrer stats for new referral
      await prisma.platformReferrer.update({
        where: { id: referrer.id },
        data: { totalReferrals: { increment: 1 } },
      });

      // Update global stats
      await prisma.platformReferralSettings.update({
        where: { id: "default" },
        data: { totalReferrals: { increment: 1 } },
      });
    }

    console.log(`[PlatformReferrals] Processed referral for user ${user.id} from code ${referralCode}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[PlatformReferrals] Error processing referral from code:", error);
    return { success: false, error: "Failed to process referral" };
  }
}

"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { fail, success, type ActionResult } from "@/lib/types/action-result";
import {
  ACHIEVEMENTS,
  calculateLevel,
  getXpProgress,
  getLevelTitle,
  type TriggerType,
  type AchievementTrigger,
} from "@/lib/gamification/achievements";
import type { AchievementCategory, AchievementRarity } from "@prisma/client";
import {
  checkMilestoneCrossed,
  ALL_MILESTONES,
  type Milestone,
  type MilestoneCategory,
} from "@/lib/gamification/milestones";

// ============================================================================
// TYPES
// ============================================================================

export interface GamificationState {
  level: number;
  levelTitle: string;
  totalXp: number;
  xpProgress: { current: number; required: number; percent: number };
  currentLoginStreak: number;
  longestLoginStreak: number;
  currentDeliveryStreak: number;
  longestDeliveryStreak: number;
  recentAchievements: UnlockedAchievement[];
  unlockedCount: number;
  totalCount: number;
  stats: {
    totalGalleries: number;
    totalDeliveries: number;
    totalClients: number;
    totalRevenueCents: number;
    totalPayments: number;
    totalBookings: number;
  };
}

export interface UnlockedAchievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  unlockedAt: Date;
}

export interface AchievementUnlock {
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  level: number;
  totalXp: number;
  rank: number;
  currentLoginStreak: number;
  currentDeliveryStreak: number;
  isCurrentUser: boolean;
}

// ============================================================================
// GET GAMIFICATION STATE
// ============================================================================

/**
 * Get gamification profile for the current user
 */
export async function getGamificationState(): Promise<ActionResult<GamificationState>> {
  try {
    const { userId } = await requireAuth();
    await requireOrganizationId();

    // Get or create gamification profile
    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: { userId },
      });
    }

    // Get recent achievements (last 5)
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
      take: 5,
    });

    // Count total unlocked
    const unlockedCount = await prisma.userAchievement.count({
      where: { userId },
    });

    // Get all non-hidden achievements count
    const totalCount = await prisma.achievement.count({
      where: { isHidden: false },
    });

    const level = calculateLevel(profile.totalXp);
    const xpProgress = getXpProgress(profile.totalXp, level);

    return success({
      level,
      levelTitle: getLevelTitle(level),
      totalXp: profile.totalXp,
      xpProgress,
      currentLoginStreak: profile.currentLoginStreak,
      longestLoginStreak: profile.longestLoginStreak,
      currentDeliveryStreak: profile.currentDeliveryStreak,
      longestDeliveryStreak: profile.longestDeliveryStreak,
      recentAchievements: recentAchievements.map((ua) => ({
        id: ua.id,
        slug: ua.achievement.slug,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        rarity: ua.achievement.rarity,
        xpReward: ua.achievement.xpReward,
        unlockedAt: ua.unlockedAt,
      })),
      unlockedCount,
      totalCount,
      stats: {
        totalGalleries: profile.totalGalleries,
        totalDeliveries: profile.totalDeliveries,
        totalClients: profile.totalClients,
        totalRevenueCents: Number(profile.totalRevenueCents),
        totalPayments: profile.totalPayments,
        totalBookings: profile.totalBookings,
      },
    });
  } catch (error) {
    console.error("[Gamification] Error fetching state:", error);
    return fail("Failed to fetch gamification state");
  }
}

// ============================================================================
// GET ALL ACHIEVEMENTS (with unlock status)
// ============================================================================

export interface AchievementWithStatus {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  isHidden: boolean;
  order: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
}

/**
 * Get all achievements with unlock status for current user
 */
export async function getAllAchievements(): Promise<ActionResult<AchievementWithStatus[]>> {
  try {
    const { userId } = await requireAuth();

    // Get all achievements
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true, progress: true },
    });

    const unlockedMap = new Map(
      userAchievements.map((ua) => [
        ua.achievementId,
        { unlockedAt: ua.unlockedAt, progress: ua.progress },
      ])
    );

    return success(
      achievements.map((a) => {
        const unlockInfo = unlockedMap.get(a.id);
        return {
          id: a.id,
          slug: a.slug,
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          rarity: a.rarity,
          xpReward: a.xpReward,
          isHidden: a.isHidden,
          order: a.order,
          unlocked: !!unlockInfo,
          unlockedAt: unlockInfo?.unlockedAt,
          progress: unlockInfo?.progress,
        };
      })
    );
  } catch (error) {
    console.error("[Gamification] Error fetching achievements:", error);
    return fail("Failed to fetch achievements");
  }
}

// ============================================================================
// CHECK AND UNLOCK ACHIEVEMENTS
// ============================================================================

/**
 * Check and unlock achievements based on current stats
 * Called after relevant actions (gallery create, delivery, payment, etc.)
 * This runs asynchronously and should not block main operations
 */
export async function checkAchievements(
  userId: string,
  organizationId: string,
  triggerTypes: TriggerType[]
): Promise<AchievementUnlock[]> {
  try {
    // Get current profile stats
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    // Get already unlocked achievement IDs
    const unlockedAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(unlockedAchievements.map((u) => u.achievementId));

    // Get all achievements from database
    const allAchievements = await prisma.achievement.findMany();

    const newUnlocks: AchievementUnlock[] = [];

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) continue;

      const trigger = achievement.triggerConfig as AchievementTrigger;

      // Skip if not matching any of the trigger types
      if (!triggerTypes.includes(trigger.type)) continue;

      // Check if threshold is met
      let currentValue = 0;
      switch (trigger.type) {
        case "gallery_count":
          currentValue = profile.totalGalleries;
          break;
        case "delivery_count":
          currentValue = profile.totalDeliveries;
          break;
        case "client_count":
          currentValue = profile.totalClients;
          break;
        case "revenue_cents":
          currentValue = Number(profile.totalRevenueCents);
          break;
        case "streak_login":
          currentValue = profile.currentLoginStreak;
          break;
        case "streak_delivery":
          currentValue = profile.currentDeliveryStreak;
          break;
        case "payment_count":
          currentValue = profile.totalPayments;
          break;
        case "booking_count":
          currentValue = profile.totalBookings;
          break;
        case "level_reached":
          currentValue = calculateLevel(profile.totalXp);
          break;
        // contract_signed_count, invoice_paid_count would need additional tracking
        default:
          continue;
      }

      if (currentValue >= trigger.threshold) {
        // Unlock achievement
        await prisma.$transaction([
          prisma.userAchievement.create({
            data: {
              organizationId,
              userId,
              achievementId: achievement.id,
              progress: currentValue,
            },
          }),
          // Only add XP if there's a reward (level achievements have 0 XP to avoid loops)
          ...(achievement.xpReward > 0
            ? [
                prisma.gamificationProfile.update({
                  where: { userId },
                  data: {
                    totalXp: { increment: achievement.xpReward },
                  },
                }),
              ]
            : []),
        ]);

        newUnlocks.push({
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          xpReward: achievement.xpReward,
        });
      }
    }

    // If XP was added, check for level achievements
    if (newUnlocks.some((u) => u.xpReward > 0)) {
      const levelUnlocks = await checkAchievements(userId, organizationId, ["level_reached"]);
      newUnlocks.push(...levelUnlocks);
    }

    return newUnlocks;
  } catch (error) {
    console.error("[Gamification] Error checking achievements:", error);
    return [];
  }
}

// ============================================================================
// STREAK MANAGEMENT
// ============================================================================

/**
 * Update login streak (call on dashboard load)
 */
export async function updateLoginStreak(userId: string): Promise<void> {
  try {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      await prisma.gamificationProfile.create({
        data: {
          userId,
          currentLoginStreak: 1,
          longestLoginStreak: 1,
          lastLoginDate: new Date(),
        },
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = profile.lastLoginDate;
    let newStreak = profile.currentLoginStreak;

    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Already logged in today - no change
        return;
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = profile.currentLoginStreak + 1;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        currentLoginStreak: newStreak,
        longestLoginStreak: Math.max(newStreak, profile.longestLoginStreak),
        lastLoginDate: today,
      },
    });
  } catch (error) {
    console.error("[Gamification] Error updating login streak:", error);
  }
}

/**
 * Update delivery streak (call after gallery delivery)
 */
export async function updateDeliveryStreak(userId: string): Promise<void> {
  try {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDelivery = profile.lastDeliveryDate;
    let newStreak = 1;

    if (lastDelivery) {
      const lastDate = new Date(lastDelivery);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Same day delivery - increment count but not streak
        return;
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = profile.currentDeliveryStreak + 1;
      }
      // else: streak broken, reset to 1
    }

    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        currentDeliveryStreak: newStreak,
        longestDeliveryStreak: Math.max(newStreak, profile.longestDeliveryStreak),
        lastDeliveryDate: today,
        totalDeliveries: { increment: 1 },
      },
    });
  } catch (error) {
    console.error("[Gamification] Error updating delivery streak:", error);
  }
}

// ============================================================================
// STAT INCREMENTING
// ============================================================================

type ProfileStat =
  | "totalGalleries"
  | "totalClients"
  | "totalDeliveries"
  | "totalPayments"
  | "totalBookings";

/**
 * Increment a stat counter (called by server actions)
 */
export async function incrementStat(
  userId: string,
  stat: ProfileStat,
  amount: number = 1
): Promise<void> {
  try {
    await prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        [stat]: amount,
      },
      update: {
        [stat]: { increment: amount },
      },
    });
  } catch (error) {
    console.error("[Gamification] Error incrementing stat:", error);
  }
}

/**
 * Add revenue to total (called after payment received)
 */
export async function addRevenue(userId: string, amountCents: number): Promise<void> {
  try {
    await prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        totalRevenueCents: BigInt(amountCents),
      },
      update: {
        totalRevenueCents: { increment: amountCents },
      },
    });
  } catch (error) {
    console.error("[Gamification] Error adding revenue:", error);
  }
}

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Get organization leaderboard
 * Returns rankings for all users in the organization
 */
export async function getLeaderboard(): Promise<ActionResult<LeaderboardEntry[]>> {
  try {
    const { userId: currentUserId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get all members of the organization
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          include: {
            gamificationProfile: true,
          },
        },
      },
    });

    // Build leaderboard entries
    const entries: (LeaderboardEntry & { xp: number })[] = members
      .filter((m) => m.user.gamificationProfile) // Only users with profiles
      .map((m) => ({
        userId: m.userId,
        userName: m.user.fullName || m.user.firstName || "Unknown",
        userAvatar: m.user.avatarUrl,
        level: m.user.gamificationProfile!.level,
        totalXp: m.user.gamificationProfile!.totalXp,
        xp: m.user.gamificationProfile!.totalXp,
        rank: 0, // Will be set below
        currentLoginStreak: m.user.gamificationProfile!.currentLoginStreak,
        currentDeliveryStreak: m.user.gamificationProfile!.currentDeliveryStreak,
        isCurrentUser: m.userId === currentUserId,
      }));

    // Sort by XP descending
    entries.sort((a, b) => b.xp - a.xp);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return success(entries);
  } catch (error) {
    console.error("[Gamification] Error fetching leaderboard:", error);
    return fail("Failed to fetch leaderboard");
  }
}

// ============================================================================
// MARK ACHIEVEMENT AS NOTIFIED
// ============================================================================

/**
 * Mark an achievement as notified (user has seen the unlock toast)
 */
export async function markAchievementNotified(achievementId: string): Promise<void> {
  try {
    const { userId } = await requireAuth();

    await prisma.userAchievement.updateMany({
      where: { userId, achievementId },
      data: { notified: true },
    });
  } catch (error) {
    console.error("[Gamification] Error marking achievement notified:", error);
  }
}

/**
 * Get unnotified achievements (for showing toasts on page load)
 */
export async function getUnnotifiedAchievements(): Promise<ActionResult<UnlockedAchievement[]>> {
  try {
    const { userId } = await requireAuth();

    const unnotified = await prisma.userAchievement.findMany({
      where: { userId, notified: false },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });

    return success(
      unnotified.map((ua) => ({
        id: ua.id,
        slug: ua.achievement.slug,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        rarity: ua.achievement.rarity,
        xpReward: ua.achievement.xpReward,
        unlockedAt: ua.unlockedAt,
      }))
    );
  } catch (error) {
    console.error("[Gamification] Error fetching unnotified achievements:", error);
    return fail("Failed to fetch unnotified achievements");
  }
}

// ============================================================================
// DAILY LOGIN BONUS
// ============================================================================

/**
 * Daily bonus XP rewards by consecutive day (1-7)
 * Day 7 gives a big bonus, then cycle resets
 */
export const DAILY_BONUS_XP = [
  10,   // Day 1
  15,   // Day 2
  25,   // Day 3
  40,   // Day 4
  60,   // Day 5
  80,   // Day 6
  100,  // Day 7 (weekly finale bonus!)
];

export interface DailyBonusState {
  canClaim: boolean;
  currentDay: number; // 1-7
  nextBonusXp: number;
  totalClaimed: number;
  streakDays: number;
  lastClaimDate: Date | null;
  weekProgress: boolean[]; // 7 booleans for visual progress
}

/**
 * Get daily bonus status for current user
 */
export async function getDailyBonusState(): Promise<ActionResult<DailyBonusState>> {
  try {
    const { userId } = await requireAuth();

    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: { userId },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastClaim = profile.lastBonusClaimDate;
    let canClaim = true;
    let currentDay = profile.consecutiveBonusDays;

    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      lastClaimDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Already claimed today
        canClaim = false;
      } else if (diffDays > 1) {
        // Missed a day - streak resets
        currentDay = 0;
      }
    } else {
      // Never claimed - start fresh
      currentDay = 0;
    }

    // Calculate next day (1-indexed for display)
    const nextDay = canClaim ? (currentDay % 7) + 1 : currentDay;
    const nextBonusXp = DAILY_BONUS_XP[(nextDay - 1) % 7];

    // Build week progress array (which days have been claimed this cycle)
    const weekProgress = Array(7).fill(false).map((_, i) => i < currentDay);

    return success({
      canClaim,
      currentDay: nextDay,
      nextBonusXp,
      totalClaimed: profile.totalBonusesClaimed,
      streakDays: currentDay,
      lastClaimDate: profile.lastBonusClaimDate,
      weekProgress,
    });
  } catch (error) {
    console.error("[Gamification] Error getting daily bonus state:", error);
    return fail("Failed to get daily bonus status");
  }
}

export interface DailyBonusClaimResult {
  xpAwarded: number;
  newTotal: number;
  newLevel: number;
  leveledUp: boolean;
  dayNumber: number;
  isWeekComplete: boolean;
}

/**
 * Claim daily login bonus
 */
export async function claimDailyBonus(): Promise<ActionResult<DailyBonusClaimResult>> {
  try {
    const { userId } = await requireAuth();

    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: { userId },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastClaim = profile.lastBonusClaimDate;

    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      lastClaimDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        return fail("Daily bonus already claimed today");
      }
    }

    // Calculate new streak day
    let newConsecutiveDays = profile.consecutiveBonusDays;

    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      lastClaimDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day
        newConsecutiveDays = (profile.consecutiveBonusDays % 7) + 1;
      } else {
        // Missed day - reset to day 1
        newConsecutiveDays = 1;
      }
    } else {
      // First claim ever
      newConsecutiveDays = 1;
    }

    const xpReward = DAILY_BONUS_XP[(newConsecutiveDays - 1) % 7];
    const oldLevel = calculateLevel(profile.totalXp);
    const newXp = profile.totalXp + xpReward;
    const newLevel = calculateLevel(newXp);
    const isWeekComplete = newConsecutiveDays === 7;

    // Update profile
    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        totalXp: newXp,
        level: newLevel,
        lastBonusClaimDate: today,
        consecutiveBonusDays: isWeekComplete ? 0 : newConsecutiveDays,
        totalBonusesClaimed: { increment: 1 },
      },
    });

    return success({
      xpAwarded: xpReward,
      newTotal: newXp,
      newLevel,
      leveledUp: newLevel > oldLevel,
      dayNumber: newConsecutiveDays,
      isWeekComplete,
    });
  } catch (error) {
    console.error("[Gamification] Error claiming daily bonus:", error);
    return fail("Failed to claim daily bonus");
  }
}

// ============================================================================
// PERSONAL BESTS
// ============================================================================

export interface PersonalBests {
  bestMonthRevenue: { amountCents: number; date: Date | null };
  fastestDelivery: { hours: number | null; date: Date | null };
  bestWeekDeliveries: { count: number; date: Date | null };
  longestLoginStreak: number;
  longestDeliveryStreak: number;
}

/**
 * Get personal bests for current user
 */
export async function getPersonalBests(): Promise<ActionResult<PersonalBests>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return success({
        bestMonthRevenue: { amountCents: 0, date: null },
        fastestDelivery: { hours: null, date: null },
        bestWeekDeliveries: { count: 0, date: null },
        longestLoginStreak: 0,
        longestDeliveryStreak: 0,
      });
    }

    return success({
      bestMonthRevenue: {
        amountCents: Number(profile.bestMonthRevenueCents),
        date: profile.bestMonthRevenueDate,
      },
      fastestDelivery: {
        hours: profile.fastestDeliveryHours,
        date: profile.fastestDeliveryDate,
      },
      bestWeekDeliveries: {
        count: profile.bestWeekDeliveries,
        date: profile.bestWeekDeliveriesDate,
      },
      longestLoginStreak: profile.longestLoginStreak,
      longestDeliveryStreak: profile.longestDeliveryStreak,
    });
  } catch (error) {
    console.error("[Gamification] Error fetching personal bests:", error);
    return fail("Failed to fetch personal bests");
  }
}

/**
 * Update fastest delivery time if it's a new record
 */
export async function updateFastestDelivery(
  userId: string,
  deliveryHours: number
): Promise<void> {
  try {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) return;

    // Check if this is a new record (or first record)
    if (
      profile.fastestDeliveryHours === null ||
      deliveryHours < profile.fastestDeliveryHours
    ) {
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          fastestDeliveryHours: deliveryHours,
          fastestDeliveryDate: new Date(),
        },
      });
      console.log(
        `[Gamification] New personal best! Fastest delivery: ${deliveryHours}h for user ${userId}`
      );
    }
  } catch (error) {
    console.error("[Gamification] Error updating fastest delivery:", error);
  }
}

// ============================================================================
// MILESTONES
// ============================================================================

export interface MilestoneCheck {
  milestone: Milestone;
  reachedAt: Date;
}

/**
 * Check if a milestone was reached and record it
 * Returns the milestone if it was just reached (first time), null otherwise
 */
export async function checkAndRecordMilestone(
  userId: string,
  category: MilestoneCategory,
  previousValue: number,
  newValue: number
): Promise<MilestoneCheck | null> {
  try {
    const milestone = checkMilestoneCrossed(category, previousValue, newValue);
    if (!milestone) return null;

    // Check if already recorded
    const existing = await prisma.milestoneAchievement.findUnique({
      where: {
        userId_milestoneId: {
          userId,
          milestoneId: milestone.id,
        },
      },
    });

    if (existing) {
      // Already reached this milestone
      return null;
    }

    // Record the milestone
    const achievement = await prisma.milestoneAchievement.create({
      data: {
        userId,
        milestoneId: milestone.id,
        celebrated: false,
      },
    });

    console.log(
      `[Gamification] User ${userId} reached milestone: ${milestone.name}`
    );

    return {
      milestone,
      reachedAt: achievement.reachedAt,
    };
  } catch (error) {
    console.error("[Gamification] Error recording milestone:", error);
    return null;
  }
}

/**
 * Get uncelebrated milestones for a user
 */
export async function getUncelebratedMilestones(): Promise<ActionResult<MilestoneCheck[]>> {
  try {
    const { userId } = await requireAuth();

    const uncelebrated = await prisma.milestoneAchievement.findMany({
      where: {
        userId,
        celebrated: false,
      },
      orderBy: { reachedAt: "desc" },
    });

    const results: MilestoneCheck[] = [];
    for (const achievement of uncelebrated) {
      const milestone = ALL_MILESTONES.find(
        (m) => m.id === achievement.milestoneId
      );
      if (milestone) {
        results.push({
          milestone,
          reachedAt: achievement.reachedAt,
        });
      }
    }

    return success(results);
  } catch (error) {
    console.error("[Gamification] Error fetching uncelebrated milestones:", error);
    return fail("Failed to fetch milestones");
  }
}

/**
 * Mark a milestone as celebrated
 */
export async function markMilestoneCelebrated(milestoneId: string): Promise<void> {
  try {
    const { userId } = await requireAuth();

    await prisma.milestoneAchievement.updateMany({
      where: {
        userId,
        milestoneId,
      },
      data: {
        celebrated: true,
      },
    });
  } catch (error) {
    console.error("[Gamification] Error marking milestone celebrated:", error);
  }
}

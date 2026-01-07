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
import { Prisma, type AchievementCategory, type AchievementRarity } from "@prisma/client";
import {
  checkMilestoneCrossed,
  ALL_MILESTONES,
  type Milestone,
  type MilestoneCategory,
} from "@/lib/gamification/milestones";
import {
  canPrestige,
  getPrestigeTier,
  getPrestigeXpMultiplier,
  MAX_PRESTIGE,
  type PrestigeTier,
} from "@/lib/gamification/prestige";
import { DAILY_BONUS_XP } from "@/lib/gamification/constants";
import {
  generateHighlights,
  getFunFacts,
  getEncouragementMessage,
  type YearInReviewStats,
  type YearHighlight,
} from "@/lib/gamification/year-in-review";
import {
  SKILLS,
  SKILL_TREE_INFO,
  getSkillById,
  getSkillsByCategory,
  canUnlockSkill,
  calculateSkillPoints,
  getAvailableSkillPoints,
  getTreeCompletion,
  getNextUnlockableSkills,
  hasPerk,
  getBestPerkValue,
  type Skill,
  type SkillTreeCategory,
  type SkillPerkType,
} from "@/lib/gamification/skill-trees";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely parse a Prisma JSON field to Record<string, number>
 * Returns empty object if invalid or null
 */
function parseObjectiveProgress(
  value: Prisma.JsonValue | null | undefined
): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  // Validate all values are numbers
  const result: Record<string, number> = {};
  for (const [key, val] of Object.entries(value)) {
    if (typeof val === "number") {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Safely parse a string array from Prisma JSON
 */
function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

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

    // Parallelize remaining queries for better performance
    const [recentAchievements, unlockedCount, totalCount] = await Promise.all([
      // Get recent achievements (last 5)
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
        take: 5,
      }),
      // Count total unlocked
      prisma.userAchievement.count({
        where: { userId },
      }),
      // Get all non-hidden achievements count
      prisma.achievement.count({
        where: { isHidden: false },
      }),
    ]);

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

    // Parallelize both queries for better performance
    const [achievements, userAchievements] = await Promise.all([
      // Get all achievements
      prisma.achievement.findMany({
        orderBy: [{ category: "asc" }, { order: "asc" }],
      }),
      // Get user's unlocked achievements
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true, progress: true },
      }),
    ]);

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
      // Create new profile and auto-start the first quest
      await prisma.gamificationProfile.create({
        data: {
          userId,
          currentLoginStreak: 1,
          longestLoginStreak: 1,
          lastLoginDate: new Date(),
          activeQuestId: "quest-welcome", // Auto-start the welcome quest
          questObjectives: Prisma.JsonNull,
        },
      });
      return;
    }

    // Check if user has no active quest and no completed quests - auto-start first quest
    if (!profile.activeQuestId && (!profile.completedQuestIds || profile.completedQuestIds.length === 0)) {
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          activeQuestId: "quest-welcome",
          questObjectives: Prisma.JsonNull,
        },
      });
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

// ============================================================================
// PRESTIGE SYSTEM
// ============================================================================

export interface PrestigeState {
  prestigeLevel: number;
  lifetimeXp: number;
  canPrestige: boolean;
  currentTier: PrestigeTier;
  xpMultiplier: number;
  lastPrestigeDate: Date | null;
}

/**
 * Get prestige state for current user
 */
export async function getPrestigeState(): Promise<ActionResult<PrestigeState>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const defaultTier = getPrestigeTier(0);
      return success({
        prestigeLevel: 0,
        lifetimeXp: 0,
        canPrestige: false,
        currentTier: defaultTier,
        xpMultiplier: 1,
        lastPrestigeDate: null,
      });
    }

    const prestigeLevel = profile.prestigeLevel;
    const currentLevel = calculateLevel(profile.totalXp);

    return success({
      prestigeLevel,
      lifetimeXp: Number(profile.lifetimeXp),
      canPrestige: canPrestige(currentLevel) && prestigeLevel < MAX_PRESTIGE,
      currentTier: getPrestigeTier(prestigeLevel),
      xpMultiplier: getPrestigeXpMultiplier(prestigeLevel),
      lastPrestigeDate: profile.lastPrestigeDate,
    });
  } catch (error) {
    console.error("[Gamification] Error getting prestige state:", error);
    return fail("Failed to get prestige state");
  }
}

export interface PrestigeResult {
  newPrestigeLevel: number;
  newTier: PrestigeTier;
  xpMultiplier: number;
  rewards: string[];
}

/**
 * Perform prestige - reset level and gain prestige badge
 */
export async function performPrestige(): Promise<ActionResult<PrestigeResult>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return fail("Profile not found");
    }

    const currentLevel = calculateLevel(profile.totalXp);

    // Check if can prestige
    if (!canPrestige(currentLevel)) {
      return fail("Must reach max level (20) to prestige");
    }

    if (profile.prestigeLevel >= MAX_PRESTIGE) {
      return fail("Already at max prestige level");
    }

    const newPrestigeLevel = profile.prestigeLevel + 1;
    const newTier = getPrestigeTier(newPrestigeLevel);

    // Update profile - reset XP but keep lifetime total
    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        totalXp: 0,
        level: 1,
        prestigeLevel: newPrestigeLevel,
        lifetimeXp: { increment: profile.totalXp },
        lastPrestigeDate: new Date(),
      },
    });

    console.log(
      `[Gamification] User ${userId} prestiged to level ${newPrestigeLevel} (${newTier.name})`
    );

    return success({
      newPrestigeLevel,
      newTier,
      xpMultiplier: getPrestigeXpMultiplier(newPrestigeLevel),
      rewards: newTier.rewards,
    });
  } catch (error) {
    console.error("[Gamification] Error performing prestige:", error);
    return fail("Failed to prestige");
  }
}

// ============================================================================
// YEAR IN REVIEW
// ============================================================================

export interface YearInReviewData extends YearInReviewStats {
  funFacts: string[];
  encouragementMessage: string;
}

/**
 * Get Year in Review stats for a specific year
 * Optimized: All independent queries run in parallel using Promise.all
 */
export async function getYearInReview(
  year?: number
): Promise<ActionResult<YearInReviewData>> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Default to current year if not specified
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1); // Jan 1
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999); // Dec 31
    const prevYearStart = new Date(targetYear - 1, 0, 1);
    const prevYearEnd = new Date(targetYear - 1, 11, 31, 23, 59, 59, 999);

    // Run all independent queries in parallel (optimized from 16+ sequential queries)
    const [
      galleriesCreated,
      galleriesDelivered,
      galleriesWithPhotos,
      payments,
      newClients,
      totalClients,
      clientGalleries,
      completedBookings,
      profile,
      achievementsInYear,
      prevYearPayments,
      prevYearGalleries,
      prevYearClients,
    ] = await Promise.all([
      // Current year gallery stats
      prisma.project.count({
        where: {
          organizationId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.project.count({
        where: {
          organizationId,
          deliveredAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.project.findMany({
        where: {
          organizationId,
          deliveredAt: { gte: startDate, lte: endDate },
        },
        select: {
          _count: { select: { assets: true } },
        },
      }),
      // Revenue stats
      prisma.payment.findMany({
        where: {
          organizationId,
          createdAt: { gte: startDate, lte: endDate },
          status: "paid",
        },
        select: { amountCents: true, createdAt: true },
      }),
      // Client stats
      prisma.client.count({
        where: {
          organizationId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.client.count({
        where: {
          organizationId,
          createdAt: { lte: endDate },
        },
      }),
      // Repeat clients
      prisma.project.groupBy({
        by: ["clientId"],
        where: {
          organizationId,
          deliveredAt: { gte: startDate, lte: endDate },
          clientId: { not: null },
        },
        _count: { id: true },
      }),
      // Booking stats (get full data, calculate count and hours from result)
      prisma.booking.findMany({
        where: {
          organizationId,
          status: "completed",
          endTime: { gte: startDate, lte: endDate },
        },
        select: { startTime: true, endTime: true },
      }),
      // Gamification profile
      prisma.gamificationProfile.findUnique({
        where: { userId },
      }),
      // Achievements unlocked in year (get all at once with details)
      prisma.userAchievement.findMany({
        where: {
          userId,
          unlockedAt: { gte: startDate, lte: endDate },
        },
        include: { achievement: true },
      }),
      // Previous year stats for comparison
      prisma.payment.aggregate({
        where: {
          organizationId,
          createdAt: { gte: prevYearStart, lte: prevYearEnd },
          status: "paid",
        },
        _sum: { amountCents: true },
      }),
      prisma.project.count({
        where: {
          organizationId,
          deliveredAt: { gte: prevYearStart, lte: prevYearEnd },
        },
      }),
      prisma.client.count({
        where: {
          organizationId,
          createdAt: { gte: prevYearStart, lte: prevYearEnd },
        },
      }),
    ]);

    // Calculate derived values from parallel query results
    const photosShared = galleriesWithPhotos.reduce(
      (sum, g) => sum + g._count.assets,
      0
    );

    const totalRevenueCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
    const paymentsReceived = payments.length;
    const averagePaymentCents =
      paymentsReceived > 0 ? Math.round(totalRevenueCents / paymentsReceived) : 0;

    // Calculate best month
    const monthlyRevenue: Record<number, number> = {};
    for (const payment of payments) {
      const month = payment.createdAt.getMonth();
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amountCents;
    }

    let bestMonthRevenueCents = 0;
    let bestMonthIndex = 0;
    for (const [monthStr, revenue] of Object.entries(monthlyRevenue)) {
      const month = parseInt(monthStr);
      if (revenue > bestMonthRevenueCents) {
        bestMonthRevenueCents = revenue;
        bestMonthIndex = month;
      }
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const bestMonthName = monthNames[bestMonthIndex];

    // Derive repeat clients from grouped data
    const repeatClients = clientGalleries.filter((c) => c._count.id > 1).length;

    // Calculate booking stats from fetched data
    const bookingsCompleted = completedBookings.length;
    const totalBookingHours = completedBookings.reduce((sum, b) => {
      const hours = (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
      return sum + Math.max(0, hours);
    }, 0);

    // Calculate achievement/XP stats
    const achievementsUnlocked = achievementsInYear.length;
    const xpEarned = achievementsInYear.reduce(
      (sum, ua) => sum + ua.achievement.xpReward,
      0
    );

    // Calculate levels gained (approximate - based on XP earned)
    const levelsGained = achievementsUnlocked > 0 ? Math.floor(xpEarned / 1000) : 0;
    const startLevel = profile ? Math.max(1, profile.level - levelsGained) : 1;
    const endLevel = profile?.level || 1;

    // Calculate percentage changes from previous year
    const prevYearRevenue = prevYearPayments._sum?.amountCents || 0;

    const revenueVsLastYear =
      prevYearRevenue > 0
        ? Math.round(((totalRevenueCents - prevYearRevenue) / prevYearRevenue) * 100)
        : null;

    const galleriesVsLastYear =
      prevYearGalleries > 0
        ? Math.round(
            ((galleriesDelivered - prevYearGalleries) / prevYearGalleries) * 100
          )
        : null;

    const clientsVsLastYear =
      prevYearClients > 0
        ? Math.round(((newClients - prevYearClients) / prevYearClients) * 100)
        : null;

    const stats: YearInReviewStats = {
      year: targetYear,
      galleriesCreated,
      galleriesDelivered,
      photosShared,
      totalRevenueCents,
      paymentsReceived,
      averagePaymentCents,
      bestMonthRevenueCents,
      bestMonthName,
      newClients,
      totalClients,
      repeatClients,
      bookingsCompleted,
      totalBookingHours: Math.round(totalBookingHours),
      achievementsUnlocked,
      xpEarned,
      levelsGained,
      startLevel,
      endLevel,
      longestLoginStreak: profile?.longestLoginStreak || 0,
      longestDeliveryStreak: profile?.longestDeliveryStreak || 0,
      totalDaysActive: profile?.currentLoginStreak || 0, // Approximation
      highlights: [],
      comparisons: {
        revenueVsLastYear,
        galleriesVsLastYear,
        clientsVsLastYear,
      },
    };

    // Generate highlights
    stats.highlights = generateHighlights(stats);

    return success({
      ...stats,
      funFacts: getFunFacts(stats),
      encouragementMessage: getEncouragementMessage(stats),
    });
  } catch (error) {
    console.error("[Gamification] Error getting year in review:", error);
    return fail("Failed to get year in review");
  }
}

// ============================================================================
// SKILL TREES
// ============================================================================

export interface SkillTreeState {
  totalSkillPoints: number;
  availableSkillPoints: number;
  spentSkillPoints: number;
  unlockedSkillIds: string[];
  trees: {
    category: SkillTreeCategory;
    name: string;
    icon: string;
    description: string;
    color: string;
    completion: number;
    skills: SkillWithStatus[];
    nextUnlockable: Skill[];
  }[];
}

export interface SkillWithStatus extends Skill {
  isUnlocked: boolean;
  canUnlock: boolean;
}

/**
 * Get skill tree state for current user
 */
export async function getSkillTreeState(): Promise<ActionResult<SkillTreeState>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    const level = profile?.level || 1;
    const unlockedSkillIds = profile?.unlockedSkillIds || [];
    const spentSkillPoints = profile?.spentSkillPoints || 0;
    const totalSkillPoints = calculateSkillPoints(level);
    const availableSkillPoints = getAvailableSkillPoints(level, spentSkillPoints);

    // Build tree state for each category
    const trees = (["marketing", "operations", "client_relations"] as SkillTreeCategory[]).map(
      (category) => {
        const treeInfo = SKILL_TREE_INFO[category];
        const treeSkills = getSkillsByCategory(category);
        const nextUnlockable = getNextUnlockableSkills(category, unlockedSkillIds);

        const skillsWithStatus: SkillWithStatus[] = treeSkills.map((skill) => ({
          ...skill,
          isUnlocked: unlockedSkillIds.includes(skill.id),
          canUnlock:
            canUnlockSkill(skill.id, unlockedSkillIds) &&
            availableSkillPoints >= skill.cost,
        }));

        return {
          category,
          name: treeInfo.name,
          icon: treeInfo.icon,
          description: treeInfo.description,
          color: treeInfo.color,
          completion: getTreeCompletion(category, unlockedSkillIds),
          skills: skillsWithStatus,
          nextUnlockable,
        };
      }
    );

    return success({
      totalSkillPoints,
      availableSkillPoints,
      spentSkillPoints,
      unlockedSkillIds,
      trees,
    });
  } catch (error) {
    console.error("[Gamification] Error getting skill tree state:", error);
    return fail("Failed to get skill tree state");
  }
}

export interface UnlockSkillResult {
  skill: Skill;
  remainingPoints: number;
  perkUnlocked: string;
}

/**
 * Unlock a skill in a skill tree
 */
export async function unlockSkill(skillId: string): Promise<ActionResult<UnlockSkillResult>> {
  try {
    const { userId } = await requireAuth();

    const skill = getSkillById(skillId);
    if (!skill) {
      return fail("Skill not found");
    }

    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: { userId },
      });
    }

    const unlockedSkillIds = profile.unlockedSkillIds || [];
    const spentSkillPoints = profile.spentSkillPoints || 0;
    const availableSkillPoints = getAvailableSkillPoints(
      profile.level,
      spentSkillPoints
    );

    // Check if already unlocked
    if (unlockedSkillIds.includes(skillId)) {
      return fail("Skill already unlocked");
    }

    // Check prerequisites
    if (!canUnlockSkill(skillId, unlockedSkillIds)) {
      return fail("Prerequisites not met");
    }

    // Check if user has enough points
    if (availableSkillPoints < skill.cost) {
      return fail("Not enough skill points");
    }

    // Unlock the skill
    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        unlockedSkillIds: { push: skillId },
        spentSkillPoints: spentSkillPoints + skill.cost,
      },
    });

    console.log(
      `[Gamification] User ${userId} unlocked skill: ${skill.name} (${skill.id})`
    );

    return success({
      skill,
      remainingPoints: availableSkillPoints - skill.cost,
      perkUnlocked: skill.perk.description,
    });
  } catch (error) {
    console.error("[Gamification] Error unlocking skill:", error);
    return fail("Failed to unlock skill");
  }
}

/**
 * Reset all skill points (allows re-spec)
 * Only available once per prestige
 */
export async function resetSkillPoints(): Promise<ActionResult<{ pointsRefunded: number }>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return fail("Profile not found");
    }

    const pointsRefunded = profile.spentSkillPoints;

    if (pointsRefunded === 0) {
      return fail("No skill points to reset");
    }

    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        unlockedSkillIds: [],
        spentSkillPoints: 0,
      },
    });

    console.log(
      `[Gamification] User ${userId} reset skill points: ${pointsRefunded} points refunded`
    );

    return success({ pointsRefunded });
  } catch (error) {
    console.error("[Gamification] Error resetting skill points:", error);
    return fail("Failed to reset skill points");
  }
}

/**
 * Check if user has a specific perk unlocked
 */
export async function checkPerk(perkType: SkillPerkType): Promise<ActionResult<{
  hasPerk: boolean;
  value: number | string | boolean | undefined;
}>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
      select: { unlockedSkillIds: true },
    });

    const unlockedSkillIds = profile?.unlockedSkillIds || [];

    return success({
      hasPerk: hasPerk(perkType, unlockedSkillIds),
      value: getBestPerkValue(perkType, unlockedSkillIds),
    });
  } catch (error) {
    console.error("[Gamification] Error checking perk:", error);
    return fail("Failed to check perk");
  }
}

// NOTE: To use skill tree types and helpers in components, import directly from:
// import { SKILLS, SKILL_TREE_INFO, type Skill, type SkillTreeCategory, type SkillPerkType } from "@/lib/gamification/skill-trees";

// ============================================================================
// QUEST/STORY MODE
// ============================================================================

import {
  QUESTS,
  QUEST_CATEGORY_INFO,
  getQuestById,
  getQuestsByCategory,
  getQuestStatus,
  getNextAvailableQuest,
  getQuestsByStatus,
  getQuestProgress,
  getTotalQuestXp,
  type Quest,
  type QuestCategory,
  type QuestStatus,
  type QuestObjective,
} from "@/lib/gamification/quests";

export interface QuestState {
  currentQuest: Quest | null;
  objectiveProgress: Record<string, number>;
  completedQuestIds: string[];
  categories: {
    category: QuestCategory;
    name: string;
    icon: string;
    description: string;
    color: string;
    quests: QuestWithStatus[];
    completedCount: number;
    totalCount: number;
  }[];
  overallProgress: number;
  totalXpAvailable: number;
  xpEarned: number;
}

export interface QuestWithStatus extends Quest {
  status: QuestStatus;
  objectiveProgress?: Record<string, number>;
}

/**
 * Get quest state for current user
 */
export async function getQuestState(): Promise<ActionResult<QuestState>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    const completedQuestIds = parseStringArray(profile?.completedQuestIds);
    const activeQuestId = profile?.activeQuestId || null;
    const questObjectives = parseObjectiveProgress(profile?.questObjectives);

    // Get current quest
    const currentQuest = activeQuestId ? getQuestById(activeQuestId) || null : null;

    // Build category data
    const categories = (
      ["onboarding", "gallery", "clients", "revenue", "growth"] as QuestCategory[]
    ).map((category) => {
      const categoryInfo = QUEST_CATEGORY_INFO[category];
      const categoryQuests = getQuestsByCategory(category);

      const questsWithStatus: QuestWithStatus[] = categoryQuests.map((quest) => ({
        ...quest,
        status: getQuestStatus(
          quest.id,
          completedQuestIds,
          activeQuestId ? [activeQuestId] : []
        ),
        objectiveProgress:
          quest.id === activeQuestId ? questObjectives : undefined,
      }));

      const completedCount = questsWithStatus.filter(
        (q) => q.status === "completed"
      ).length;

      return {
        category,
        name: categoryInfo.name,
        icon: categoryInfo.icon,
        description: categoryInfo.description,
        color: categoryInfo.color,
        quests: questsWithStatus,
        completedCount,
        totalCount: categoryQuests.length,
      };
    });

    // Calculate XP earned from completed quests
    const xpEarned = completedQuestIds.reduce((sum, questId) => {
      const quest = getQuestById(questId);
      return sum + (quest?.xpReward || 0);
    }, 0);

    return success({
      currentQuest,
      objectiveProgress: questObjectives,
      completedQuestIds,
      categories,
      overallProgress: getQuestProgress(completedQuestIds),
      totalXpAvailable: getTotalQuestXp(),
      xpEarned,
    });
  } catch (error) {
    console.error("[Gamification] Error getting quest state:", error);
    return fail("Failed to get quest state");
  }
}

/**
 * Start a quest
 */
export async function startQuest(questId: string): Promise<ActionResult<{ quest: Quest }>> {
  try {
    const { userId } = await requireAuth();

    const quest = getQuestById(questId);
    if (!quest) {
      return fail("Quest not found");
    }

    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: { userId },
      });
    }

    const completedQuestIds = profile.completedQuestIds || [];

    // Check if already completed
    if (completedQuestIds.includes(questId)) {
      return fail("Quest already completed");
    }

    // Check if already has an active quest
    if (profile.activeQuestId) {
      return fail("Already have an active quest");
    }

    // Check prerequisites
    const prerequisitesMet = quest.prerequisiteQuestIds.every((prereq) =>
      completedQuestIds.includes(prereq)
    );
    if (!prerequisitesMet) {
      return fail("Prerequisites not met");
    }

    // Initialize objective progress
    const initialProgress: Record<string, number> = {};
    for (const objective of quest.objectives) {
      initialProgress[objective.id] = 0;
    }

    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        activeQuestId: questId,
        questObjectives: initialProgress,
      },
    });

    console.log(`[Gamification] User ${userId} started quest: ${quest.name}`);

    return success({ quest });
  } catch (error) {
    console.error("[Gamification] Error starting quest:", error);
    return fail("Failed to start quest");
  }
}

/**
 * Update objective progress
 * Called by triggers when user performs actions
 */
export async function updateQuestObjective(
  userId: string,
  objectiveType: string,
  incrementBy: number = 1
): Promise<void> {
  try {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile?.activeQuestId) return;

    const quest = getQuestById(profile.activeQuestId);
    if (!quest) return;

    const questObjectives = parseObjectiveProgress(profile.questObjectives);

    // Find matching objectives
    let updated = false;
    for (const objective of quest.objectives) {
      if (objective.type === objectiveType) {
        questObjectives[objective.id] = Math.min(
          (questObjectives[objective.id] || 0) + incrementBy,
          objective.targetValue
        );
        updated = true;
      }
    }

    if (!updated) return;

    // Check if all objectives are complete
    const allComplete = quest.objectives.every(
      (obj) => (questObjectives[obj.id] || 0) >= obj.targetValue
    );

    if (allComplete) {
      // Complete the quest
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          completedQuestIds: { push: profile.activeQuestId },
          activeQuestId: null,
          questObjectives: Prisma.JsonNull,
          totalXp: { increment: quest.xpReward },
        },
      });
      console.log(
        `[Gamification] User ${userId} completed quest: ${quest.name} (+${quest.xpReward} XP)`
      );
    } else {
      // Just update progress
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          questObjectives,
        },
      });
    }
  } catch (error) {
    console.error("[Gamification] Error updating quest objective:", error);
  }
}

/**
 * Abandon current quest
 */
export async function abandonQuest(): Promise<ActionResult<{ success: boolean }>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile?.activeQuestId) {
      return fail("No active quest to abandon");
    }

    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        activeQuestId: null,
        questObjectives: Prisma.JsonNull,
      },
    });

    console.log(`[Gamification] User ${userId} abandoned quest`);

    return success({ success: true });
  } catch (error) {
    console.error("[Gamification] Error abandoning quest:", error);
    return fail("Failed to abandon quest");
  }
}

// NOTE: To use quest types in components, import directly from:
// import { QUESTS, QUEST_CATEGORY_INFO, type Quest, type QuestCategory, type QuestStatus, type QuestObjective } from "@/lib/gamification/quests";

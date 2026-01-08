"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { fail, success, type ActionResult } from "@/lib/types/action-result";
import {
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
import { DAILY_BONUS_XP, STREAK_FREEZE_CONFIG } from "@/lib/gamification/constants";
import {
  generateHighlights,
  getFunFacts,
  getEncouragementMessage,
  type YearInReviewStats,
} from "@/lib/gamification/year-in-review";
import {
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
  progressHint?: {
    current: number;
    target: number;
    percentComplete: number;
  };
}

/**
 * Get all achievements with unlock status for current user
 */
export async function getAllAchievements(): Promise<ActionResult<AchievementWithStatus[]>> {
  try {
    const { userId } = await requireAuth();

    // Parallelize all queries for better performance
    const [achievements, userAchievements, profile] = await Promise.all([
      // Get all achievements
      prisma.achievement.findMany({
        orderBy: [{ category: "asc" }, { order: "asc" }],
      }),
      // Get user's unlocked achievements
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true, progress: true },
      }),
      // Get user's gamification profile for progress hints
      prisma.gamificationProfile.findUnique({
        where: { userId },
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
        const isUnlocked = !!unlockInfo;

        // Calculate progress hint for locked achievements
        let progressHint: { current: number; target: number; percentComplete: number } | undefined;

        if (!isUnlocked && profile && a.triggerConfig) {
          const trigger = a.triggerConfig as AchievementTrigger;
          progressHint = getAchievementProgressHint(trigger, profile);
        }

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
          unlocked: isUnlocked,
          unlockedAt: unlockInfo?.unlockedAt,
          progress: unlockInfo?.progress,
          progressHint,
        };
      })
    );
  } catch (error) {
    console.error("[Gamification] Error fetching achievements:", error);
    return fail("Failed to fetch achievements");
  }
}

/**
 * Calculate progress hint for a locked achievement
 */
function getAchievementProgressHint(
  trigger: AchievementTrigger,
  profile: {
    totalGalleries: number;
    totalDeliveries: number;
    totalClients: number;
    totalRevenueCents: bigint;
    currentLoginStreak: number;
    currentDeliveryStreak: number;
    totalPayments: number;
    totalBookings: number;
    totalXp: number;
    onboardingProgress?: number | null;
    totalIntegrations?: number;
    totalEmailsSent?: number;
    totalSmsSent?: number;
  }
): { current: number; target: number; percentComplete: number } | undefined {
  let currentValue = 0;
  const target = trigger.threshold;

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
    case "onboarding_progress":
      currentValue = profile.onboardingProgress ?? 0;
      break;
    case "integration_count":
      currentValue = profile.totalIntegrations ?? 0;
      break;
    case "email_count":
      currentValue = profile.totalEmailsSent ?? 0;
      break;
    case "sms_count":
      currentValue = profile.totalSmsSent ?? 0;
      break;
    default:
      // For triggers we can't calculate progress for, return undefined
      return undefined;
  }

  const percentComplete = Math.min(Math.round((currentValue / target) * 100), 100);

  return {
    current: currentValue,
    target,
    percentComplete,
  };
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
 * Returns streak freeze info if one was used
 */
export async function updateLoginStreak(userId: string): Promise<{
  streakFreezeUsed?: boolean;
  previousStreak?: number;
}> {
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
      return {};
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
    let streakFreezeUsed = false;

    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Already logged in today - no change
        return {};
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = profile.currentLoginStreak + 1;
      } else if (diffDays === 2 && profile.availableStreakFreezes > 0 && profile.currentLoginStreak > 0) {
        // Missed exactly 1 day and has freezes - use a freeze to save the streak
        // Check if we haven't already used a freeze today
        const lastFreezeDate = profile.lastStreakFreezeDate;
        const canUseFreeze = !lastFreezeDate ||
          new Date(lastFreezeDate).setHours(0, 0, 0, 0) !== today.getTime();

        if (canUseFreeze) {
          // Use a streak freeze - keep the streak and increment by 1
          newStreak = profile.currentLoginStreak + 1;
          streakFreezeUsed = true;

          await prisma.gamificationProfile.update({
            where: { userId },
            data: {
              currentLoginStreak: newStreak,
              longestLoginStreak: Math.max(newStreak, profile.longestLoginStreak),
              lastLoginDate: today,
              availableStreakFreezes: { decrement: 1 },
              totalStreakFreezesUsed: { increment: 1 },
              lastStreakFreezeDate: today,
            },
          });

          return { streakFreezeUsed: true, previousStreak: profile.currentLoginStreak };
        } else {
          // Already used a freeze today - streak breaks
          newStreak = 1;
        }
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

    return { streakFreezeUsed };
  } catch (error) {
    console.error("[Gamification] Error updating login streak:", error);
    return {};
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
// STREAK FREEZE MANAGEMENT
// ============================================================================

export type StreakFreezeState = {
  available: number;
  totalUsed: number;
  maxFreezes: number;
  lastUsedDate: Date | null;
};

/**
 * Get streak freeze state for a user (internal use)
 */
export async function getStreakFreezeStateInternal(userId: string): Promise<StreakFreezeState> {
  const profile = await prisma.gamificationProfile.findUnique({
    where: { userId },
    select: {
      availableStreakFreezes: true,
      totalStreakFreezesUsed: true,
      lastStreakFreezeDate: true,
    },
  });

  return {
    available: profile?.availableStreakFreezes ?? 0,
    totalUsed: profile?.totalStreakFreezesUsed ?? 0,
    maxFreezes: STREAK_FREEZE_CONFIG.maxFreezes,
    lastUsedDate: profile?.lastStreakFreezeDate ?? null,
  };
}

/**
 * Get streak freeze state for the current user (server action)
 */
export async function getStreakFreezeState(): Promise<ActionResult<StreakFreezeState>> {
  try {
    const { userId } = await requireAuth();
    const state = await getStreakFreezeStateInternal(userId);
    return success(state);
  } catch (error) {
    console.error("[Gamification] Error getting streak freeze state:", error);
    return fail("Failed to get streak freeze state");
  }
}

/**
 * Award streak freezes to a user
 * @param userId - User to award freezes to
 * @param amount - Number of freezes to award
 * @param source - Source of the award (for logging/analytics)
 * @returns The new total freezes
 */
export async function awardStreakFreezes(
  userId: string,
  amount: number,
  source: "daily_bonus" | "level_up" | "milestone" | "purchase" | "achievement"
): Promise<{ success: boolean; newTotal: number }> {
  try {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
      select: { availableStreakFreezes: true },
    });

    if (!profile) {
      return { success: false, newTotal: 0 };
    }

    // Cap at max freezes
    const currentFreezes = profile.availableStreakFreezes;
    const newTotal = Math.min(
      currentFreezes + amount,
      STREAK_FREEZE_CONFIG.maxFreezes
    );

    // Only update if there's an actual change
    if (newTotal > currentFreezes) {
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          availableStreakFreezes: newTotal,
        },
      });

      console.log(`[Gamification] Awarded ${amount} streak freeze(s) to user ${userId} from ${source}. New total: ${newTotal}`);
    }

    return { success: true, newTotal };
  } catch (error) {
    console.error("[Gamification] Error awarding streak freezes:", error);
    return { success: false, newTotal: 0 };
  }
}

/**
 * Purchase a streak freeze with XP
 */
export async function purchaseStreakFreeze(
  _organizationId?: string
): Promise<ActionResult<{ newFreezes: number; xpRemaining: number }>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
      select: {
        availableStreakFreezes: true,
        totalXp: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Check if at max freezes
    if (profile.availableStreakFreezes >= STREAK_FREEZE_CONFIG.maxFreezes) {
      return { success: false, error: `Maximum ${STREAK_FREEZE_CONFIG.maxFreezes} freezes reached` };
    }

    // Check if has enough XP
    if (profile.totalXp < STREAK_FREEZE_CONFIG.xpCost) {
      return { success: false, error: `Requires ${STREAK_FREEZE_CONFIG.xpCost} XP` };
    }

    // Deduct XP and add freeze
    const updated = await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        totalXp: { decrement: STREAK_FREEZE_CONFIG.xpCost },
        availableStreakFreezes: { increment: 1 },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/achievements");

    return {
      success: true,
      data: {
        newFreezes: updated.availableStreakFreezes,
        xpRemaining: updated.totalXp,
      },
    };
  } catch (error) {
    console.error("[Gamification] Error purchasing streak freeze:", error);
    return { success: false, error: "Failed to purchase streak freeze" };
  }
}

/**
 * Check if user should receive streak freeze rewards based on streak milestones
 */
export async function checkStreakMilestoneRewards(
  userId: string,
  currentStreak: number,
  streakType: "login" | "delivery"
): Promise<void> {
  const milestoneRewards = STREAK_FREEZE_CONFIG.rewards.milestoneStreaks;

  for (const [milestone, freezeReward] of Object.entries(milestoneRewards)) {
    if (currentStreak === parseInt(milestone)) {
      await awardStreakFreezes(userId, freezeReward, "milestone");
      console.log(
        `[Gamification] ${streakType} streak milestone ${milestone} reached! Awarded ${freezeReward} freeze(s)`
      );
      break;
    }
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
// ENHANCED LEADERBOARD WITH FILTERS
// ============================================================================

export type LeaderboardTimeFilter = "all_time" | "this_week" | "this_month";
export type LeaderboardRankBy = "xp" | "achievements" | "login_streak" | "delivery_streak" | "deliveries";

export interface LeaderboardFilters {
  timeFilter?: LeaderboardTimeFilter;
  rankBy?: LeaderboardRankBy;
  limit?: number;
}

export interface EnhancedLeaderboardEntry extends LeaderboardEntry {
  achievementsCount: number;
  deliveriesThisPeriod?: number;
  changeFromPrevious?: number; // Rank change from previous period
}

/**
 * Get enhanced leaderboard with filters
 */
export async function getEnhancedLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<ActionResult<EnhancedLeaderboardEntry[]>> {
  try {
    const { userId: currentUserId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    const { timeFilter = "all_time", rankBy = "xp", limit = 50 } = filters;

    // Calculate date range based on filter
    let startDate: Date | null = null;
    if (timeFilter === "this_week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === "this_month") {
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    // Get all members with their gamification profiles
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          include: {
            gamificationProfile: true,
            userAchievements: {
              where: startDate
                ? { unlockedAt: { gte: startDate } }
                : undefined,
            },
          },
        },
      },
    });

    // Build enhanced entries
    const entries: EnhancedLeaderboardEntry[] = members
      .filter((m) => m.user.gamificationProfile)
      .map((m) => {
        const profile = m.user.gamificationProfile!;
        return {
          userId: m.userId,
          userName: m.user.fullName || m.user.firstName || "Unknown",
          userAvatar: m.user.avatarUrl,
          level: profile.level,
          totalXp: profile.totalXp,
          rank: 0,
          currentLoginStreak: profile.currentLoginStreak,
          currentDeliveryStreak: profile.currentDeliveryStreak,
          isCurrentUser: m.userId === currentUserId,
          achievementsCount: m.user.userAchievements.length,
          deliveriesThisPeriod: startDate
            ? profile.totalDeliveries // Note: Would need period-specific tracking
            : profile.totalDeliveries,
        };
      });

    // Sort by the selected ranking metric
    switch (rankBy) {
      case "achievements":
        entries.sort((a, b) => b.achievementsCount - a.achievementsCount);
        break;
      case "login_streak":
        entries.sort((a, b) => b.currentLoginStreak - a.currentLoginStreak);
        break;
      case "delivery_streak":
        entries.sort((a, b) => b.currentDeliveryStreak - a.currentDeliveryStreak);
        break;
      case "deliveries":
        entries.sort((a, b) => (b.deliveriesThisPeriod || 0) - (a.deliveriesThisPeriod || 0));
        break;
      case "xp":
      default:
        entries.sort((a, b) => b.totalXp - a.totalXp);
    }

    // Assign ranks and apply limit
    const limitedEntries = entries.slice(0, limit);
    limitedEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return success(limitedEntries);
  } catch (error) {
    console.error("[Gamification] Error fetching enhanced leaderboard:", error);
    return fail("Failed to fetch leaderboard");
  }
}

/**
 * Get current user's rank for a specific metric
 */
export async function getMyRank(
  rankBy: LeaderboardRankBy = "xp"
): Promise<ActionResult<{ rank: number; total: number; percentile: number }>> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get all profiles in organization
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          include: {
            gamificationProfile: true,
            userAchievements: true,
          },
        },
      },
    });

    const profiles = members
      .filter((m) => m.user.gamificationProfile)
      .map((m) => ({
        userId: m.userId,
        xp: m.user.gamificationProfile!.totalXp,
        achievements: m.user.userAchievements.length,
        loginStreak: m.user.gamificationProfile!.currentLoginStreak,
        deliveryStreak: m.user.gamificationProfile!.currentDeliveryStreak,
        deliveries: m.user.gamificationProfile!.totalDeliveries,
      }));

    // Sort by metric
    let sortKey: keyof typeof profiles[0];
    switch (rankBy) {
      case "achievements":
        sortKey = "achievements";
        break;
      case "login_streak":
        sortKey = "loginStreak";
        break;
      case "delivery_streak":
        sortKey = "deliveryStreak";
        break;
      case "deliveries":
        sortKey = "deliveries";
        break;
      case "xp":
      default:
        sortKey = "xp";
    }

    profiles.sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));

    const rank = profiles.findIndex((p) => p.userId === userId) + 1;
    const total = profiles.length;
    const percentile = total > 0 ? Math.round(((total - rank + 1) / total) * 100) : 0;

    return success({ rank, total, percentile });
  } catch (error) {
    console.error("[Gamification] Error fetching rank:", error);
    return fail("Failed to fetch rank");
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
  streakFreezeAwarded?: boolean; // True if a streak freeze was awarded (day 7)
  totalStreakFreezes?: number;   // Updated total streak freezes
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
    const updatedProfile = await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        totalXp: newXp,
        level: newLevel,
        lastBonusClaimDate: today,
        consecutiveBonusDays: isWeekComplete ? 0 : newConsecutiveDays,
        totalBonusesClaimed: { increment: 1 },
      },
    });

    // Award streak freeze on day 7 completion
    let streakFreezeAwarded = false;
    let totalStreakFreezes = updatedProfile.availableStreakFreezes;

    if (isWeekComplete) {
      const freezeResult = await awardStreakFreezes(userId, 1, "daily_bonus");
      if (freezeResult.success) {
        streakFreezeAwarded = true;
        totalStreakFreezes = freezeResult.newTotal;
      }
    }

    return success({
      xpAwarded: xpReward,
      newTotal: newXp,
      newLevel,
      leveledUp: newLevel > oldLevel,
      dayNumber: newConsecutiveDays,
      isWeekComplete,
      streakFreezeAwarded,
      totalStreakFreezes,
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

// ============================================================================
// STREAK STATUS CHECK
// ============================================================================

export interface StreakStatus {
  loginStreak: {
    current: number;
    isAtRisk: boolean;
    hoursUntilReset: number;
    hasFreezesAvailable: boolean;
    freezesAvailable: number;
  };
  deliveryStreak: {
    current: number;
    isAtRisk: boolean;
    hoursUntilReset: number;
  };
  lastLoginWasToday: boolean;
  lastDeliveryWasToday: boolean;
}

/**
 * Check if user's streaks are at risk
 */
export async function getStreakStatus(): Promise<ActionResult<StreakStatus>> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return success({
        loginStreak: {
          current: 0,
          isAtRisk: false,
          hoursUntilReset: 24,
          hasFreezesAvailable: false,
          freezesAvailable: 0,
        },
        deliveryStreak: {
          current: 0,
          isAtRisk: false,
          hoursUntilReset: 24,
        },
        lastLoginWasToday: false,
        lastDeliveryWasToday: false,
      });
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate hours until reset (midnight)
    const hoursUntilReset = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));

    // Check login streak
    let loginIsAtRisk = false;
    let lastLoginWasToday = false;

    if (profile.lastLoginDate) {
      const lastLogin = new Date(profile.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);
      lastLoginWasToday = lastLogin.getTime() === today.getTime();

      // At risk if they haven't logged in today AND have a streak to lose
      loginIsAtRisk = !lastLoginWasToday && profile.currentLoginStreak > 0;
    }

    // Check delivery streak
    let deliveryIsAtRisk = false;
    let lastDeliveryWasToday = false;

    if (profile.lastDeliveryDate) {
      const lastDelivery = new Date(profile.lastDeliveryDate);
      lastDelivery.setHours(0, 0, 0, 0);
      lastDeliveryWasToday = lastDelivery.getTime() === today.getTime();

      // At risk if they haven't delivered today AND have a streak to lose
      deliveryIsAtRisk = !lastDeliveryWasToday && profile.currentDeliveryStreak > 0;
    }

    return success({
      loginStreak: {
        current: profile.currentLoginStreak,
        isAtRisk: loginIsAtRisk,
        hoursUntilReset,
        hasFreezesAvailable: profile.availableStreakFreezes > 0,
        freezesAvailable: profile.availableStreakFreezes,
      },
      deliveryStreak: {
        current: profile.currentDeliveryStreak,
        isAtRisk: deliveryIsAtRisk,
        hoursUntilReset,
      },
      lastLoginWasToday,
      lastDeliveryWasToday,
    });
  } catch (error) {
    console.error("[Gamification] Error checking streak status:", error);
    return fail("Failed to check streak status");
  }
}

// Statistics Dashboard types
export interface GamificationStatistics {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  xpProgress: number;
  prestigeLevel?: number;
  currentLoginStreak: number;
  longestLoginStreak: number;
  currentDeliveryStreak: number;
  longestDeliveryStreak: number;
  totalAchievements: number;
  unlockedAchievements: number;
  achievementsByRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
  achievementsByCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
  totalGalleries: number;
  totalDeliveries: number;
  totalClients: number;
  totalBookings: number;
  totalPayments: number;
  bestMonthRevenueCents: number;
  fastestDeliveryHours: number | null;
  bestWeekDeliveries: number;
  memberSinceDays: number;
  totalBonusesClaimed: number;
  consecutiveBonusDays: number;
}

/**
 * Get comprehensive gamification statistics for the statistics dashboard
 */
export async function getGamificationStatistics(): Promise<ActionResult<GamificationStatistics>> {
  try {
    const { userId } = await requireAuth();

    // Get user profile and achievements in parallel
    const [profile, achievements, userAchievements] = await Promise.all([
      prisma.gamificationProfile.findUnique({
        where: { userId },
      }),
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
    ]);

    if (!profile) {
      return fail("Profile not found");
    }

    // Calculate level and XP progress
    const level = calculateLevel(profile.totalXp);
    const xpProgress = getXpProgress(profile.totalXp);

    // Build set of unlocked achievement IDs
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    // Calculate achievements by rarity
    const achievementsByRarity: Record<AchievementRarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
    };

    // Calculate achievements by category
    const achievementsByCategory: Record<AchievementCategory, { total: number; unlocked: number }> = {} as Record<AchievementCategory, { total: number; unlocked: number }>;

    for (const achievement of achievements) {
      // By rarity
      achievementsByRarity[achievement.rarity].total++;
      if (unlockedIds.has(achievement.id)) {
        achievementsByRarity[achievement.rarity].unlocked++;
      }

      // By category
      if (!achievementsByCategory[achievement.category]) {
        achievementsByCategory[achievement.category] = { total: 0, unlocked: 0 };
      }
      achievementsByCategory[achievement.category].total++;
      if (unlockedIds.has(achievement.id)) {
        achievementsByCategory[achievement.category].unlocked++;
      }
    }

    // Calculate days since member joined
    const memberSinceDays = Math.floor(
      (Date.now() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return success({
      level,
      totalXp: profile.totalXp,
      xpToNextLevel: xpProgress.xpToNext,
      xpProgress: xpProgress.progress,
      prestigeLevel: profile.prestigeLevel > 0 ? profile.prestigeLevel : undefined,
      currentLoginStreak: profile.currentLoginStreak,
      longestLoginStreak: profile.longestLoginStreak,
      currentDeliveryStreak: profile.currentDeliveryStreak,
      longestDeliveryStreak: profile.longestDeliveryStreak,
      totalAchievements: achievements.length,
      unlockedAchievements: unlockedIds.size,
      achievementsByRarity,
      achievementsByCategory,
      totalGalleries: profile.totalGalleries,
      totalDeliveries: profile.totalDeliveries,
      totalClients: profile.totalClients,
      totalBookings: profile.totalBookings,
      totalPayments: profile.totalPayments,
      bestMonthRevenueCents: Number(profile.bestMonthRevenueCents),
      fastestDeliveryHours: profile.fastestDeliveryHours,
      bestWeekDeliveries: profile.bestWeekDeliveries,
      memberSinceDays,
      totalBonusesClaimed: profile.totalBonusesClaimed,
      consecutiveBonusDays: profile.consecutiveBonusDays,
    });
  } catch (error) {
    console.error("[Gamification] Error fetching statistics:", error);
    return fail("Failed to fetch statistics");
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
  QUEST_CATEGORY_INFO,
  getQuestById,
  getQuestsByCategory,
  getQuestStatus,
  getQuestProgress,
  getTotalQuestXp,
  type Quest,
  type QuestCategory,
  type QuestStatus,
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

// ============================================================================
// WEEKLY/MONTHLY RECAPS
// ============================================================================

export type RecapPeriod = "week" | "month";

export interface RecapSummary {
  period: RecapPeriod;
  startDate: Date;
  endDate: Date;

  // XP & Level Progress
  xpEarned: number;
  levelStart: number;
  levelEnd: number;
  levelsGained: number;

  // Achievements
  achievementsUnlocked: number;
  achievementHighlight?: {
    name: string;
    description: string;
    rarity: AchievementRarity;
    icon: string;
  };

  // Streaks
  loginStreakMaintained: boolean;
  deliveryStreakMaintained: boolean;
  longestLoginStreakThisPeriod: number;
  longestDeliveryStreakThisPeriod: number;

  // Activity
  galleriesCreated: number;
  deliveriesCompleted: number;
  clientsAdded: number;

  // Daily Bonus
  dailyBonusesClaimed: number;

  // Comparison to previous period
  xpChange: number; // Positive = more than last period
  activityChange: number; // % change in activity

  // Motivational message
  message: string;
  emoji: string;
}

/**
 * Get recap summary for a specific period
 */
export async function getRecapSummary(
  period: RecapPeriod
): Promise<ActionResult<RecapSummary>> {
  try {
    const { userId } = await requireAuth();

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
    } else {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
    }
    startDate.setHours(0, 0, 0, 0);
    previousStartDate.setHours(0, 0, 0, 0);

    // Get current profile
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return fail("Gamification profile not found");
    }

    // Get achievements unlocked this period
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        unlockedAt: { gte: startDate },
      },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });

    // Get highest rarity achievement as highlight
    const achievementHighlight = achievements.length > 0
      ? achievements.reduce((best, current) => {
          const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"];
          const currentOrder = rarityOrder.indexOf(current.achievement.rarity);
          const bestOrder = rarityOrder.indexOf(best.achievement.rarity);
          return currentOrder > bestOrder ? current : best;
        })
      : null;

    // Get activity counts this period (from galleries, etc.)
    const [galleries, deliveries, clients] = await Promise.all([
      prisma.gallery.count({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.delivery.count({
        where: {
          gallery: { userId },
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
      }),
      prisma.client.count({
        where: {
          organizationMembers: {
            some: {
              user: { id: userId },
            },
          },
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // Get previous period activity for comparison
    const [prevGalleries, prevDeliveries] = await Promise.all([
      prisma.gallery.count({
        where: {
          userId,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      prisma.delivery.count({
        where: {
          gallery: { userId },
          createdAt: { gte: previousStartDate, lt: startDate },
          status: "COMPLETED",
        },
      }),
    ]);

    // Calculate XP earned (estimate based on achievements)
    const xpEarned = achievements.reduce((sum, a) => sum + a.achievement.xpReward, 0);

    // Calculate previous period XP for comparison
    const prevAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        unlockedAt: { gte: previousStartDate, lt: startDate },
      },
      include: { achievement: true },
    });
    const prevXpEarned = prevAchievements.reduce((sum, a) => sum + a.achievement.xpReward, 0);

    // Calculate activity change percentage
    const currentActivity = galleries + deliveries;
    const prevActivity = prevGalleries + prevDeliveries;
    const activityChange = prevActivity > 0
      ? Math.round(((currentActivity - prevActivity) / prevActivity) * 100)
      : currentActivity > 0 ? 100 : 0;

    // Generate motivational message based on performance
    let message: string;
    let emoji: string;

    if (achievements.length >= 5) {
      message = "Incredible progress! You're on fire!";
      emoji = "🔥";
    } else if (achievements.length >= 3) {
      message = "Great work this period! Keep it up!";
      emoji = "⭐";
    } else if (deliveries >= 5) {
      message = "You've been crushing those deliveries!";
      emoji = "🚀";
    } else if (activityChange > 0) {
      message = "Nice improvement from last period!";
      emoji = "📈";
    } else if (profile.currentLoginStreak >= 7) {
      message = "Your consistency is paying off!";
      emoji = "💪";
    } else {
      message = "Every day is a chance to grow!";
      emoji = "🌱";
    }

    const summary: RecapSummary = {
      period,
      startDate,
      endDate: now,

      xpEarned,
      levelStart: calculateLevel(profile.totalXp - xpEarned),
      levelEnd: profile.level,
      levelsGained: profile.level - calculateLevel(profile.totalXp - xpEarned),

      achievementsUnlocked: achievements.length,
      achievementHighlight: achievementHighlight
        ? {
            name: achievementHighlight.achievement.name,
            description: achievementHighlight.achievement.description,
            rarity: achievementHighlight.achievement.rarity,
            icon: achievementHighlight.achievement.icon,
          }
        : undefined,

      loginStreakMaintained: profile.currentLoginStreak > 0,
      deliveryStreakMaintained: profile.currentDeliveryStreak > 0,
      longestLoginStreakThisPeriod: profile.longestLoginStreak,
      longestDeliveryStreakThisPeriod: profile.longestDeliveryStreak,

      galleriesCreated: galleries,
      deliveriesCompleted: deliveries,
      clientsAdded: clients,

      dailyBonusesClaimed: profile.consecutiveBonusDays,

      xpChange: xpEarned - prevXpEarned,
      activityChange,

      message,
      emoji,
    };

    return success(summary);
  } catch (error) {
    console.error("[Gamification] Error generating recap:", error);
    return fail("Failed to generate recap");
  }
}

/**
 * Get available recaps for the user
 */
export async function getAvailableRecaps(): Promise<
  ActionResult<{ hasWeeklyRecap: boolean; hasMonthlyRecap: boolean }>
> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return success({ hasWeeklyRecap: false, hasMonthlyRecap: false });
    }

    // Check if they have enough history for recaps
    const memberSinceDays = Math.floor(
      (Date.now() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return success({
      hasWeeklyRecap: memberSinceDays >= 7,
      hasMonthlyRecap: memberSinceDays >= 30,
    });
  } catch (error) {
    console.error("[Gamification] Error checking available recaps:", error);
    return fail("Failed to check available recaps");
  }
}

// ============================================================================
// TEAM CHALLENGES
// ============================================================================

export type TeamChallengeType =
  | "total_deliveries"
  | "total_galleries"
  | "total_xp"
  | "most_achievements"
  | "longest_streak";

export type TeamChallengeStatus = "upcoming" | "active" | "completed";

export interface TeamChallenge {
  id: string;
  name: string;
  description: string;
  type: TeamChallengeType;
  targetValue: number;
  startDate: Date;
  endDate: Date;
  status: TeamChallengeStatus;
  xpReward: number;
  participants: TeamChallengeParticipant[];
  currentProgress: number;
  isTeamGoal: boolean; // true = collaborative, false = competitive
}

export interface TeamChallengeParticipant {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  contribution: number;
  rank?: number;
}

// Pre-defined team challenges that rotate
const TEAM_CHALLENGE_TEMPLATES: Omit<TeamChallenge, "id" | "startDate" | "endDate" | "status" | "participants" | "currentProgress">[] = [
  {
    name: "Delivery Sprint",
    description: "Complete as many deliveries as possible as a team",
    type: "total_deliveries",
    targetValue: 50,
    xpReward: 500,
    isTeamGoal: true,
  },
  {
    name: "Gallery Blitz",
    description: "Create the most galleries this week",
    type: "total_galleries",
    targetValue: 30,
    xpReward: 400,
    isTeamGoal: true,
  },
  {
    name: "XP Race",
    description: "Who can earn the most XP?",
    type: "total_xp",
    targetValue: 5000,
    xpReward: 300,
    isTeamGoal: false,
  },
  {
    name: "Achievement Hunter",
    description: "Unlock the most achievements this week",
    type: "most_achievements",
    targetValue: 10,
    xpReward: 400,
    isTeamGoal: false,
  },
  {
    name: "Streak Masters",
    description: "Maintain the longest combined streak",
    type: "longest_streak",
    targetValue: 100,
    xpReward: 350,
    isTeamGoal: true,
  },
];

/**
 * Get active team challenges for the organization
 */
export async function getTeamChallenges(): Promise<ActionResult<TeamChallenge[]>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const now = new Date();

    // Get the current week's start (Monday)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Week end (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get all organization members
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          include: {
            gamificationProfile: true,
            userAchievements: {
              where: {
                unlockedAt: { gte: weekStart },
              },
            },
          },
        },
      },
    });

    // Create challenges based on templates (rotating weekly)
    const weekOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Pick 2-3 challenges for this week based on week number
    const selectedIndices = [
      weekOfYear % TEAM_CHALLENGE_TEMPLATES.length,
      (weekOfYear + 2) % TEAM_CHALLENGE_TEMPLATES.length,
    ];

    const challenges: TeamChallenge[] = selectedIndices.map((index, i) => {
      const template = TEAM_CHALLENGE_TEMPLATES[index];

      // Calculate current progress based on challenge type
      const participants: TeamChallengeParticipant[] = [];
      let totalProgress = 0;

      members.forEach((m) => {
        if (!m.user.gamificationProfile) return;

        const profile = m.user.gamificationProfile;
        let contribution = 0;

        switch (template.type) {
          case "total_deliveries":
            contribution = profile.totalDeliveries;
            break;
          case "total_galleries":
            contribution = profile.totalGalleries;
            break;
          case "total_xp":
            contribution = profile.totalXp;
            break;
          case "most_achievements":
            contribution = m.user.userAchievements.length;
            break;
          case "longest_streak":
            contribution = profile.currentLoginStreak + profile.currentDeliveryStreak;
            break;
        }

        participants.push({
          userId: m.userId,
          userName: m.user.fullName || m.user.firstName || "Unknown",
          userAvatar: m.user.avatarUrl,
          contribution,
        });

        totalProgress += contribution;
      });

      // Sort and rank participants for competitive challenges
      if (!template.isTeamGoal) {
        participants.sort((a, b) => b.contribution - a.contribution);
        participants.forEach((p, idx) => {
          p.rank = idx + 1;
        });
      }

      // Determine status
      let status: TeamChallengeStatus = "active";
      if (now < weekStart) status = "upcoming";
      if (now > weekEnd) status = "completed";

      return {
        ...template,
        id: `challenge-${weekOfYear}-${i}`,
        startDate: weekStart,
        endDate: weekEnd,
        status,
        participants,
        currentProgress: template.isTeamGoal ? totalProgress : Math.max(...participants.map(p => p.contribution), 0),
      };
    });

    return success(challenges);
  } catch (error) {
    console.error("[Gamification] Error fetching team challenges:", error);
    return fail("Failed to fetch team challenges");
  }
}

/**
 * Get user's contribution to current challenges
 */
export async function getMyChallengContributions(): Promise<
  ActionResult<Record<string, number>>
> {
  try {
    const { userId } = await requireAuth();

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return success({});
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const achievements = await prisma.userAchievement.count({
      where: {
        userId,
        unlockedAt: { gte: weekStart },
      },
    });

    return success({
      total_deliveries: profile.totalDeliveries,
      total_galleries: profile.totalGalleries,
      total_xp: profile.totalXp,
      most_achievements: achievements,
      longest_streak: profile.currentLoginStreak + profile.currentDeliveryStreak,
    });
  } catch (error) {
    console.error("[Gamification] Error fetching challenge contributions:", error);
    return fail("Failed to fetch contributions");
  }
}

// ============================================================================
// XP ACTIVITY LOG
// ============================================================================

export type XpActivityType =
  | "achievement"
  | "daily_bonus"
  | "level_up"
  | "streak_milestone"
  | "delivery"
  | "gallery"
  | "quest"
  | "challenge"
  | "referral";

export interface XpActivityEntry {
  id: string;
  type: XpActivityType;
  amount: number;
  description: string;
  timestamp: Date;
  metadata?: {
    achievementName?: string;
    achievementRarity?: string;
    streakType?: string;
    streakCount?: number;
    level?: number;
  };
}

/**
 * Log an XP activity (internal helper)
 */
export async function logXpActivity(
  userId: string,
  type: XpActivityType,
  amount: number,
  description: string,
  metadata?: {
    achievementSlug?: string;
    achievementName?: string;
    rarity?: AchievementRarity;
    questId?: string;
    challengeId?: string;
    eventId?: string;
  }
): Promise<void> {
  try {
    await prisma.xpActivityLog.create({
      data: {
        userId,
        type,
        amount,
        description,
        achievementSlug: metadata?.achievementSlug,
        achievementName: metadata?.achievementName,
        rarity: metadata?.rarity,
        questId: metadata?.questId,
        challengeId: metadata?.challengeId,
        eventId: metadata?.eventId,
      },
    });
  } catch (error) {
    console.error("[Gamification] Error logging XP activity:", error);
  }
}

/**
 * Get XP activity history for current user
 */
export async function getXpActivityLog(
  limit: number = 50
): Promise<ActionResult<XpActivityEntry[]>> {
  try {
    const { userId } = await requireAuth();

    // Get from XP activity log table
    const activities = await prisma.xpActivityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Convert to XpActivityEntry format
    const entries: XpActivityEntry[] = activities.map((activity) => ({
      id: activity.id,
      type: activity.type as XpActivityType,
      amount: activity.amount,
      description: activity.description,
      timestamp: activity.createdAt,
      metadata: activity.achievementName
        ? {
            achievementName: activity.achievementName,
            achievementRarity: activity.rarity || undefined,
          }
        : undefined,
    }));

    return success(entries);
  } catch (error) {
    console.error("[Gamification] Error fetching XP activity log:", error);
    return fail("Failed to fetch activity log");
  }
}

/**
 * Get XP summary by type
 */
export async function getXpSummaryByType(): Promise<
  ActionResult<Record<XpActivityType, number>>
> {
  try {
    const { userId } = await requireAuth();

    // Aggregate XP by type from activity log
    const activities = await prisma.xpActivityLog.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    });

    // Build summary with all types initialized to 0
    const summary: Record<XpActivityType, number> = {
      achievement: 0,
      daily_bonus: 0,
      level_up: 0,
      streak_milestone: 0,
      delivery: 0,
      gallery: 0,
      quest: 0,
      challenge: 0,
      referral: 0,
      seasonal_event: 0,
      admin_award: 0,
    };

    // Fill in actual values
    for (const activity of activities) {
      const type = activity.type as XpActivityType;
      summary[type] = activity._sum.amount || 0;
    }

    return success(summary);
  } catch (error) {
    console.error("[Gamification] Error fetching XP summary:", error);
    return fail("Failed to fetch XP summary");
  }
}

// ============================================================================
// BADGE SHOWCASE
// ============================================================================

export interface BadgeShowcase {
  featuredAchievementIds: string[];
  maxSlots: number;
}

/**
 * Get user's badge showcase
 */
export async function getBadgeShowcase(): Promise<ActionResult<BadgeShowcase>> {
  try {
    const { userId } = await requireAuth();

    // Get showcase and profile in parallel
    const [showcase, profile] = await Promise.all([
      prisma.badgeShowcase.findUnique({
        where: { userId },
      }),
      prisma.gamificationProfile.findUnique({
        where: { userId },
        select: { level: true },
      }),
    ]);

    // Max slots based on level (3 base + 1 per 10 levels, max 6)
    const maxSlots = Math.min(3 + Math.floor((profile?.level || 1) / 10), 6);

    return success({
      featuredAchievementIds: showcase?.featuredSlugs || [],
      maxSlots,
    });
  } catch (error) {
    console.error("[Gamification] Error fetching badge showcase:", error);
    return fail("Failed to fetch badge showcase");
  }
}

/**
 * Update user's badge showcase
 */
export async function updateBadgeShowcase(
  featuredSlugs: string[]
): Promise<ActionResult<BadgeShowcase>> {
  try {
    const { userId } = await requireAuth();

    // Get profile for max slots validation
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
      select: { level: true },
    });

    const maxSlots = Math.min(3 + Math.floor((profile?.level || 1) / 10), 6);

    // Validate number of slots
    if (featuredSlugs.length > maxSlots) {
      return fail(`You can only feature up to ${maxSlots} achievements`);
    }

    // Validate that user owns all the achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: { select: { slug: true } } },
    });

    const ownedSlugs = new Set(userAchievements.map((ua) => ua.achievement.slug));
    const invalidSlugs = featuredSlugs.filter((slug) => !ownedSlugs.has(slug));

    if (invalidSlugs.length > 0) {
      return fail("Cannot feature achievements you haven't unlocked");
    }

    // Upsert the showcase
    await prisma.badgeShowcase.upsert({
      where: { userId },
      create: {
        userId,
        featuredSlugs,
      },
      update: {
        featuredSlugs,
      },
    });

    return success({
      featuredAchievementIds: featuredSlugs,
      maxSlots,
    });
  } catch (error) {
    console.error("[Gamification] Error updating badge showcase:", error);
    return fail("Failed to update badge showcase");
  }
}

/**
 * Get user's unlocked achievements for showcase selection
 */
export async function getShowcaseableAchievements(): Promise<
  ActionResult<UnlockedAchievement[]>
> {
  try {
    const { userId } = await requireAuth();

    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });

    return success(
      achievements.map((ua) => ({
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
    console.error("[Gamification] Error fetching showcaseable achievements:", error);
    return fail("Failed to fetch achievements");
  }
}

// ============================================================================
// SEASONAL EVENTS
// ============================================================================

export type SeasonalEventType =
  | "new_year"
  | "spring"
  | "summer"
  | "fall"
  | "winter"
  | "anniversary"
  | "special";

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  type: SeasonalEventType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  xpMultiplier: number;
  specialRewards: {
    type: string;
    name: string;
    description: string;
  }[];
  challenges: {
    id: string;
    name: string;
    description: string;
    targetValue: number;
    currentProgress: number;
    xpReward: number;
  }[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    icon: string;
  };
}

// Pre-defined seasonal events
const SEASONAL_EVENTS: Omit<SeasonalEvent, "isActive" | "challenges">[] = [
  {
    id: "new-year-2025",
    name: "New Year Sprint",
    description: "Start the year strong with bonus XP and special challenges!",
    type: "new_year",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-15"),
    xpMultiplier: 1.5,
    specialRewards: [
      {
        type: "badge",
        name: "Fresh Start",
        description: "Complete the New Year Sprint event",
      },
    ],
    theme: {
      primaryColor: "#FFD700",
      secondaryColor: "#FFA500",
      icon: "sparkles",
    },
  },
  {
    id: "summer-2025",
    name: "Summer Photo Festival",
    description: "Capture the season with special summer challenges!",
    type: "summer",
    startDate: new Date("2025-06-21"),
    endDate: new Date("2025-07-21"),
    xpMultiplier: 1.25,
    specialRewards: [
      {
        type: "badge",
        name: "Summer Champion",
        description: "Complete the Summer Photo Festival",
      },
    ],
    theme: {
      primaryColor: "#FF6B6B",
      secondaryColor: "#4ECDC4",
      icon: "sun",
    },
  },
];

/**
 * Get active seasonal events
 */
export async function getSeasonalEvents(): Promise<ActionResult<SeasonalEvent[]>> {
  try {
    await requireAuth();

    const now = new Date();

    const activeEvents: SeasonalEvent[] = SEASONAL_EVENTS
      .filter((event) => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return now >= start && now <= end;
      })
      .map((event) => ({
        ...event,
        isActive: true,
        challenges: [
          {
            id: `${event.id}-deliveries`,
            name: "Delivery Dash",
            description: "Complete 10 deliveries during the event",
            targetValue: 10,
            currentProgress: 0,
            xpReward: 500,
          },
          {
            id: `${event.id}-galleries`,
            name: "Gallery Rush",
            description: "Create 5 galleries during the event",
            targetValue: 5,
            currentProgress: 0,
            xpReward: 300,
          },
        ],
      }));

    return success(activeEvents);
  } catch (error) {
    console.error("[Gamification] Error fetching seasonal events:", error);
    return fail("Failed to fetch seasonal events");
  }
}

/**
 * Get upcoming seasonal events
 */
export async function getUpcomingEvents(): Promise<ActionResult<SeasonalEvent[]>> {
  try {
    await requireAuth();

    const now = new Date();

    const upcomingEvents: SeasonalEvent[] = SEASONAL_EVENTS
      .filter((event) => new Date(event.startDate) > now)
      .map((event) => ({
        ...event,
        isActive: false,
        challenges: [],
      }))
      .slice(0, 3);

    return success(upcomingEvents);
  } catch (error) {
    console.error("[Gamification] Error fetching upcoming events:", error);
    return fail("Failed to fetch upcoming events");
  }
}

// ============================================================================
// DAILY QUESTS
// ============================================================================

export interface DailyQuest {
  id: string;
  name: string;
  description: string;
  type: "upload" | "message" | "delivery" | "login" | "review";
  targetValue: number;
  currentProgress: number;
  xpReward: number;
  isCompleted: boolean;
  expiresAt: Date;
}

// Daily quest templates
const DAILY_QUEST_TEMPLATES: Omit<DailyQuest, "currentProgress" | "isCompleted" | "expiresAt">[] = [
  {
    id: "upload-photos",
    name: "Photo Upload",
    description: "Upload at least 10 photos to a gallery",
    type: "upload",
    targetValue: 10,
    xpReward: 50,
  },
  {
    id: "send-message",
    name: "Stay Connected",
    description: "Send a message to a client",
    type: "message",
    targetValue: 1,
    xpReward: 25,
  },
  {
    id: "complete-delivery",
    name: "Quick Delivery",
    description: "Complete a gallery delivery",
    type: "delivery",
    targetValue: 1,
    xpReward: 75,
  },
  {
    id: "daily-login",
    name: "Check In",
    description: "Log in to the platform",
    type: "login",
    targetValue: 1,
    xpReward: 15,
  },
];

/**
 * Get today's daily quests
 */
export async function getDailyQuests(): Promise<ActionResult<DailyQuest[]>> {
  try {
    const { userId } = await requireAuth();

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Get profile for checking progress
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    // Rotate quests based on day of year
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Pick 3 quests for today
    const selectedQuests = [
      DAILY_QUEST_TEMPLATES[dayOfYear % DAILY_QUEST_TEMPLATES.length],
      DAILY_QUEST_TEMPLATES[(dayOfYear + 1) % DAILY_QUEST_TEMPLATES.length],
      DAILY_QUEST_TEMPLATES[(dayOfYear + 2) % DAILY_QUEST_TEMPLATES.length],
    ].filter((q, i, arr) => arr.findIndex((x) => x.id === q.id) === i); // Remove duplicates

    const quests: DailyQuest[] = selectedQuests.map((template) => {
      let currentProgress = 0;
      let isCompleted = false;

      // Check completion based on quest type
      if (template.type === "login" && profile?.lastLoginDate) {
        const lastLogin = new Date(profile.lastLoginDate);
        if (lastLogin.toDateString() === now.toDateString()) {
          currentProgress = 1;
          isCompleted = true;
        }
      }

      return {
        ...template,
        currentProgress,
        isCompleted,
        expiresAt: endOfDay,
      };
    });

    return success(quests);
  } catch (error) {
    console.error("[Gamification] Error fetching daily quests:", error);
    return fail("Failed to fetch daily quests");
  }
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface GamificationNotificationPrefs {
  achievementUnlocks: boolean;
  levelUps: boolean;
  streakReminders: boolean;
  dailyBonusReminders: boolean;
  leaderboardChanges: boolean;
  challengeUpdates: boolean;
  weeklyRecaps: boolean;
  seasonalEvents: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: GamificationNotificationPrefs = {
  achievementUnlocks: true,
  levelUps: true,
  streakReminders: true,
  dailyBonusReminders: true,
  leaderboardChanges: false,
  challengeUpdates: true,
  weeklyRecaps: true,
  seasonalEvents: true,
};

/**
 * Get gamification notification preferences
 */
export async function getGamificationNotificationPrefs(): Promise<
  ActionResult<GamificationNotificationPrefs>
> {
  try {
    const { userId } = await requireAuth();

    // Get user's preferences or create with defaults
    const prefs = await prisma.gamificationNotificationPrefs.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Return defaults if no preferences saved yet
      return success(DEFAULT_NOTIFICATION_PREFS);
    }

    return success({
      achievementUnlocks: prefs.achievementUnlocks,
      levelUps: prefs.levelUps,
      streakReminders: prefs.streakReminders,
      dailyBonusReminders: prefs.dailyBonusReminders,
      leaderboardChanges: prefs.leaderboardChanges,
      challengeUpdates: prefs.challengeUpdates,
      weeklyRecaps: prefs.weeklyRecaps,
      seasonalEvents: prefs.seasonalEvents,
    });
  } catch (error) {
    console.error("[Gamification] Error fetching notification prefs:", error);
    return fail("Failed to fetch notification preferences");
  }
}

/**
 * Update gamification notification preferences
 */
export async function updateGamificationNotificationPrefs(
  prefs: Partial<GamificationNotificationPrefs>
): Promise<ActionResult<GamificationNotificationPrefs>> {
  try {
    const { userId } = await requireAuth();

    // Upsert the preferences
    const updated = await prisma.gamificationNotificationPrefs.upsert({
      where: { userId },
      create: {
        userId,
        ...DEFAULT_NOTIFICATION_PREFS,
        ...prefs,
      },
      update: prefs,
    });

    return success({
      achievementUnlocks: updated.achievementUnlocks,
      levelUps: updated.levelUps,
      streakReminders: updated.streakReminders,
      dailyBonusReminders: updated.dailyBonusReminders,
      leaderboardChanges: updated.leaderboardChanges,
      challengeUpdates: updated.challengeUpdates,
      weeklyRecaps: updated.weeklyRecaps,
      seasonalEvents: updated.seasonalEvents,
    });
  } catch (error) {
    console.error("[Gamification] Error updating notification prefs:", error);
    return fail("Failed to update notification preferences");
  }
}

// ============================================================================
// ACHIEVEMENT CATEGORIES
// ============================================================================

export interface AchievementCategoryInfo {
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  totalCount: number;
  unlockedCount: number;
  totalXp: number;
  earnedXp: number;
}

/**
 * Get achievement statistics by category
 */
export async function getAchievementsByCategory(): Promise<
  ActionResult<AchievementCategoryInfo[]>
> {
  try {
    const { userId } = await requireAuth();

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    // Group by category
    const categoryMap = new Map<AchievementCategory, {
      total: number;
      unlocked: number;
      totalXp: number;
      earnedXp: number;
    }>();

    const categories: AchievementCategory[] = [
      "general",
      "gallery",
      "delivery",
      "client",
      "revenue",
      "streak",
      "social",
      "milestone",
    ];

    categories.forEach((cat) => {
      categoryMap.set(cat, { total: 0, unlocked: 0, totalXp: 0, earnedXp: 0 });
    });

    allAchievements.forEach((achievement) => {
      const stats = categoryMap.get(achievement.category);
      if (stats) {
        stats.total++;
        stats.totalXp += achievement.xpReward;
        if (unlockedIds.has(achievement.id)) {
          stats.unlocked++;
          stats.earnedXp += achievement.xpReward;
        }
      }
    });

    const categoryNames: Record<AchievementCategory, { name: string; description: string; icon: string }> = {
      general: { name: "General", description: "General platform achievements", icon: "star" },
      gallery: { name: "Gallery", description: "Gallery creation achievements", icon: "image" },
      delivery: { name: "Delivery", description: "Delivery milestones", icon: "send" },
      client: { name: "Clients", description: "Client relationship achievements", icon: "users" },
      revenue: { name: "Revenue", description: "Business growth achievements", icon: "dollar-sign" },
      streak: { name: "Streaks", description: "Consistency achievements", icon: "flame" },
      social: { name: "Social", description: "Community achievements", icon: "heart" },
      milestone: { name: "Milestones", description: "Major milestone achievements", icon: "trophy" },
    };

    const result: AchievementCategoryInfo[] = categories.map((category) => {
      const stats = categoryMap.get(category)!;
      const info = categoryNames[category];
      return {
        category,
        name: info.name,
        description: info.description,
        icon: info.icon,
        totalCount: stats.total,
        unlockedCount: stats.unlocked,
        totalXp: stats.totalXp,
        earnedXp: stats.earnedXp,
      };
    });

    return success(result);
  } catch (error) {
    console.error("[Gamification] Error fetching achievements by category:", error);
    return fail("Failed to fetch achievement categories");
  }
}

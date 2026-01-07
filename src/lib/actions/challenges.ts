"use server";

/**
 * Weekly Challenges Server Actions
 *
 * Handles weekly challenge management, progress tracking, and completion.
 * Challenges reset every Monday and provide bonus XP for completing specific tasks.
 */

import { prisma } from "@/lib/db";
import { requireAuth } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import type { ChallengeType } from "@prisma/client";

// =============================================================================
// Types
// =============================================================================

export interface ChallengeWithProgress {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  targetType: string;
  targetCount: number;
  xpReward: number;
  startsAt: Date;
  endsAt: Date;
  currentCount: number;
  completed: boolean;
  completedAt?: Date;
}

// Challenge templates for weekly rotation
const CHALLENGE_TEMPLATES = [
  {
    name: "Gallery Rush",
    description: "Create 3 galleries this week",
    targetType: "gallery_created",
    targetCount: 3,
    xpReward: 150,
  },
  {
    name: "Delivery Champion",
    description: "Deliver 5 galleries this week",
    targetType: "gallery_delivered",
    targetCount: 5,
    xpReward: 200,
  },
  {
    name: "Client Connector",
    description: "Add 3 new clients this week",
    targetType: "client_added",
    targetCount: 3,
    xpReward: 150,
  },
  {
    name: "Booking Blitz",
    description: "Confirm 2 bookings this week",
    targetType: "booking_confirmed",
    targetCount: 2,
    xpReward: 175,
  },
  {
    name: "Payment Pro",
    description: "Receive 3 payments this week",
    targetType: "payment_received",
    targetCount: 3,
    xpReward: 200,
  },
  {
    name: "Gallery Creator",
    description: "Create 5 galleries this week",
    targetType: "gallery_created",
    targetCount: 5,
    xpReward: 250,
  },
  {
    name: "Delivery Master",
    description: "Deliver 3 galleries this week",
    targetType: "gallery_delivered",
    targetCount: 3,
    xpReward: 175,
  },
  {
    name: "Network Builder",
    description: "Add 5 new clients this week",
    targetType: "client_added",
    targetCount: 5,
    xpReward: 225,
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the start of the current week (Monday 00:00:00)
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, otherwise go back to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get the end of the current week (Sunday 23:59:59)
 */
function getWeekEnd(): Date {
  const weekStart = getWeekStart();
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Select random challenges from templates
 */
function selectRandomChallenges(count: number): typeof CHALLENGE_TEMPLATES {
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// =============================================================================
// Server Actions
// =============================================================================

/**
 * Get active challenges for the current week
 * Creates new challenges if none exist for the current week
 */
export async function getActiveChallenges(): Promise<ActionResult<ChallengeWithProgress[]>> {
  try {
    const { userId } = await requireAuth();

    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    // Get or create challenges for this week
    let challenges = await prisma.challenge.findMany({
      where: {
        startsAt: { gte: weekStart },
        endsAt: { lte: weekEnd },
      },
    });

    // If no challenges exist for this week, create them
    if (challenges.length === 0) {
      const templates = selectRandomChallenges(3); // 3 challenges per week
      challenges = await Promise.all(
        templates.map((template) =>
          prisma.challenge.create({
            data: {
              name: template.name,
              description: template.description,
              type: "weekly",
              targetType: template.targetType,
              targetCount: template.targetCount,
              xpReward: template.xpReward,
              startsAt: weekStart,
              endsAt: weekEnd,
            },
          })
        )
      );
    }

    // Get user's progress for each challenge
    const challengeIds = challenges.map((c) => c.id);
    const progressRecords = await prisma.challengeProgress.findMany({
      where: {
        userId,
        challengeId: { in: challengeIds },
      },
    });

    const progressMap = new Map(progressRecords.map((p) => [p.challengeId, p]));

    // Combine challenges with progress
    const challengesWithProgress: ChallengeWithProgress[] = challenges.map((challenge) => {
      const progress = progressMap.get(challenge.id);
      return {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        type: challenge.type,
        targetType: challenge.targetType,
        targetCount: challenge.targetCount,
        xpReward: challenge.xpReward,
        startsAt: challenge.startsAt,
        endsAt: challenge.endsAt,
        currentCount: progress?.currentCount ?? 0,
        completed: progress?.completed ?? false,
        completedAt: progress?.completedAt ?? undefined,
      };
    });

    return success(challengesWithProgress);
  } catch (error) {
    console.error("[Challenges] Error getting active challenges:", error);
    return fail("Failed to get challenges");
  }
}

/**
 * Increment challenge progress for a specific target type
 * Called by gamification triggers when relevant actions occur
 */
export async function incrementChallengeProgress(
  userId: string,
  organizationId: string,
  targetType: string
): Promise<void> {
  try {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    // Find challenges matching this target type for the current week
    const challenges = await prisma.challenge.findMany({
      where: {
        targetType,
        startsAt: { gte: weekStart },
        endsAt: { lte: weekEnd },
      },
    });

    if (challenges.length === 0) return;

    for (const challenge of challenges) {
      // Get or create progress record
      const existingProgress = await prisma.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id,
          },
        },
      });

      if (existingProgress?.completed) {
        // Already completed, skip
        continue;
      }

      const newCount = (existingProgress?.currentCount ?? 0) + 1;
      const isCompleted = newCount >= challenge.targetCount;

      await prisma.challengeProgress.upsert({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id,
          },
        },
        update: {
          currentCount: newCount,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        create: {
          userId,
          organizationId,
          challengeId: challenge.id,
          currentCount: newCount,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      // If just completed, award XP
      if (isCompleted && !existingProgress?.completed) {
        await prisma.gamificationProfile.upsert({
          where: { userId },
          update: {
            totalXp: { increment: challenge.xpReward },
          },
          create: {
            userId,
            totalXp: challenge.xpReward,
          },
        });

        console.log(
          `[Challenges] User ${userId} completed challenge "${challenge.name}" (+${challenge.xpReward} XP)`
        );
      }
    }
  } catch (error) {
    console.error("[Challenges] Error incrementing challenge progress:", error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Get challenge completion stats for a user
 */
export async function getChallengeStats(): Promise<
  ActionResult<{
    totalCompleted: number;
    totalXpEarned: number;
    currentWeekCompleted: number;
    currentWeekTotal: number;
  }>
> {
  try {
    const { userId } = await requireAuth();

    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    // Get all completed challenges
    const completedChallenges = await prisma.challengeProgress.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        challenge: {
          select: { xpReward: true, startsAt: true, endsAt: true },
        },
      },
    });

    const totalCompleted = completedChallenges.length;
    const totalXpEarned = completedChallenges.reduce(
      (sum, cp) => sum + cp.challenge.xpReward,
      0
    );

    // Get current week stats
    const currentWeekChallenges = await prisma.challenge.count({
      where: {
        startsAt: { gte: weekStart },
        endsAt: { lte: weekEnd },
      },
    });

    const currentWeekCompleted = completedChallenges.filter((cp) => {
      const challengeStart = cp.challenge.startsAt;
      return challengeStart >= weekStart && challengeStart <= weekEnd;
    }).length;

    return success({
      totalCompleted,
      totalXpEarned,
      currentWeekCompleted,
      currentWeekTotal: currentWeekChallenges,
    });
  } catch (error) {
    console.error("[Challenges] Error getting challenge stats:", error);
    return fail("Failed to get challenge stats");
  }
}

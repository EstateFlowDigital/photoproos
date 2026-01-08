export const DAILY_BONUS_XP = [
  10, // Day 1
  15, // Day 2
  25, // Day 3
  40, // Day 4
  60, // Day 5
  80, // Day 6
  100, // Day 7 (weekly finale bonus!)
];

// ============================================================================
// STREAK FREEZE CONFIGURATION
// ============================================================================

/**
 * Streak Freezes allow users to preserve their streak when they miss a day.
 * They can be earned through various achievements and milestones.
 */
export const STREAK_FREEZE_CONFIG = {
  // Maximum freezes a user can hold at once
  maxFreezes: 5,

  // Ways to earn streak freezes
  rewards: {
    // Earn 1 freeze when claiming Day 7 bonus
    dailyBonusDay7: 1,
    // Earn 1 freeze for every 10 levels
    perTenLevels: 1,
    // Milestone achievements that grant freezes
    milestoneStreaks: {
      7: 1, // 7-day streak: +1 freeze
      30: 2, // 30-day streak: +2 freezes
      100: 3, // 100-day streak: +3 freezes
    },
  },

  // Cost in XP to purchase a freeze (optional feature)
  xpCost: 500,
} as const;

// Streak freeze type for UI display
export type StreakFreezeSource = "daily_bonus" | "level_up" | "milestone" | "purchase";

import type { AchievementCategory, AchievementRarity } from "@prisma/client";

// ============================================================================
// ACHIEVEMENT TRIGGER TYPES
// ============================================================================

export type AchievementTrigger =
  | { type: "gallery_count"; threshold: number }
  | { type: "delivery_count"; threshold: number }
  | { type: "client_count"; threshold: number }
  | { type: "revenue_cents"; threshold: number }
  | { type: "streak_login"; threshold: number }
  | { type: "streak_delivery"; threshold: number }
  | { type: "payment_count"; threshold: number }
  | { type: "booking_count"; threshold: number }
  | { type: "contract_signed_count"; threshold: number }
  | { type: "invoice_paid_count"; threshold: number }
  | { type: "level_reached"; threshold: number }
  | { type: "onboarding_complete"; threshold: 1 };

export type TriggerType = AchievementTrigger["type"];

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

export interface AchievementDefinition {
  slug: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  isHidden?: boolean;
  order?: number;
  trigger: AchievementTrigger;
}

/**
 * All achievement definitions
 * These are seeded to the database and used for achievement checking
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ============================================================================
  // GALLERIES
  // ============================================================================
  {
    slug: "first_gallery",
    name: "First Gallery",
    description: "Create your first gallery",
    category: "milestone",
    rarity: "common",
    icon: "camera",
    xpReward: 50,
    order: 1,
    trigger: { type: "gallery_count", threshold: 1 },
  },
  {
    slug: "gallery_10",
    name: "10 Galleries",
    description: "Create 10 galleries",
    category: "milestone",
    rarity: "uncommon",
    icon: "images",
    xpReward: 100,
    order: 2,
    trigger: { type: "gallery_count", threshold: 10 },
  },
  {
    slug: "gallery_25",
    name: "25 Galleries",
    description: "Create 25 galleries",
    category: "milestone",
    rarity: "uncommon",
    icon: "images",
    xpReward: 150,
    order: 3,
    trigger: { type: "gallery_count", threshold: 25 },
  },
  {
    slug: "gallery_50",
    name: "50 Galleries",
    description: "Create 50 galleries",
    category: "milestone",
    rarity: "rare",
    icon: "gallery",
    xpReward: 250,
    order: 4,
    trigger: { type: "gallery_count", threshold: 50 },
  },
  {
    slug: "gallery_100",
    name: "100 Galleries",
    description: "Create 100 galleries",
    category: "milestone",
    rarity: "epic",
    icon: "crown",
    xpReward: 500,
    order: 5,
    trigger: { type: "gallery_count", threshold: 100 },
  },

  // ============================================================================
  // DELIVERIES
  // ============================================================================
  {
    slug: "first_delivery",
    name: "First Delivery",
    description: "Deliver your first gallery to a client",
    category: "milestone",
    rarity: "common",
    icon: "send",
    xpReward: 75,
    order: 10,
    trigger: { type: "delivery_count", threshold: 1 },
  },
  {
    slug: "delivery_10",
    name: "10 Deliveries",
    description: "Deliver 10 galleries to clients",
    category: "milestone",
    rarity: "uncommon",
    icon: "rocket",
    xpReward: 150,
    order: 11,
    trigger: { type: "delivery_count", threshold: 10 },
  },
  {
    slug: "delivery_25",
    name: "25 Deliveries",
    description: "Deliver 25 galleries to clients",
    category: "milestone",
    rarity: "uncommon",
    icon: "rocket",
    xpReward: 200,
    order: 12,
    trigger: { type: "delivery_count", threshold: 25 },
  },
  {
    slug: "delivery_50",
    name: "50 Deliveries",
    description: "Deliver 50 galleries to clients",
    category: "milestone",
    rarity: "rare",
    icon: "truck",
    xpReward: 300,
    order: 13,
    trigger: { type: "delivery_count", threshold: 50 },
  },
  {
    slug: "delivery_100",
    name: "100 Deliveries",
    description: "Deliver 100 galleries to clients",
    category: "milestone",
    rarity: "epic",
    icon: "trophy",
    xpReward: 600,
    order: 14,
    trigger: { type: "delivery_count", threshold: 100 },
  },

  // ============================================================================
  // REVENUE
  // ============================================================================
  {
    slug: "revenue_1k",
    name: "$1,000 Revenue",
    description: "Earn $1,000 in total revenue",
    category: "revenue",
    rarity: "common",
    icon: "dollar",
    xpReward: 100,
    order: 20,
    trigger: { type: "revenue_cents", threshold: 100000 }, // $1,000 in cents
  },
  {
    slug: "revenue_5k",
    name: "$5,000 Revenue",
    description: "Earn $5,000 in total revenue",
    category: "revenue",
    rarity: "uncommon",
    icon: "trending-up",
    xpReward: 200,
    order: 21,
    trigger: { type: "revenue_cents", threshold: 500000 },
  },
  {
    slug: "revenue_10k",
    name: "$10,000 Revenue",
    description: "Earn $10,000 in total revenue",
    category: "revenue",
    rarity: "uncommon",
    icon: "trending-up",
    xpReward: 300,
    order: 22,
    trigger: { type: "revenue_cents", threshold: 1000000 },
  },
  {
    slug: "revenue_25k",
    name: "$25,000 Revenue",
    description: "Earn $25,000 in total revenue",
    category: "revenue",
    rarity: "rare",
    icon: "gem",
    xpReward: 400,
    order: 23,
    trigger: { type: "revenue_cents", threshold: 2500000 },
  },
  {
    slug: "revenue_50k",
    name: "$50,000 Revenue",
    description: "Earn $50,000 in total revenue",
    category: "revenue",
    rarity: "rare",
    icon: "gem",
    xpReward: 500,
    order: 24,
    trigger: { type: "revenue_cents", threshold: 5000000 },
  },
  {
    slug: "revenue_100k",
    name: "$100,000 Revenue",
    description: "Earn $100,000 in total revenue",
    category: "revenue",
    rarity: "epic",
    icon: "star",
    xpReward: 1000,
    order: 25,
    trigger: { type: "revenue_cents", threshold: 10000000 },
  },

  // ============================================================================
  // CLIENTS
  // ============================================================================
  {
    slug: "first_client",
    name: "First Client",
    description: "Add your first client",
    category: "milestone",
    rarity: "common",
    icon: "user-plus",
    xpReward: 50,
    order: 30,
    trigger: { type: "client_count", threshold: 1 },
  },
  {
    slug: "client_10",
    name: "10 Clients",
    description: "Build a client base of 10",
    category: "milestone",
    rarity: "common",
    icon: "users",
    xpReward: 100,
    order: 31,
    trigger: { type: "client_count", threshold: 10 },
  },
  {
    slug: "client_25",
    name: "25 Clients",
    description: "Build a client base of 25",
    category: "milestone",
    rarity: "uncommon",
    icon: "users",
    xpReward: 150,
    order: 32,
    trigger: { type: "client_count", threshold: 25 },
  },
  {
    slug: "client_50",
    name: "50 Clients",
    description: "Build a client base of 50",
    category: "milestone",
    rarity: "rare",
    icon: "network",
    xpReward: 250,
    order: 33,
    trigger: { type: "client_count", threshold: 50 },
  },
  {
    slug: "client_100",
    name: "100 Clients",
    description: "Build a client base of 100",
    category: "milestone",
    rarity: "epic",
    icon: "network",
    xpReward: 400,
    order: 34,
    trigger: { type: "client_count", threshold: 100 },
  },

  // ============================================================================
  // STREAKS
  // ============================================================================
  {
    slug: "streak_login_3",
    name: "3 Day Streak",
    description: "Log in 3 days in a row",
    category: "streak",
    rarity: "common",
    icon: "flame",
    xpReward: 25,
    order: 40,
    trigger: { type: "streak_login", threshold: 3 },
  },
  {
    slug: "streak_login_7",
    name: "Week Warrior",
    description: "Log in 7 days in a row",
    category: "streak",
    rarity: "common",
    icon: "flame",
    xpReward: 75,
    order: 41,
    trigger: { type: "streak_login", threshold: 7 },
  },
  {
    slug: "streak_login_14",
    name: "14 Day Streak",
    description: "Log in 14 days in a row",
    category: "streak",
    rarity: "uncommon",
    icon: "fire",
    xpReward: 150,
    order: 42,
    trigger: { type: "streak_login", threshold: 14 },
  },
  {
    slug: "streak_login_30",
    name: "Month Master",
    description: "Log in 30 days in a row",
    category: "streak",
    rarity: "rare",
    icon: "fire",
    xpReward: 300,
    order: 43,
    trigger: { type: "streak_login", threshold: 30 },
  },
  {
    slug: "streak_login_60",
    name: "60 Day Streak",
    description: "Log in 60 days in a row",
    category: "streak",
    rarity: "epic",
    icon: "zap",
    xpReward: 500,
    order: 44,
    trigger: { type: "streak_login", threshold: 60 },
  },
  {
    slug: "streak_delivery_3",
    name: "3 Day Delivery Streak",
    description: "Deliver galleries 3 days in a row",
    category: "streak",
    rarity: "common",
    icon: "zap",
    xpReward: 50,
    order: 45,
    trigger: { type: "streak_delivery", threshold: 3 },
  },
  {
    slug: "streak_delivery_5",
    name: "5 Day Delivery Streak",
    description: "Deliver galleries 5 days in a row",
    category: "streak",
    rarity: "uncommon",
    icon: "zap",
    xpReward: 100,
    order: 46,
    trigger: { type: "streak_delivery", threshold: 5 },
  },
  {
    slug: "streak_delivery_7",
    name: "Week of Deliveries",
    description: "Deliver galleries 7 days in a row",
    category: "streak",
    rarity: "rare",
    icon: "rocket",
    xpReward: 200,
    order: 47,
    trigger: { type: "streak_delivery", threshold: 7 },
  },

  // ============================================================================
  // PAYMENTS
  // ============================================================================
  {
    slug: "first_payment",
    name: "First Payment",
    description: "Receive your first payment",
    category: "milestone",
    rarity: "common",
    icon: "banknote",
    xpReward: 100,
    order: 50,
    trigger: { type: "payment_count", threshold: 1 },
  },
  {
    slug: "payment_10",
    name: "10 Payments",
    description: "Receive 10 payments",
    category: "milestone",
    rarity: "uncommon",
    icon: "wallet",
    xpReward: 150,
    order: 51,
    trigger: { type: "payment_count", threshold: 10 },
  },
  {
    slug: "payment_50",
    name: "50 Payments",
    description: "Receive 50 payments",
    category: "milestone",
    rarity: "rare",
    icon: "wallet",
    xpReward: 300,
    order: 52,
    trigger: { type: "payment_count", threshold: 50 },
  },
  {
    slug: "payment_100",
    name: "100 Payments",
    description: "Receive 100 payments",
    category: "milestone",
    rarity: "epic",
    icon: "trophy",
    xpReward: 500,
    order: 53,
    trigger: { type: "payment_count", threshold: 100 },
  },

  // ============================================================================
  // BOOKINGS
  // ============================================================================
  {
    slug: "first_booking",
    name: "First Booking",
    description: "Complete your first booking",
    category: "milestone",
    rarity: "common",
    icon: "calendar",
    xpReward: 50,
    order: 60,
    trigger: { type: "booking_count", threshold: 1 },
  },
  {
    slug: "booking_10",
    name: "10 Bookings",
    description: "Complete 10 bookings",
    category: "milestone",
    rarity: "uncommon",
    icon: "calendar-check",
    xpReward: 100,
    order: 61,
    trigger: { type: "booking_count", threshold: 10 },
  },
  {
    slug: "booking_50",
    name: "50 Bookings",
    description: "Complete 50 bookings",
    category: "milestone",
    rarity: "rare",
    icon: "calendar-check",
    xpReward: 250,
    order: 62,
    trigger: { type: "booking_count", threshold: 50 },
  },
  {
    slug: "booking_100",
    name: "100 Bookings",
    description: "Complete 100 bookings",
    category: "milestone",
    rarity: "epic",
    icon: "trophy",
    xpReward: 500,
    order: 63,
    trigger: { type: "booking_count", threshold: 100 },
  },

  // ============================================================================
  // CONTRACTS
  // ============================================================================
  {
    slug: "first_contract",
    name: "First Contract",
    description: "Get your first contract signed",
    category: "milestone",
    rarity: "common",
    icon: "file-signature",
    xpReward: 75,
    order: 70,
    trigger: { type: "contract_signed_count", threshold: 1 },
  },
  {
    slug: "contract_10",
    name: "10 Contracts",
    description: "Get 10 contracts signed",
    category: "milestone",
    rarity: "uncommon",
    icon: "file-check",
    xpReward: 150,
    order: 71,
    trigger: { type: "contract_signed_count", threshold: 10 },
  },
  {
    slug: "contract_50",
    name: "50 Contracts",
    description: "Get 50 contracts signed",
    category: "milestone",
    rarity: "rare",
    icon: "file-check",
    xpReward: 300,
    order: 72,
    trigger: { type: "contract_signed_count", threshold: 50 },
  },

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  {
    slug: "onboarding_complete",
    name: "Getting Started",
    description: "Complete the onboarding checklist",
    category: "onboarding",
    rarity: "common",
    icon: "check-circle",
    xpReward: 200,
    order: 80,
    trigger: { type: "onboarding_complete", threshold: 1 },
  },

  // ============================================================================
  // LEVEL ACHIEVEMENTS (Secret - unlocked when reaching levels)
  // ============================================================================
  {
    slug: "level_5",
    name: "Level 5",
    description: "Reach level 5",
    category: "engagement",
    rarity: "uncommon",
    icon: "star",
    xpReward: 0, // No XP for level achievements to avoid infinite loop
    isHidden: true,
    order: 90,
    trigger: { type: "level_reached", threshold: 5 },
  },
  {
    slug: "level_10",
    name: "Level 10",
    description: "Reach level 10",
    category: "engagement",
    rarity: "rare",
    icon: "star",
    xpReward: 0,
    isHidden: true,
    order: 91,
    trigger: { type: "level_reached", threshold: 10 },
  },
  {
    slug: "level_15",
    name: "Level 15",
    description: "Reach level 15",
    category: "engagement",
    rarity: "epic",
    icon: "star",
    xpReward: 0,
    isHidden: true,
    order: 92,
    trigger: { type: "level_reached", threshold: 15 },
  },
  {
    slug: "level_20",
    name: "Level 20",
    description: "Reach the maximum level",
    category: "engagement",
    rarity: "legendary",
    icon: "crown",
    xpReward: 0,
    isHidden: true,
    order: 93,
    trigger: { type: "level_reached", threshold: 20 },
  },
];

// ============================================================================
// LEVEL SYSTEM
// ============================================================================

/**
 * XP thresholds for each level
 * Level 1 starts at 0 XP, Level 20 is max
 */
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  1750, // Level 6
  2750, // Level 7
  4000, // Level 8
  5500, // Level 9
  7500, // Level 10
  10000, // Level 11
  13000, // Level 12
  16500, // Level 13
  20500, // Level 14
  25000, // Level 15
  30000, // Level 16
  36000, // Level 17
  43000, // Level 18
  51000, // Level 19
  60000, // Level 20 (Max)
];

export const MAX_LEVEL = 20;

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return Math.min(i + 1, MAX_LEVEL);
    }
  }
  return 1;
}

/**
 * Get XP required for a specific level
 */
export function getXpForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL - 1];
  return LEVEL_THRESHOLDS[level - 1];
}

/**
 * Get XP required for next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL - 1];
  return LEVEL_THRESHOLDS[currentLevel];
}

/**
 * Calculate progress towards next level
 */
export function getXpProgress(
  totalXp: number,
  currentLevel: number
): { current: number; required: number; percent: number } {
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || currentThreshold;

  const xpInCurrentLevel = totalXp - currentThreshold;
  const xpRequiredForNextLevel = nextThreshold - currentThreshold;

  if (currentLevel >= MAX_LEVEL) {
    return { current: xpInCurrentLevel, required: xpRequiredForNextLevel, percent: 100 };
  }

  const percent =
    xpRequiredForNextLevel > 0
      ? Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100))
      : 100;

  return {
    current: xpInCurrentLevel,
    required: xpRequiredForNextLevel,
    percent,
  };
}

/**
 * Get level title/rank name
 */
export function getLevelTitle(level: number): string {
  if (level >= 20) return "Legend";
  if (level >= 18) return "Master";
  if (level >= 15) return "Expert";
  if (level >= 12) return "Professional";
  if (level >= 10) return "Skilled";
  if (level >= 7) return "Intermediate";
  if (level >= 4) return "Apprentice";
  return "Beginner";
}

// ============================================================================
// RARITY HELPERS
// ============================================================================

export const RARITY_ORDER: AchievementRarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

export function getRarityWeight(rarity: AchievementRarity): number {
  return RARITY_ORDER.indexOf(rarity) + 1;
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  milestone: "Milestones",
  streak: "Streaks",
  revenue: "Revenue",
  engagement: "Engagement",
  onboarding: "Getting Started",
  special: "Special",
};

export const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  milestone: "flag",
  streak: "flame",
  revenue: "dollar",
  engagement: "star",
  onboarding: "check-circle",
  special: "sparkles",
};

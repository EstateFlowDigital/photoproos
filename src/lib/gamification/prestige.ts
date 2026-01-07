/**
 * Prestige System
 *
 * When users reach max level (20), they can "prestige" to:
 * - Reset their level to 1
 * - Keep all achievements and stats
 * - Gain a prestige badge
 * - Unlock exclusive prestige rewards
 */

import { MAX_LEVEL } from "./achievements";

// Prestige tiers and their rewards
export interface PrestigeTier {
  level: number;
  name: string;
  title: string;
  badge: string;
  color: string;
  description: string;
  rewards: string[];
}

export const PRESTIGE_TIERS: PrestigeTier[] = [
  {
    level: 0,
    name: "None",
    title: "",
    badge: "",
    color: "",
    description: "Not yet prestiged",
    rewards: [],
  },
  {
    level: 1,
    name: "Bronze",
    title: "Seasoned Photographer",
    badge: "🥉",
    color: "#cd7f32",
    description: "Your first prestige - a mark of dedication",
    rewards: [
      "Bronze badge on profile",
      "Exclusive 'Seasoned' title",
      "+5% XP bonus",
    ],
  },
  {
    level: 2,
    name: "Silver",
    title: "Expert Photographer",
    badge: "🥈",
    color: "#c0c0c0",
    description: "Twice through the ranks - true expertise",
    rewards: [
      "Silver badge on profile",
      "Exclusive 'Expert' title",
      "+10% XP bonus",
      "Silver theme unlock",
    ],
  },
  {
    level: 3,
    name: "Gold",
    title: "Master Photographer",
    badge: "🥇",
    color: "#ffd700",
    description: "Three times over - photography mastery",
    rewards: [
      "Gold badge on profile",
      "Exclusive 'Master' title",
      "+15% XP bonus",
      "Gold theme unlock",
      "Custom profile border",
    ],
  },
  {
    level: 4,
    name: "Platinum",
    title: "Elite Photographer",
    badge: "💎",
    color: "#e5e4e2",
    description: "Platinum status - among the elite",
    rewards: [
      "Platinum badge on profile",
      "Exclusive 'Elite' title",
      "+20% XP bonus",
      "Platinum theme unlock",
      "Animated profile badge",
    ],
  },
  {
    level: 5,
    name: "Diamond",
    title: "Legendary Photographer",
    badge: "💠",
    color: "#b9f2ff",
    description: "Diamond tier - legendary status achieved",
    rewards: [
      "Diamond badge on profile",
      "Exclusive 'Legendary' title",
      "+25% XP bonus",
      "Diamond theme unlock",
      "Exclusive leaderboard crown",
      "Priority support status",
    ],
  },
];

// Max prestige level
export const MAX_PRESTIGE = 5;

/**
 * Get prestige tier info for a given prestige level
 */
export function getPrestigeTier(prestigeLevel: number): PrestigeTier {
  const clamped = Math.min(Math.max(prestigeLevel, 0), MAX_PRESTIGE);
  return PRESTIGE_TIERS[clamped] || PRESTIGE_TIERS[0];
}

/**
 * Calculate XP bonus multiplier based on prestige level
 * Each prestige level gives +5% bonus
 */
export function getPrestigeXpMultiplier(prestigeLevel: number): number {
  return 1 + prestigeLevel * 0.05;
}

/**
 * Check if user can prestige
 * Must be at max level (20) to prestige
 */
export function canPrestige(currentLevel: number): boolean {
  return currentLevel >= MAX_LEVEL;
}

/**
 * Get the next prestige tier info
 */
export function getNextPrestigeTier(currentPrestige: number): PrestigeTier | null {
  if (currentPrestige >= MAX_PRESTIGE) return null;
  return PRESTIGE_TIERS[currentPrestige + 1];
}

/**
 * Format prestige badge for display
 */
export function formatPrestigeBadge(prestigeLevel: number): string {
  if (prestigeLevel === 0) return "";
  const tier = getPrestigeTier(prestigeLevel);
  return `${tier.badge} P${prestigeLevel}`;
}

/**
 * Get prestige display name
 */
export function getPrestigeDisplayName(prestigeLevel: number): string {
  if (prestigeLevel === 0) return "No Prestige";
  const tier = getPrestigeTier(prestigeLevel);
  return `${tier.name} Prestige`;
}

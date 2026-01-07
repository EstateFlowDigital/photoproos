/**
 * Milestone Definitions and Detection
 *
 * Milestones are celebratory moments that happen when users reach
 * significant thresholds in their business journey.
 */

export type MilestoneCategory =
  | "revenue"
  | "clients"
  | "galleries"
  | "deliveries"
  | "payments";

export interface Milestone {
  id: string;
  name: string;
  description: string;
  category: MilestoneCategory;
  threshold: number;
  icon: string;
  celebrationType: "subtle" | "standard" | "big";
}

// Revenue milestones (in cents)
export const REVENUE_MILESTONES: Milestone[] = [
  {
    id: "revenue-1k",
    name: "First $1,000",
    description: "You've earned your first $1,000!",
    category: "revenue",
    threshold: 100000, // $1,000 in cents
    icon: "💰",
    celebrationType: "standard",
  },
  {
    id: "revenue-5k",
    name: "$5,000 Milestone",
    description: "You've crossed $5,000 in revenue!",
    category: "revenue",
    threshold: 500000,
    icon: "💵",
    celebrationType: "standard",
  },
  {
    id: "revenue-10k",
    name: "Five Figures!",
    description: "You've earned $10,000!",
    category: "revenue",
    threshold: 1000000,
    icon: "🎉",
    celebrationType: "big",
  },
  {
    id: "revenue-25k",
    name: "$25K Club",
    description: "Quarter of the way to six figures!",
    category: "revenue",
    threshold: 2500000,
    icon: "⭐",
    celebrationType: "big",
  },
  {
    id: "revenue-50k",
    name: "Halfway There!",
    description: "You've earned $50,000!",
    category: "revenue",
    threshold: 5000000,
    icon: "🚀",
    celebrationType: "big",
  },
  {
    id: "revenue-100k",
    name: "Six Figure Studio!",
    description: "You've earned $100,000!",
    category: "revenue",
    threshold: 10000000,
    icon: "🏆",
    celebrationType: "big",
  },
];

// Client milestones
export const CLIENT_MILESTONES: Milestone[] = [
  {
    id: "clients-1",
    name: "First Client",
    description: "You've added your first client!",
    category: "clients",
    threshold: 1,
    icon: "👤",
    celebrationType: "subtle",
  },
  {
    id: "clients-10",
    name: "Growing Network",
    description: "10 clients and counting!",
    category: "clients",
    threshold: 10,
    icon: "👥",
    celebrationType: "standard",
  },
  {
    id: "clients-25",
    name: "Client Builder",
    description: "25 clients in your network!",
    category: "clients",
    threshold: 25,
    icon: "📈",
    celebrationType: "standard",
  },
  {
    id: "clients-50",
    name: "Client Magnet",
    description: "50 clients served!",
    category: "clients",
    threshold: 50,
    icon: "🌟",
    celebrationType: "big",
  },
  {
    id: "clients-100",
    name: "Century of Clients",
    description: "100 clients! Amazing work!",
    category: "clients",
    threshold: 100,
    icon: "🎊",
    celebrationType: "big",
  },
];

// Gallery milestones
export const GALLERY_MILESTONES: Milestone[] = [
  {
    id: "galleries-1",
    name: "First Gallery",
    description: "You've created your first gallery!",
    category: "galleries",
    threshold: 1,
    icon: "📸",
    celebrationType: "subtle",
  },
  {
    id: "galleries-10",
    name: "Getting Started",
    description: "10 galleries created!",
    category: "galleries",
    threshold: 10,
    icon: "🖼️",
    celebrationType: "standard",
  },
  {
    id: "galleries-50",
    name: "Portfolio Pro",
    description: "50 galleries in your portfolio!",
    category: "galleries",
    threshold: 50,
    icon: "📷",
    celebrationType: "standard",
  },
  {
    id: "galleries-100",
    name: "Gallery Master",
    description: "100 galleries created!",
    category: "galleries",
    threshold: 100,
    icon: "🏅",
    celebrationType: "big",
  },
];

// Delivery milestones
export const DELIVERY_MILESTONES: Milestone[] = [
  {
    id: "deliveries-1",
    name: "First Delivery",
    description: "Your first gallery delivered!",
    category: "deliveries",
    threshold: 1,
    icon: "📬",
    celebrationType: "subtle",
  },
  {
    id: "deliveries-10",
    name: "Delivery Machine",
    description: "10 galleries delivered!",
    category: "deliveries",
    threshold: 10,
    icon: "📦",
    celebrationType: "standard",
  },
  {
    id: "deliveries-50",
    name: "Delivery Champion",
    description: "50 deliveries completed!",
    category: "deliveries",
    threshold: 50,
    icon: "🚚",
    celebrationType: "standard",
  },
  {
    id: "deliveries-100",
    name: "Delivery Legend",
    description: "100 galleries delivered!",
    category: "deliveries",
    threshold: 100,
    icon: "🎯",
    celebrationType: "big",
  },
];

// Payment milestones
export const PAYMENT_MILESTONES: Milestone[] = [
  {
    id: "payments-1",
    name: "First Payment",
    description: "You've received your first payment!",
    category: "payments",
    threshold: 1,
    icon: "💳",
    celebrationType: "standard",
  },
  {
    id: "payments-10",
    name: "Cash Flow",
    description: "10 payments received!",
    category: "payments",
    threshold: 10,
    icon: "💸",
    celebrationType: "standard",
  },
  {
    id: "payments-50",
    name: "Payment Pro",
    description: "50 payments collected!",
    category: "payments",
    threshold: 50,
    icon: "🏦",
    celebrationType: "big",
  },
];

// All milestones combined
export const ALL_MILESTONES: Milestone[] = [
  ...REVENUE_MILESTONES,
  ...CLIENT_MILESTONES,
  ...GALLERY_MILESTONES,
  ...DELIVERY_MILESTONES,
  ...PAYMENT_MILESTONES,
];

/**
 * Check if a milestone was just crossed
 * @param category The milestone category
 * @param previousValue The value before the action
 * @param newValue The value after the action
 * @returns The milestone that was crossed, if any
 */
export function checkMilestoneCrossed(
  category: MilestoneCategory,
  previousValue: number,
  newValue: number
): Milestone | null {
  const milestones = ALL_MILESTONES.filter((m) => m.category === category);

  // Find milestones that were crossed (previous < threshold <= new)
  for (const milestone of milestones) {
    if (previousValue < milestone.threshold && newValue >= milestone.threshold) {
      return milestone;
    }
  }

  return null;
}

/**
 * Get the next milestone for a category
 * @param category The milestone category
 * @param currentValue The current value
 * @returns The next milestone to reach, if any
 */
export function getNextMilestone(
  category: MilestoneCategory,
  currentValue: number
): Milestone | null {
  const milestones = ALL_MILESTONES.filter((m) => m.category === category);

  // Sort by threshold and find the first one above current value
  const sortedMilestones = milestones.sort((a, b) => a.threshold - b.threshold);
  return sortedMilestones.find((m) => m.threshold > currentValue) || null;
}

/**
 * Get progress towards next milestone
 * @param category The milestone category
 * @param currentValue The current value
 * @returns Progress info or null if no next milestone
 */
export function getMilestoneProgress(
  category: MilestoneCategory,
  currentValue: number
): { current: number; target: number; percent: number; milestone: Milestone } | null {
  const nextMilestone = getNextMilestone(category, currentValue);
  if (!nextMilestone) return null;

  // Find previous milestone threshold as the starting point
  const milestones = ALL_MILESTONES.filter((m) => m.category === category);
  const sortedMilestones = milestones.sort((a, b) => a.threshold - b.threshold);
  const prevMilestone = sortedMilestones.find((m) => m.threshold > currentValue);
  const prevIndex = prevMilestone ? sortedMilestones.indexOf(prevMilestone) - 1 : -1;
  const startValue = prevIndex >= 0 ? sortedMilestones[prevIndex].threshold : 0;

  const range = nextMilestone.threshold - startValue;
  const progress = currentValue - startValue;
  const percent = Math.min(100, Math.round((progress / range) * 100));

  return {
    current: currentValue,
    target: nextMilestone.threshold,
    percent,
    milestone: nextMilestone,
  };
}

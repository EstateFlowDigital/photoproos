/**
 * Onboarding Constants
 *
 * Constants and types for the onboarding checklist system.
 * These are separated from the server actions file to allow
 * use in both server and client components.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ChecklistItemData {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  order: number;
  isEnabled: boolean;
  isDefault: boolean;
  isCustom: boolean;
  category: OnboardingCategory;
  industryFilter: string | null;
  completedAt: Date | null;
  skippedAt: Date | null;
}

export type OnboardingCategory = "getting_started" | "payments" | "workflow" | "advanced";

export interface CreateChecklistItemInput {
  label: string;
  description: string;
  href: string;
  icon: string;
  category: OnboardingCategory;
  industryFilter?: string;
}

export interface UpdateChecklistItemInput {
  id: string;
  label?: string;
  description?: string;
  href?: string;
  icon?: string;
  isEnabled?: boolean;
  category?: OnboardingCategory;
  industryFilter?: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// XP rewards by category
export const ONBOARDING_XP_REWARDS = {
  STEP_COMPLETE: 50, // Base XP for completing any step
  MILESTONE_25: 100, // Bonus for reaching 25%
  MILESTONE_50: 200, // Bonus for reaching 50%
  MILESTONE_75: 300, // Bonus for reaching 75%
  MILESTONE_100: 500, // Bonus for completing all steps
  SPEED_BONUS: 50, // Bonus for completing within first week
};

// Achievement IDs for onboarding milestones
export const ONBOARDING_ACHIEVEMENTS = {
  FIRST_STEP: "onboarding_first_step",
  QUARTER_DONE: "onboarding_25_percent",
  HALF_DONE: "onboarding_50_percent",
  ALMOST_THERE: "onboarding_75_percent",
  FULLY_SETUP: "onboarding_complete",
  SPEED_DEMON: "onboarding_speed_demon", // Complete in under 1 hour
  WEEK_ONE_WARRIOR: "onboarding_week_one", // Complete in first week
};

// Category labels for display
export const CATEGORY_LABELS: Record<string, string> = {
  getting_started: "Getting Started",
  payments: "Payments",
  workflow: "Workflow",
  advanced: "Advanced",
};

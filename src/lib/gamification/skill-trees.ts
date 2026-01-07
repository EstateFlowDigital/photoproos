/**
 * Skill Trees System
 *
 * Three skill trees that users can progress through:
 * - Marketing: Boost visibility, referrals, and client acquisition
 * - Operations: Improve efficiency, automation, and workflows
 * - Client Relations: Enhance client experience and retention
 *
 * Users earn skill points as they level up (1 point per level).
 * Skills unlock perks and bonuses within the application.
 */

export type SkillTreeCategory = "marketing" | "operations" | "client_relations";

export type SkillTier = 1 | 2 | 3 | 4;

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: SkillTreeCategory;
  tier: SkillTier;
  cost: number; // Skill points required
  prerequisiteIds: string[]; // Skills that must be unlocked first
  perk: SkillPerk;
}

export interface SkillPerk {
  type: SkillPerkType;
  value: number | string | boolean;
  description: string;
}

export type SkillPerkType =
  // Marketing perks
  | "gallery_branding_level" // Unlock advanced branding options
  | "referral_bonus_xp" // Extra XP from referrals
  | "social_share_templates" // Unlock social media templates
  | "review_reminder_frequency" // More frequent review reminders
  // Operations perks
  | "batch_upload_limit" // Increase batch upload limit
  | "gallery_template_slots" // More gallery templates
  | "auto_backup_frequency" // More frequent backups
  | "bulk_action_limit" // Larger bulk operations
  // Client Relations perks
  | "client_portal_features" // Unlock portal features
  | "message_templates" // More message templates
  | "delivery_notification_options" // More notification options
  | "client_feedback_features"; // Enhanced feedback collection

// Skill Tree Definitions
export const SKILL_TREE_INFO: Record<
  SkillTreeCategory,
  { name: string; icon: string; description: string; color: string }
> = {
  marketing: {
    name: "Marketing",
    icon: "📣",
    description: "Boost your visibility and grow your client base",
    color: "#f97316", // Orange
  },
  operations: {
    name: "Operations",
    icon: "⚙️",
    description: "Streamline your workflow and increase efficiency",
    color: "#3b82f6", // Blue
  },
  client_relations: {
    name: "Client Relations",
    icon: "🤝",
    description: "Enhance client experience and build loyalty",
    color: "#22c55e", // Green
  },
};

// All skills organized by tree
export const SKILLS: Skill[] = [
  // ============================================================================
  // MARKETING TREE
  // ============================================================================

  // Tier 1 (Entry level)
  {
    id: "marketing-branding-basics",
    name: "Brand Basics",
    description: "Unlock custom colors for your client galleries",
    icon: "🎨",
    category: "marketing",
    tier: 1,
    cost: 1,
    prerequisiteIds: [],
    perk: {
      type: "gallery_branding_level",
      value: 1,
      description: "Custom primary color for galleries",
    },
  },
  {
    id: "marketing-social-starter",
    name: "Social Starter",
    description: "Access basic social media share templates",
    icon: "📱",
    category: "marketing",
    tier: 1,
    cost: 1,
    prerequisiteIds: [],
    perk: {
      type: "social_share_templates",
      value: 3,
      description: "3 social media templates",
    },
  },

  // Tier 2
  {
    id: "marketing-branding-pro",
    name: "Brand Pro",
    description: "Add custom logos and fonts to galleries",
    icon: "✨",
    category: "marketing",
    tier: 2,
    cost: 2,
    prerequisiteIds: ["marketing-branding-basics"],
    perk: {
      type: "gallery_branding_level",
      value: 2,
      description: "Custom logos and fonts",
    },
  },
  {
    id: "marketing-review-boost",
    name: "Review Boost",
    description: "Send review requests more frequently",
    icon: "⭐",
    category: "marketing",
    tier: 2,
    cost: 2,
    prerequisiteIds: ["marketing-social-starter"],
    perk: {
      type: "review_reminder_frequency",
      value: "weekly",
      description: "Weekly review reminders",
    },
  },

  // Tier 3
  {
    id: "marketing-referral-rewards",
    name: "Referral Rewards",
    description: "Earn bonus XP when clients refer others",
    icon: "🎁",
    category: "marketing",
    tier: 3,
    cost: 3,
    prerequisiteIds: ["marketing-branding-pro", "marketing-review-boost"],
    perk: {
      type: "referral_bonus_xp",
      value: 50,
      description: "+50 XP per referral",
    },
  },
  {
    id: "marketing-social-pro",
    name: "Social Pro",
    description: "Access premium social media templates",
    icon: "📸",
    category: "marketing",
    tier: 3,
    cost: 3,
    prerequisiteIds: ["marketing-review-boost"],
    perk: {
      type: "social_share_templates",
      value: 10,
      description: "10 premium templates",
    },
  },

  // Tier 4 (Master)
  {
    id: "marketing-master",
    name: "Marketing Master",
    description: "Full suite of marketing tools and white-label branding",
    icon: "👑",
    category: "marketing",
    tier: 4,
    cost: 4,
    prerequisiteIds: ["marketing-referral-rewards", "marketing-social-pro"],
    perk: {
      type: "gallery_branding_level",
      value: 3,
      description: "White-label branding",
    },
  },

  // ============================================================================
  // OPERATIONS TREE
  // ============================================================================

  // Tier 1
  {
    id: "operations-batch-basics",
    name: "Batch Basics",
    description: "Upload more photos at once",
    icon: "📤",
    category: "operations",
    tier: 1,
    cost: 1,
    prerequisiteIds: [],
    perk: {
      type: "batch_upload_limit",
      value: 100,
      description: "Upload 100 photos at once",
    },
  },
  {
    id: "operations-template-starter",
    name: "Template Starter",
    description: "Save more gallery templates",
    icon: "📋",
    category: "operations",
    tier: 1,
    cost: 1,
    prerequisiteIds: [],
    perk: {
      type: "gallery_template_slots",
      value: 5,
      description: "5 gallery templates",
    },
  },

  // Tier 2
  {
    id: "operations-batch-pro",
    name: "Batch Pro",
    description: "Upload even larger batches",
    icon: "🚀",
    category: "operations",
    tier: 2,
    cost: 2,
    prerequisiteIds: ["operations-batch-basics"],
    perk: {
      type: "batch_upload_limit",
      value: 250,
      description: "Upload 250 photos at once",
    },
  },
  {
    id: "operations-bulk-actions",
    name: "Bulk Actions",
    description: "Perform actions on more items at once",
    icon: "⚡",
    category: "operations",
    tier: 2,
    cost: 2,
    prerequisiteIds: ["operations-template-starter"],
    perk: {
      type: "bulk_action_limit",
      value: 50,
      description: "Bulk actions on 50 items",
    },
  },

  // Tier 3
  {
    id: "operations-auto-backup",
    name: "Auto Backup",
    description: "More frequent automatic backups",
    icon: "💾",
    category: "operations",
    tier: 3,
    cost: 3,
    prerequisiteIds: ["operations-batch-pro"],
    perk: {
      type: "auto_backup_frequency",
      value: "daily",
      description: "Daily backups",
    },
  },
  {
    id: "operations-template-pro",
    name: "Template Pro",
    description: "Save unlimited gallery templates",
    icon: "📚",
    category: "operations",
    tier: 3,
    cost: 3,
    prerequisiteIds: ["operations-bulk-actions"],
    perk: {
      type: "gallery_template_slots",
      value: -1,
      description: "Unlimited templates",
    },
  },

  // Tier 4 (Master)
  {
    id: "operations-master",
    name: "Operations Master",
    description: "Maximum efficiency with no limits on batch operations",
    icon: "👑",
    category: "operations",
    tier: 4,
    cost: 4,
    prerequisiteIds: ["operations-auto-backup", "operations-template-pro"],
    perk: {
      type: "batch_upload_limit",
      value: -1,
      description: "Unlimited batch uploads",
    },
  },

  // ============================================================================
  // CLIENT RELATIONS TREE
  // ============================================================================

  // Tier 1
  {
    id: "client-portal-basics",
    name: "Portal Basics",
    description: "Enhanced client portal with selection tools",
    icon: "🖼️",
    category: "client_relations",
    tier: 1,
    cost: 1,
    prerequisiteIds: [],
    perk: {
      type: "client_portal_features",
      value: 1,
      description: "Photo selection tools",
    },
  },
  {
    id: "client-messages-starter",
    name: "Message Templates",
    description: "Save common message templates",
    icon: "💬",
    category: "client_relations",
    tier: 1,
    cost: 1,
    prerequisiteIds: [],
    perk: {
      type: "message_templates",
      value: 5,
      description: "5 message templates",
    },
  },

  // Tier 2
  {
    id: "client-notifications-pro",
    name: "Notifications Pro",
    description: "More delivery notification options",
    icon: "🔔",
    category: "client_relations",
    tier: 2,
    cost: 2,
    prerequisiteIds: ["client-portal-basics"],
    perk: {
      type: "delivery_notification_options",
      value: "advanced",
      description: "SMS + email notifications",
    },
  },
  {
    id: "client-messages-pro",
    name: "Messages Pro",
    description: "Save more message templates",
    icon: "📝",
    category: "client_relations",
    tier: 2,
    cost: 2,
    prerequisiteIds: ["client-messages-starter"],
    perk: {
      type: "message_templates",
      value: 15,
      description: "15 message templates",
    },
  },

  // Tier 3
  {
    id: "client-feedback-pro",
    name: "Feedback Pro",
    description: "Enhanced feedback collection tools",
    icon: "📊",
    category: "client_relations",
    tier: 3,
    cost: 3,
    prerequisiteIds: ["client-notifications-pro"],
    perk: {
      type: "client_feedback_features",
      value: "advanced",
      description: "Surveys and analytics",
    },
  },
  {
    id: "client-portal-pro",
    name: "Portal Pro",
    description: "Premium client portal features",
    icon: "🌟",
    category: "client_relations",
    tier: 3,
    cost: 3,
    prerequisiteIds: ["client-messages-pro"],
    perk: {
      type: "client_portal_features",
      value: 2,
      description: "Comments and ratings",
    },
  },

  // Tier 4 (Master)
  {
    id: "client-relations-master",
    name: "Client Relations Master",
    description: "Full suite of client engagement tools",
    icon: "👑",
    category: "client_relations",
    tier: 4,
    cost: 4,
    prerequisiteIds: ["client-feedback-pro", "client-portal-pro"],
    perk: {
      type: "client_portal_features",
      value: 3,
      description: "VIP client experiences",
    },
  },
];

// Helper functions

/**
 * Get skills for a specific tree
 */
export function getSkillsByCategory(category: SkillTreeCategory): Skill[] {
  return SKILLS.filter((s) => s.category === category);
}

/**
 * Get skills by tier
 */
export function getSkillsByTier(
  category: SkillTreeCategory,
  tier: SkillTier
): Skill[] {
  return SKILLS.filter((s) => s.category === category && s.tier === tier);
}

/**
 * Get a skill by ID
 */
export function getSkillById(skillId: string): Skill | undefined {
  return SKILLS.find((s) => s.id === skillId);
}

/**
 * Check if a skill can be unlocked based on prerequisites
 */
export function canUnlockSkill(
  skillId: string,
  unlockedSkillIds: string[]
): boolean {
  const skill = getSkillById(skillId);
  if (!skill) return false;

  // Check if already unlocked
  if (unlockedSkillIds.includes(skillId)) return false;

  // Check prerequisites
  return skill.prerequisiteIds.every((prereq) =>
    unlockedSkillIds.includes(prereq)
  );
}

/**
 * Calculate total skill points needed for a tree
 */
export function getTotalPointsForTree(category: SkillTreeCategory): number {
  return getSkillsByCategory(category).reduce((sum, s) => sum + s.cost, 0);
}

/**
 * Calculate skill points earned based on level
 * Users earn 1 skill point per level
 */
export function calculateSkillPoints(level: number): number {
  return Math.max(0, level - 1); // Level 1 = 0 points, Level 2 = 1 point, etc.
}

/**
 * Get available skill points (total - spent)
 */
export function getAvailableSkillPoints(
  level: number,
  spentPoints: number
): number {
  return calculateSkillPoints(level) - spentPoints;
}

/**
 * Get the tree completion percentage
 */
export function getTreeCompletion(
  category: SkillTreeCategory,
  unlockedSkillIds: string[]
): number {
  const treeSkills = getSkillsByCategory(category);
  const unlockedInTree = treeSkills.filter((s) =>
    unlockedSkillIds.includes(s.id)
  ).length;
  return Math.round((unlockedInTree / treeSkills.length) * 100);
}

/**
 * Get next unlockable skills in a tree
 */
export function getNextUnlockableSkills(
  category: SkillTreeCategory,
  unlockedSkillIds: string[]
): Skill[] {
  return getSkillsByCategory(category).filter(
    (skill) =>
      !unlockedSkillIds.includes(skill.id) &&
      canUnlockSkill(skill.id, unlockedSkillIds)
  );
}

/**
 * Check if user has a specific perk
 */
export function hasPerk(
  perkType: SkillPerkType,
  unlockedSkillIds: string[]
): boolean {
  return SKILLS.some(
    (skill) =>
      unlockedSkillIds.includes(skill.id) && skill.perk.type === perkType
  );
}

/**
 * Get the best perk value for a type (highest value unlocked)
 */
export function getBestPerkValue(
  perkType: SkillPerkType,
  unlockedSkillIds: string[]
): number | string | boolean | undefined {
  const relevantSkills = SKILLS.filter(
    (skill) =>
      unlockedSkillIds.includes(skill.id) && skill.perk.type === perkType
  );

  if (relevantSkills.length === 0) return undefined;

  // Return the highest tier skill's perk value
  const highestTier = relevantSkills.reduce((best, current) =>
    current.tier > best.tier ? current : best
  );

  return highestTier.perk.value;
}

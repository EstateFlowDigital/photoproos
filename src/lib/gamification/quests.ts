/**
 * Quest/Story Mode System
 *
 * A guided journey through the platform with story-like progression.
 * Quests unlock sequentially, teaching users key features while
 * rewarding them with XP and achievements.
 */

export type QuestCategory =
  | "onboarding"
  | "gallery"
  | "clients"
  | "revenue"
  | "growth";

export type QuestStatus = "locked" | "available" | "in_progress" | "completed";

export interface Quest {
  id: string;
  category: QuestCategory;
  order: number;
  name: string;
  description: string;
  icon: string;
  storyline: string; // Narrative text for immersion
  xpReward: number;
  achievementSlug?: string; // Achievement to unlock on completion
  prerequisiteQuestIds: string[];
  objectives: QuestObjective[];
}

export interface QuestObjective {
  id: string;
  description: string;
  type: QuestObjectiveType;
  targetValue: number;
  actionUrl?: string; // URL to navigate to for completing this objective
}

export type QuestObjectiveType =
  | "create_gallery"
  | "upload_photos"
  | "deliver_gallery"
  | "add_client"
  | "send_invoice"
  | "receive_payment"
  | "complete_booking"
  | "add_service"
  | "customize_branding"
  | "enable_reviews"
  | "daily_login"
  | "unlock_achievement"
  | "reach_level";

// Quest Categories Info
export const QUEST_CATEGORY_INFO: Record<
  QuestCategory,
  { name: string; icon: string; description: string; color: string }
> = {
  onboarding: {
    name: "Getting Started",
    icon: "🚀",
    description: "Learn the basics and set up your account",
    color: "#3b82f6", // Blue
  },
  gallery: {
    name: "Gallery Master",
    icon: "📸",
    description: "Master gallery creation and delivery",
    color: "#22c55e", // Green
  },
  clients: {
    name: "Client Pro",
    icon: "👥",
    description: "Build your client relationships",
    color: "#8b5cf6", // Purple
  },
  revenue: {
    name: "Revenue Builder",
    icon: "💰",
    description: "Maximize your earnings",
    color: "#f97316", // Orange
  },
  growth: {
    name: "Business Growth",
    icon: "📈",
    description: "Scale your photography business",
    color: "#ec4899", // Pink
  },
};

// All Quests
export const QUESTS: Quest[] = [
  // ============================================================================
  // ONBOARDING QUESTS (Chapter 1)
  // ============================================================================
  {
    id: "quest-welcome",
    category: "onboarding",
    order: 1,
    name: "Welcome to Your Journey",
    description: "Complete your profile and explore the dashboard",
    icon: "👋",
    storyline:
      "Every great photographer's journey begins with a single step. Welcome to your new creative home. Let's get you set up for success.",
    xpReward: 50,
    prerequisiteQuestIds: [],
    objectives: [
      {
        id: "obj-login",
        description: "Log in to your dashboard",
        type: "daily_login",
        targetValue: 1,
        actionUrl: "/dashboard",
      },
    ],
  },
  {
    id: "quest-first-client",
    category: "onboarding",
    order: 2,
    name: "Your First Client",
    description: "Add your first client to the system",
    icon: "🤝",
    storyline:
      "Behind every great photo is a story, and behind every story is a client. Let's add your first client and begin building your network.",
    xpReward: 75,
    prerequisiteQuestIds: ["quest-welcome"],
    objectives: [
      {
        id: "obj-add-client",
        description: "Add a new client",
        type: "add_client",
        targetValue: 1,
        actionUrl: "/clients/new",
      },
    ],
  },
  {
    id: "quest-first-gallery",
    category: "onboarding",
    order: 3,
    name: "Capture the Moment",
    description: "Create and set up your first gallery",
    icon: "🖼️",
    storyline:
      "The gallery is your canvas, where your vision comes to life. Create your first gallery and start showcasing your work.",
    xpReward: 100,
    prerequisiteQuestIds: ["quest-first-client"],
    objectives: [
      {
        id: "obj-create-gallery",
        description: "Create a new gallery",
        type: "create_gallery",
        targetValue: 1,
        actionUrl: "/galleries/new",
      },
      {
        id: "obj-upload-photos",
        description: "Upload at least 5 photos",
        type: "upload_photos",
        targetValue: 5,
      },
    ],
  },
  {
    id: "quest-first-delivery",
    category: "onboarding",
    order: 4,
    name: "Share Your Vision",
    description: "Deliver your first gallery to a client",
    icon: "📬",
    storyline:
      "The moment of truth! Delivering your work to a client is when the magic happens. Watch their face light up with joy.",
    xpReward: 150,
    achievementSlug: "first-delivery",
    prerequisiteQuestIds: ["quest-first-gallery"],
    objectives: [
      {
        id: "obj-deliver-gallery",
        description: "Deliver a gallery to your client",
        type: "deliver_gallery",
        targetValue: 1,
      },
    ],
  },

  // ============================================================================
  // GALLERY QUESTS (Chapter 2)
  // ============================================================================
  {
    id: "quest-gallery-pro",
    category: "gallery",
    order: 1,
    name: "Gallery Professional",
    description: "Create and deliver 5 galleries",
    icon: "📸",
    storyline:
      "You've got the basics down. Now it's time to hone your craft. Create more galleries and perfect your delivery process.",
    xpReward: 200,
    prerequisiteQuestIds: ["quest-first-delivery"],
    objectives: [
      {
        id: "obj-5-galleries",
        description: "Create 5 galleries",
        type: "create_gallery",
        targetValue: 5,
      },
      {
        id: "obj-5-deliveries",
        description: "Deliver 5 galleries",
        type: "deliver_gallery",
        targetValue: 5,
      },
    ],
  },
  {
    id: "quest-branding",
    category: "gallery",
    order: 2,
    name: "Brand Your Style",
    description: "Customize your gallery branding",
    icon: "🎨",
    storyline:
      "Your brand tells your story. Customize your galleries with your unique style and make every delivery memorable.",
    xpReward: 100,
    prerequisiteQuestIds: ["quest-gallery-pro"],
    objectives: [
      {
        id: "obj-branding",
        description: "Customize your branding settings",
        type: "customize_branding",
        targetValue: 1,
        actionUrl: "/settings/appearance",
      },
    ],
  },

  // ============================================================================
  // CLIENT QUESTS (Chapter 3)
  // ============================================================================
  {
    id: "quest-client-builder",
    category: "clients",
    order: 1,
    name: "Growing Your Network",
    description: "Build your client base to 10 clients",
    icon: "👥",
    storyline:
      "Word is spreading about your talent. More clients are finding you. Keep building those relationships!",
    xpReward: 250,
    prerequisiteQuestIds: ["quest-first-delivery"],
    objectives: [
      {
        id: "obj-10-clients",
        description: "Add 10 clients to your network",
        type: "add_client",
        targetValue: 10,
      },
    ],
  },
  {
    id: "quest-reviews",
    category: "clients",
    order: 2,
    name: "Reputation Builder",
    description: "Enable review collection and get feedback",
    icon: "⭐",
    storyline:
      "Your reputation is your greatest asset. Start collecting reviews and let your work speak for itself.",
    xpReward: 150,
    prerequisiteQuestIds: ["quest-client-builder"],
    objectives: [
      {
        id: "obj-enable-reviews",
        description: "Enable review collection",
        type: "enable_reviews",
        targetValue: 1,
        actionUrl: "/settings/reviews",
      },
    ],
  },

  // ============================================================================
  // REVENUE QUESTS (Chapter 4)
  // ============================================================================
  {
    id: "quest-first-payment",
    category: "revenue",
    order: 1,
    name: "First Earnings",
    description: "Receive your first payment",
    icon: "💵",
    storyline:
      "The sweetest sound in business: the cha-ching of your first payment. Let's turn your passion into profit!",
    xpReward: 200,
    achievementSlug: "first-payment",
    prerequisiteQuestIds: ["quest-first-delivery"],
    objectives: [
      {
        id: "obj-first-payment",
        description: "Receive a payment from a client",
        type: "receive_payment",
        targetValue: 1,
      },
    ],
  },
  {
    id: "quest-invoice-pro",
    category: "revenue",
    order: 2,
    name: "Invoice Professional",
    description: "Send 5 invoices to clients",
    icon: "📄",
    storyline:
      "Professional invoicing is key to a healthy cash flow. Master the art of getting paid on time.",
    xpReward: 150,
    prerequisiteQuestIds: ["quest-first-payment"],
    objectives: [
      {
        id: "obj-5-invoices",
        description: "Send 5 invoices",
        type: "send_invoice",
        targetValue: 5,
        actionUrl: "/invoices/new",
      },
    ],
  },

  // ============================================================================
  // GROWTH QUESTS (Chapter 5)
  // ============================================================================
  {
    id: "quest-services",
    category: "growth",
    order: 1,
    name: "Service Portfolio",
    description: "Add your photography services",
    icon: "📋",
    storyline:
      "Diversify your offerings! Add your services to attract more clients and grow your business.",
    xpReward: 100,
    prerequisiteQuestIds: ["quest-first-delivery"],
    objectives: [
      {
        id: "obj-add-service",
        description: "Add a photography service",
        type: "add_service",
        targetValue: 1,
        actionUrl: "/services/new",
      },
    ],
  },
  {
    id: "quest-booking-master",
    category: "growth",
    order: 2,
    name: "Booking Master",
    description: "Complete 10 bookings",
    icon: "📅",
    storyline:
      "A full calendar is a happy calendar. Keep those bookings coming and your business thriving!",
    xpReward: 300,
    prerequisiteQuestIds: ["quest-services"],
    objectives: [
      {
        id: "obj-10-bookings",
        description: "Complete 10 bookings",
        type: "complete_booking",
        targetValue: 10,
      },
    ],
  },
  {
    id: "quest-level-10",
    category: "growth",
    order: 3,
    name: "Rising Star",
    description: "Reach level 10",
    icon: "⭐",
    storyline:
      "Your dedication is paying off! Reach level 10 and prove you're a rising star in the photography world.",
    xpReward: 500,
    achievementSlug: "level-10",
    prerequisiteQuestIds: ["quest-booking-master"],
    objectives: [
      {
        id: "obj-level-10",
        description: "Reach level 10",
        type: "reach_level",
        targetValue: 10,
      },
    ],
  },
];

// Helper Functions

/**
 * Get all quests for a category
 */
export function getQuestsByCategory(category: QuestCategory): Quest[] {
  return QUESTS.filter((q) => q.category === category).sort(
    (a, b) => a.order - b.order
  );
}

/**
 * Get a quest by ID
 */
export function getQuestById(questId: string): Quest | undefined {
  return QUESTS.find((q) => q.id === questId);
}

/**
 * Determine quest status based on completion and prerequisites
 */
export function getQuestStatus(
  questId: string,
  completedQuestIds: string[],
  inProgressQuestIds: string[]
): QuestStatus {
  if (completedQuestIds.includes(questId)) {
    return "completed";
  }

  if (inProgressQuestIds.includes(questId)) {
    return "in_progress";
  }

  const quest = getQuestById(questId);
  if (!quest) return "locked";

  // Check if all prerequisites are completed
  const prerequisitesMet = quest.prerequisiteQuestIds.every((prereq) =>
    completedQuestIds.includes(prereq)
  );

  return prerequisitesMet ? "available" : "locked";
}

/**
 * Get the next available quest for a user
 */
export function getNextAvailableQuest(completedQuestIds: string[]): Quest | undefined {
  return QUESTS.find((quest) => {
    if (completedQuestIds.includes(quest.id)) return false;
    return quest.prerequisiteQuestIds.every((prereq) =>
      completedQuestIds.includes(prereq)
    );
  });
}

/**
 * Get quests by completion status
 */
export function getQuestsByStatus(
  completedQuestIds: string[],
  inProgressQuestIds: string[]
): {
  completed: Quest[];
  inProgress: Quest[];
  available: Quest[];
  locked: Quest[];
} {
  const result = {
    completed: [] as Quest[],
    inProgress: [] as Quest[],
    available: [] as Quest[],
    locked: [] as Quest[],
  };

  for (const quest of QUESTS) {
    const status = getQuestStatus(quest.id, completedQuestIds, inProgressQuestIds);
    result[status].push(quest);
  }

  return result;
}

/**
 * Calculate overall quest progress percentage
 */
export function getQuestProgress(completedQuestIds: string[]): number {
  return Math.round((completedQuestIds.length / QUESTS.length) * 100);
}

/**
 * Get total XP available from all quests
 */
export function getTotalQuestXp(): number {
  return QUESTS.reduce((sum, q) => sum + q.xpReward, 0);
}

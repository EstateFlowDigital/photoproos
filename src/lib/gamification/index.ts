// Gamification System - Barrel Export

// Achievement definitions and utilities
export {
  ACHIEVEMENTS,
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
  calculateLevel,
  getXpForLevel,
  getXpForNextLevel,
  getXpProgress,
  getLevelTitle,
  RARITY_ORDER,
  getRarityWeight,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type AchievementDefinition,
  type AchievementTrigger,
  type TriggerType,
} from "./achievements";

// Trigger utilities
export {
  fireGamificationTrigger,
  triggerLoginStreak,
  triggerGalleryCreated,
  triggerGalleryDelivered,
  triggerClientAdded,
  triggerPaymentReceived,
  triggerContractSigned,
  triggerBookingConfirmed,
  triggerEmailSent,
  triggerSmsSent,
  type GamificationEvent,
} from "./trigger";

// Gamification Components - Barrel Export

export { AchievementBadge, RarityLabel } from "./achievement-badge";
export { LevelProgress, LevelBadge, XpDisplay } from "./level-progress";
export { StreakDisplay, StreakBadge } from "./streak-display";
export {
  AchievementToast,
  useAchievementNotifications,
} from "./achievement-toast";
export {
  GamificationWidget,
  GamificationWidgetCompact,
} from "./gamification-widget";
export { ChallengeCard, ChallengeList } from "./challenge-card";
export { DailyBonusCard, DailyBonusBadge } from "./daily-bonus";
export { PersonalBestsCard, PersonalBestsCompact } from "./personal-bests";
export {
  MilestoneCelebration,
  MilestoneToast,
  useMilestoneCelebration,
} from "./milestone-celebration";
export { SkillTree, SkillTreeWidget } from "./skill-tree";
export { QuestCard, ActiveQuestWidget } from "./quest-card";
export {
  GamificationErrorBoundary,
  GamificationErrorFallback,
  GamificationErrorCompact,
} from "./error-boundary";

// Streak Freeze & Protection
export {
  StreakFreezeDisplay,
  StreakFreezeIndicator,
} from "./streak-freeze-display";

// Statistics Dashboard
export {
  StatisticsDashboard,
  type GamificationStats,
} from "./statistics-dashboard";

// Streak Notifications
export {
  StreakNotification,
  StreakNotificationContainer,
  StreakWarningBanner,
  useStreakNotifications,
  type StreakNotificationData,
  type StreakNotificationType,
} from "./streak-notification";

// Level-Up Rewards
export {
  LevelUpModal,
  LevelUpToast,
  useLevelUpRewards,
  getLevelTitle,
  getLevelRewards,
  LEVEL_MILESTONES,
  LEVEL_TITLES,
  type LevelUpReward,
  type LevelUpData,
} from "./level-up-reward";

// Loading Skeletons
export {
  GamificationWidgetSkeleton,
  AchievementBadgeSkeleton,
  PersonalBestsSkeleton,
  QuestCardSkeleton,
  ChallengeCardSkeleton,
  DailyBonusSkeleton,
  SkillTreeSkeleton,
  LeaderboardSkeleton,
  AchievementsPageSkeleton,
  StreakDisplaySkeleton,
} from "./skeletons";

// Enhanced Leaderboard
export {
  EnhancedLeaderboard,
  LeaderboardWidget,
  type EnhancedLeaderboardProps,
  type LeaderboardWidgetProps,
} from "./enhanced-leaderboard";

// Weekly/Monthly Recaps
export {
  RecapCard,
  RecapModal,
  RecapWidget,
  useRecaps,
  type RecapCardProps,
  type RecapModalProps,
  type RecapWidgetProps,
} from "./recap-card";

// Team Challenges
export {
  TeamChallengeCard,
  TeamChallengeList,
  TeamChallengeWidget,
  type TeamChallengeCardProps,
  type TeamChallengeListProps,
  type TeamChallengeWidgetProps,
} from "./team-challenge";

// Achievement Sharing
export {
  AchievementShareButton,
  AchievementShareModal,
  AchievementShareIcons,
  useAchievementShare,
  type ShareableAchievement,
  type AchievementShareButtonProps,
  type AchievementShareModalProps,
  type AchievementShareIconsProps,
} from "./achievement-share";

// XP Activity Log
export {
  XpActivityLog,
  XpActivityWidget,
  type XpActivityLogProps,
  type XpActivityWidgetProps,
} from "./xp-activity-log";

// Badge Showcase
export {
  BadgeShowcaseDisplay,
  BadgeShowcaseEditor,
  useBadgeShowcase,
  type BadgeShowcaseDisplayProps,
  type BadgeShowcaseEditorProps,
} from "./badge-showcase";

// Seasonal Events
export {
  SeasonalEventCard,
  SeasonalEventBanner,
  SeasonalEventWidget,
  type SeasonalEventCardProps,
  type SeasonalEventBannerProps,
  type SeasonalEventWidgetProps,
} from "./seasonal-event";

// Daily Quests
export {
  DailyQuestCard,
  DailyQuestList,
  DailyQuestWidget,
  type DailyQuestCardProps,
  type DailyQuestListProps,
  type DailyQuestWidgetProps,
} from "./daily-quest";

// Gamification Hub (Dashboard Widget)
export {
  GamificationHub,
  GamificationHubCompact,
  type GamificationHubProps,
  type GamificationHubCompactProps,
} from "./gamification-hub";

// Simplified Progress Widget
export {
  ProgressWidget,
  type ProgressWidgetProps,
} from "./progress-widget";

// Achievement Categories Browser
export {
  AchievementCategories,
  CategoryFilter,
  type AchievementCategoriesProps,
  type CategoryFilterProps,
} from "./achievement-categories";

// Notification Preferences
export {
  NotificationPrefs,
  NotificationPrefsCompact,
  type NotificationPrefsProps,
  type NotificationPrefsCompactProps,
} from "./notification-prefs";

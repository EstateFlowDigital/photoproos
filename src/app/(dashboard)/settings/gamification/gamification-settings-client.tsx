"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { SparklesIcon, CheckIcon } from "@/components/ui/settings-icons";
import {
  Trophy,
  Target,
  Zap,
  Star,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";
import {
  getGamificationState,
  getSkillTreeState,
  getQuestState,
  resetSkillPoints,
  getStreakFreezeState,
  getGamificationNotificationPrefs,
  updateGamificationNotificationPrefs,
  getBadgeShowcase,
  updateBadgeShowcase,
  type StreakFreezeState,
  type GamificationNotificationPrefs,
  type UnlockedAchievement,
  type BadgeShowcase,
} from "@/lib/actions/gamification";
import { StreakFreezeDisplay } from "@/components/gamification/streak-freeze-display";
import {
  BadgeShowcaseDisplay,
  BadgeShowcaseEditor,
  useBadgeShowcase,
} from "@/components/gamification";

// Default notification preferences
const defaultNotificationPrefs: GamificationNotificationPrefs = {
  achievementUnlocks: true,
  levelUps: true,
  streakReminders: true,
  dailyBonusReminders: true,
  leaderboardChanges: false,
  challengeUpdates: true,
  weeklyRecaps: true,
  seasonalEvents: true,
};

const notificationOptions: Array<{
  id: keyof GamificationNotificationPrefs;
  label: string;
  description: string;
  icon: typeof Zap;
}> = [
  {
    id: "achievementUnlocks",
    label: "Achievement Unlocks",
    description: "Get notified when you unlock new achievements",
    icon: Trophy,
  },
  {
    id: "levelUps",
    label: "Level Up Celebrations",
    description: "Show confetti and celebration when you level up",
    icon: Star,
  },
  {
    id: "streakReminders",
    label: "Streak Reminders",
    description: "Get reminded to maintain your login and delivery streaks",
    icon: Calendar,
  },
  {
    id: "dailyBonusReminders",
    label: "Daily Bonus Reminders",
    description: "Never miss your daily XP bonus",
    icon: SparklesIcon,
  },
  {
    id: "leaderboardChanges",
    label: "Leaderboard Changes",
    description: "Know when your ranking changes on the leaderboard",
    icon: Target,
  },
  {
    id: "challengeUpdates",
    label: "Challenge Updates",
    description: "Stay updated on team challenge progress",
    icon: Zap,
  },
  {
    id: "weeklyRecaps",
    label: "Weekly Recaps",
    description: "Receive weekly progress summaries",
    icon: Award,
  },
  {
    id: "seasonalEvents",
    label: "Seasonal Events",
    description: "Get notified about special events and bonuses",
    icon: Calendar,
  },
];

export function GamificationSettingsClient() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationPrefs, setNotificationPrefs] =
    useState<GamificationNotificationPrefs>(defaultNotificationPrefs);
  const [hasChanges, setHasChanges] = useState(false);

  // Stats
  const [level, setLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [skillPointsSpent, setSkillPointsSpent] = useState(0);
  const [skillPointsAvailable, setSkillPointsAvailable] = useState(0);
  const [questsCompleted, setQuestsCompleted] = useState(0);
  const [totalQuests, setTotalQuests] = useState(0);
  const [isResettingSkills, setIsResettingSkills] = useState(false);
  const [streakFreezeState, setStreakFreezeState] = useState<StreakFreezeState | null>(null);

  // Badge Showcase
  const [badgeShowcase, setBadgeShowcase] = useState<BadgeShowcase | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const showcaseHook = useBadgeShowcase([]);

  const loadSettings = useCallback(async () => {
    try {
      // Load gamification state and notification preferences
      const [stateResult, skillResult, questResult, freezeResult, notifPrefsResult, showcaseResult] = await Promise.all([
        getGamificationState(),
        getSkillTreeState(),
        getQuestState(),
        getStreakFreezeState(),
        getGamificationNotificationPrefs(),
        getBadgeShowcase(),
      ]);

      if (stateResult.success) {
        setLevel(stateResult.data.level);
        setTotalXp(stateResult.data.totalXp);
        // Store unlocked achievements for badge showcase
        const unlocked = stateResult.data.recentAchievements.filter((a) => a.unlocked);
        setUnlockedAchievements(unlocked);
        setAchievementsUnlocked(unlocked.length);
        setTotalAchievements(45);
      }

      if (skillResult.success) {
        setSkillPointsSpent(skillResult.data.spentSkillPoints);
        setSkillPointsAvailable(skillResult.data.availableSkillPoints);
      }

      if (questResult.success) {
        setQuestsCompleted(questResult.data.completedQuestIds.length);
        setTotalQuests(
          questResult.data.categories.reduce((sum, c) => sum + c.totalCount, 0)
        );
      }

      if (freezeResult.success) {
        setStreakFreezeState(freezeResult.data);
      }

      // Load notification preferences from database
      if (notifPrefsResult.success) {
        setNotificationPrefs(notifPrefsResult.data);
      }

      // Load badge showcase
      if (showcaseResult.success) {
        setBadgeShowcase(showcaseResult.data);
        showcaseHook.resetSelection(showcaseResult.data.featuredAchievementIds);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showcaseHook]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = (key: keyof GamificationNotificationPrefs) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateGamificationNotificationPrefs(notificationPrefs);
      if (result.success) {
        setHasChanges(false);
        showToast({
          title: "Settings saved",
          description: "Your gamification preferences have been updated.",
          variant: "success",
        });
      } else {
        showToast({
          title: "Error",
          description: result.error || "Failed to save settings. Please try again.",
          variant: "error",
        });
      }
    } catch {
      showToast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSkillPoints = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all your skill points? This will remove all unlocked perks and refund your points."
      )
    ) {
      return;
    }

    setIsResettingSkills(true);
    try {
      const result = await resetSkillPoints();
      if (result.success) {
        setSkillPointsSpent(0);
        setSkillPointsAvailable(skillPointsSpent + skillPointsAvailable);
        showToast({
          title: "Skill points reset",
          description: `${result.data.pointsRefunded} skill points have been refunded.`,
          variant: "success",
        });
      } else {
        showToast({
          title: "Error",
          description: result.error || "Failed to reset skill points.",
          variant: "error",
        });
      }
    } catch {
      showToast({
        title: "Error",
        description: "Failed to reset skill points. Please try again.",
        variant: "error",
      });
    } finally {
      setIsResettingSkills(false);
    }
  };

  const handleStreakFreezePurchase = useCallback(
    (result: { newFreezes: number; xpRemaining: number }) => {
      setStreakFreezeState((prev) =>
        prev
          ? { ...prev, available: result.newFreezes }
          : {
              available: result.newFreezes,
              totalUsed: 0,
              maxFreezes: 5,
              lastUsedDate: null,
            }
      );
      setTotalXp(result.xpRemaining);
    },
    []
  );

  const handleSaveShowcase = useCallback(async () => {
    try {
      const result = await updateBadgeShowcase(showcaseHook.selectedIds);
      if (result.success) {
        setBadgeShowcase((prev) =>
          prev ? { ...prev, featuredAchievementIds: showcaseHook.selectedIds } : null
        );
        showcaseHook.closeEditor();
        showToast({
          title: "Showcase updated",
          description: "Your badge showcase has been saved.",
          variant: "success",
        });
      } else {
        showToast({
          title: "Error",
          description: result.error || "Failed to update showcase.",
          variant: "error",
        });
      }
    } catch {
      showToast({
        title: "Error",
        description: "Failed to update showcase. Please try again.",
        variant: "error",
      });
    }
  }, [showcaseHook, showToast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-[var(--background-secondary)]" />
          <div className="mt-2 h-4 w-64 rounded bg-[var(--background-secondary)]" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-[var(--background-secondary)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/achievements"
          className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)]"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/15">
              <Star className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-muted transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">Level {level}</p>
            <p className="text-sm text-foreground-muted">
              {totalXp.toLocaleString()} XP earned
            </p>
          </div>
        </Link>

        <Link
          href="/achievements"
          className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)]"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/15">
              <Trophy className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-muted transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">
              {achievementsUnlocked}/{totalAchievements}
            </p>
            <p className="text-sm text-foreground-muted">
              Achievements unlocked
            </p>
          </div>
        </Link>

        <Link
          href="/skills"
          className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)]"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/15">
              <Zap className="h-5 w-5 text-[var(--success)]" />
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-muted transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">
              {skillPointsAvailable}
            </p>
            <p className="text-sm text-foreground-muted">
              Skill points available
            </p>
          </div>
        </Link>

        <Link
          href="/quests"
          className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)]"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/15">
              <Target className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-muted transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">
              {questsCompleted}/{totalQuests}
            </p>
            <p className="text-sm text-foreground-muted">Quests completed</p>
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Quick Links
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/achievements"
            className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-3 transition-colors hover:bg-[var(--background-hover)]"
          >
            <Trophy className="h-5 w-5 text-[var(--warning)]" />
            <span className="text-sm font-medium text-foreground">
              View Achievements
            </span>
          </Link>
          <Link
            href="/quests"
            className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-3 transition-colors hover:bg-[var(--background-hover)]"
          >
            <Target className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-medium text-foreground">
              View Quests
            </span>
          </Link>
          <Link
            href="/skills"
            className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-3 transition-colors hover:bg-[var(--background-hover)]"
          >
            <Zap className="h-5 w-5 text-[var(--success)]" />
            <span className="text-sm font-medium text-foreground">
              Skill Trees
            </span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-3 transition-colors hover:bg-[var(--background-hover)]"
          >
            <Award className="h-5 w-5 text-[var(--ai)]" />
            <span className="text-sm font-medium text-foreground">
              Leaderboard
            </span>
          </Link>
        </div>
      </div>

      {/* Badge Showcase */}
      {badgeShowcase && (
        <>
          <BadgeShowcaseDisplay
            showcase={badgeShowcase}
            achievements={unlockedAchievements}
            onEdit={showcaseHook.openEditor}
          />
          <BadgeShowcaseEditor
            showcase={badgeShowcase}
            achievements={unlockedAchievements}
            selectedIds={showcaseHook.selectedIds}
            onSelect={showcaseHook.handleSelect}
            onDeselect={showcaseHook.handleDeselect}
            onSave={handleSaveShowcase}
            onCancel={() => {
              showcaseHook.resetSelection(badgeShowcase.featuredAchievementIds);
              showcaseHook.closeEditor();
            }}
            isOpen={showcaseHook.isEditorOpen}
          />
        </>
      )}

      {/* Notification Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">
          Notification Preferences
        </h3>
        <p className="text-sm text-foreground-muted mb-4">
          Control which gamification notifications you see.
        </p>

        <div className="space-y-4">
          {notificationOptions.map((option) => {
            const IconComponent = option.icon;
            const isEnabled = notificationPrefs[option.id];

            return (
              <div
                key={option.id}
                className="flex items-start justify-between gap-4 flex-wrap gap-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isEnabled
                        ? "bg-[var(--primary)]/15"
                        : "bg-[var(--background-tertiary)]"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "h-4 w-4",
                        isEnabled
                          ? "text-[var(--primary)]"
                          : "text-foreground-muted"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {option.label}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(option.id)}
                  aria-label={`Toggle ${option.label}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Points Management */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">
          Skill Points Management
        </h3>
        <p className="text-sm text-foreground-muted mb-4">
          You have spent {skillPointsSpent} skill points on perks. Reset to
          redistribute them.
        </p>

        <div className="flex items-start justify-between gap-4 flex-wrap rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Reset Skill Points
            </p>
            <p className="text-xs text-foreground-muted">
              Refund all spent points and remove unlocked perks
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetSkillPoints}
            disabled={isResettingSkills || skillPointsSpent === 0}
          >
            {isResettingSkills ? "Resetting..." : "Reset Points"}
          </Button>
        </div>
      </div>

      {/* Streak Protection */}
      {streakFreezeState && (
        <StreakFreezeDisplay
          freezeState={streakFreezeState}
          userXp={totalXp}
          onPurchase={handleStreakFreezePurchase}
        />
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg">
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

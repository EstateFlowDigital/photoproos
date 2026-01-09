"use client";

import { useState, useCallback, useTransition, memo } from "react";
import { cn } from "@/lib/utils";
import {
  Bell,
  Trophy,
  TrendingUp,
  Flame,
  Gift,
  Users,
  Target,
  Calendar,
  Sparkles,
} from "lucide-react";
import type { GamificationNotificationPrefs } from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface NotificationPrefsProps {
  preferences: GamificationNotificationPrefs;
  onUpdate: (prefs: Partial<GamificationNotificationPrefs>) => Promise<void>;
  className?: string;
}

interface PreferenceToggleProps {
  icon: typeof Bell;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isPending?: boolean;
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export const NotificationPrefs = memo(function NotificationPrefs({
  preferences,
  onUpdate,
  className,
}: NotificationPrefsProps) {
  const [isPending, startTransition] = useTransition();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleChange = useCallback(
    (key: keyof GamificationNotificationPrefs, value: boolean) => {
      setLocalPrefs((prev) => ({ ...prev, [key]: value }));
      startTransition(async () => {
        await onUpdate({ [key]: value });
      });
    },
    [onUpdate]
  );

  return (
    <div
      className={cn(
        "notification-prefs rounded-xl border border-[var(--card-border)] bg-[var(--card)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--card-border)]">
        <Bell className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">
            Gamification Notifications
          </h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Choose which notifications you want to receive
          </p>
        </div>
      </div>

      {/* Preference Toggles */}
      <div className="divide-y divide-[var(--card-border)]">
        <PreferenceToggle
          icon={Trophy}
          label="Achievement Unlocks"
          description="Get notified when you unlock new achievements"
          enabled={localPrefs.achievementUnlocks}
          onChange={(v) => handleChange("achievementUnlocks", v)}
          isPending={isPending}
        />
        <PreferenceToggle
          icon={TrendingUp}
          label="Level Ups"
          description="Celebrate when you reach a new level"
          enabled={localPrefs.levelUps}
          onChange={(v) => handleChange("levelUps", v)}
          isPending={isPending}
        />
        <PreferenceToggle
          icon={Flame}
          label="Streak Reminders"
          description="Get reminded to maintain your streaks"
          enabled={localPrefs.streakReminders}
          onChange={(v) => handleChange("streakReminders", v)}
          isPending={isPending}
        />
        <PreferenceToggle
          icon={Gift}
          label="Daily Bonus Reminders"
          description="Never miss your daily XP bonus"
          enabled={localPrefs.dailyBonusReminders}
          onChange={(v) => handleChange("dailyBonusReminders", v)}
          isPending={isPending}
        />
        <PreferenceToggle
          icon={Users}
          label="Leaderboard Changes"
          description="Know when your ranking changes"
          enabled={localPrefs.leaderboardChanges}
          onChange={(v) => handleChange("leaderboardChanges", v)}
          isPending={isPending}
        />
        <PreferenceToggle
          icon={Target}
          label="Challenge Updates"
          description="Stay updated on team challenge progress"
          enabled={localPrefs.challengeUpdates}
          onChange={(v) => handleChange("challengeUpdates", v)}
          isPending={isPending}
        />
        <PreferenceToggle
          icon={Calendar}
          label="Weekly Recaps"
          description="Receive weekly progress summaries"
          enabled={localPrefs.weeklyRecaps}
          onChange={(v) => handleChange("weeklyRecaps", v)}
          isPending={isPending}
        />
        <PreferenceToggle
          icon={Sparkles}
          label="Seasonal Events"
          description="Get notified about special events"
          enabled={localPrefs.seasonalEvents}
          onChange={(v) => handleChange("seasonalEvents", v)}
          isPending={isPending}
        />
      </div>
    </div>
  );
});

// ============================================================================
// PREFERENCE TOGGLE
// ============================================================================

const PreferenceToggle = memo(function PreferenceToggle({
  icon: Icon,
  label,
  description,
  enabled,
  onChange,
  isPending,
}: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap gap-4 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--foreground-muted)]/15 text-[var(--foreground-muted)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-[var(--foreground)]">{label}</p>
          <p className="text-sm text-[var(--foreground-muted)]">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        disabled={isPending}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
          enabled ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]",
          isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            enabled && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
});

// ============================================================================
// COMPACT VERSION
// ============================================================================

interface NotificationPrefsCompactProps {
  preferences: GamificationNotificationPrefs;
  onOpenSettings: () => void;
  className?: string;
}

export const NotificationPrefsCompact = memo(function NotificationPrefsCompact({
  preferences,
  onOpenSettings,
  className,
}: NotificationPrefsCompactProps) {
  const enabledCount = Object.values(preferences).filter(Boolean).length;
  const totalCount = Object.keys(preferences).length;

  return (
    <button
      onClick={onOpenSettings}
      className={cn(
        "notification-prefs-compact flex items-start justify-between gap-4 flex-wrap gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 w-full text-left hover:bg-[var(--background-hover)] transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-[var(--foreground)]">Notification Settings</p>
          <p className="text-sm text-[var(--foreground-muted)]">
            {enabledCount} of {totalCount} enabled
          </p>
        </div>
      </div>
      <span className="text-[var(--foreground-muted)]">→</span>
    </button>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { NotificationPrefsProps, NotificationPrefsCompactProps };

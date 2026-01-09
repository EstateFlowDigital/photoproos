"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  Gift,
  Zap,
  Clock,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SeasonalEvent, SeasonalEventType } from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface SeasonalEventCardProps {
  event: SeasonalEvent;
  className?: string;
}

interface SeasonalEventBannerProps {
  event: SeasonalEvent;
  onDismiss?: () => void;
  className?: string;
}

interface SeasonalEventWidgetProps {
  events: SeasonalEvent[];
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const eventIcons: Record<SeasonalEventType, typeof Sparkles> = {
  new_year: Sparkles,
  spring: Flower2,
  summer: Sun,
  fall: Leaf,
  winter: Snowflake,
  anniversary: Gift,
  special: Sparkles,
};

function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = new Date(endDate).getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} left`;
  return `${hours} hour${hours !== 1 ? "s" : ""} left`;
}

// ============================================================================
// SEASONAL EVENT CARD
// ============================================================================

export const SeasonalEventCard = memo(function SeasonalEventCard({
  event,
  className,
}: SeasonalEventCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = eventIcons[event.type];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "seasonal-event-card rounded-xl border overflow-hidden",
        className
      )}
      style={{
        borderColor: `${event.theme.primaryColor}40`,
        background: `linear-gradient(135deg, ${event.theme.primaryColor}10, ${event.theme.secondaryColor}10)`,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{
          background: `linear-gradient(135deg, ${event.theme.primaryColor}, ${event.theme.secondaryColor})`,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Icon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{event.name}</h3>
              <p className="text-sm text-white/80">{event.description}</p>
            </div>
          </div>
          {event.isActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatTimeRemaining(event.endDate)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* XP Multiplier */}
        {event.xpMultiplier > 1 && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--warning)]/10 px-3 py-2 mb-4">
            <Zap className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--warning)]">
              {event.xpMultiplier}x XP Bonus Active!
            </span>
          </div>
        )}

        {/* Challenges */}
        {event.challenges.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--foreground-muted)]">
              Event Challenges
            </h4>
            {event.challenges.map((challenge) => {
              const progress = Math.min(
                (challenge.currentProgress / challenge.targetValue) * 100,
                100
              );
              return (
                <div
                  key={challenge.id}
                  className="rounded-lg bg-[var(--background-secondary)] p-3"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {challenge.name}
                    </span>
                    <span className="text-xs text-[var(--warning)]">
                      +{challenge.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)] mb-2">
                    {challenge.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${event.theme.primaryColor}, ${event.theme.secondaryColor})`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-[var(--foreground-muted)]">
                      {challenge.currentProgress}/{challenge.targetValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Special Rewards */}
        {event.specialRewards.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
              Exclusive Rewards
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.specialRewards.map((reward, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: `${event.theme.primaryColor}20`,
                    color: event.theme.primaryColor,
                  }}
                >
                  <Gift className="h-3 w-3" aria-hidden="true" />
                  {reward.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// ============================================================================
// SEASONAL EVENT BANNER
// ============================================================================

export const SeasonalEventBanner = memo(function SeasonalEventBanner({
  event,
  onDismiss,
  className,
}: SeasonalEventBannerProps) {
  const Icon = eventIcons[event.type];

  return (
    <div
      className={cn(
        "seasonal-event-banner relative rounded-xl px-4 py-3",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${event.theme.primaryColor}, ${event.theme.secondaryColor})`,
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
          <div>
            <p className="font-medium text-white">{event.name}</p>
            <p className="text-sm text-white/80">
              {event.xpMultiplier > 1 && `${event.xpMultiplier}x XP · `}
              {formatTimeRemaining(event.endDate)}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// SEASONAL EVENT WIDGET
// ============================================================================

export const SeasonalEventWidget = memo(function SeasonalEventWidget({
  events,
  className,
}: SeasonalEventWidgetProps) {
  const activeEvents = events.filter((e) => e.isActive);

  if (activeEvents.length === 0) {
    return null;
  }

  const event = activeEvents[0];
  const Icon = eventIcons[event.type];

  return (
    <div
      className={cn(
        "seasonal-event-widget rounded-xl p-4",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${event.theme.primaryColor}15, ${event.theme.secondaryColor}15)`,
        border: `1px solid ${event.theme.primaryColor}30`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${event.theme.primaryColor}25` }}
        >
          <Icon className="h-5 w-5" style={{ color: event.theme.primaryColor }} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--foreground)] truncate">{event.name}</p>
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            {event.xpMultiplier > 1 && (
              <span className="text-[var(--warning)]">{event.xpMultiplier}x XP</span>
            )}
            <span>{formatTimeRemaining(event.endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { SeasonalEventCardProps, SeasonalEventBannerProps, SeasonalEventWidgetProps };

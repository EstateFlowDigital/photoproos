"use client";

import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  count: number;
  type: "login" | "delivery";
  longestStreak?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    icon: "h-4 w-4",
    text: "text-sm",
    container: "gap-1.5",
  },
  md: {
    icon: "h-5 w-5",
    text: "text-base",
    container: "gap-2",
  },
  lg: {
    icon: "h-6 w-6",
    text: "text-lg",
    container: "gap-2.5",
  },
};

const streakConfig = {
  login: {
    icon: FlameIcon,
    label: "Day Streak",
    color: "text-[var(--warning)]",
    bgColor: "bg-[var(--warning)]/10",
  },
  delivery: {
    icon: RocketIcon,
    label: "Delivery Streak",
    color: "text-[var(--success)]",
    bgColor: "bg-[var(--success)]/10",
  },
};

export function StreakDisplay({
  count,
  type,
  longestStreak,
  size = "md",
  showLabel = true,
  className,
}: StreakDisplayProps) {
  const styles = sizeStyles[size];
  const config = streakConfig[type];
  const Icon = config.icon;
  const isActive = count > 0;

  const ariaLabel = `${config.label}: ${count} days${longestStreak && longestStreak > count ? `, best streak: ${longestStreak} days` : ""}`;

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "streak-display inline-flex items-center rounded-lg px-3 py-1.5",
        config.bgColor,
        styles.container,
        className
      )}
    >
      <Icon
        className={cn(
          styles.icon,
          isActive ? config.color : "text-[var(--foreground-muted)]",
          isActive && "animate-pulse"
        )}
        aria-hidden="true"
      />
      <div className="flex flex-col">
        <span className={cn("font-bold leading-tight", styles.text, config.color)} aria-hidden="true">
          {count}
        </span>
        {showLabel && (
          <span className="text-[10px] text-[var(--foreground-muted)] leading-tight" aria-hidden="true">
            {config.label}
          </span>
        )}
      </div>
      {longestStreak && longestStreak > count && (
        <span className="text-[10px] text-[var(--foreground-muted)]" aria-hidden="true">
          (Best: {longestStreak})
        </span>
      )}
    </div>
  );
}

// Compact streak badge for tight spaces
export function StreakBadge({
  count,
  type,
  size = "sm",
}: {
  count: number;
  type: "login" | "delivery";
  size?: "sm" | "md";
}) {
  const config = streakConfig[type];
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  if (count === 0) return null;

  return (
    <div
      role="status"
      aria-label={`${config.label}: ${count} days`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
        config.bgColor
      )}
      title={`${count} ${config.label}`}
    >
      <Icon className={cn(iconSize, config.color)} aria-hidden="true" />
      <span className={cn("font-semibold", textSize, config.color)} aria-hidden="true">{count}</span>
    </div>
  );
}

// Icons
function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
        clipRule="evenodd"
      />
      <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
    </svg>
  );
}

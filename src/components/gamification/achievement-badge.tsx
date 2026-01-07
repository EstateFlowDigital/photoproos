"use client";

import { cn } from "@/lib/utils";
import type { AchievementRarity } from "@prisma/client";

interface AchievementBadgeProps {
  icon: string;
  name: string;
  rarity: AchievementRarity;
  isUnlocked: boolean;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
  className?: string;
}

const rarityStyles: Record<AchievementRarity, { glow: string; border: string; bg: string }> = {
  common: {
    glow: "shadow-[0_0_12px_var(--foreground-muted)]",
    border: "border-[var(--foreground-muted)]/40",
    bg: "bg-[var(--foreground-muted)]/10",
  },
  uncommon: {
    glow: "shadow-[0_0_16px_var(--success)]",
    border: "border-[var(--success)]/40",
    bg: "bg-[var(--success)]/10",
  },
  rare: {
    glow: "shadow-[0_0_20px_var(--primary)]",
    border: "border-[var(--primary)]/40",
    bg: "bg-[var(--primary)]/10",
  },
  epic: {
    glow: "shadow-[0_0_24px_var(--ai)]",
    border: "border-[var(--ai)]/50",
    bg: "bg-[var(--ai)]/15",
  },
  legendary: {
    glow: "shadow-[0_0_28px_var(--warning)]",
    border: "border-[var(--warning)]/60",
    bg: "bg-gradient-to-br from-[var(--warning)]/20 to-[var(--warning)]/10",
  },
};

const sizeStyles = {
  sm: {
    container: "h-10 w-10",
    icon: "text-lg",
  },
  md: {
    container: "h-14 w-14",
    icon: "text-2xl",
  },
  lg: {
    container: "h-20 w-20",
    icon: "text-4xl",
  },
};

export function AchievementBadge({
  icon,
  name,
  rarity,
  isUnlocked,
  size = "md",
  showGlow = true,
  className,
}: AchievementBadgeProps) {
  const styles = rarityStyles[rarity];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      role="img"
      aria-label={`${name} achievement badge${isUnlocked ? "" : " (locked)"} - ${rarity} rarity`}
      className={cn(
        "achievement-badge relative flex items-center justify-center rounded-full border-2 transition-all duration-300",
        sizeStyle.container,
        isUnlocked ? styles.bg : "bg-[var(--background-secondary)]",
        isUnlocked ? styles.border : "border-[var(--border)]",
        isUnlocked && showGlow && styles.glow,
        !isUnlocked && "opacity-40 grayscale",
        className
      )}
      title={name}
    >
      <span className={cn("select-none", sizeStyle.icon)} aria-hidden="true">
        {icon}
      </span>

      {/* Locked overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-[var(--foreground-muted)]"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Rarity label component
export function RarityLabel({ rarity }: { rarity: AchievementRarity }) {
  const colors: Record<AchievementRarity, string> = {
    common: "text-[var(--foreground-muted)]",
    uncommon: "text-[var(--success)]",
    rare: "text-[var(--primary)]",
    epic: "text-[var(--ai)]",
    legendary: "text-[var(--warning)]",
  };

  return (
    <span className={cn("text-xs font-medium capitalize", colors[rarity])}>
      {rarity}
    </span>
  );
}

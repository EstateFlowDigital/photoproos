"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Flame, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

interface ProgressWidgetProps {
  level: number;
  levelProgress: number;
  currentStreak: number;
  className?: string;
}

// ============================================================================
// PROGRESS WIDGET (SIMPLIFIED DASHBOARD WIDGET)
// ============================================================================

export const ProgressWidget = memo(function ProgressWidget({
  level,
  levelProgress,
  currentStreak,
  className,
}: ProgressWidgetProps) {
  return (
    <Link
      href="/progress"
      className={cn(
        "progress-widget block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--card-border-hover)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Level */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--ai)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--foreground)]">Level {level}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-20 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)]"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <span className="text-xs text-[var(--foreground-muted)]">{levelProgress}%</span>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[var(--error)]" />
            <span className="font-semibold text-[var(--foreground)]">{currentStreak}</span>
            <span className="text-sm text-[var(--foreground-muted)]">day streak</span>
          </div>
          <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)]" />
        </div>
      </div>
    </Link>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { ProgressWidgetProps };

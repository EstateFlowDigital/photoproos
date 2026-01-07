"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  ChevronRight,
  Sparkles,
  Users,
  Images,
  CreditCard,
  Tag,
  Building2,
  Palette,
  Receipt,
  Repeat,
  CalendarPlus,
  Clock,
  FileText,
  FileSpreadsheet,
  Settings,
  PartyPopper,
  SkipForward,
  Undo2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { skipChecklistItem } from "@/lib/actions/onboarding-checklist";
import type { ChecklistItem } from "@/lib/utils/checklist-items";

// Re-export type for backwards compatibility
export type { ChecklistItem };

// New type for database-driven checklist items
export interface ChecklistItemWithIcon {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string; // Icon name as string
  isCompleted: boolean;
  isSkipped?: boolean;
}

// Icon map for converting icon names to React components
const ICON_MAP: Record<string, React.ReactNode> = {
  users: <Users className="h-4 w-4" />,
  images: <Images className="h-4 w-4" />,
  "credit-card": <CreditCard className="h-4 w-4" />,
  tag: <Tag className="h-4 w-4" />,
  "building-2": <Building2 className="h-4 w-4" />,
  palette: <Palette className="h-4 w-4" />,
  receipt: <Receipt className="h-4 w-4" />,
  repeat: <Repeat className="h-4 w-4" />,
  check: <Check className="h-4 w-4" />,
  "calendar-plus": <CalendarPlus className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  "file-text": <FileText className="h-4 w-4" />,
  "file-invoice": <FileSpreadsheet className="h-4 w-4" />,
};

interface OnboardingChecklistProps {
  items: ChecklistItem[] | ChecklistItemWithIcon[];
  organizationName?: string;
  className?: string;
}

const STORAGE_KEY = "onboarding-checklist-dismissed";
const CELEBRATION_KEY = "onboarding-celebration-shown";

export function OnboardingChecklist({
  items,
  organizationName = "your business",
  className,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const confettiTriggered = useRef(false);

  // Fire confetti celebration
  const fireConfetti = useCallback(() => {
    if (confettiTriggered.current) return;
    confettiTriggered.current = true;

    // Fire multiple bursts for a nice effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from left
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 60,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899"],
      });

      // Fire from right
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 60,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899"],
      });
    }, 250);
  }, []);

  // Load dismissed state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === "true");
    setIsLoaded(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleDismissCelebration = () => {
    setShowCelebration(false);
    localStorage.setItem(CELEBRATION_KEY, "true");
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  // Normalize items to handle both old and new formats
  const normalizedItems = items.map((item) => {
    // Check if it's the new format (has isCompleted) or old format (has completed)
    const isNewFormat = "isCompleted" in item;
    const completed = isNewFormat
      ? (item as ChecklistItemWithIcon).isCompleted
      : (item as ChecklistItem).completed;
    const skipped = isNewFormat
      ? (item as ChecklistItemWithIcon).isSkipped ?? false
      : false;
    const icon = isNewFormat
      ? ICON_MAP[(item as ChecklistItemWithIcon).icon] || <Check className="h-4 w-4" />
      : (item as ChecklistItem).icon;

    return {
      id: item.id,
      label: item.label,
      description: item.description,
      href: item.href,
      completed,
      skipped,
      icon,
    };
  });

  const [skippingItems, setSkippingItems] = useState<Set<string>>(new Set());

  const handleSkip = async (itemId: string, currentlySkipped: boolean) => {
    setSkippingItems((prev) => new Set(prev).add(itemId));
    try {
      await skipChecklistItem(itemId, !currentlySkipped);
    } finally {
      setSkippingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const completedCount = normalizedItems.filter((item) => item.completed).length;
  const totalCount = normalizedItems.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Check for celebration when all items complete
  useEffect(() => {
    if (!isLoaded) return;

    if (allCompleted && !isDismissed) {
      const celebrationShown = localStorage.getItem(CELEBRATION_KEY);
      if (celebrationShown !== "true") {
        setShowCelebration(true);
        fireConfetti();
      }
    }
  }, [allCompleted, isDismissed, isLoaded, fireConfetti]);

  // Don't render until we've loaded the dismissed state
  if (!isLoaded) return null;

  // Don't render if dismissed
  if (isDismissed) return null;

  // Show celebration state if all completed
  if (showCelebration || (allCompleted && localStorage.getItem(CELEBRATION_KEY) !== "true")) {
    return (
      <div
        className={cn(
          "rounded-xl border border-[var(--success)]/30 bg-gradient-to-br from-[var(--success)]/10 to-transparent p-6",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10 text-[var(--success)]">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                You&apos;re all set up!
              </h3>
              <p className="mt-0.5 text-sm text-foreground-muted">
                Congratulations! You&apos;ve completed all the setup steps for {organizationName}.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismissCelebration}
            className="shrink-0 rounded-lg p-1.5 bg-[var(--background-hover)] text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground transition-colors"
            aria-label="Dismiss celebration"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Completion Badge */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success)] text-white">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium text-[var(--success)]">
              {totalCount} of {totalCount} completed
            </span>
          </div>
          <Link
            href="/settings/onboarding"
            className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-3 w-3" />
            Customize checklist
          </Link>
        </div>

        {/* Progress Bar - Full */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--background-secondary)]">
          <div className="h-full w-full rounded-full bg-[var(--success)]" />
        </div>
      </div>
    );
  }

  // Hide if all completed and celebration was already shown
  if (allCompleted) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Finish setting up {organizationName}
            </h3>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Complete these steps to get the most out of your account
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1.5 bg-[var(--background-hover)] text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground-muted">
            {completedCount} of {totalCount} completed
          </span>
          <span className="font-medium text-[var(--primary)]">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-secondary)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="mt-5 space-y-2">
        {normalizedItems.map((item) => {
          const isSkipping = skippingItems.has(item.id);
          const isActuallyCompleted = item.completed && !item.skipped;

          return (
            <div
              key={item.id}
              className={cn(
                "group flex items-center gap-3 rounded-lg p-3 transition-all",
                item.completed
                  ? "opacity-60"
                  : "hover:bg-[var(--card)] hover:shadow-sm"
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isActuallyCompleted
                    ? "border-[var(--success)] bg-[var(--success)] text-white"
                    : item.skipped
                    ? "border-[var(--foreground-muted)] bg-[var(--foreground-muted)] text-white"
                    : "border-[var(--border)] group-hover:border-[var(--primary)]"
                )}
              >
                {isActuallyCompleted && <Check className="h-3.5 w-3.5" />}
                {item.skipped && <SkipForward className="h-3.5 w-3.5" />}
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  item.completed
                    ? "bg-[var(--background-secondary)] text-foreground-muted"
                    : "bg-[var(--primary)]/10 text-[var(--primary)]"
                )}
              >
                {item.icon}
              </div>

              {/* Content - Wrapped in Link for non-completed items */}
              {item.completed ? (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        item.skipped
                          ? "text-foreground-muted"
                          : "text-foreground-muted line-through"
                      )}
                    >
                      {item.label}
                    </p>
                    {item.skipped && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background-secondary)] text-foreground-muted">
                        Skipped
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted truncate">
                    {item.description}
                  </p>
                </div>
              ) : (
                <Link href={item.href} className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-foreground-muted truncate">
                    {item.description}
                  </p>
                </Link>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Unskip button for skipped items */}
                {item.skipped && (
                  <button
                    onClick={() => handleSkip(item.id, true)}
                    disabled={isSkipping}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] rounded transition-colors disabled:opacity-50"
                    title="Restore this item"
                  >
                    <Undo2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Restore</span>
                  </button>
                )}

                {/* Skip button for incomplete items */}
                {!item.completed && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleSkip(item.id, false);
                      }}
                      disabled={isSkipping}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] rounded transition-colors disabled:opacity-50"
                      title="Skip this item"
                    >
                      <SkipForward className="h-3 w-3" />
                      <span className="hidden sm:inline">Skip</span>
                    </button>
                    <Link href={item.href}>
                      <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-[var(--primary)] transition-colors" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with Customize Link */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-end">
        <Link
          href="/settings/onboarding"
          className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-3 w-3" />
          Customize checklist
        </Link>
      </div>
    </div>
  );
}

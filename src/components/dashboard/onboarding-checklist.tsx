"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  ChevronRight,
  ChevronDown,
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
  Zap,
  Trophy,
  Star,
  Info,
  Lock,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { skipChecklistItem } from "@/lib/actions/onboarding-checklist";
import type { ChecklistItem } from "@/lib/utils/checklist-items";
import { CATEGORY_LABELS, ONBOARDING_XP_REWARDS } from "@/lib/constants/onboarding";

// Re-export type for backwards compatibility
export type { ChecklistItem };

// New type for database-driven checklist items with enhanced features
export interface ChecklistItemWithIcon {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  isCompleted: boolean;
  isSkipped?: boolean;
  // Enhanced fields
  category?: string;
  estimatedMinutes?: number;
  tip?: string | null;
  dependencies?: string[];
  xpReward?: number;
  xpAwarded?: boolean;
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
  // Enhanced progress data
  progress?: {
    completedCount: number;
    totalCount: number;
    progress: number;
    totalXpEarned: number;
    totalXpAvailable: number;
    milestonesReached: string[];
    nextMilestone: { percent: number; bonusXp: number } | null;
    estimatedTimeRemaining: number;
    categorySummary: Record<string, { completed: number; total: number }>;
  };
}

const STORAGE_KEY = "onboarding-checklist-dismissed";
const CELEBRATION_KEY = "onboarding-celebration-shown";
const MILESTONE_CELEBRATION_KEY = "onboarding-milestone-";

// Milestone celebration messages
const MILESTONE_MESSAGES: Record<string, { title: string; message: string; emoji: string }> = {
  "25": {
    title: "Great Start!",
    message: "You've completed 25% of setup. Keep going!",
    emoji: "🚀",
  },
  "50": {
    title: "Halfway There!",
    message: "50% complete! You're making great progress.",
    emoji: "⭐",
  },
  "75": {
    title: "Almost Done!",
    message: "75% complete! Just a few more steps to go.",
    emoji: "🔥",
  },
  "100": {
    title: "Setup Complete!",
    message: "You've finished all setup steps. Time to grow your business!",
    emoji: "🎉",
  },
};

export function OnboardingChecklist({
  items,
  organizationName = "your business",
  className,
  progress: progressData,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [milestoneCelebration, setMilestoneCelebration] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const confettiTriggered = useRef(false);
  const milestoneConfettiTriggered = useRef<Set<string>>(new Set());

  // Fire confetti celebration
  const fireConfetti = useCallback((intensity: "small" | "medium" | "large" = "large") => {
    const particleMultiplier = intensity === "small" ? 0.3 : intensity === "medium" ? 0.6 : 1;
    const duration = intensity === "small" ? 1500 : intensity === "medium" ? 2000 : 3000;
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

      const particleCount = Math.floor(50 * particleMultiplier * (timeLeft / duration));

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 60,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899"],
      });

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

  // Check for new milestones to celebrate
  useEffect(() => {
    if (!isLoaded || !progressData) return;

    const { milestonesReached } = progressData;
    for (const milestone of milestonesReached) {
      const celebrationKey = MILESTONE_CELEBRATION_KEY + milestone;
      const alreadyCelebrated = localStorage.getItem(celebrationKey);

      if (!alreadyCelebrated && !milestoneConfettiTriggered.current.has(milestone)) {
        milestoneConfettiTriggered.current.add(milestone);
        setMilestoneCelebration(milestone);

        // Fire confetti based on milestone
        const intensity = milestone === "100" ? "large" : milestone === "75" ? "medium" : "small";
        fireConfetti(intensity);

        localStorage.setItem(celebrationKey, "true");

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setMilestoneCelebration(null);
        }, 5000);
        break;
      }
    }
  }, [isLoaded, progressData, fireConfetti]);

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

  const handleDismissMilestone = () => {
    setMilestoneCelebration(null);
  };

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Normalize items to handle both old and new formats (memoized for performance)
  const normalizedItems = useMemo(() => items.map((item) => {
    const isNewFormat = "isCompleted" in item;
    const typedItem = item as ChecklistItemWithIcon;
    const completed = isNewFormat
      ? typedItem.isCompleted
      : (item as ChecklistItem).completed;
    const skipped = isNewFormat ? typedItem.isSkipped ?? false : false;
    const icon = isNewFormat
      ? ICON_MAP[typedItem.icon] || <Check className="h-4 w-4" />
      : (item as ChecklistItem).icon;

    return {
      id: item.id,
      label: item.label,
      description: item.description,
      href: item.href,
      completed,
      skipped,
      icon,
      category: typedItem.category || "getting_started",
      estimatedMinutes: typedItem.estimatedMinutes || 5,
      tip: typedItem.tip,
      dependencies: typedItem.dependencies || [],
      xpReward: typedItem.xpReward || 50,
      xpAwarded: typedItem.xpAwarded || false,
    };
  }), [items]);

  // Group items by category (memoized for performance)
  const itemsByCategory = useMemo(() => normalizedItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof normalizedItems>), [normalizedItems]);

  // Get completed items for dependency checking
  const completedItemIds = new Set(
    normalizedItems.filter((item) => item.completed).map((item) => {
      // Map completionType to ID pattern
      const completionTypeMap: Record<string, string> = {
        hasClients: "hasClients",
        hasServices: "hasServices",
        hasGalleries: "hasGalleries",
        hasProperties: "hasProperties",
        hasBranding: "hasBranding",
        hasPaymentMethod: "hasPaymentMethod",
        hasAvailability: "hasAvailability",
        hasBookingForms: "hasBookingForms",
        hasContractTemplates: "hasContractTemplates",
        hasInvoiceTemplates: "hasInvoiceTemplates",
        hasExpenseSettings: "hasExpenseSettings",
        hasExpenseTemplates: "hasExpenseTemplates",
      };
      return Object.entries(completionTypeMap).find(([, v]) => v === item.id)?.[0] || item.id;
    })
  );

  const [skippingItems, setSkippingItems] = useState<Set<string>>(new Set());
  const [skipError, setSkipError] = useState<string | null>(null);

  const handleSkip = async (itemId: string, currentlySkipped: boolean) => {
    setSkippingItems((prev) => new Set(prev).add(itemId));
    setSkipError(null);
    try {
      const result = await skipChecklistItem(itemId, !currentlySkipped);
      if (!result.success) {
        setSkipError(result.error || "Failed to update item");
        // Auto-clear error after 3 seconds
        setTimeout(() => setSkipError(null), 3000);
      }
    } catch {
      setSkipError("Failed to update item");
      setTimeout(() => setSkipError(null), 3000);
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

  // Calculate total time remaining
  const estimatedTimeRemaining = normalizedItems
    .filter((item) => !item.completed)
    .reduce((sum, item) => sum + item.estimatedMinutes, 0);

  // Calculate total XP available
  const totalXpAvailable = normalizedItems.reduce((sum, item) => sum + item.xpReward, 0);
  const totalXpEarned = normalizedItems
    .filter((item) => item.xpAwarded)
    .reduce((sum, item) => sum + item.xpReward, 0);

  // Check for celebration when all items complete
  useEffect(() => {
    if (!isLoaded) return;

    if (allCompleted && !isDismissed) {
      const celebrationShown = localStorage.getItem(CELEBRATION_KEY);
      if (celebrationShown !== "true" && !confettiTriggered.current) {
        confettiTriggered.current = true;
        setShowCelebration(true);
        fireConfetti("large");
      }
    }
  }, [allCompleted, isDismissed, isLoaded, fireConfetti]);

  // Don't render until we've loaded the dismissed state
  if (!isLoaded) return null;

  // Don't render if dismissed
  if (isDismissed) return null;

  // Milestone celebration overlay
  if (milestoneCelebration && MILESTONE_MESSAGES[milestoneCelebration]) {
    const { title, message, emoji } = MILESTONE_MESSAGES[milestoneCelebration];
    const bonusXp = milestoneCelebration === "25" ? ONBOARDING_XP_REWARDS.MILESTONE_25
      : milestoneCelebration === "50" ? ONBOARDING_XP_REWARDS.MILESTONE_50
      : milestoneCelebration === "75" ? ONBOARDING_XP_REWARDS.MILESTONE_75
      : ONBOARDING_XP_REWARDS.MILESTONE_100;

    return (
      <div
        className={cn(
          "rounded-xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--ai)]/5 to-transparent p-6",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-3xl">
              {emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  +{bonusXp} XP Bonus
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground-muted">{message}</p>
            </div>
          </div>
          <button
            onClick={handleDismissMilestone}
            className="shrink-0 rounded-lg p-1.5 bg-[var(--background-hover)] text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 h-3 overflow-hidden rounded-full bg-[var(--background-secondary)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-1000"
              style={{ width: `${milestoneCelebration}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-[var(--primary)]">
            {milestoneCelebration}%
          </span>
        </div>

        {/* Milestone markers */}
        <div className="mt-2 flex justify-between px-1">
          {[25, 50, 75, 100].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                "flex flex-col items-center",
                parseInt(milestoneCelebration) >= milestone
                  ? "text-[var(--primary)]"
                  : "text-foreground-muted"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  parseInt(milestoneCelebration) >= milestone
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)]"
                )}
              >
                {parseInt(milestoneCelebration) >= milestone ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Star className="h-3 w-3" />
                )}
              </div>
              <span className="mt-1 text-[10px] font-medium">{milestone}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  You&apos;re all set up!
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-medium">
                  <Trophy className="h-3 w-3" />
                  +{ONBOARDING_XP_REWARDS.MILESTONE_100} XP
                </span>
              </div>
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

        {/* XP Summary */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--background-secondary)] p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--warning)]" />
            <span className="text-sm font-medium">Total XP Earned</span>
          </div>
          <span className="text-lg font-bold text-[var(--warning)]">{totalXpEarned} XP</span>
        </div>

        {/* Progress Bar - Full */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--background-secondary)]">
          <div className="h-full w-full rounded-full bg-[var(--success)]" />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--success)]">
            {totalCount} of {totalCount} completed
          </span>
          <Link
            href="/settings/onboarding"
            className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-3 w-3" />
            Customize checklist
          </Link>
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

      {/* Enhanced Progress Section */}
      <div className="mt-4 rounded-lg bg-[var(--background-secondary)]/50 p-4">
        {/* Progress Stats */}
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-4">
            <span className="text-foreground-muted">
              {completedCount} of {totalCount} completed
            </span>
            <span className="flex items-center gap-1 text-foreground-muted">
              <Clock className="h-3.5 w-3.5" />
              ~{estimatedTimeRemaining} min left
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[var(--warning)]">
              <Zap className="h-3.5 w-3.5" />
              {totalXpEarned}/{totalXpAvailable} XP
            </span>
            <span className="font-medium text-[var(--primary)]">{progress}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Milestone Markers */}
        <div className="mt-2 flex justify-between">
          {[25, 50, 75, 100].map((milestone) => {
            const reached = progress >= milestone;
            const bonusXp = milestone === 25 ? ONBOARDING_XP_REWARDS.MILESTONE_25
              : milestone === 50 ? ONBOARDING_XP_REWARDS.MILESTONE_50
              : milestone === 75 ? ONBOARDING_XP_REWARDS.MILESTONE_75
              : ONBOARDING_XP_REWARDS.MILESTONE_100;

            return (
              <div
                key={milestone}
                className={cn(
                  "flex items-center gap-1 text-[10px]",
                  reached ? "text-[var(--primary)]" : "text-foreground-muted"
                )}
                title={`${milestone}% milestone: +${bonusXp} XP bonus`}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full",
                    reached
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--background-tertiary)]"
                  )}
                >
                  {reached ? <Check className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5" />}
                </div>
                <span className="hidden sm:inline">{milestone}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skip Error Message */}
      {skipError && (
        <div role="alert" className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-3 py-2 text-sm text-[var(--error)]">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{skipError}</span>
        </div>
      )}

      {/* Checklist Items by Category */}
      <div className="mt-5 space-y-4">
        {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
          const categoryLabel = CATEGORY_LABELS[category] || category;
          const isCollapsed = collapsedCategories.has(category);
          const completedInCategory = categoryItems.filter((item) => item.completed).length;
          const totalInCategory = categoryItems.length;
          const allCategoryCompleted = completedInCategory === totalInCategory;

          return (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                aria-expanded={!isCollapsed}
                aria-controls={`category-items-${category}`}
                aria-label={`${categoryLabel} category, ${completedInCategory} of ${totalInCategory} completed. ${isCollapsed ? 'Expand' : 'Collapse'} section`}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors",
                  "hover:bg-[var(--background-hover)]"
                )}
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-foreground-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-foreground-muted" />
                  )}
                  <span className="text-sm font-medium text-foreground">{categoryLabel}</span>
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      allCategoryCompleted
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--background-secondary)] text-foreground-muted"
                    )}
                  >
                    {completedInCategory}/{totalInCategory}
                  </span>
                </div>
              </button>

              {/* Category Items */}
              {!isCollapsed && (
                <div id={`category-items-${category}`} className="space-y-1 pl-2" role="group" aria-label={`${categoryLabel} checklist items`}>
                  {categoryItems.map((item) => {
                    const isSkipping = skippingItems.has(item.id);
                    const isActuallyCompleted = item.completed && !item.skipped;
                    const hasDependencies = item.dependencies.length > 0;
                    const dependenciesMet = item.dependencies.every((dep) =>
                      completedItemIds.has(dep)
                    );
                    const isLocked = hasDependencies && !dependenciesMet && !item.completed;
                    const showTip = expandedTip === item.id && item.tip;

                    return (
                      <div key={item.id}>
                        <div
                          className={cn(
                            "group flex items-center gap-3 rounded-lg p-3 transition-all",
                            item.completed
                              ? "opacity-60"
                              : isLocked
                              ? "opacity-50"
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
                                : isLocked
                                ? "border-[var(--border)] bg-[var(--background-secondary)]"
                                : "border-[var(--border)] group-hover:border-[var(--primary)]"
                            )}
                          >
                            {isActuallyCompleted && <Check className="h-3.5 w-3.5" />}
                            {item.skipped && <SkipForward className="h-3.5 w-3.5" />}
                            {isLocked && <Lock className="h-3 w-3 text-foreground-muted" />}
                          </div>

                          {/* Icon */}
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              item.completed
                                ? "bg-[var(--background-secondary)] text-foreground-muted"
                                : isLocked
                                ? "bg-[var(--background-secondary)] text-foreground-muted"
                                : "bg-[var(--primary)]/10 text-[var(--primary)]"
                            )}
                          >
                            {item.icon}
                          </div>

                          {/* Content */}
                          {item.completed || isLocked ? (
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    item.skipped
                                      ? "text-foreground-muted"
                                      : isLocked
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
                                {isLocked && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background-secondary)] text-foreground-muted">
                                    Locked
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-foreground-muted truncate">
                                {item.description}
                              </p>
                            </div>
                          ) : (
                            <Link href={item.href} className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">
                                  {item.label}
                                </p>
                                {/* Time estimate badge */}
                                <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[var(--background-secondary)] text-foreground-muted">
                                  <Clock className="h-2.5 w-2.5" />
                                  ~{item.estimatedMinutes} min
                                </span>
                              </div>
                              <p className="text-xs text-foreground-muted truncate">
                                {item.description}
                              </p>
                            </Link>
                          )}

                          {/* XP Reward Badge */}
                          {!item.completed && !isLocked && (
                            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-medium">
                              <Zap className="h-3 w-3" />
                              +{item.xpReward}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Tip button */}
                            {item.tip && !item.completed && (
                              <button
                                onClick={() =>
                                  setExpandedTip(expandedTip === item.id ? null : item.id)
                                }
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  showTip
                                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                    : "text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)]"
                                )}
                                aria-label={showTip ? `Hide tip for ${item.label}` : `Show tip for ${item.label}`}
                                aria-expanded={showTip}
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Unskip button for skipped items */}
                            {item.skipped && (
                              <button
                                onClick={() => handleSkip(item.id, true)}
                                disabled={isSkipping}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] rounded transition-colors disabled:opacity-50"
                                aria-label={`Restore ${item.label} to checklist`}
                              >
                                <Undo2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Restore</span>
                              </button>
                            )}

                            {/* Skip button for incomplete items */}
                            {!item.completed && !isLocked && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleSkip(item.id, false);
                                  }}
                                  disabled={isSkipping}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] rounded transition-colors disabled:opacity-50"
                                  aria-label={`Skip ${item.label}`}
                                >
                                  <SkipForward className="h-3 w-3" />
                                  <span className="hidden sm:inline">Skip</span>
                                </button>
                                <Link href={item.href} aria-label={`Go to ${item.label}`}>
                                  <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-[var(--primary)] transition-colors" />
                                </Link>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expanded Tip */}
                        {showTip && (
                          <div className="ml-14 mr-4 mb-2 p-3 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/10">
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                              <p className="text-xs text-foreground-secondary">{item.tip}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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

"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Award, Plus, X, Check, Lock } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { AchievementBadge } from "./achievement-badge";
import type { UnlockedAchievement, BadgeShowcase } from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface BadgeShowcaseDisplayProps {
  showcase: BadgeShowcase;
  achievements: UnlockedAchievement[];
  onEdit?: () => void;
  className?: string;
}

interface BadgeShowcaseEditorProps {
  showcase: BadgeShowcase;
  achievements: UnlockedAchievement[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface BadgeSlotProps {
  achievement?: UnlockedAchievement;
  isEmpty: boolean;
  isLocked: boolean;
  onClick?: () => void;
}

// ============================================================================
// MAIN SHOWCASE DISPLAY
// ============================================================================

export const BadgeShowcaseDisplay = memo(function BadgeShowcaseDisplay({
  showcase,
  achievements,
  onEdit,
  className,
}: BadgeShowcaseDisplayProps) {
  const prefersReducedMotion = useReducedMotion();

  // Get featured achievements
  const featuredAchievements = showcase.featuredAchievementIds
    .map((id) => achievements.find((a) => a.id === id))
    .filter(Boolean) as UnlockedAchievement[];

  // Fill remaining slots
  const slots = Array.from({ length: showcase.maxSlots }, (_, i) => ({
    achievement: featuredAchievements[i],
    isEmpty: !featuredAchievements[i] && i < showcase.maxSlots,
    isLocked: i >= showcase.maxSlots,
  }));

  return (
    <div
      className={cn(
        "badge-showcase rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">Badge Showcase</h3>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {/* Showcase Slots */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {slots.map((slot, index) => (
          <motion.div
            key={index}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
          >
            <BadgeSlot
              achievement={slot.achievement}
              isEmpty={slot.isEmpty}
              isLocked={slot.isLocked}
              onClick={onEdit}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {featuredAchievements.length === 0 && (
        <p className="text-center text-sm text-[var(--foreground-muted)] mt-4">
          Select achievements to showcase your accomplishments
        </p>
      )}
    </div>
  );
});

// ============================================================================
// BADGE SLOT
// ============================================================================

const BadgeSlot = memo(function BadgeSlot({
  achievement,
  isEmpty,
  isLocked,
  onClick,
}: BadgeSlotProps) {
  if (isLocked) {
    return (
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--background-secondary)]">
        <Lock className="h-5 w-5 text-[var(--foreground-muted)]" aria-hidden="true" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <button
        onClick={onClick}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors"
        aria-label="Add achievement to showcase"
      >
        <Plus className="h-5 w-5 text-[var(--foreground-muted)]" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="relative">
      <AchievementBadge
        achievement={{
          slug: achievement!.slug,
          name: achievement!.name,
          description: achievement!.description,
          icon: achievement!.icon,
          category: achievement!.category,
          rarity: achievement!.rarity,
          xpReward: achievement!.xpReward,
          trigger: { type: "manual" as const },
        }}
        isUnlocked={true}
        size="md"
        showName={false}
      />
    </div>
  );
});

// ============================================================================
// BADGE SHOWCASE EDITOR
// ============================================================================

export const BadgeShowcaseEditor = memo(function BadgeShowcaseEditor({
  showcase,
  achievements,
  selectedIds,
  onSelect,
  onDeselect,
  onSave,
  onCancel,
  isOpen,
}: BadgeShowcaseEditorProps) {
  const prefersReducedMotion = useReducedMotion();

  const overlayVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const modalVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
      };

  const canSelectMore = selectedIds.length < showcase.maxSlots;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={overlayVariants.initial}
            animate={overlayVariants.animate}
            exit={overlayVariants.exit}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={modalVariants.initial}
            animate={modalVariants.animate}
            exit={modalVariants.exit}
            transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[80vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="showcase-editor-title"
          >
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap px-5 py-4 border-b border-[var(--card-border)]">
                <div>
                  <h2 id="showcase-editor-title" className="text-lg font-semibold text-[var(--foreground)]">
                    Edit Showcase
                  </h2>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Select up to {showcase.maxSlots} achievements
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  className="rounded-full p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Selected Preview */}
              <div className="px-5 py-3 border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <p className="text-xs text-[var(--foreground-muted)] mb-2">
                  Selected ({selectedIds.length}/{showcase.maxSlots})
                </p>
                <div className="flex items-center gap-2 flex-wrap min-h-[48px]">
                  {selectedIds.map((id) => {
                    const achievement = achievements.find((a) => a.id === id);
                    if (!achievement) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => onDeselect(id)}
                        className="relative group"
                        aria-label={`Remove ${achievement.name}`}
                      >
                        <AchievementBadge
                          achievement={{
                            slug: achievement.slug,
                            name: achievement.name,
                            description: achievement.description,
                            icon: achievement.icon,
                            category: achievement.category,
                            rarity: achievement.rarity,
                            xpReward: achievement.xpReward,
                            trigger: { type: "manual" as const },
                          }}
                          isUnlocked={true}
                          size="sm"
                          showName={false}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4 text-white" />
                        </div>
                      </button>
                    );
                  })}
                  {selectedIds.length === 0 && (
                    <span className="text-sm text-[var(--foreground-muted)]">
                      No achievements selected
                    </span>
                  )}
                </div>
              </div>

              {/* Achievement Grid */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-4 gap-3">
                  {achievements.map((achievement) => {
                    const isSelected = selectedIds.includes(achievement.id);
                    const canSelect = canSelectMore || isSelected;

                    return (
                      <button
                        key={achievement.id}
                        onClick={() => {
                          if (isSelected) {
                            onDeselect(achievement.id);
                          } else if (canSelect) {
                            onSelect(achievement.id);
                          }
                        }}
                        disabled={!canSelect && !isSelected}
                        className={cn(
                          "relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                          isSelected
                            ? "bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]"
                            : canSelect
                              ? "hover:bg-[var(--background-hover)]"
                              : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <AchievementBadge
                          achievement={{
                            slug: achievement.slug,
                            name: achievement.name,
                            description: achievement.description,
                            icon: achievement.icon,
                            category: achievement.category,
                            rarity: achievement.rarity,
                            xpReward: achievement.xpReward,
                            trigger: { type: "manual" as const },
                          }}
                          isUnlocked={true}
                          size="sm"
                          showName={false}
                        />
                        <span className="text-xs text-[var(--foreground-muted)] truncate max-w-full">
                          {achievement.name}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {achievements.length === 0 && (
                  <p className="text-center text-[var(--foreground-muted)] py-8">
                    No achievements unlocked yet
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[var(--card-border)]">
                <button
                  onClick={onCancel}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Save Showcase
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ============================================================================
// HOOK FOR MANAGING SHOWCASE
// ============================================================================

export function useBadgeShowcase(initialSelectedIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => [...prev, id]);
  }, []);

  const handleDeselect = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const openEditor = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const resetSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  return {
    selectedIds,
    isEditorOpen,
    handleSelect,
    handleDeselect,
    openEditor,
    closeEditor,
    resetSelection,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { BadgeShowcaseDisplayProps, BadgeShowcaseEditorProps };

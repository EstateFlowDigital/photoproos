"use client";

import { useState, useTransition, useCallback, useMemo, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { unlockSkill, resetSkillPoints } from "@/lib/actions/gamification";
import type { SkillTreeState, SkillWithStatus } from "@/lib/actions/gamification";
import type { SkillTreeCategory } from "@/lib/gamification/skill-trees";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Lock, Check, Sparkles, RotateCcw, ChevronRight, AlertCircle } from "lucide-react";

interface SkillTreeProps {
  initialState: SkillTreeState;
  className?: string;
}

export function SkillTree({ initialState, className }: SkillTreeProps) {
  const [state, setState] = useState(initialState);
  const [selectedTree, setSelectedTree] = useState<SkillTreeCategory>("marketing");
  const [isPending, startTransition] = useTransition();
  const [lastUnlocked, setLastUnlocked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Track timeout IDs for cleanup
  const unlockAnimationTimeout = useRef<NodeJS.Timeout | null>(null);
  const errorTimeout = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (unlockAnimationTimeout.current) clearTimeout(unlockAnimationTimeout.current);
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, []);

  // Safe tree lookup with fallback
  const currentTree = useMemo(() => {
    const tree = state.trees.find((t) => t.category === selectedTree);
    return tree ?? state.trees[0];
  }, [state.trees, selectedTree]);

  const handleUnlockSkill = useCallback((skillId: string) => {
    setError(null);
    if (errorTimeout.current) clearTimeout(errorTimeout.current);

    startTransition(async () => {
      try {
        const result = await unlockSkill(skillId);
        if (result.success) {
          setLastUnlocked(skillId);
          // Update local state
          setState((prev) => ({
            ...prev,
            availableSkillPoints: result.data.remainingPoints,
            spentSkillPoints: prev.spentSkillPoints + result.data.skill.cost,
            unlockedSkillIds: [...prev.unlockedSkillIds, skillId],
            trees: prev.trees.map((tree) => ({
              ...tree,
              skills: tree.skills.map((skill) =>
                skill.id === skillId
                  ? { ...skill, isUnlocked: true, canUnlock: false }
                  : {
                      ...skill,
                      canUnlock:
                        !skill.isUnlocked &&
                        skill.prerequisiteIds.every(
                          (prereq) =>
                            prev.unlockedSkillIds.includes(prereq) || prereq === skillId
                        ) &&
                        result.data.remainingPoints >= skill.cost,
                    }
              ),
              completion: tree.category === selectedTree
                ? Math.round(
                    ((tree.skills.filter((s) => s.isUnlocked || s.id === skillId).length) /
                      tree.skills.length) *
                      100
                  )
                : tree.completion,
            })),
          }));
          // Clear animation after delay (with cleanup)
          if (unlockAnimationTimeout.current) clearTimeout(unlockAnimationTimeout.current);
          unlockAnimationTimeout.current = setTimeout(() => setLastUnlocked(null), 1500);
        } else {
          setError(result.error || "Failed to unlock skill");
          errorTimeout.current = setTimeout(() => setError(null), 5000);
        }
      } catch {
        setError("Failed to unlock skill. Please try again.");
        errorTimeout.current = setTimeout(() => setError(null), 5000);
      }
    });
  }, [selectedTree]);

  const handleResetSkills = useCallback(() => {
    if (!confirm("Reset all skill points? This will refund all spent points.")) return;

    setError(null);
    if (errorTimeout.current) clearTimeout(errorTimeout.current);

    startTransition(async () => {
      try {
        const result = await resetSkillPoints();
        if (result.success) {
          setState((prev) => ({
            ...prev,
            availableSkillPoints: prev.totalSkillPoints,
            spentSkillPoints: 0,
            unlockedSkillIds: [],
            trees: prev.trees.map((tree) => ({
              ...tree,
              skills: tree.skills.map((skill) => ({
                ...skill,
                isUnlocked: false,
                canUnlock: skill.prerequisiteIds.length === 0 && prev.totalSkillPoints >= skill.cost,
              })),
              completion: 0,
            })),
          }));
        } else {
          setError(result.error || "Failed to reset skills");
          errorTimeout.current = setTimeout(() => setError(null), 5000);
        }
      } catch {
        setError("Failed to reset skills. Please try again.");
        errorTimeout.current = setTimeout(() => setError(null), 5000);
      }
    });
  }, []);

  // Group skills by tier (memoized)
  const skillsByTier = useMemo(() => {
    const grouped: Record<number, SkillWithStatus[]> = {};
    currentTree.skills.forEach((skill) => {
      if (!grouped[skill.tier]) {
        grouped[skill.tier] = [];
      }
      grouped[skill.tier].push(skill);
    });
    return grouped;
  }, [currentTree.skills]);

  return (
    <div className={cn("skill-tree flex flex-col gap-6", className)}>
      {/* Error Message */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-3 py-2 text-sm text-[var(--error)]">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Header with points */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ai)] to-[var(--primary)]">
            <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Skill Trees</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Unlock perks as you level up
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--foreground)]" aria-label={`${state.availableSkillPoints} skill points available`}>
              {state.availableSkillPoints}
            </div>
            <div className="text-xs text-[var(--foreground-muted)]" aria-hidden="true">
              Points Available
            </div>
          </div>
          {state.spentSkillPoints > 0 && (
            <button
              onClick={handleResetSkills}
              disabled={isPending}
              aria-label="Reset all skill points"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:border-[var(--card-border-hover)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tree tabs */}
      <div role="tablist" aria-label="Skill tree categories" className="flex gap-2 border-b border-[var(--card-border)]">
        {state.trees.map((tree) => (
          <button
            key={tree.category}
            role="tab"
            aria-selected={selectedTree === tree.category}
            aria-controls={`tabpanel-${tree.category}`}
            id={`tab-${tree.category}`}
            onClick={() => setSelectedTree(tree.category)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-inset",
              selectedTree === tree.category
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            <span className="text-lg" aria-hidden="true">{tree.icon}</span>
            <span>{tree.name}</span>
            <span
              className={cn(
                "ml-1 rounded-full px-2 py-0.5 text-xs",
                tree.completion === 100
                  ? "bg-[var(--success)]/15 text-[var(--success)]"
                  : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
              )}
              aria-label={`${tree.completion}% complete`}
            >
              {tree.completion}%
            </span>
            {selectedTree === tree.category && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tree description */}
      <div
        role="tabpanel"
        id={`tabpanel-${currentTree.category}`}
        aria-labelledby={`tab-${currentTree.category}`}
        className="flex flex-col gap-6"
      >
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: `${currentTree.color}10` }}
        >
          <p className="text-sm" style={{ color: currentTree.color }}>
            {currentTree.description}
          </p>
        </div>

        {/* Skill tree visualization */}
        <div className="flex flex-col gap-8">
        {[1, 2, 3, 4].map((tier) => {
          const tierSkills = skillsByTier[tier] || [];
          if (tierSkills.length === 0) return null;

          return (
            <div key={tier} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-[var(--card-border)]" />
                <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  Tier {tier}
                </span>
                <div className="h-px flex-1 bg-[var(--card-border)]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {tierSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    treeColor={currentTree.color}
                    onUnlock={() => handleUnlockSkill(skill.id)}
                    isPending={isPending}
                    justUnlocked={lastUnlocked === skill.id}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

interface SkillCardProps {
  skill: SkillWithStatus;
  treeColor: string;
  onUnlock: () => void;
  isPending: boolean;
  justUnlocked: boolean;
  prefersReducedMotion: boolean;
}

const SkillCard = memo(function SkillCard({
  skill,
  treeColor,
  onUnlock,
  isPending,
  justUnlocked,
  prefersReducedMotion,
}: SkillCardProps) {
  const statusLabel = skill.isUnlocked
    ? "Unlocked"
    : skill.canUnlock
    ? "Available to unlock"
    : "Locked - prerequisites required";

  return (
    <motion.article
      className={cn(
        "skill-card relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all",
        skill.isUnlocked && "border-[var(--success)]/30",
        skill.canUnlock && !skill.isUnlocked && "border-[var(--primary)]/30",
        !skill.isUnlocked && !skill.canUnlock && "opacity-60"
      )}
      aria-label={`Skill: ${skill.name} - ${statusLabel}`}
      animate={justUnlocked && !prefersReducedMotion ? { scale: [1, 1.02, 1] } : {}}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {/* Status indicator */}
      <div className="absolute -top-2 -right-2" aria-hidden="true">
        {skill.isUnlocked ? (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-white">
            <Check className="h-3.5 w-3.5" />
          </div>
        ) : !skill.canUnlock ? (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-[var(--foreground-muted)]">
            <Lock className="h-3 w-3" />
          </div>
        ) : null}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all",
            skill.isUnlocked
              ? "bg-[var(--success)]/15"
              : skill.canUnlock
              ? "bg-[var(--primary)]/15"
              : "bg-[var(--background-secondary)]"
          )}
          style={
            skill.isUnlocked
              ? { backgroundColor: `${treeColor}20` }
              : undefined
          }
          aria-hidden="true"
        >
          {skill.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--foreground)]">{skill.name}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                skill.cost === 1 && "bg-[var(--foreground-muted)]/15 text-[var(--foreground-muted)]",
                skill.cost === 2 && "bg-[var(--success)]/15 text-[var(--success)]",
                skill.cost === 3 && "bg-[var(--primary)]/15 text-[var(--primary)]",
                skill.cost === 4 && "bg-[var(--ai)]/15 text-[var(--ai)]"
              )}
              aria-label={`Cost: ${skill.cost} skill points`}
            >
              {skill.cost} pts
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            {skill.description}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: treeColor }}>
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Perk: {skill.perk.description}</span>
          </div>
        </div>
      </div>

      {/* Unlock button */}
      {skill.canUnlock && !skill.isUnlocked && (
        <motion.button
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : undefined}
          onClick={onUnlock}
          disabled={isPending}
          aria-label={isPending ? `Unlocking ${skill.name}...` : `Unlock ${skill.name} for ${skill.cost} skill points`}
          className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
          style={{ backgroundColor: treeColor }}
        >
          {isPending ? "Unlocking..." : "Unlock Skill"}
        </motion.button>
      )}

      {/* Unlocked animation */}
      <AnimatePresence>
        {justUnlocked && !prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 animate-pulse"
              style={{ backgroundColor: `${treeColor}10` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});

// Compact version for dashboard widget
interface SkillTreeWidgetProps {
  state: SkillTreeState;
  className?: string;
}

export function SkillTreeWidget({ state, className }: SkillTreeWidgetProps) {
  return (
    <article
      className={cn("skill-tree-widget rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5", className)}
      aria-labelledby="skill-tree-widget-title"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--ai)]" aria-hidden="true" />
          <h3 id="skill-tree-widget-title" className="font-semibold text-[var(--foreground)]">Skill Trees</h3>
        </div>
        <span
          className="text-sm font-medium text-[var(--primary)]"
          aria-label={`${state.availableSkillPoints} skill points available`}
        >
          {state.availableSkillPoints} pts
        </span>
      </div>

      <div className="space-y-3" role="list" aria-label="Skill tree progress">
        {state.trees.map((tree) => (
          <div key={tree.category} className="flex items-start justify-between gap-4 flex-wrap" role="listitem">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">{tree.icon}</span>
              <span className="text-sm text-[var(--foreground-secondary)]">{tree.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                role="progressbar"
                aria-valuenow={tree.completion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${tree.name} progress: ${tree.completion}%`}
                className="h-1.5 w-16 overflow-x-auto rounded-full bg-[var(--background-secondary)]"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${tree.completion}%`,
                    backgroundColor: tree.color,
                  }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-xs text-[var(--foreground-muted)]" aria-hidden="true">{tree.completion}%</span>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/skills"
        aria-label="Manage skills - view and unlock skills"
        className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-[var(--card-border)] py-2 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:border-[var(--card-border-hover)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
      >
        Manage Skills
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </article>
  );
}

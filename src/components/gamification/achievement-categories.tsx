"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Star,
  Image,
  Send,
  Users,
  DollarSign,
  Flame,
  Heart,
  Trophy,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { AchievementCategoryInfo } from "@/lib/actions/gamification";
import type { AchievementCategory } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface AchievementCategoriesProps {
  categories: AchievementCategoryInfo[];
  onSelectCategory?: (category: AchievementCategory) => void;
  selectedCategory?: AchievementCategory | null;
  className?: string;
}

interface CategoryCardProps {
  category: AchievementCategoryInfo;
  isSelected: boolean;
  onClick?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const categoryIcons: Record<AchievementCategory, typeof Star> = {
  general: Star,
  gallery: Image,
  delivery: Send,
  client: Users,
  revenue: DollarSign,
  streak: Flame,
  social: Heart,
  milestone: Trophy,
};

const categoryColors: Record<AchievementCategory, string> = {
  general: "text-[var(--foreground-muted)] bg-[var(--background-secondary)]",
  gallery: "text-[var(--ai)] bg-[var(--ai)]/15",
  delivery: "text-[var(--success)] bg-[var(--success)]/15",
  client: "text-[var(--primary)] bg-[var(--primary)]/15",
  revenue: "text-[var(--warning)] bg-[var(--warning)]/15",
  streak: "text-[var(--error)] bg-[var(--error)]/15",
  social: "text-pink-500 bg-pink-500/15",
  milestone: "text-[var(--warning)] bg-[var(--warning)]/15",
};

// ============================================================================
// ACHIEVEMENT CATEGORIES BROWSER
// ============================================================================

export const AchievementCategories = memo(function AchievementCategories({
  categories,
  onSelectCategory,
  selectedCategory,
  className,
}: AchievementCategoriesProps) {
  const totalUnlocked = categories.reduce((sum, c) => sum + c.unlockedCount, 0);
  const totalCount = categories.reduce((sum, c) => sum + c.totalCount, 0);
  const totalXp = categories.reduce((sum, c) => sum + c.earnedXp, 0);

  return (
    <div className={cn("achievement-categories", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">{totalUnlocked}</p>
          <p className="text-sm text-[var(--foreground-muted)]">of {totalCount} unlocked</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--warning)]">{totalXp.toLocaleString()}</p>
          <p className="text-sm text-[var(--foreground-muted)]">XP earned</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {totalCount > 0 ? Math.round((totalUnlocked / totalCount) * 100) : 0}%
          </p>
          <p className="text-sm text-[var(--foreground-muted)]">Complete</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.category}
            category={category}
            isSelected={selectedCategory === category.category}
            onClick={onSelectCategory ? () => onSelectCategory(category.category) : undefined}
          />
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// CATEGORY CARD
// ============================================================================

const CategoryCard = memo(function CategoryCard({
  category,
  isSelected,
  onClick,
}: CategoryCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = categoryIcons[category.category];
  const colorClass = categoryColors[category.category];
  const progress = category.totalCount > 0
    ? Math.round((category.unlockedCount / category.totalCount) * 100)
    : 0;

  return (
    <motion.button
      onClick={onClick}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      className={cn(
        "category-card relative rounded-xl border bg-[var(--card)] p-4 text-left transition-all",
        isSelected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
          : "border-[var(--card-border)] hover:border-[var(--primary)]/50"
      )}
    >
      {/* Icon & Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colorClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">{category.name}</h3>
          <p className="text-xs text-[var(--foreground-muted)]">{category.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-4 flex-wrap text-sm mb-1">
          <span className="text-[var(--foreground-muted)]">
            {category.unlockedCount}/{category.totalCount}
          </span>
          <span className="font-medium text-[var(--foreground)]">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* XP */}
      <div className="flex items-start justify-between gap-4 flex-wrap text-xs">
        <span className="flex items-center gap-1 text-[var(--warning)]">
          <Zap className="h-3 w-3" aria-hidden="true" />
          {category.earnedXp.toLocaleString()} XP
        </span>
        {onClick && (
          <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
        )}
      </div>
    </motion.button>
  );
});

// ============================================================================
// CATEGORY FILTER PILLS
// ============================================================================

interface CategoryFilterProps {
  categories: AchievementCategoryInfo[];
  selectedCategory: AchievementCategory | null;
  onSelect: (category: AchievementCategory | null) => void;
  className?: string;
}

export const CategoryFilter = memo(function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn("category-filter flex flex-wrap gap-2", className)}>
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          selectedCategory === null
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
        )}
      >
        All
      </button>
      {categories.map((cat) => {
        const Icon = categoryIcons[cat.category];
        return (
          <button
            key={cat.category}
            onClick={() => onSelect(cat.category)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selectedCategory === cat.category
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {cat.name}
            <span className="text-xs opacity-70">({cat.unlockedCount})</span>
          </button>
        );
      })}
    </div>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { AchievementCategoriesProps, CategoryFilterProps };

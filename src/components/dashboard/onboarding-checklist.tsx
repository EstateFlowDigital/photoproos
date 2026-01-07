"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
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

export function OnboardingChecklist({
  items,
  organizationName = "your business",
  className,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Normalize items to handle both old and new formats
  const normalizedItems = items.map((item) => {
    // Check if it's the new format (has isCompleted) or old format (has completed)
    const isNewFormat = "isCompleted" in item;
    const completed = isNewFormat
      ? (item as ChecklistItemWithIcon).isCompleted
      : (item as ChecklistItem).completed;
    const icon = isNewFormat
      ? ICON_MAP[(item as ChecklistItemWithIcon).icon] || <Check className="h-4 w-4" />
      : (item as ChecklistItem).icon;

    return {
      id: item.id,
      label: item.label,
      description: item.description,
      href: item.href,
      completed,
      icon,
    };
  });

  const completedCount = normalizedItems.filter((item) => item.completed).length;
  const totalCount = normalizedItems.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Don't render until we've loaded the dismissed state
  if (!isLoaded) return null;

  // Don't render if dismissed or all completed
  if (isDismissed || allCompleted) return null;

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
        {normalizedItems.map((item) => (
          <Link
            key={item.id}
            href={item.completed ? "#" : item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg p-3 transition-all",
              item.completed
                ? "cursor-default opacity-60"
                : "hover:bg-[var(--card)] hover:shadow-sm"
            )}
            onClick={(e) => item.completed && e.preventDefault()}
          >
            {/* Checkbox */}
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                item.completed
                  ? "border-[var(--success)] bg-[var(--success)] text-white"
                  : "border-[var(--border)] group-hover:border-[var(--primary)]"
              )}
            >
              {item.completed && <Check className="h-3.5 w-3.5" />}
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

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  item.completed
                    ? "text-foreground-muted line-through"
                    : "text-foreground"
                )}
              >
                {item.label}
              </p>
              <p className="text-xs text-foreground-muted truncate">
                {item.description}
              </p>
            </div>

            {/* Arrow */}
            {!item.completed && (
              <ChevronRight className="h-4 w-4 shrink-0 text-foreground-muted group-hover:text-[var(--primary)] transition-colors" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  type ChecklistItemData,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItem,
  reorderChecklistItems,
  resetChecklistToDefaults,
} from "@/lib/actions/onboarding-checklist";
import {
  Users,
  Images,
  CreditCard,
  Tag,
  Building2,
  Palette,
  Receipt,
  Repeat,
  Check,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CalendarPlus,
  Clock,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Zap,
  Trophy,
  Star,
  Target,
} from "lucide-react";
import Link from "next/link";
import { ONBOARDING_XP_REWARDS } from "@/lib/constants/onboarding";

// ============================================================================
// Types
// ============================================================================

interface CompletionStats {
  total: number;
  completed: number;
  completionRate: number;
  firstIncompleteHref: string | null;
  firstIncompleteLabel: string | null;
}

interface ProgressData {
  completedCount: number;
  totalCount: number;
  progress: number;
  totalXpEarned: number;
  totalXpAvailable: number;
  milestonesReached: string[];
  nextMilestone: { percent: number; bonusXp: number } | null;
  estimatedTimeRemaining: number;
  categorySummary: Record<string, { completed: number; total: number }>;
}

interface OnboardingSettingsClientProps {
  initialItems: ChecklistItemData[];
  completionStats: CompletionStats;
  progressData: ProgressData | null;
}

// ============================================================================
// Icon Map
// ============================================================================

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

const AVAILABLE_ICONS = [
  { value: "users", label: "Users" },
  { value: "images", label: "Images" },
  { value: "credit-card", label: "Credit Card" },
  { value: "tag", label: "Tag" },
  { value: "building-2", label: "Building" },
  { value: "palette", label: "Palette" },
  { value: "receipt", label: "Receipt" },
  { value: "repeat", label: "Repeat" },
  { value: "check", label: "Check" },
  { value: "calendar-plus", label: "Calendar" },
  { value: "clock", label: "Clock" },
  { value: "file-text", label: "Document" },
  { value: "file-invoice", label: "Invoice" },
];

// ============================================================================
// Component
// ============================================================================

export function OnboardingSettingsClient({
  initialItems,
  completionStats,
  progressData,
}: OnboardingSettingsClientProps) {
  const [items, setItems] = useState<ChecklistItemData[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItemData | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Calculate local stats (memoized for performance)
  const enabledCount = useMemo(() => items.filter((item) => item.isEnabled).length, [items]);
  const customCount = useMemo(() => items.filter((item) => item.isCustom).length, [items]);
  const allComplete = completionStats.completionRate === 100;

  // Milestone data (memoized - static array)
  const milestones = useMemo(() => [
    { percent: 25, label: "25%", bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_25 },
    { percent: 50, label: "50%", bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_50 },
    { percent: 75, label: "75%", bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_75 },
    { percent: 100, label: "100%", bonusXp: ONBOARDING_XP_REWARDS.MILESTONE_100 },
  ], []);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleToggle = async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await toggleChecklistItem(itemId);
      if (!result.success) {
        setError(result.error || "Failed to toggle item");
        return;
      }
      if (result.data) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? result.data! : item))
        );
      }
    } catch {
      setError("Failed to toggle item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this checklist item?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await deleteChecklistItem(itemId);
      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setError(result.error || "Failed to delete item");
      }
    } catch {
      setError("Failed to delete item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset to default checklist items? This will remove all custom items."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await resetChecklistToDefaults();
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error || "Failed to reset checklist");
      }
    } catch {
      setError("Failed to reset checklist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = items.findIndex((item) => item.id === draggedItem);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    setItems(newItems);
  };

  const handleDragEnd = async () => {
    if (!draggedItem) return;

    setDraggedItem(null);
    setIsLoading(true);
    setError(null);

    try {
      const itemIds = items.map((item) => item.id);
      const result = await reorderChecklistItems(itemIds);
      if (!result.success) {
        setError(result.error || "Failed to reorder items");
      }
    } catch {
      setError("Failed to reorder items");
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard-based reordering for accessibility
  const handleKeyboardReorder = useCallback(async (itemId: string, direction: "up" | "down") => {
    const currentIndex = items.findIndex((item) => item.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    const [removed] = newItems.splice(currentIndex, 1);
    newItems.splice(newIndex, 0, removed);
    setItems(newItems);

    // Persist the reorder
    setIsLoading(true);
    setError(null);
    try {
      const itemIds = newItems.map((item) => item.id);
      const result = await reorderChecklistItems(itemIds);
      if (!result.success) {
        setError(result.error || "Failed to reorder items");
      }
    } catch {
      setError("Failed to reorder items");
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  const handleSaveItem = async (data: {
    label: string;
    description: string;
    href: string;
    icon: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (editingItem) {
        const result = await updateChecklistItem(editingItem.id, data);
        if (!result.success) {
          setError(result.error || "Failed to update item");
          return;
        }
        if (result.data) {
          setItems((prev) =>
            prev.map((item) => (item.id === editingItem.id ? result.data! : item))
          );
          setEditingItem(null);
        }
      } else {
        const result = await createChecklistItem(data);
        if (!result.success) {
          setError(result.error || "Failed to create item");
          return;
        }
        if (result.data) {
          setItems((prev) => [...prev, result.data!]);
          setShowAddModal(false);
        }
      }
    } catch {
      setError("Failed to save item");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Progress Info */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                allComplete
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--primary)]/10 text-[var(--primary)]"
              )}
            >
              {allComplete ? (
                <Trophy className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {allComplete ? "Setup Complete!" : "Setup Progress"}
              </h3>
              <div className="flex items-center gap-4 text-sm text-foreground-muted">
                <span>
                  {allComplete
                    ? "You've completed all onboarding steps"
                    : `${completionStats.completed} of ${completionStats.total} steps completed`}
                </span>
                {progressData && progressData.estimatedTimeRemaining > 0 && (
                  <span className="flex items-center gap-1 text-foreground-muted">
                    <Clock className="h-3.5 w-3.5" />
                    ~{progressData.estimatedTimeRemaining} min left
                  </span>
                )}
              </div>
              {/* Progress Bar with Milestones */}
              <div className="mt-3">
                <div className="relative h-3 w-64 overflow-x-auto rounded-full bg-[var(--background-secondary)]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      allComplete
                        ? "bg-gradient-to-r from-[var(--success)] to-[var(--success)]"
                        : "bg-gradient-to-r from-[var(--primary)] to-[var(--ai)]"
                    )}
                    style={{ width: `${completionStats.completionRate}%` }}
                  />
                </div>
                {/* Milestone markers */}
                <div className="mt-2 flex justify-between w-64">
                  {milestones.map((m) => {
                    const reached = progressData?.milestonesReached?.includes(m.percent.toString()) || false;
                    return (
                      <div
                        key={m.percent}
                        className={cn(
                          "flex flex-col items-center",
                          reached ? "text-[var(--primary)]" : "text-foreground-muted"
                        )}
                        title={`${m.label} milestone: +${m.bonusXp} XP bonus`}
                      >
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            reached
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--border)] bg-[var(--background-secondary)]"
                          )}
                        >
                          {reached ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Star className="h-2.5 w-2.5" />
                          )}
                        </div>
                        <span className="mt-0.5 text-[10px] font-medium">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Resume Setup Button */}
          {!allComplete && completionStats.firstIncompleteHref && (
            <Link
              href={completionStats.firstIncompleteHref}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Resume Setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-4 gap-4 border-t border-[var(--card-border)] pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--warning)]">
              <Zap className="h-5 w-5" />
              {progressData?.totalXpEarned || 0}
            </div>
            <p className="text-xs text-foreground-muted">XP Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            <p className="text-xs text-foreground-muted">Total Steps</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{enabledCount}</p>
            <p className="text-xs text-foreground-muted">Enabled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{customCount}</p>
            <p className="text-xs text-foreground-muted">Custom</p>
          </div>
        </div>

        {/* Next Milestone Hint */}
        {progressData?.nextMilestone && !allComplete && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-[var(--primary)]/5 p-3 border border-[var(--primary)]/10">
            <Target className="h-5 w-5 text-[var(--primary)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Next milestone: {progressData.nextMilestone.percent}%
              </p>
              <p className="text-xs text-foreground-muted">
                Complete {Math.ceil((progressData.nextMilestone.percent / 100) * items.length) - completionStats.completed} more steps to earn +{progressData.nextMilestone.bonusXp} XP bonus
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-4 text-[var(--error)]">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-[var(--error)]/20 rounded focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-foreground-muted">
          Drag items to reorder. Toggle visibility or add custom steps.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Custom Step
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group flex items-center gap-4 rounded-lg border p-4 transition-all",
              item.isEnabled
                ? "border-[var(--card-border)] bg-[var(--card)]"
                : "border-[var(--card-border)]/50 bg-[var(--card)]/50 opacity-60",
              draggedItem === item.id && "opacity-50 border-[var(--primary)]"
            )}
          >
            {/* Drag handle - supports keyboard reordering with arrow keys */}
            <div
              className="cursor-grab text-foreground-muted hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded"
              aria-label={`Reorder ${item.label}. Use arrow keys to move up or down.`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  handleKeyboardReorder(item.id, "up");
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  handleKeyboardReorder(item.id, "down");
                }
              }}
            >
              <GripVertical className="h-5 w-5" aria-hidden="true" />
            </div>

            {/* Icon */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                item.isEnabled
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "bg-[var(--background-tertiary)] text-foreground-muted"
              )}
            >
              {ICON_MAP[item.icon] || <Check className="h-4 w-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground truncate">
                  {item.label}
                </h3>
                {item.isCustom && (
                  <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                    Custom
                  </span>
                )}
                {item.industries.length > 0 && (
                  <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                    {item.industries.join(", ")}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground-muted truncate">
                {item.description}
              </p>
              <p className="text-xs text-foreground-muted/60 mt-1">
                Links to: {item.href}
              </p>
            </div>

            {/* Actions - always visible for keyboard accessibility */}
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingItem(item)}
                disabled={isLoading}
                className="p-2 rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground focus:bg-[var(--background-hover)] focus:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                aria-label={`Edit ${item.label}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleToggle(item.id)}
                disabled={isLoading}
                className="p-2 rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground focus:bg-[var(--background-hover)] focus:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                aria-label={item.isEnabled ? `Disable ${item.label}` : `Enable ${item.label}`}
              >
                {item.isEnabled ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              {item.isCustom && (
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isLoading}
                  className="p-2 rounded-lg text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)] focus:bg-[var(--error)]/10 focus:text-[var(--error)] focus:outline-none focus:ring-2 focus:ring-[var(--error)] transition-colors"
                  aria-label={`Delete ${item.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Enable/Disable indicator */}
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                item.isEnabled ? "bg-[var(--success)]" : "bg-foreground-muted"
              )}
            />
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-foreground-muted">
            <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No checklist items configured.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-[var(--primary)] hover:underline"
            >
              Add your first step
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <ItemModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// ============================================================================
// Item Modal Component
// ============================================================================

interface ItemModalProps {
  item: ChecklistItemData | null;
  onSave: (data: {
    label: string;
    description: string;
    href: string;
    icon: string;
  }) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

function ItemModal({ item, onSave, onClose, isLoading }: ItemModalProps) {
  const [label, setLabel] = useState(item?.label || "");
  const [description, setDescription] = useState(item?.description || "");
  const [href, setHref] = useState(item?.href || "/");
  const [icon, setIcon] = useState(item?.icon || "check");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ label, description, href, icon });
  };

  const modalTitleId = "modal-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <h2 id={modalTitleId} className="text-lg font-semibold text-foreground">
            {item ? "Edit Checklist Step" : "Add Checklist Step"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div>
            <label htmlFor="checklist-label" className="block text-sm font-medium text-foreground mb-1">
              Label
            </label>
            <input
              id="checklist-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Add your first client"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="checklist-description" className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <input
              id="checklist-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Start building your client database"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Link */}
          <div>
            <label htmlFor="checklist-href" className="block text-sm font-medium text-foreground mb-1">
              Link (URL)
            </label>
            <input
              id="checklist-href"
              type="text"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/clients/new"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Icon */}
          <div>
            <label id="icon-picker-label" className="block text-sm font-medium text-foreground mb-1">
              Icon
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                aria-expanded={showIconPicker}
                aria-haspopup="listbox"
                aria-labelledby="icon-picker-label"
                className="w-full flex items-start justify-between gap-4 flex-wrap rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <div className="flex items-center gap-2">
                  {ICON_MAP[icon] || <Check className="h-4 w-4" />}
                  <span>{AVAILABLE_ICONS.find((i) => i.value === icon)?.label || icon}</span>
                </div>
                {showIconPicker ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showIconPicker && (
                <div
                  role="listbox"
                  aria-label="Select an icon"
                  className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2 shadow-lg z-10"
                >
                  <div className="grid grid-cols-3 gap-1">
                    {AVAILABLE_ICONS.map((iconOption) => (
                      <button
                        key={iconOption.value}
                        type="button"
                        role="option"
                        aria-selected={icon === iconOption.value}
                        onClick={() => {
                          setIcon(iconOption.value);
                          setShowIconPicker(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                          icon === iconOption.value
                            ? "bg-[var(--primary)] text-white"
                            : "hover:bg-[var(--background-hover)] text-foreground"
                        )}
                      >
                        {ICON_MAP[iconOption.value]}
                        <span>{iconOption.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !label || !description || !href}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : item ? "Save Changes" : "Add Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OnboardingSettingsClient;

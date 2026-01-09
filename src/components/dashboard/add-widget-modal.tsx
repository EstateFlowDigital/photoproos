"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type WidgetType, type DashboardWidgetConfig } from "@/lib/dashboard-types";
import {
  WIDGET_REGISTRY,
  WIDGET_CATEGORIES,
  getWidgetsByCategory,
  type WidgetDefinition,
  type WidgetCategory,
} from "@/lib/widget-registry";
import { addWidget, addWidgets } from "@/lib/actions/dashboard";
import { useToast } from "@/components/ui/toast";
import {
  DollarSign,
  Image,
  Users,
  FileText,
  Zap,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  CheckSquare,
  Edit3,
  Cloud,
  Award,
  Gift,
  Share2,
  CheckCircle,
  BarChart2,
  Layout,
  Plus,
  MessageSquare,
  Check,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardWidgetConfig;
}

// ============================================================================
// ICON MAP
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "dollar-sign": DollarSign,
  image: Image,
  users: Users,
  "file-text": FileText,
  zap: Zap,
  calendar: Calendar,
  clock: Clock,
  activity: Activity,
  "alert-circle": AlertCircle,
  "trending-up": TrendingUp,
  "file-check": FileCheck,
  "alert-triangle": AlertTriangle,
  "check-square": CheckSquare,
  "edit-3": Edit3,
  cloud: Cloud,
  award: Award,
  gift: Gift,
  "share-2": Share2,
  "check-circle": CheckCircle,
  "bar-chart-2": BarChart2,
  layout: Layout,
  "message-square": MessageSquare,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Layout;
}

// ============================================================================
// CATEGORY ICON MAP
// ============================================================================

const CATEGORY_ICONS: Record<WidgetCategory, React.ComponentType<{ className?: string }>> = {
  core: BarChart2,
  content: Layout,
  analytics: TrendingUp,
  productivity: CheckSquare,
  engagement: Award,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AddWidgetModal({ isOpen, onClose, config }: AddWidgetModalProps) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState<WidgetCategory>("core");
  const [isAdding, setIsAdding] = React.useState<string | null>(null);
  const [selectedWidgets, setSelectedWidgets] = React.useState<Set<WidgetType>>(new Set());
  const [isAddingMultiple, setIsAddingMultiple] = React.useState(false);

  // Clear selection when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedWidgets(new Set());
    }
  }, [isOpen]);

  // Get widgets that can still be added (respecting maxInstances)
  const getAvailableWidgets = React.useCallback(
    (category: WidgetCategory): WidgetDefinition[] => {
      const categoryWidgets = getWidgetsByCategory(category);

      return categoryWidgets.filter((widgetDef) => {
        if (!widgetDef.maxInstances) return true;

        const existingCount = config.widgets.filter(
          (w) => w.type === widgetDef.type
        ).length;

        return existingCount < widgetDef.maxInstances;
      });
    },
    [config.widgets]
  );

  // Check if a widget can be added
  const canAddWidget = React.useCallback(
    (widgetDef: WidgetDefinition): boolean => {
      if (!widgetDef.maxInstances) return true;

      const existingCount = config.widgets.filter(
        (w) => w.type === widgetDef.type
      ).length;

      return existingCount < widgetDef.maxInstances;
    },
    [config.widgets]
  );

  // Toggle widget selection for multi-add
  const toggleWidgetSelection = (type: WidgetType) => {
    setSelectedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Add a single widget (click without selection mode)
  const handleAddWidget = async (type: WidgetType) => {
    setIsAdding(type);

    try {
      const result = await addWidget(type);

      if (result.success) {
        showToast("Widget added!", "success");
        onClose();
      } else {
        showToast(result.error || "Failed to add widget", "error");
      }
    } catch {
      showToast("Failed to add widget", "error");
    } finally {
      setIsAdding(null);
    }
  };

  // Add all selected widgets
  const handleAddSelectedWidgets = async () => {
    if (selectedWidgets.size === 0) return;

    setIsAddingMultiple(true);

    try {
      const result = await addWidgets(Array.from(selectedWidgets));

      if (result.success && result.data) {
        const count = result.data.length;
        showToast(`${count} widget${count !== 1 ? "s" : ""} added!`, "success");
        setSelectedWidgets(new Set());
        onClose();
      } else {
        showToast(result.error || "Failed to add widgets", "error");
      }
    } catch {
      showToast("Failed to add widgets", "error");
    } finally {
      setIsAddingMultiple(false);
    }
  };

  const availableWidgets = getAvailableWidgets(selectedCategory);
  const allCategoryWidgets = getWidgetsByCategory(selectedCategory);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {WIDGET_CATEGORIES.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category.id];
              const availableCount = getAvailableWidgets(category.id).length;
              const totalCount = getWidgetsByCategory(category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    selectedCategory === category.id
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--background)] text-foreground-secondary hover:text-foreground border border-[var(--card-border)]"
                  )}
                >
                  <CategoryIcon className="h-4 w-4" />
                  {category.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      selectedCategory === category.id
                        ? "bg-white/20"
                        : "bg-[var(--background-secondary)]"
                    )}
                  >
                    {availableCount}/{totalCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Widget Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {allCategoryWidgets.map((widgetDef) => {
              const Icon = getIcon(widgetDef.icon);
              const isAvailable = canAddWidget(widgetDef);
              const isLoading = isAdding === widgetDef.type;
              const isSelected = selectedWidgets.has(widgetDef.type);

              return (
                <div
                  key={widgetDef.type}
                  className={cn(
                    "relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    !isAvailable
                      ? "border-[var(--card-border)] bg-[var(--background)] opacity-50"
                      : isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-hover)]"
                  )}
                >
                  {/* Selection checkbox (top-left) */}
                  {isAvailable && (
                    <button
                      onClick={() => toggleWidgetSelection(widgetDef.type)}
                      disabled={isLoading}
                      className={cn(
                        "absolute -top-2 -left-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--card-border)] bg-[var(--card)] text-foreground-muted hover:border-[var(--primary)]/50"
                      )}
                      aria-label={isSelected ? `Deselect ${widgetDef.label}` : `Select ${widgetDef.label}`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  )}

                  {/* Quick add button (entire card clickable for single add) */}
                  <button
                    onClick={() => {
                      if (!isAvailable || isLoading) return;
                      // If nothing is selected, do quick add; otherwise toggle selection
                      if (selectedWidgets.size === 0) {
                        handleAddWidget(widgetDef.type);
                      } else {
                        toggleWidgetSelection(widgetDef.type);
                      }
                    }}
                    disabled={!isAvailable || isLoading}
                    className="flex flex-1 items-start gap-3 text-left"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        isAvailable
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {isLoading ? (
                        <div
                          className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent"
                          role="status"
                          aria-label={`Adding ${widgetDef.label}`}
                        />
                      ) : (
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <h4 className="text-sm font-semibold text-foreground">
                          {widgetDef.label}
                        </h4>
                        {isAvailable && selectedWidgets.size === 0 && (
                          <Plus className="h-4 w-4 text-foreground-muted" />
                        )}
                        {!isAvailable && (
                          <span className="text-xs text-foreground-muted">Added</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-foreground-muted line-clamp-2">
                        {widgetDef.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded bg-[var(--background)] px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
                          {widgetDef.defaultSize}
                        </span>
                        {widgetDef.allowedSizes.length > 1 && (
                          <span className="text-[10px] text-foreground-muted">
                            Resizable
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {availableWidgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background)]">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                All widgets added!
              </p>
              <p className="mt-1 text-xs text-foreground-muted">
                You've added all available widgets in this category.
              </p>
            </div>
          )}
        </DialogBody>

        {/* Footer with Add Selected button */}
        {selectedWidgets.size > 0 && (
          <DialogFooter className="border-t border-[var(--card-border)] px-6 py-4">
            <div className="flex items-start justify-between gap-4 flex-wrap w-full">
              <button
                onClick={() => setSelectedWidgets(new Set())}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors"
              >
                Clear selection
              </button>
              <Button
                variant="primary"
                onClick={handleAddSelectedWidgets}
                disabled={isAddingMultiple}
              >
                {isAddingMultiple ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {selectedWidgets.size} Widget{selectedWidgets.size !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddWidgetModal;

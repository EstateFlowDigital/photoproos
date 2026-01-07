"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Eye,
  EyeOff,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Images,
  Image,
  Users,
  User,
  Receipt,
  FileText,
  Calculator,
  FileSignature,
  PenTool,
  Calendar,
  CalendarCheck,
  Globe,
  Palette,
  Settings,
  Plug,
  Users2,
  BarChart3,
  FileBarChart,
} from "lucide-react";
import {
  updateWalkthroughState,
  resetHiddenWalkthroughs,
} from "@/lib/actions/walkthrough";
import {
  WALKTHROUGH_CATEGORY_LABELS,
  type WalkthroughPageId,
  type WalkthroughCategory,
  type WalkthroughState,
} from "@/lib/walkthrough-types";
import { toast } from "sonner";

// Icon mapping for walkthrough pages
const WALKTHROUGH_ICONS: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  images: Images,
  image: Image,
  users: Users,
  user: User,
  receipt: Receipt,
  "file-text": FileText,
  calculator: Calculator,
  "file-signature": FileSignature,
  "pen-tool": PenTool,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  globe: Globe,
  palette: Palette,
  settings: Settings,
  plug: Plug,
  "users-2": Users2,
  "bar-chart-3": BarChart3,
  "file-bar-chart": FileBarChart,
};

interface WalkthroughWithPref {
  pageId: WalkthroughPageId;
  label: string;
  description: string;
  icon: string;
  category: WalkthroughCategory;
  state: WalkthroughState;
  dismissedAt: Date | null;
  hiddenAt: Date | null;
}

interface WalkthroughSettingsClientProps {
  walkthroughs: WalkthroughWithPref[];
}

export function WalkthroughSettingsClient({
  walkthroughs,
}: WalkthroughSettingsClientProps) {
  const [items, setItems] = React.useState(walkthroughs);
  const [isResetting, setIsResetting] = React.useState(false);
  const [savingItems, setSavingItems] = React.useState<Set<string>>(new Set());

  // Group walkthroughs by category
  const groupedWalkthroughs = React.useMemo(() => {
    const groups: Record<WalkthroughCategory, WalkthroughWithPref[]> = {
      core: [],
      clients: [],
      financial: [],
      scheduling: [],
      marketing: [],
      settings: [],
    };

    items.forEach((item) => {
      groups[item.category].push(item);
    });

    return groups;
  }, [items]);

  // Count hidden walkthroughs (not dismissed)
  const hiddenCount = items.filter((item) => item.state === "hidden").length;
  const dismissedCount = items.filter(
    (item) => item.state === "dismissed"
  ).length;

  const handleToggle = async (
    pageId: WalkthroughPageId,
    currentState: WalkthroughState
  ) => {
    // Can't toggle dismissed walkthroughs
    if (currentState === "dismissed") {
      toast.error("This walkthrough has been permanently dismissed");
      return;
    }

    const newState: WalkthroughState =
      currentState === "hidden" ? "open" : "hidden";

    // Optimistic update
    setSavingItems((prev) => new Set(prev).add(pageId));
    setItems((prev) =>
      prev.map((item) =>
        item.pageId === pageId
          ? { ...item, state: newState, hiddenAt: newState === "hidden" ? new Date() : null }
          : item
      )
    );

    const result = await updateWalkthroughState(pageId, newState);

    setSavingItems((prev) => {
      const next = new Set(prev);
      next.delete(pageId);
      return next;
    });

    if (!result.success) {
      // Revert on error
      setItems((prev) =>
        prev.map((item) =>
          item.pageId === pageId ? { ...item, state: currentState } : item
        )
      );
      toast.error("Failed to update walkthrough settings");
    } else {
      toast.success(
        newState === "hidden"
          ? "Walkthrough hidden"
          : "Walkthrough restored"
      );
    }
  };

  const handleResetAll = async () => {
    setIsResetting(true);

    const result = await resetHiddenWalkthroughs();

    if (result.success) {
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.state === "hidden"
            ? { ...item, state: "open" as const, hiddenAt: null }
            : item
        )
      );
      toast.success(`Restored ${result.data.count} walkthrough(s)`);
    } else {
      toast.error("Failed to reset walkthroughs");
    }

    setIsResetting(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10">
              <HelpCircle className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-medium text-foreground">Walkthrough Status</p>
              <p className="text-sm text-foreground-muted">
                {items.length - hiddenCount - dismissedCount} visible,{" "}
                {hiddenCount} hidden, {dismissedCount} permanently dismissed
              </p>
            </div>
          </div>

          {hiddenCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              disabled={isResetting}
              className="gap-2"
            >
              <RotateCcw
                className={cn("h-4 w-4", isResetting && "animate-spin")}
              />
              Reset Hidden ({hiddenCount})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Info about dismissed walkthroughs */}
      {dismissedCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
          <div>
            <p className="font-medium text-foreground">
              {dismissedCount} walkthrough(s) permanently dismissed
            </p>
            <p className="text-sm text-foreground-muted">
              Permanently dismissed walkthroughs cannot be restored. They are
              marked below but cannot be toggled back on.
            </p>
          </div>
        </div>
      )}

      {/* Walkthrough Categories */}
      {(Object.entries(groupedWalkthroughs) as [WalkthroughCategory, WalkthroughWithPref[]][]).map(
        ([category, categoryItems]) => {
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {WALKTHROUGH_CATEGORY_LABELS[category]}
                </CardTitle>
                <CardDescription>
                  {getCategoryDescription(category)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {categoryItems.map((item) => (
                  <WalkthroughToggleItem
                    key={item.pageId}
                    item={item}
                    isSaving={savingItems.has(item.pageId)}
                    onToggle={handleToggle}
                  />
                ))}
              </CardContent>
            </Card>
          );
        }
      )}
    </div>
  );
}

interface WalkthroughToggleItemProps {
  item: WalkthroughWithPref;
  isSaving: boolean;
  onToggle: (pageId: WalkthroughPageId, currentState: WalkthroughState) => void;
}

function WalkthroughToggleItem({
  item,
  isSaving,
  onToggle,
}: WalkthroughToggleItemProps) {
  const IconComponent = WALKTHROUGH_ICONS[item.icon] ?? HelpCircle;
  const isDismissed = item.state === "dismissed";
  const isHidden = item.state === "hidden";
  const isVisible = !isDismissed && !isHidden;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-4 py-3 transition-colors",
        isDismissed
          ? "bg-[var(--error)]/5 opacity-60"
          : "hover:bg-[var(--ghost-hover)]"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            isDismissed
              ? "bg-[var(--error)]/10"
              : isVisible
                ? "bg-[var(--primary)]/10"
                : "bg-[var(--border)]"
          )}
        >
          <IconComponent
            className={cn(
              "h-4 w-4",
              isDismissed
                ? "text-[var(--error)]"
                : isVisible
                  ? "text-[var(--primary)]"
                  : "text-foreground-muted"
            )}
          />
        </div>
        <div>
          <p
            className={cn(
              "font-medium",
              isDismissed ? "text-foreground-muted" : "text-foreground"
            )}
          >
            {item.label}
          </p>
          <p className="text-sm text-foreground-muted">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            isDismissed
              ? "text-[var(--error)]"
              : isVisible
                ? "text-[var(--success)]"
                : "text-foreground-muted"
          )}
        >
          {isDismissed ? (
            <>
              <XCircle className="h-3.5 w-3.5" />
              Dismissed
            </>
          ) : isVisible ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Visible
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Hidden
            </>
          )}
        </span>

        {/* Toggle switch */}
        <Switch
          checked={isVisible}
          onCheckedChange={() => onToggle(item.pageId, item.state)}
          disabled={isDismissed || isSaving}
          aria-label={`Toggle ${item.label} walkthrough`}
        />
      </div>
    </div>
  );
}

function getCategoryDescription(category: WalkthroughCategory): string {
  switch (category) {
    case "core":
      return "Essential features for managing your photography business";
    case "clients":
      return "Learn how to manage your client relationships";
    case "financial":
      return "Guides for invoicing, estimates, and contracts";
    case "scheduling":
      return "Calendar and booking management tutorials";
    case "marketing":
      return "Property websites and marketing kit guides";
    case "settings":
      return "Configuration and administration guides";
    default:
      return "";
  }
}

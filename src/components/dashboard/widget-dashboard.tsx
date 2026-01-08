"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  type DashboardWidgetConfig,
  type WidgetInstance,
  type WidgetSize,
  parseWidgetSize,
} from "@/lib/dashboard-types";
import { WIDGET_REGISTRY, type WidgetDefinition } from "@/lib/widget-registry";
import { saveDashboardLayout, removeWidget, updateWidgetSize } from "@/lib/actions/dashboard";
import { Plus, GripVertical, X, Settings2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { MessagesWidget } from "./widgets/messages-widget";

// ============================================================================
// TYPES
// ============================================================================

interface WidgetDashboardProps {
  config: DashboardWidgetConfig;
  dashboardData: DashboardData;
  onAddWidget: () => void;
  className?: string;
}

// Dashboard data passed to widgets
export interface DashboardData {
  stats: {
    revenue: { value: number; change: number | null };
    galleries: { value: number; change: number | null };
    clients: { value: number; change: number | null };
    invoices: { value: number; change: number | null };
  };
  recentGalleries: Array<{
    id: string;
    name: string;
    thumbnailUrl: string | null;
    createdAt: Date;
  }>;
  upcomingBookings: Array<{
    id: string;
    title: string;
    startTime: Date;
    clientName: string | null;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: Date;
  }>;
  overdueInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    clientName: string;
  }>;
  expiringGalleries: Array<{
    id: string;
    name: string;
    expiresAt: Date;
    daysUntilExpiration: number;
  }>;
  calendarEvents: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
  }>;
  gamification?: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    streak: number;
  };
  dailyBonus?: {
    canClaim: boolean;
    streak: number;
  };
  onboarding?: {
    completed: number;
    total: number;
    items: Array<{ id: string; label: string; completed: boolean }>;
  };
  messages?: Array<{
    id: string;
    conversationId: string;
    conversationName: string | null;
    conversationType: string;
    content: string;
    senderName: string;
    senderAvatar: string | null;
    createdAt: Date;
    isUnread: boolean;
  }>;
}

// ============================================================================
// SORTABLE WIDGET ITEM
// ============================================================================

interface SortableWidgetProps {
  widget: WidgetInstance;
  dashboardData: DashboardData;
  isEditing: boolean;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
}

function SortableWidget({
  widget,
  dashboardData,
  isEditing,
  onRemove,
  onResize,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { cols, rows } = parseWidgetSize(widget.size);
  const widgetDef = WIDGET_REGISTRY[widget.type];

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        gridColumn: `span ${cols}`,
        gridRow: `span ${rows}`,
      }}
      className={cn(
        "group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)]",
        "transition-all duration-200",
        isDragging && "opacity-50 ring-2 ring-[var(--primary)] shadow-lg z-50",
        isEditing && "ring-1 ring-[var(--border-hover)]"
      )}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {isEditing && (
            <button
              {...attributes}
              {...listeners}
              className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <h3 className="text-sm font-semibold text-foreground truncate">
            {widgetDef?.label || widget.type}
          </h3>
        </div>

        {isEditing && (
          <div className="flex items-center gap-1">
            {/* Size selector */}
            {widgetDef && widgetDef.allowedSizes.length > 1 && (
              <select
                value={widget.size}
                onChange={(e) => onResize(e.target.value as WidgetSize)}
                aria-label={`Resize ${widgetDef.label} widget`}
                className="h-6 rounded border border-[var(--card-border)] bg-[var(--background)] px-1.5 text-xs text-foreground-secondary hover:border-[var(--border-hover)]"
              >
                {widgetDef.allowedSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            )}
            {/* Remove button */}
            <button
              onClick={onRemove}
              className="flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
              aria-label={`Remove ${widgetDef?.label || 'widget'}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className="p-4">
        <WidgetContent widget={widget} dashboardData={dashboardData} />
      </div>
    </div>
  );
}

// ============================================================================
// WIDGET CONTENT RENDERER
// ============================================================================

interface WidgetContentProps {
  widget: WidgetInstance;
  dashboardData: DashboardData;
}

function WidgetContent({ widget, dashboardData }: WidgetContentProps) {
  const { cols, rows } = parseWidgetSize(widget.size);
  const isCompact = cols === 1 && rows === 1;

  switch (widget.type) {
    case "stats-revenue":
      return (
        <StatWidget
          label="Revenue"
          value={`$${dashboardData.stats.revenue.value.toLocaleString()}`}
          change={dashboardData.stats.revenue.change}
          icon="dollar"
          isCompact={isCompact}
        />
      );

    case "stats-galleries":
      return (
        <StatWidget
          label="Galleries"
          value={dashboardData.stats.galleries.value.toString()}
          change={dashboardData.stats.galleries.change}
          icon="image"
          isCompact={isCompact}
        />
      );

    case "stats-clients":
      return (
        <StatWidget
          label="Clients"
          value={dashboardData.stats.clients.value.toString()}
          change={dashboardData.stats.clients.change}
          icon="users"
          isCompact={isCompact}
        />
      );

    case "stats-invoices":
      return (
        <StatWidget
          label="Invoices"
          value={dashboardData.stats.invoices.value.toString()}
          change={dashboardData.stats.invoices.change}
          icon="file"
          isCompact={isCompact}
        />
      );

    case "quick-actions":
      return <QuickActionsWidget />;

    case "upcoming-bookings":
      return <UpcomingBookingsWidget bookings={dashboardData.upcomingBookings} isCompact={isCompact} />;

    case "recent-galleries":
      return <RecentGalleriesWidget galleries={dashboardData.recentGalleries} />;

    case "recent-activity":
      return <RecentActivityWidget activities={dashboardData.recentActivity} />;

    case "calendar":
      return <CalendarWidget events={dashboardData.calendarEvents} />;

    case "overdue-invoices":
      return <OverdueInvoicesWidget invoices={dashboardData.overdueInvoices} isCompact={isCompact} />;

    case "expiring-galleries":
      return <ExpiringGalleriesWidgetContent galleries={dashboardData.expiringGalleries} isCompact={isCompact} />;

    case "gamification":
      return <GamificationWidget data={dashboardData.gamification} isCompact={isCompact} />;

    case "daily-bonus":
      return <DailyBonusWidget data={dashboardData.dailyBonus} />;

    case "onboarding":
      return <OnboardingWidget data={dashboardData.onboarding} />;

    case "messages":
      return <MessagesWidget messages={dashboardData.messages} isCompact={isCompact} />;

    default:
      return (
        <div className="flex h-full items-center justify-center text-foreground-muted">
          <span className="text-sm">Widget: {widget.type}</span>
        </div>
      );
  }
}

// ============================================================================
// STAT WIDGET
// ============================================================================

interface StatWidgetProps {
  label: string;
  value: string;
  change: number | null;
  icon: string;
  isCompact?: boolean;
}

function StatWidget({ label, value, change, isCompact }: StatWidgetProps) {
  return (
    <div className={cn("flex flex-col", isCompact ? "gap-1" : "gap-2")}>
      <span className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
        {label}
      </span>
      <span className={cn("font-bold text-foreground", isCompact ? "text-xl" : "text-2xl")}>
        {value}
      </span>
      {change !== null && (
        <span
          className={cn(
            "text-xs font-medium",
            change >= 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {change >= 0 ? "+" : ""}
          {change}%
        </span>
      )}
    </div>
  );
}

// ============================================================================
// PLACEHOLDER WIDGETS (to be replaced with actual implementations)
// ============================================================================

const QUICK_ACTIONS = [
  { label: "New Gallery", href: "/galleries/new" },
  { label: "New Booking", href: "/scheduling/new" },
  { label: "New Invoice", href: "/invoices/new" },
  { label: "New Client", href: "/clients/new" },
] as const;

function QuickActionsWidget() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function UpcomingBookingsWidget({
  bookings,
  isCompact,
}: {
  bookings: DashboardData["upcomingBookings"];
  isCompact?: boolean;
}) {
  const displayBookings = isCompact ? bookings.slice(0, 3) : bookings.slice(0, 5);

  if (displayBookings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-foreground-muted text-sm">
        No upcoming bookings
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayBookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{booking.title}</p>
            <p className="text-xs text-foreground-muted">{booking.clientName || "No client"}</p>
          </div>
          <span className="text-xs text-foreground-muted whitespace-nowrap ml-2">
            {new Date(booking.startTime).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecentGalleriesWidget({ galleries }: { galleries: DashboardData["recentGalleries"] }) {
  if (galleries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-foreground-muted text-sm">
        No galleries yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {galleries.slice(0, 4).map((gallery) => (
        <Link
          key={gallery.id}
          href={`/galleries/${gallery.id}`}
          className="aspect-video rounded-lg bg-[var(--background)] overflow-hidden relative group"
        >
          {gallery.thumbnailUrl ? (
            <Image
              src={gallery.thumbnailUrl}
              alt={gallery.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-muted">
              <span className="text-xs truncate px-2">{gallery.name}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

function RecentActivityWidget({ activities }: { activities: DashboardData["recentActivity"] }) {
  if (activities.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-foreground-muted text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-start gap-2">
          <div className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground truncate">{activity.description}</p>
            <p className="text-xs text-foreground-muted">
              {new Date(activity.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarWidget({ events }: { events: DashboardData["calendarEvents"] }) {
  return (
    <div className="flex h-full items-center justify-center text-foreground-muted">
      <div className="text-center">
        <p className="text-sm font-medium">Calendar</p>
        <p className="text-xs">{events.length} events</p>
      </div>
    </div>
  );
}

function OverdueInvoicesWidget({
  invoices,
  isCompact,
}: {
  invoices: DashboardData["overdueInvoices"];
  isCompact?: boolean;
}) {
  if (invoices.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-green-500 text-sm">
        No overdue invoices
      </div>
    );
  }

  const displayInvoices = isCompact ? invoices.slice(0, 2) : invoices.slice(0, 4);

  return (
    <div className="space-y-2">
      {displayInvoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between rounded-lg bg-[var(--error)]/5 px-3 py-2 border border-[var(--error)]/20"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</p>
            <p className="text-xs text-foreground-muted">{invoice.clientName}</p>
          </div>
          <span className="text-sm font-semibold text-[var(--error)]">
            ${invoice.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function ExpiringGalleriesWidgetContent({
  galleries,
  isCompact,
}: {
  galleries: DashboardData["expiringGalleries"];
  isCompact?: boolean;
}) {
  if (galleries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-green-500 text-sm">
        No galleries expiring soon
      </div>
    );
  }

  const displayGalleries = isCompact ? galleries.slice(0, 2) : galleries.slice(0, 4);

  return (
    <div className="space-y-2">
      {displayGalleries.map((gallery) => (
        <div
          key={gallery.id}
          className="flex items-center justify-between rounded-lg bg-[var(--warning)]/5 px-3 py-2 border border-[var(--warning)]/20"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{gallery.name}</p>
            <p className="text-xs text-foreground-muted">
              Expires {new Date(gallery.expiresAt).toLocaleDateString()}
            </p>
          </div>
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            gallery.daysUntilExpiration <= 3
              ? "bg-[var(--error)]/10 text-[var(--error)]"
              : "bg-[var(--warning)]/10 text-[var(--warning)]"
          )}>
            {gallery.daysUntilExpiration}d
          </span>
        </div>
      ))}
    </div>
  );
}

function GamificationWidget({
  data,
  isCompact,
}: {
  data: DashboardData["gamification"];
  isCompact?: boolean;
}) {
  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-foreground-muted text-sm">
        Gamification disabled
      </div>
    );
  }

  const progress = (data.xp / data.xpToNextLevel) * 100;

  return (
    <div className={cn("flex flex-col", isCompact ? "gap-2" : "gap-3")}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Level {data.level}</span>
        <span className="text-xs text-foreground-muted">{data.streak} day streak</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--background)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-foreground-muted">
        {data.xp} / {data.xpToNextLevel} XP
      </span>
    </div>
  );
}

function DailyBonusWidget({ data }: { data: DashboardData["dailyBonus"] }) {
  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="text-2xl" aria-hidden="true">🎁</span>
      <span className="text-sm font-medium text-foreground">
        {data.canClaim ? "Claim Bonus!" : "Claimed Today"}
      </span>
      <span className="text-xs text-foreground-muted">{data.streak} day streak</span>
    </div>
  );
}

function OnboardingWidget({ data }: { data: DashboardData["onboarding"] }) {
  if (!data || data.completed >= data.total) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Getting Started</span>
        <span className="text-xs text-foreground-muted">
          {data.completed}/{data.total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--background)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${(data.completed / data.total) * 100}%` }}
        />
      </div>
      <div className="space-y-1">
        {data.items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-xs">
            <span className={item.completed ? "text-green-500" : "text-foreground-muted"} aria-hidden="true">
              {item.completed ? "✓" : "○"}
            </span>
            <span className={item.completed ? "text-foreground-muted line-through" : "text-foreground"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WidgetDashboard({
  config,
  dashboardData,
  onAddWidget,
  className,
}: WidgetDashboardProps) {
  const { showToast } = useToast();
  const [widgets, setWidgets] = React.useState(config.widgets);
  const [isEditing, setIsEditing] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Update local state when config changes
  React.useEffect(() => {
    setWidgets(config.widgets);
  }, [config.widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = [...widgets];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);

      // Update positions based on new order
      const updatedWidgets = recalculatePositions(newWidgets, config.gridColumns);
      setWidgets(updatedWidgets);

      // Save to server
      setIsSaving(true);
      const result = await saveDashboardLayout(updatedWidgets);
      setIsSaving(false);

      if (!result.success) {
        showToast({ type: "error", message: result.error || "Failed to save layout" });
        setWidgets(config.widgets); // Revert
      }
    }
  };

  const handleRemoveWidget = async (widgetId: string) => {
    const newWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(newWidgets);

    const result = await removeWidget(widgetId);
    if (!result.success) {
      showToast({ type: "error", message: result.error || "Failed to remove widget" });
      setWidgets(config.widgets); // Revert
    }
  };

  const handleResizeWidget = async (widgetId: string, newSize: WidgetSize) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, size: newSize } : w
    );
    const updatedWidgets = recalculatePositions(newWidgets, config.gridColumns);
    setWidgets(updatedWidgets);

    const result = await updateWidgetSize(widgetId, newSize);
    if (!result.success) {
      showToast({ type: "error", message: result.error || "Failed to resize widget" });
      setWidgets(config.widgets); // Revert
    }
  };

  const widgetIds = widgets.map((w) => w.id);
  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            isEditing
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background)] text-foreground-secondary hover:text-foreground border border-[var(--card-border)]"
          )}
        >
          <Settings2 className="h-4 w-4" />
          {isEditing ? "Done" : "Edit"}
        </button>
        {isEditing && (
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </button>
        )}
      </div>

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${config.gridColumns}, minmax(0, 1fr))`,
            }}
          >
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                dashboardData={dashboardData}
                isEditing={isEditing}
                onRemove={() => handleRemoveWidget(widget.id)}
                onResize={(size) => handleResizeWidget(widget.id, size)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget ? (
            <div
              className="rounded-xl border border-[var(--primary)] bg-[var(--card)] shadow-lg opacity-90"
              style={{
                gridColumn: `span ${parseWidgetSize(activeWidget.size).cols}`,
                gridRow: `span ${parseWidgetSize(activeWidget.size).rows}`,
                width: "auto",
                height: "auto",
              }}
            >
              <div className="p-4">
                <span className="text-sm font-medium text-foreground">
                  {WIDGET_REGISTRY[activeWidget.type]?.label || activeWidget.type}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] py-16">
          <p className="text-foreground-muted mb-4">No widgets on your dashboard</p>
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Add Your First Widget
          </button>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 rounded-lg bg-[var(--card)] px-4 py-2 shadow-lg border border-[var(--card-border)]"
        >
          <span className="text-sm text-foreground-muted">Saving...</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Recalculate widget positions after reordering
 */
function recalculatePositions(
  widgets: WidgetInstance[],
  gridColumns: number
): WidgetInstance[] {
  const result: WidgetInstance[] = [];
  let currentRow = 0;
  let currentCol = 0;

  for (const widget of widgets) {
    const { cols, rows } = parseWidgetSize(widget.size);

    // If widget doesn't fit in current row, move to next
    if (currentCol + cols > gridColumns) {
      currentRow++;
      currentCol = 0;
    }

    result.push({
      ...widget,
      position: { x: currentCol, y: currentRow },
    });

    currentCol += cols;

    // If we've filled the row, move to next
    if (currentCol >= gridColumns) {
      currentRow++;
      currentCol = 0;
    }
  }

  return result;
}

export default WidgetDashboard;

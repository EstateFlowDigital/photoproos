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
import { WIDGET_REGISTRY } from "@/lib/widget-registry";
import { saveDashboardLayout, removeWidget, updateWidgetSize } from "@/lib/actions/dashboard";
import { Plus, GripVertical, X, Settings2, Flame, Star, Gift, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { MessagesWidget } from "./widgets/messages-widget";
import { RevenueWidget } from "./widgets/revenue-widget";
import { TodoListWidget } from "./widgets/todo-list-widget";
import { WeatherWidget } from "./widgets/weather-widget";
import { DeadlinesWidget } from "./widgets/deadlines-widget";
import { NotesWidget } from "./widgets/notes-widget";
import { ContractStatusWidget } from "./widgets/contract-status-widget";
import { ClientGrowthWidget } from "./widgets/client-growth-widget";
import { ReferralWidget } from "./referral-widget";
import { LevelBadge, StreakBadge } from "@/components/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface WidgetDashboardProps {
  config: DashboardWidgetConfig;
  dashboardData: DashboardData;
  onAddWidget: () => void;
  className?: string;
}

// Date type that handles serialization from server to client
type SerializedDate = Date | string;

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
    createdAt: SerializedDate;
  }>;
  upcomingBookings: Array<{
    id: string;
    title: string;
    startTime: SerializedDate;
    clientName: string | null;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: SerializedDate;
  }>;
  overdueInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: SerializedDate;
    clientName: string;
  }>;
  expiringGalleries: Array<{
    id: string;
    name: string;
    expiresAt: SerializedDate;
    daysUntilExpiration: number;
  }>;
  calendarEvents: Array<{
    id: string;
    title: string;
    start: SerializedDate;
    end: SerializedDate;
    type: string;
  }>;
  gamification?: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    xpProgress: number;
    streak: number;
    deliveryStreak: number;
    recentAchievementsCount: number;
    activeChallengesCount: number;
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
    createdAt: SerializedDate;
    isUnread: boolean;
  }>;
  // Revenue chart data
  revenueChart?: {
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    yearToDateRevenue: number;
    monthlyGoal?: number;
  };
  // Client growth data
  clientGrowth?: {
    totalClients: number;
    newClientsThisMonth: number;
    newClientsLastMonth: number;
    clientsByMonth?: Array<{ month: string; count: number }>;
  };
  // Todo list data
  todos?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: SerializedDate;
    priority?: "low" | "medium" | "high";
  }>;
  // Deadlines data
  deadlines?: Array<{
    id: string;
    title: string;
    dueDate: SerializedDate;
    type: "gallery" | "contract" | "invoice" | "task" | "project";
    href: string;
    priority?: "low" | "medium" | "high";
  }>;
  // Weather data
  weather?: {
    location?: string;
    forecast?: Array<{
      date: SerializedDate;
      high: number;
      low: number;
      condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy" | "stormy";
      description: string;
    }>;
  };
  // Notes data
  notes?: string;
  // Contract status data
  contracts?: Array<{
    id: string;
    title: string;
    client: string;
    status: "draft" | "sent" | "viewed" | "signed" | "expired";
    sentAt?: SerializedDate;
    signedAt?: SerializedDate;
    expiresAt?: SerializedDate;
  }>;
  // Referral program data
  referral?: {
    referralCode: string | null;
    successfulReferrals: number;
    totalEarnedCents: number;
    pendingReferrals: number;
  };
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

/**
 * Get responsive grid span classes for a widget size
 * - Mobile (1 col): All widgets full width
 * - Tablet (2 cols): Widgets span min(cols, 2)
 * - Desktop (4 cols): Widgets use their full size
 */
function getResponsiveGridSpan(size: WidgetSize): string {
  const { cols, rows } = parseWidgetSize(size);

  // Column spans: mobile=1, tablet=min(cols, 2), desktop=cols
  const colClasses = [
    "col-span-1", // Mobile: always 1 column
    cols >= 2 ? "sm:col-span-2" : "sm:col-span-1", // Tablet: up to 2
    `lg:col-span-${cols}`, // Desktop: actual size
  ];

  // Row spans remain consistent
  const rowClasses = rows > 1 ? [`row-span-${rows}`] : [];

  return cn(...colClasses, ...rowClasses);
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

  const widgetDef = WIDGET_REGISTRY[widget.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)]",
        "transition-all duration-200",
        getResponsiveGridSpan(widget.size),
        isDragging && "opacity-50 ring-2 ring-[var(--primary)] shadow-lg z-50",
        isEditing && "ring-1 ring-[var(--border-hover)]"
      )}
    >
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] px-4 py-2.5">
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
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
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

    case "revenue-chart":
      return dashboardData.revenueChart ? (
        <RevenueWidget
          currentMonthRevenue={dashboardData.revenueChart.currentMonthRevenue}
          previousMonthRevenue={dashboardData.revenueChart.previousMonthRevenue}
          yearToDateRevenue={dashboardData.revenueChart.yearToDateRevenue}
          monthlyGoal={dashboardData.revenueChart.monthlyGoal}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-foreground-muted text-sm">
          Revenue data unavailable
        </div>
      );

    case "client-growth":
      return dashboardData.clientGrowth ? (
        <ClientGrowthWidget
          totalClients={dashboardData.clientGrowth.totalClients}
          newClientsThisMonth={dashboardData.clientGrowth.newClientsThisMonth}
          newClientsLastMonth={dashboardData.clientGrowth.newClientsLastMonth}
          clientsByMonth={dashboardData.clientGrowth.clientsByMonth}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-foreground-muted text-sm">
          Client data unavailable
        </div>
      );

    case "todo-list":
      return (
        <TodoListWidget
          items={dashboardData.todos}
          showCompleted={false}
          maxItems={10}
        />
      );

    case "deadlines":
      return (
        <DeadlinesWidget
          deadlines={dashboardData.deadlines?.map(d => ({
            ...d,
            dueDate: new Date(d.dueDate),
          }))}
          maxItems={5}
        />
      );

    case "weather":
      return (
        <WeatherWidget
          location={dashboardData.weather?.location}
          forecast={dashboardData.weather?.forecast?.map(f => ({
            ...f,
            date: new Date(f.date),
          }))}
        />
      );

    case "notes":
      return (
        <NotesWidget
          initialNotes={dashboardData.notes || ""}
        />
      );

    case "contract-status":
      return (
        <ContractStatusWidget
          contracts={dashboardData.contracts?.map(c => ({
            ...c,
            sentAt: c.sentAt ? new Date(c.sentAt) : undefined,
            signedAt: c.signedAt ? new Date(c.signedAt) : undefined,
            expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined,
          }))}
          maxItems={5}
        />
      );

    case "referral-widget":
      return dashboardData.referral ? (
        <ReferralWidget
          referralCode={dashboardData.referral.referralCode}
          successfulReferrals={dashboardData.referral.successfulReferrals}
          totalEarnedCents={dashboardData.referral.totalEarnedCents}
          pendingReferrals={dashboardData.referral.pendingReferrals}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-foreground-muted text-sm">
          Referral data unavailable
        </div>
      );

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
          className="flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--background)] px-3 py-2"
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
          className="flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--error)]/5 px-3 py-2 border border-[var(--error)]/20"
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
          className="flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--warning)]/5 px-3 py-2 border border-[var(--warning)]/20"
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

  const progress = data.xpProgress || (data.xp / data.xpToNextLevel) * 100;

  // Compact 1x1 view
  if (isCompact) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <LevelBadge level={data.level} size="sm" />
          <StreakBadge count={data.streak} type="login" size="sm" />
        </div>
        <div className="h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-foreground-muted">
          {data.xp.toLocaleString()} / {data.xpToNextLevel.toLocaleString()} XP
        </span>
      </div>
    );
  }

  // Larger view with more details
  return (
    <div className="flex flex-col gap-4">
      {/* Level & XP */}
      <div className="flex items-start justify-between gap-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <LevelBadge level={data.level} size="md" showTitle />
          <div>
            <p className="font-semibold text-foreground">
              {data.xp.toLocaleString()} XP
            </p>
            <p className="text-xs text-foreground-muted">
              {data.xpToNextLevel.toLocaleString()} to level {data.level + 1}
            </p>
          </div>
        </div>
        <StreakBadge count={data.streak} type="login" size="md" />
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-[var(--background-secondary)] p-2">
          <Flame className="h-4 w-4 text-[var(--error)]" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">{data.deliveryStreak || 0}</p>
            <p className="text-xs text-foreground-muted">Delivery streak</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[var(--background-secondary)] p-2">
          <Star className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">{data.recentAchievementsCount || 0}</p>
            <p className="text-xs text-foreground-muted">Achievements</p>
          </div>
        </div>
      </div>

      {/* View All Link */}
      <Link
        href="/achievements"
        className="flex items-center justify-center gap-1 text-sm text-[var(--primary)] hover:underline"
      >
        View Progress
        <Zap className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}

function DailyBonusWidget({ data }: { data: DashboardData["dailyBonus"] }) {
  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          data.canClaim
            ? "bg-[var(--warning)]/15 animate-pulse"
            : "bg-[var(--background-secondary)]"
        )}
      >
        <Gift
          className={cn(
            "h-6 w-6",
            data.canClaim ? "text-[var(--warning)]" : "text-foreground-muted"
          )}
          aria-hidden="true"
        />
      </div>
      <div className="text-center">
        <p className={cn(
          "text-sm font-medium",
          data.canClaim ? "text-[var(--warning)]" : "text-foreground"
        )}>
          {data.canClaim ? "Claim Daily Bonus!" : "Claimed Today"}
        </p>
        <p className="text-xs text-foreground-muted flex items-center justify-center gap-1 mt-1">
          <Flame className="h-3 w-3 text-[var(--error)]" aria-hidden="true" />
          {data.streak} day streak
        </p>
      </div>
      {data.canClaim && (
        <Link
          href="/settings/gamification"
          className="rounded-lg bg-[var(--warning)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[var(--warning)]/90 transition-colors"
        >
          Claim +{Math.min(50 + (data.streak - 1) * 10, 200)} XP
        </Link>
      )}
    </div>
  );
}

function OnboardingWidget({ data }: { data: DashboardData["onboarding"] }) {
  if (!data || data.completed >= data.total) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
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
        showToast(result.error || "Failed to save layout", "error");
        setWidgets(config.widgets); // Revert
      }
    }
  };

  const handleRemoveWidget = async (widgetId: string) => {
    const newWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(newWidgets);

    const result = await removeWidget(widgetId);
    if (!result.success) {
      showToast(result.error || "Failed to remove widget", "error");
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
      showToast(result.error || "Failed to resize widget", "error");
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

      {/* Widget Grid - Responsive: 1 col mobile, 2 tablet, 4 desktop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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
    const { cols } = parseWidgetSize(widget.size);

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

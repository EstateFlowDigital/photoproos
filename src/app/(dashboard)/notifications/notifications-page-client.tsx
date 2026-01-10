"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import type { NotificationData } from "@/lib/actions/notifications";
import type { ActivityData } from "@/lib/types/activity";
import { VirtualList } from "@/components/ui/virtual-list";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notifications";

type TabType = "notifications" | "activity";
type NotificationFilterType = "all" | "payments" | "galleries" | "bookings" | "contracts" | "questionnaires" | "leads" | "system";

const NOTIFICATION_FILTERS: { value: NotificationFilterType; label: string; types: string[] }[] = [
  { value: "all", label: "All", types: [] },
  { value: "payments", label: "Payments", types: ["payment_received", "payment_failed", "invoice_sent", "invoice_paid"] },
  { value: "galleries", label: "Galleries", types: ["gallery_viewed", "gallery_delivered"] },
  { value: "bookings", label: "Bookings", types: ["booking_confirmed", "booking_created", "booking_cancelled", "booking_reminder"] },
  { value: "contracts", label: "Contracts", types: ["contract_signed", "contract_sent"] },
  { value: "questionnaires", label: "Questionnaires", types: ["questionnaire_assigned", "questionnaire_completed", "questionnaire_reminder"] },
  { value: "leads", label: "Leads", types: ["lead_received", "client_added"] },
  { value: "system", label: "System", types: ["system", "invoice_overdue"] },
];

interface NotificationsPageClientProps {
  notifications: NotificationData[];
  unreadCount: number;
  activities: ActivityData[];
}

export function NotificationsPageClient({
  notifications,
  unreadCount: initialUnreadCount,
  activities,
}: NotificationsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>("notifications");
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>("all");

  // Filter notifications based on active filter
  const filteredNotifications = activeFilter === "all"
    ? localNotifications
    : localNotifications.filter((n) => {
        const filter = NOTIFICATION_FILTERS.find((f) => f.value === activeFilter);
        return filter?.types.includes(n.type);
      });

  // Get counts for each filter
  const getFilterCount = (filterValue: NotificationFilterType) => {
    if (filterValue === "all") return localNotifications.filter((n) => !n.read).length;
    const filter = NOTIFICATION_FILTERS.find((f) => f.value === filterValue);
    return localNotifications.filter((n) => !n.read && filter?.types.includes(n.type)).length;
  };

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistic update
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await markNotificationAsRead(notificationId);
      if (!result.success) {
        // Revert on error
        setLocalNotifications(notifications);
        setUnreadCount(initialUnreadCount);
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    startTransition(async () => {
      const result = await markAllNotificationsAsRead();
      if (!result.success) {
        // Revert on error
        setLocalNotifications(notifications);
        setUnreadCount(initialUnreadCount);
      }
      router.refresh();
    });
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  const getActivityLinkUrl = (activity: ActivityData): string | null => {
    if (activity.invoiceId) return `/invoices/${activity.invoiceId}`;
    if (activity.paymentId) return `/payments`;
    if (activity.bookingId) return `/scheduling/${activity.bookingId}`;
    if (activity.contractId) return `/contracts/${activity.contractId}`;
    if (activity.clientId) return `/clients/${activity.clientId}`;
    if (activity.projectId) return `/projects`;
    return null;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        new Date(date).getFullYear() !== now.getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Activity"
        subtitle="Stay updated on what's happening in your business"
      />

      {/* Tab Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg bg-[var(--background-tertiary)] p-1 sm:flex-nowrap">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "notifications"
                ? "bg-[var(--card)] text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <BellIcon className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-medium text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "activity"
                ? "bg-[var(--card)] text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <ClockIcon className="h-4 w-4" />
            Activity Log
          </button>
        </div>

        {activeTab === "notifications" && unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-50"
          >
            <CheckAllIcon className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Type Filters - Only show for notifications tab */}
      {activeTab === "notifications" && (
        <div className="flex items-center gap-2 flex-wrap">
          {NOTIFICATION_FILTERS.map((filter) => {
            const count = getFilterCount(filter.value);
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-tertiary)] text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                }`}
              >
                {filter.label}
                {count > 0 && (
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[var(--primary)]/10 text-[var(--primary)]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
        {activeTab === "notifications" ? (
          <NotificationsList
            notifications={filteredNotifications}
            onNotificationClick={handleNotificationClick}
            formatTimeAgo={formatTimeAgo}
            filterActive={activeFilter !== "all"}
          />
        ) : (
          <ActivityList
            activities={activities}
            getActivityLinkUrl={getActivityLinkUrl}
            formatTimeAgo={formatTimeAgo}
          />
        )}
      </div>

      {/* Settings Link */}
      <div className="text-center">
        <Link
          href="/settings/notifications"
          className="text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          Manage notification preferences
        </Link>
      </div>
    </div>
  );
}

// Notifications List Component
function NotificationsList({
  notifications,
  onNotificationClick,
  formatTimeAgo,
  filterActive = false,
}: {
  notifications: NotificationData[];
  onNotificationClick: (n: NotificationData) => void;
  formatTimeAgo: (date: Date) => string;
  filterActive?: boolean;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-[var(--background-tertiary)] p-4">
          {filterActive ? (
            <FilterIcon className="h-8 w-8 text-foreground-muted" />
          ) : (
            <BellIcon className="h-8 w-8 text-foreground-muted" />
          )}
        </div>
        <h3 className="text-lg font-medium text-foreground">
          {filterActive ? "No matching notifications" : "No notifications yet"}
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          {filterActive
            ? "Try selecting a different filter"
            : "When something important happens, you'll see it here"}
        </p>
      </div>
    );
  }

  return (
    <VirtualList
      items={notifications}
      itemGap={0}
      estimateSize={() => 96}
      className="divide-y divide-[var(--card-border)] max-h-[70vh]"
      getItemKey={(n) => n.id}
      renderItem={(notification) => (
        <button
          key={notification.id}
          onClick={() => onNotificationClick(notification)}
          className={`flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-[var(--background-hover)] ${
            !notification.read ? "bg-[var(--primary)]/5" : ""
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            <NotificationIcon type={notification.type} read={notification.read} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <p
                className={`text-sm ${
                  notification.read
                    ? "font-normal text-foreground"
                    : "font-semibold text-foreground"
                }`}
              >
                {notification.title}
              </p>
              <span className="flex-shrink-0 text-xs text-foreground-muted">
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm text-foreground-muted">
              {notification.message}
            </p>
            {notification.linkUrl && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--primary)]">
                View details
                <ChevronRightIcon className="h-3 w-3" />
              </span>
            )}
          </div>
          {!notification.read && (
            <div className="flex-shrink-0">
              <span className="block h-2 w-2 rounded-full bg-[var(--primary)]" />
            </div>
          )}
        </button>
      )}
    />
  );
}

// Activity List Component
function ActivityList({
  activities,
  getActivityLinkUrl,
  formatTimeAgo,
}: {
  activities: ActivityData[];
  getActivityLinkUrl: (a: ActivityData) => string | null;
  formatTimeAgo: (date: Date) => string;
}) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-[var(--background-tertiary)] p-4">
          <ClockIcon className="h-8 w-8 text-foreground-muted" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          No activity yet
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Your business activity will appear here
        </p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce<
    Record<string, ActivityData[]>
  >((acc, activity) => {
    const date = new Date(activity.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else {
      key = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(activity);
    return acc;
  }, {});

  return (
    <div className="divide-y divide-[var(--card-border)]">
      {Object.entries(groupedActivities).map(([dateLabel, dayActivities]) => (
        <div key={dateLabel}>
          <div className="sticky top-0 bg-[var(--background-tertiary)] px-4 py-2">
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              {dateLabel}
            </span>
          </div>
          <div className="divide-y divide-[var(--card-border)]/50">
            {dayActivities.map((activity) => {
              const linkUrl = getActivityLinkUrl(activity);

              const wrapperProps = {
                key: activity.id,
                className: `flex items-start gap-4 p-4 ${
                  linkUrl
                    ? "hover:bg-[var(--background-hover)] transition-colors cursor-pointer"
                    : ""
                }`,
              };

              if (linkUrl) {
                return (
                  <Link href={linkUrl} {...wrapperProps}>
                    <div className="flex-shrink-0 mt-0.5">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        {activity.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
                        {activity.user && (
                          <>
                            <span>{activity.user.fullName || activity.user.email}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatTimeAgo(activity.createdAt)}</span>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-foreground-muted" />
                  </Link>
                );
              }

              return (
                <div {...wrapperProps}>
                  <div className="flex-shrink-0 mt-0.5">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
                      {activity.user && (
                        <>
                          <span>{activity.user.fullName || activity.user.email}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Notification Icon based on type
function NotificationIcon({ type, read }: { type: string; read: boolean }) {
  const baseClasses = `h-8 w-8 rounded-full flex items-center justify-center`;
  const iconClasses = "h-4 w-4";

  const getStyles = () => {
    switch (type) {
      case "payment_received":
      case "invoice_paid":
        return {
          bg: read ? "bg-[var(--success)]/10" : "bg-[var(--success)]/20",
          icon: <CurrencyIcon className={`${iconClasses} text-[var(--success)]`} />,
        };
      case "payment_failed":
        return {
          bg: read ? "bg-[var(--error)]/10" : "bg-[var(--error)]/20",
          icon: <CurrencyIcon className={`${iconClasses} text-[var(--error)]`} />,
        };
      case "gallery_viewed":
        return {
          bg: read ? "bg-[var(--primary)]/10" : "bg-[var(--primary)]/20",
          icon: <EyeIcon className={`${iconClasses} text-[var(--primary)]`} />,
        };
      case "gallery_delivered":
        return {
          bg: read ? "bg-[var(--success)]/10" : "bg-[var(--success)]/20",
          icon: <PhotoIcon className={`${iconClasses} text-[var(--success)]`} />,
        };
      case "contract_signed":
        return {
          bg: read ? "bg-[var(--success)]/10" : "bg-[var(--success)]/20",
          icon: <CheckIcon className={`${iconClasses} text-[var(--success)]`} />,
        };
      case "contract_sent":
        return {
          bg: read ? "bg-[var(--primary)]/10" : "bg-[var(--primary)]/20",
          icon: <DocumentIcon className={`${iconClasses} text-[var(--primary)]`} />,
        };
      case "booking_created":
      case "booking_confirmed":
        return {
          bg: read ? "bg-[var(--primary)]/10" : "bg-[var(--primary)]/20",
          icon: <CalendarIcon className={`${iconClasses} text-[var(--primary)]`} />,
        };
      case "booking_cancelled":
        return {
          bg: read ? "bg-[var(--error)]/10" : "bg-[var(--error)]/20",
          icon: <CalendarIcon className={`${iconClasses} text-[var(--error)]`} />,
        };
      case "booking_reminder":
        return {
          bg: read ? "bg-[var(--warning)]/10" : "bg-[var(--warning)]/20",
          icon: <ClockIcon className={`${iconClasses} text-[var(--warning)]`} />,
        };
      case "invoice_overdue":
        return {
          bg: read ? "bg-[var(--error)]/10" : "bg-[var(--error)]/20",
          icon: <AlertIcon className={`${iconClasses} text-[var(--error)]`} />,
        };
      case "invoice_sent":
        return {
          bg: read ? "bg-[var(--primary)]/10" : "bg-[var(--primary)]/20",
          icon: <DocumentIcon className={`${iconClasses} text-[var(--primary)]`} />,
        };
      case "questionnaire_assigned":
        return {
          bg: read ? "bg-[var(--primary)]/10" : "bg-[var(--primary)]/20",
          icon: <ClipboardIcon className={`${iconClasses} text-[var(--primary)]`} />,
        };
      case "questionnaire_completed":
        return {
          bg: read ? "bg-[var(--success)]/10" : "bg-[var(--success)]/20",
          icon: <ClipboardIcon className={`${iconClasses} text-[var(--success)]`} />,
        };
      case "questionnaire_reminder":
        return {
          bg: read ? "bg-[var(--warning)]/10" : "bg-[var(--warning)]/20",
          icon: <ClipboardIcon className={`${iconClasses} text-[var(--warning)]`} />,
        };
      case "lead_received":
        return {
          bg: read ? "bg-[var(--primary)]/10" : "bg-[var(--primary)]/20",
          icon: <UserPlusIcon className={`${iconClasses} text-[var(--primary)]`} />,
        };
      case "client_added":
        return {
          bg: read ? "bg-[var(--success)]/10" : "bg-[var(--success)]/20",
          icon: <UserIcon className={`${iconClasses} text-[var(--success)]`} />,
        };
      default:
        return {
          bg: read ? "bg-[var(--foreground-muted)]/10" : "bg-[var(--foreground-muted)]/20",
          icon: <BellIcon className={`${iconClasses} text-foreground-muted`} />,
        };
    }
  };

  const styles = getStyles();
  return <div className={`${baseClasses} ${styles.bg}`}>{styles.icon}</div>;
}

// Activity Icon based on type
function ActivityIcon({ type }: { type: string }) {
  const baseClasses = "h-8 w-8 rounded-full flex items-center justify-center bg-[var(--background-tertiary)]";
  const iconClasses = "h-4 w-4 text-foreground-muted";

  const getIcon = () => {
    switch (type) {
      case "gallery_created":
      case "gallery_delivered":
        return <PhotoIcon className={iconClasses} />;
      case "gallery_viewed":
        return <EyeIcon className={iconClasses} />;
      case "gallery_paid":
      case "payment_received":
        return <CurrencyIcon className={iconClasses} />;
      case "payment_failed":
        return <AlertIcon className={iconClasses} />;
      case "client_added":
        return <UserIcon className={iconClasses} />;
      case "booking_created":
      case "booking_confirmed":
        return <CalendarIcon className={iconClasses} />;
      case "invoice_sent":
      case "invoice_paid":
        return <DocumentIcon className={iconClasses} />;
      case "contract_sent":
      case "contract_signed":
        return <DocumentIcon className={iconClasses} />;
      case "email_sent":
        return <MailIcon className={iconClasses} />;
      case "file_uploaded":
        return <UploadIcon className={iconClasses} />;
      case "file_downloaded":
        return <DownloadIcon className={iconClasses} />;
      case "settings_updated":
        return <SettingsIcon className={iconClasses} />;
      default:
        return <InfoIcon className={iconClasses} />;
    }
  };

  return <div className={baseClasses}>{getIcon()}</div>;
}

// Icons
function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckAllIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 6.5a.75.75 0 0 0-1.5 0v.25h-.75a.75.75 0 0 0 0 1.5h2.5a.25.25 0 0 1 0 .5h-1.5a1.75 1.75 0 0 0-.25 3.483V12.5a.75.75 0 0 0 1.5 0v-.25h.75a.75.75 0 0 0 0-1.5h-2.5a.25.25 0 0 1 0-.5h1.5a1.75 1.75 0 0 0 .25-3.483V6.5Z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.168-.169 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.457-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0L2.5 11.06Zm6-4.56a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0 1 18 5.25v6.5A2.25 2.25 0 0 1 15.75 14H13.5V7A2.5 2.5 0 0 0 11 4.5H8.128a2.252 2.252 0 0 1 1.884-1.488A2.25 2.25 0 0 1 12.25 1h1.5a2.25 2.25 0 0 1 2.238 2.012ZM11.5 3.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v.25h-3v-.25Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M2 7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm2 3.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.046 15.253c-.058.468.172.92.57 1.175A9.953 9.953 0 0 0 8 18c1.982 0 3.83-.578 5.384-1.573.398-.254.628-.707.57-1.175a6.001 6.001 0 0 0-11.908 0ZM16.75 5.75a.75.75 0 0 0-1.5 0v2h-2a.75.75 0 0 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 0-1.5h-2v-2Z" />
    </svg>
  );
}

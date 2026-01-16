"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Icons
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3z" />
      <path d="M9 4v13" />
      <path d="M15 7v13" />
    </svg>
  );
}

// Mini Sparkline Component
function Sparkline({
  data,
  color = "var(--primary)",
  height = 24,
  width = 60,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  openTickets: number;
  totalRevenueCents: number;
  newUsersThisWeek: number;
  totalGalleries: number;
  totalClients: number;
  galleriesDeliveredThisMonth: number;
  revenueThisMonth: number;
  averageRating: number;
  feedbackCount: number;
  pendingFeedback: number;
  userGrowth: number[];
  revenueGrowth: number[];
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: Date;
}

interface AuditLog {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
  targetType?: string;
}

interface Feedback {
  id: string;
  rating?: number;
  comment?: string;
  source: string;
  createdAt: Date;
}

interface SuperAdminDashboardClientProps {
  stats: DashboardStats | null;
  recentTickets: SupportTicket[];
  recentActivity: unknown[];
  recentFeedback: unknown[];
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function SuperAdminDashboardClient({
  stats,
  recentTickets,
  recentActivity,
  recentFeedback,
}: SuperAdminDashboardClientProps) {
  // Safely cast and validate arrays
  const activity = Array.isArray(recentActivity) ? (recentActivity as AuditLog[]) : [];
  const feedback = Array.isArray(recentFeedback) ? (recentFeedback as Feedback[]) : [];

  // Primary stats (big numbers)
  const primaryStats = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      subtext: `+${stats?.newUsersThisWeek || 0} this week`,
      icon: UsersIcon,
      color: "text-[var(--primary)]",
      bgColor: "bg-[var(--primary)]/10",
      sparkline: stats?.userGrowth,
      sparklineColor: "var(--primary)",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenueCents || 0),
      subtext: `${formatCurrency(stats?.revenueThisMonth || 0)} this month`,
      icon: DollarSignIcon,
      color: "text-[var(--success)]",
      bgColor: "bg-[var(--success)]/10",
      sparkline: stats?.revenueGrowth,
      sparklineColor: "var(--success)",
      isFormatted: true,
    },
    {
      label: "Active Today",
      value: stats?.activeUsers || 0,
      subtext: "24h activity",
      icon: ActivityIcon,
      color: "text-[var(--ai)]",
      bgColor: "bg-[var(--ai)]/10",
    },
    {
      label: "Open Tickets",
      value: stats?.openTickets || 0,
      subtext: "Needs attention",
      icon: TicketIcon,
      color:
        (stats?.openTickets || 0) > 5
          ? "text-[var(--warning)]"
          : "text-[var(--foreground-muted)]",
      bgColor:
        (stats?.openTickets || 0) > 5
          ? "bg-[var(--warning)]/10"
          : "bg-[var(--foreground)]/5",
    },
  ];

  // Secondary stats (smaller cards)
  const secondaryStats = [
    {
      label: "Organizations",
      value: stats?.totalOrganizations || 0,
      icon: BuildingIcon,
    },
    {
      label: "Total Galleries",
      value: stats?.totalGalleries || 0,
      icon: ImageIcon,
    },
    {
      label: "Galleries Delivered",
      value: stats?.galleriesDeliveredThisMonth || 0,
      subtext: "This month",
      icon: TrendingUpIcon,
    },
    {
      label: "Avg. Rating",
      value: (stats?.averageRating || 0).toFixed(1),
      subtext: `${stats?.feedbackCount || 0} reviews`,
      icon: StarIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((card) => (
          <div
            key={card.label}
            className={cn(
              "p-5 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  card.bgColor
                )}
              >
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
              {card.sparkline && card.sparkline.length > 0 && (
                <Sparkline data={card.sparkline} color={card.sparklineColor} />
              )}
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)] mb-0.5">
              {card.isFormatted ? card.value : (card.value as number).toLocaleString()}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">
              {card.label}
            </div>
            <div className="text-xs text-[var(--foreground-muted)] mt-0.5">
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "p-4 rounded-lg",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-[var(--foreground-muted)]" />
              <span className="text-xs text-[var(--foreground-muted)]">{stat.label}</span>
            </div>
            <div className="text-xl font-semibold text-[var(--foreground)]">
              {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
            </div>
            {stat.subtext && (
              <div className="text-xs text-[var(--foreground-muted)]">{stat.subtext}</div>
            )}
          </div>
        ))}
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
              <h2 className="font-semibold text-[var(--foreground)]">
                Support Tickets
              </h2>
            </div>
            <Link
              href="/super-admin/support"
              className="text-xs text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentTickets.length > 0 ? (
            <div className="space-y-2">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/super-admin/support/${ticket.id}`}
                  className={cn(
                    "block p-2.5 rounded-lg",
                    "bg-[var(--background-tertiary)]",
                    "hover:bg-[var(--background-elevated)]",
                    "transition-colors"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <span className="font-medium text-[var(--foreground)] text-sm truncate">
                      {ticket.subject}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] flex-shrink-0",
                        ticket.priority === "high" &&
                          "bg-[var(--warning)]/10 text-[var(--warning)]",
                        ticket.priority === "urgent" &&
                          "bg-[var(--error)]/10 text-[var(--error)]"
                      )}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {formatDistanceToNow(new Date(ticket.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[var(--foreground-muted)] text-sm">
              No open tickets
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
            <h2 className="font-semibold text-[var(--foreground)]">
              Recent Activity
            </h2>
          </div>

          {activity.length > 0 ? (
            <div className="space-y-2">
              {activity.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "p-2.5 rounded-lg",
                    "bg-[var(--background-tertiary)]"
                  )}
                >
                  <p className="text-sm text-[var(--foreground)] truncate">
                    {log.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[var(--foreground-muted)] uppercase">
                      {log.actionType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-[var(--foreground-muted)]">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[var(--foreground-muted)] text-sm">
              No recent activity
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
              <h2 className="font-semibold text-[var(--foreground)]">
                Recent Feedback
              </h2>
            </div>
            {stats?.pendingFeedback ? (
              <Badge variant="secondary" className="text-[10px] bg-[var(--warning)]/10 text-[var(--warning)]">
                {stats.pendingFeedback} pending
              </Badge>
            ) : null}
          </div>

          {feedback.length > 0 ? (
            <div className="space-y-2">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-2.5 rounded-lg",
                    "bg-[var(--background-tertiary)]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {item.rating && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={cn(
                              "w-3 h-3",
                              star <= item.rating!
                                ? "text-[var(--warning)] fill-[var(--warning)]"
                                : "text-[var(--foreground-muted)]"
                            )}
                          />
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-[var(--foreground-muted)] uppercase">
                      {item.source.replace(/_/g, " ")}
                    </span>
                  </div>
                  {item.comment && (
                    <p className="text-sm text-[var(--foreground)] line-clamp-2">
                      {item.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[var(--foreground-muted)] text-sm">
              No feedback yet
            </div>
          )}

          <Link
            href="/super-admin/feedback"
            className={cn(
              "block mt-3 py-2 text-center rounded-lg",
              "bg-[var(--background-tertiary)]",
              "hover:bg-[var(--background-elevated)]",
              "text-sm text-[var(--primary)]",
              "transition-colors"
            )}
          >
            View all feedback
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className={cn(
          "p-5 rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <h2 className="font-semibold text-[var(--foreground)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {[
            { href: "/super-admin/users", icon: UsersIcon, label: "Users" },
            { href: "/super-admin/support", icon: TicketIcon, label: "Support" },
            { href: "/super-admin/feedback", icon: MessageSquareIcon, label: "Feedback" },
            { href: "/super-admin/roadmap", icon: MapIcon, label: "Roadmap" },
            { href: "/super-admin/developer", icon: CodeIcon, label: "Developer" },
            { href: "/super-admin/config", icon: SettingsIcon, label: "Config" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "p-3 rounded-lg text-center",
                "bg-[var(--background-tertiary)]",
                "hover:bg-[var(--background-elevated)]",
                "transition-colors"
              )}
            >
              <action.icon className="w-5 h-5 mx-auto mb-1.5 text-[var(--foreground-muted)]" />
              <span className="text-xs font-medium text-[var(--foreground)]">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

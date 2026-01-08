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

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
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
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: Date;
}

interface SuperAdminDashboardClientProps {
  stats: DashboardStats | null;
  recentTickets: SupportTicket[];
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
}: SuperAdminDashboardClientProps) {
  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      subtext: `+${stats?.newUsersThisWeek || 0} this week`,
      icon: UsersIcon,
      color: "text-[var(--primary)]",
      bgColor: "bg-[var(--primary)]/10",
    },
    {
      label: "Active Today",
      value: stats?.activeUsers || 0,
      subtext: "24h activity",
      icon: ActivityIcon,
      color: "text-[var(--success)]",
      bgColor: "bg-[var(--success)]/10",
    },
    {
      label: "Organizations",
      value: stats?.totalOrganizations || 0,
      subtext: "Total studios",
      icon: BuildingIcon,
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

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "p-6 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  card.bgColor
                )}
              >
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
            <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
              {card.value.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">
              {card.label}
            </div>
            <div className="text-xs text-[var(--foreground-muted)] mt-1">
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div
          className={cn(
            "p-6 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Platform Revenue
            </h2>
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "bg-[var(--success)]/10"
              )}
            >
              <DollarSignIcon className="w-5 h-5 text-[var(--success)]" />
            </div>
          </div>

          <div className="text-4xl font-bold text-[var(--foreground)] mb-2">
            {formatCurrency(stats?.totalRevenueCents || 0)}
          </div>
          <p className="text-sm text-[var(--foreground-muted)]">
            Total processed through platform
          </p>

          <div className="flex items-center gap-2 mt-4 text-[var(--success)]">
            <TrendingUpIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Growing steadily</span>
          </div>
        </div>

        {/* Recent Tickets */}
        <div
          className={cn(
            "p-6 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Recent Tickets
            </h2>
            <Link
              href="/super-admin/support"
              className={cn(
                "flex items-center gap-1",
                "text-sm text-[var(--primary)]",
                "hover:underline"
              )}
            >
              View all
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {recentTickets.length > 0 ? (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/super-admin/support/${ticket.id}`}
                  className={cn(
                    "block p-3 rounded-lg",
                    "bg-[var(--background-tertiary)]",
                    "hover:bg-[var(--background-elevated)]",
                    "transition-colors"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-[var(--foreground)] text-sm truncate">
                      {ticket.subject}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs flex-shrink-0",
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
            <div className="text-center py-8 text-[var(--foreground-muted)]">
              No open tickets
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className={cn(
          "p-6 rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/super-admin/users"
            className={cn(
              "p-4 rounded-lg text-center",
              "bg-[var(--background-tertiary)]",
              "hover:bg-[var(--background-elevated)]",
              "transition-colors"
            )}
          >
            <UsersIcon className="w-6 h-6 mx-auto mb-2 text-[var(--foreground-muted)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Manage Users
            </span>
          </Link>
          <Link
            href="/super-admin/support"
            className={cn(
              "p-4 rounded-lg text-center",
              "bg-[var(--background-tertiary)]",
              "hover:bg-[var(--background-elevated)]",
              "transition-colors"
            )}
          >
            <TicketIcon className="w-6 h-6 mx-auto mb-2 text-[var(--foreground-muted)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Support Tickets
            </span>
          </Link>
          <Link
            href="/super-admin/feedback"
            className={cn(
              "p-4 rounded-lg text-center",
              "bg-[var(--background-tertiary)]",
              "hover:bg-[var(--background-elevated)]",
              "transition-colors"
            )}
          >
            <ActivityIcon className="w-6 h-6 mx-auto mb-2 text-[var(--foreground-muted)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              View Feedback
            </span>
          </Link>
          <Link
            href="/super-admin/roadmap"
            className={cn(
              "p-4 rounded-lg text-center",
              "bg-[var(--background-tertiary)]",
              "hover:bg-[var(--background-elevated)]",
              "transition-colors"
            )}
          >
            <BuildingIcon className="w-6 h-6 mx-auto mb-2 text-[var(--foreground-muted)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Roadmap Admin
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

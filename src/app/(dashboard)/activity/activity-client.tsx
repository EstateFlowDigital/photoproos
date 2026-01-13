"use client";

import { useState } from "react";
import {
  Calendar,
  Camera,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  User,
  Clock,
  Filter,
  Download,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ActivityType = "all" | "bookings" | "payments" | "galleries" | "clients" | "messages";

interface Activity {
  id: string;
  type: "booking" | "payment" | "gallery" | "client" | "message" | "invoice" | "contract";
  action: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, string>;
}

// Mock data
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "payment",
    action: "Payment received",
    description: "Sarah Miller paid Invoice #1024",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    user: "System",
    metadata: { amount: "$850.00" },
  },
  {
    id: "2",
    type: "gallery",
    action: "Gallery viewed",
    description: "Johnson Wedding gallery was viewed 15 times",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    metadata: { views: "15" },
  },
  {
    id: "3",
    type: "booking",
    action: "Booking confirmed",
    description: "Corporate Headshots session with Tech Startup Inc",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: "You",
    metadata: { date: "Jan 15, 2025" },
  },
  {
    id: "4",
    type: "message",
    action: "Message sent",
    description: "Sent follow-up email to Emily Davis",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    user: "You",
  },
  {
    id: "5",
    type: "client",
    action: "New client added",
    description: "James Wilson was added as a new client",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: "You",
  },
  {
    id: "6",
    type: "gallery",
    action: "Photos downloaded",
    description: "Mike Chen downloaded 24 photos from Real Estate Shoot",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    metadata: { count: "24" },
  },
  {
    id: "7",
    type: "invoice",
    action: "Invoice sent",
    description: "Invoice #1025 sent to Acme Corp",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    user: "You",
    metadata: { amount: "$1,200.00" },
  },
  {
    id: "8",
    type: "contract",
    action: "Contract signed",
    description: "Wedding contract signed by Lisa Park",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: "Lisa Park",
  },
  {
    id: "9",
    type: "booking",
    action: "Booking completed",
    description: "Portrait session with Thompson Family marked complete",
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    user: "You",
  },
  {
    id: "10",
    type: "payment",
    action: "Payment failed",
    description: "Payment for Invoice #1022 failed",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    user: "System",
    metadata: { reason: "Card declined" },
  },
];

const FILTERS: { value: ActivityType; label: string }[] = [
  { value: "all", label: "All Activity" },
  { value: "bookings", label: "Bookings" },
  { value: "payments", label: "Payments" },
  { value: "galleries", label: "Galleries" },
  { value: "clients", label: "Clients" },
  { value: "messages", label: "Messages" },
];

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  booking: { icon: Calendar, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  payment: { icon: DollarSign, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  gallery: { icon: ImageIcon, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  client: { icon: User, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  message: { icon: Mail, color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10" },
  invoice: { icon: FileText, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
  contract: { icon: FileText, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
};

export function ActivityClient() {
  const [filter, setFilter] = useState<ActivityType>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const filteredActivities = MOCK_ACTIVITIES.filter((activity) => {
    if (filter === "all") return true;
    if (filter === "bookings") return activity.type === "booking";
    if (filter === "payments") return ["payment", "invoice"].includes(activity.type);
    if (filter === "galleries") return activity.type === "gallery";
    if (filter === "clients") return activity.type === "client";
    if (filter === "messages") return activity.type === "message";
    return true;
  });

  // Group activities by day
  const groupedActivities: { date: string; activities: Activity[] }[] = [];
  let currentDate = "";

  filteredActivities.forEach((activity) => {
    const activityDate = new Date(activity.timestamp).toLocaleDateString();
    if (activityDate !== currentDate) {
      currentDate = activityDate;
      groupedActivities.push({ date: activityDate, activities: [activity] });
    } else {
      groupedActivities[groupedActivities.length - 1].activities.push(activity);
    }
  });

  const getDateLabel = (dateString: string) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
          >
            <Filter className="h-4 w-4 text-foreground-muted" />
            {FILTERS.find((f) => f.value === filter)?.label}
            <ChevronDown className="h-4 w-4 text-foreground-muted" />
          </button>
          {showFilterDropdown && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilter(f.value);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--background-hover)] ${
                    f.value === filter ? "text-[var(--primary)]" : "text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Activity Timeline */}
      {filteredActivities.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No activity found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {filter === "all"
              ? "Your activity will appear here"
              : `No ${filter} activity to show`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedActivities.map((group) => (
            <div key={group.date}>
              <h3 className="text-sm font-medium text-foreground-muted mb-3">
                {getDateLabel(group.date)}
              </h3>
              <div className="space-y-3">
                {group.activities.map((activity) => {
                  const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.booking;
                  const Icon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="card p-4 flex items-start gap-4 hover:bg-[var(--background-hover)] transition-colors"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{activity.action}</p>
                          {activity.metadata?.amount && (
                            <span className="text-sm font-medium text-[var(--success)]">
                              {activity.metadata.amount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground-muted truncate">{activity.description}</p>
                        {activity.metadata?.reason && (
                          <p className="text-xs text-[var(--error)] mt-1">{activity.metadata.reason}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-foreground-muted">{formatRelativeTime(activity.timestamp)}</p>
                        {activity.user && (
                          <p className="text-xs text-foreground-muted mt-1">{activity.user}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="text-center">
          <Button variant="outline">Load More Activity</Button>
        </div>
      )}
    </div>
  );
}

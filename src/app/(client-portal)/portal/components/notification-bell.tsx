"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { formatDate } from "./utils";
import type { InvoiceData, QuestionnaireData, GalleryData } from "./types";
import { useHydrated } from "@/hooks/use-hydrated";

interface Activity {
  id: string;
  type: "gallery_delivered" | "invoice_sent" | "invoice_due" | "questionnaire_assigned" | "payment_received";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationBellProps {
  invoices: InvoiceData[];
  questionnaires: QuestionnaireData[];
  galleries: GalleryData[];
}

export function NotificationBell({
  invoices,
  questionnaires,
  galleries,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useHydrated();
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("portal_read_notifications");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Generate activities from data
  const activities = useMemo<Activity[]>(() => {
    if (!hydrated) return [];

    const now = new Date();

    return [
      // Recent galleries (delivered in last 30 days)
      ...galleries
        .filter((g) => g.deliveredAt && g.downloadable)
        .map((g) => ({
          id: `gallery-${g.id}`,
          type: "gallery_delivered" as const,
          title: "Gallery Delivered",
          description: `${g.name} is ready with ${g.photoCount} photos`,
          timestamp: new Date(g.deliveredAt!),
          read: readIds.has(`gallery-${g.id}`),
          actionLabel: "View Gallery",
        })),

      // Unpaid invoices
      ...invoices
        .filter((inv) => inv.status !== "paid" && inv.status !== "draft")
        .map((inv) => ({
          id: `invoice-${inv.id}`,
          type: (inv.dueDate && new Date(inv.dueDate) < now
            ? "invoice_due"
            : "invoice_sent") as "invoice_due" | "invoice_sent",
          title:
            inv.dueDate && new Date(inv.dueDate) < now
              ? "Invoice Overdue"
              : "Invoice Awaiting Payment",
          description: `Invoice ${inv.invoiceNumber} - $${(inv.amount / 100).toFixed(2)}`,
          timestamp: new Date(inv.createdAt),
          read: readIds.has(`invoice-${inv.id}`),
          actionLabel: "Pay Now",
        })),

      // Pending questionnaires
      ...questionnaires
        .filter((q) => q.status !== "completed" && q.status !== "approved")
        .map((q) => ({
          id: `questionnaire-${q.id}`,
          type: "questionnaire_assigned" as const,
          title: "Questionnaire Required",
          description: q.templateName,
          timestamp: new Date(q.createdAt),
          read: readIds.has(`questionnaire-${q.id}`),
          actionUrl: `/portal/questionnaires/${q.id}`,
          actionLabel: q.startedAt ? "Continue" : "Start",
        })),

      // Paid invoices (last 30 days)
      ...invoices
        .filter((inv) => inv.status === "paid" && inv.paidAt)
        .map((inv) => ({
          id: `payment-${inv.id}`,
          type: "payment_received" as const,
          title: "Payment Confirmed",
          description: `Invoice ${inv.invoiceNumber} has been paid`,
          timestamp: new Date(inv.paidAt!),
          read: readIds.has(`payment-${inv.id}`),
        })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [galleries, invoices, questionnaires, readIds, hydrated]);

  const unreadCount = useMemo(() => activities.filter((a) => !a.read).length, [activities]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark all as read
  const markAllAsRead = () => {
    const newReadIds = new Set(activities.map((a) => a.id));
    setReadIds(newReadIds);
    localStorage.setItem(
      "portal_read_notifications",
      JSON.stringify(Array.from(newReadIds))
    );
  };

  // Mark single as read
  const markAsRead = (id: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    localStorage.setItem(
      "portal_read_notifications",
      JSON.stringify(Array.from(newReadIds))
    );
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--card-border)] hover:text-[var(--foreground)]"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--error)] px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
            <h3 className="font-semibold text-[var(--foreground)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary)]/80"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Activity List */}
          <div className="max-h-[400px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="mx-auto h-8 w-8 text-[var(--foreground-muted)]" />
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  No notifications yet
                </p>
              </div>
            ) : (
              activities.slice(0, 20).map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onRead={() => markAsRead(activity.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Activity Item Component
interface ActivityItemProps {
  activity: Activity;
  onRead: () => void;
}

function ActivityItem({ activity, onRead }: ActivityItemProps) {
  const iconConfig = {
    gallery_delivered: {
      icon: <ImageIcon className="h-4 w-4" />,
      bg: "bg-[var(--success)]/10",
      text: "text-[var(--success)]",
    },
    invoice_sent: {
      icon: <ReceiptIcon className="h-4 w-4" />,
      bg: "bg-[var(--primary)]/10",
      text: "text-[var(--primary)]",
    },
    invoice_due: {
      icon: <AlertIcon className="h-4 w-4" />,
      bg: "bg-[var(--error)]/10",
      text: "text-[var(--error)]",
    },
    questionnaire_assigned: {
      icon: <ClipboardIcon className="h-4 w-4" />,
      bg: "bg-[var(--warning)]/10",
      text: "text-[var(--warning)]",
    },
    payment_received: {
      icon: <CheckIcon className="h-4 w-4" />,
      bg: "bg-[var(--success)]/10",
      text: "text-[var(--success)]",
    },
  };

  const config = iconConfig[activity.type];

  return (
    <div
      className={`flex gap-3 border-b border-[var(--card-border)] px-4 py-3 transition-colors last:border-b-0 ${
        activity.read ? "bg-transparent" : "bg-[var(--primary)]/5"
      }`}
      onClick={onRead}
    >
      {/* Icon */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.text}`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={`text-sm font-medium ${
                activity.read ? "text-[var(--foreground-secondary)]" : "text-[var(--foreground)]"
              }`}
            >
              {activity.title}
            </p>
            <p className="text-sm text-[var(--foreground-muted)] truncate">
              {activity.description}
            </p>
          </div>
          {!activity.read && (
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Helper: Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// Icons
function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

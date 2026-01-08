"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, AlertTriangle, Shield, X } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ============================================================================
// TYPES
// ============================================================================

export type StreakNotificationType =
  | "warning"      // Streak at risk (hasn't logged in yet today)
  | "broken"       // Streak was broken
  | "saved"        // Streak was saved by freeze
  | "protected";   // Streak freeze used automatically

export interface StreakNotificationData {
  id: string;
  type: StreakNotificationType;
  streakType: "login" | "delivery";
  streakCount: number;
  message: string;
  showAt?: Date;
}

interface StreakNotificationProps {
  notification: StreakNotificationData;
  onDismiss: (id: string) => void;
}

// ============================================================================
// NOTIFICATION MESSAGES
// ============================================================================

const notificationConfig: Record<
  StreakNotificationType,
  {
    icon: typeof Flame;
    iconColor: string;
    bgColor: string;
    borderColor: string;
    title: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-[var(--warning)]",
    bgColor: "bg-[var(--warning)]/10",
    borderColor: "border-[var(--warning)]/30",
    title: "Streak at Risk!",
  },
  broken: {
    icon: Flame,
    iconColor: "text-[var(--error)]",
    bgColor: "bg-[var(--error)]/10",
    borderColor: "border-[var(--error)]/30",
    title: "Streak Lost",
  },
  saved: {
    icon: Shield,
    iconColor: "text-[var(--ai)]",
    bgColor: "bg-[var(--ai)]/10",
    borderColor: "border-[var(--ai)]/30",
    title: "Streak Protected!",
  },
  protected: {
    icon: Shield,
    iconColor: "text-[var(--success)]",
    bgColor: "bg-[var(--success)]/10",
    borderColor: "border-[var(--success)]/30",
    title: "Streak Freeze Used",
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StreakNotification({ notification, onDismiss }: StreakNotificationProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 8000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: -20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.95 },
      };

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "streak-notification relative flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm",
        config.bgColor,
        config.borderColor,
        "min-w-[300px] max-w-[400px]"
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0", config.iconColor)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p className={cn("text-sm font-semibold", config.iconColor)}>
          {config.title}
        </p>
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
          {notification.message}
        </p>
        {notification.streakCount > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
            <span className="text-xs text-[var(--foreground-muted)]">
              {notification.streakType === "login" ? "Login" : "Delivery"} streak: {notification.streakCount} day
              {notification.streakCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(notification.id)}
        className="absolute right-2 top-2 rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// NOTIFICATION CONTAINER
// ============================================================================

interface StreakNotificationContainerProps {
  notifications: StreakNotificationData[];
  onDismiss: (id: string) => void;
  position?: "top-right" | "top-center" | "bottom-right";
}

export function StreakNotificationContainer({
  notifications,
  onDismiss,
  position = "top-right",
}: StreakNotificationContainerProps) {
  const positionClasses = {
    "top-right": "fixed top-4 right-4 z-50",
    "top-center": "fixed top-4 left-1/2 -translate-x-1/2 z-50",
    "bottom-right": "fixed bottom-4 right-4 z-50",
  };

  return (
    <div
      className={cn(positionClasses[position], "flex flex-col gap-3")}
      role="region"
      aria-label="Streak notifications"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <StreakNotification
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// HOOK FOR MANAGING STREAK NOTIFICATIONS
// ============================================================================

export function useStreakNotifications() {
  const [notifications, setNotifications] = useState<StreakNotificationData[]>([]);

  const addNotification = useCallback((data: Omit<StreakNotificationData, "id">) => {
    const id = `streak-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((prev) => [...prev, { ...data, id }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper to create common notification types
  const showStreakWarning = useCallback(
    (streakType: "login" | "delivery", streakCount: number) => {
      addNotification({
        type: "warning",
        streakType,
        streakCount,
        message:
          streakType === "login"
            ? "You haven't logged in yet today. Log in to keep your streak!"
            : "You haven't made a delivery today. Complete one to keep your streak!",
      });
    },
    [addNotification]
  );

  const showStreakBroken = useCallback(
    (streakType: "login" | "delivery", previousStreak: number) => {
      addNotification({
        type: "broken",
        streakType,
        streakCount: 0,
        message: `Your ${previousStreak}-day ${streakType} streak has ended. Start a new one today!`,
      });
    },
    [addNotification]
  );

  const showStreakProtected = useCallback(
    (streakType: "login" | "delivery", streakCount: number, freezesRemaining: number) => {
      addNotification({
        type: "protected",
        streakType,
        streakCount,
        message: `Your ${streakType} streak was saved! You have ${freezesRemaining} freeze${
          freezesRemaining !== 1 ? "s" : ""
        } remaining.`,
      });
    },
    [addNotification]
  );

  const showStreakSaved = useCallback(
    (streakType: "login" | "delivery", streakCount: number) => {
      addNotification({
        type: "saved",
        streakType,
        streakCount,
        message: `Your ${streakCount}-day ${streakType} streak is still going strong!`,
      });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    showStreakWarning,
    showStreakBroken,
    showStreakProtected,
    showStreakSaved,
  };
}

// ============================================================================
// INLINE STREAK WARNING COMPONENT
// ============================================================================

interface StreakWarningBannerProps {
  streakType: "login" | "delivery";
  streakCount: number;
  hoursRemaining?: number;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function StreakWarningBanner({
  streakType,
  streakCount,
  hoursRemaining,
  onAction,
  actionLabel = "Take Action",
  className,
}: StreakWarningBannerProps) {
  if (streakCount === 0) return null;

  return (
    <div
      className={cn(
        "streak-warning-banner flex items-center justify-between gap-4 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-3",
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Your {streakCount}-day {streakType} streak is at risk!
          </p>
          {hoursRemaining !== undefined && (
            <p className="text-xs text-[var(--foreground-muted)]">
              {hoursRemaining > 0
                ? `${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""} left to save it`
                : "Ends today!"}
            </p>
          )}
        </div>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="shrink-0 rounded-lg bg-[var(--warning)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--warning)] focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

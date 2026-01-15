"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from "lucide-react";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

interface UseAutoSaveOptions {
  /** Content to auto-save */
  content: unknown;
  /** Save function */
  onSave: () => Promise<boolean>;
  /** Debounce delay in ms (default: 2000 = 2 seconds) */
  debounceDelay?: number;
  /** Auto-save interval in ms (default: 30000 = 30 seconds) */
  intervalDelay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook for auto-saving content
 * - Debounced saves when content changes
 * - Periodic saves at interval
 * - Offline detection
 */
export function useAutoSave({
  content,
  onSave,
  debounceDelay = 2000,
  intervalDelay = 30000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const contentRef = useRef(content);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Track content changes
  const hasChanges = useRef(false);

  // Update content ref and mark as changed
  useEffect(() => {
    if (JSON.stringify(contentRef.current) !== JSON.stringify(content)) {
      contentRef.current = content;
      hasChanges.current = true;
    }
  }, [content]);

  // Perform save
  const performSave = useCallback(async () => {
    if (!enabled || isSavingRef.current || !hasChanges.current) return;

    if (!isOnline) {
      setStatus("offline");
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");

    try {
      const success = await onSave();
      if (success) {
        setStatus("saved");
        setLastSaved(new Date());
        hasChanges.current = false;
        // Reset to idle after a moment
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, isOnline, onSave]);

  // Debounced save on content change
  useEffect(() => {
    if (!enabled || !hasChanges.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, debounceDelay, enabled, performSave]);

  // Periodic save interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      if (hasChanges.current) {
        performSave();
      }
    }, intervalDelay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalDelay, performSave]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (status === "offline") {
        setStatus("idle");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [status]);

  // Force save function
  const forceSave = useCallback(() => {
    hasChanges.current = true;
    performSave();
  }, [performSave]);

  return {
    status,
    lastSaved,
    isOnline,
    forceSave,
  };
}

/**
 * Auto-save status indicator component
 */
export function AutoSaveIndicator({
  status,
  lastSaved,
  className,
}: {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  className?: string;
}) {
  const statusConfig: Record<
    AutoSaveStatus,
    { icon: React.ElementType; text: string; className: string }
  > = {
    idle: {
      icon: Cloud,
      text: "Auto-save enabled",
      className: "text-[var(--foreground-muted)]",
    },
    saving: {
      icon: Loader2,
      text: "Saving...",
      className: "text-[var(--primary)]",
    },
    saved: {
      icon: Check,
      text: "Saved",
      className: "text-green-500",
    },
    error: {
      icon: AlertCircle,
      text: "Save failed",
      className: "text-red-500",
    },
    offline: {
      icon: CloudOff,
      text: "Offline",
      className: "text-yellow-500",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Format last saved time
  const lastSavedText = lastSaved
    ? `Last saved ${formatRelativeTime(lastSaved)}`
    : null;

  return (
    <div
      className={cn("flex items-center gap-1.5 text-xs", config.className, className)}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn(
          "w-3.5 h-3.5",
          status === "saving" && "animate-spin"
        )}
        aria-hidden="true"
      />
      <span>{config.text}</span>
      {lastSavedText && status === "idle" && (
        <span className="text-[var(--foreground-muted)]">· {lastSavedText}</span>
      )}
    </div>
  );
}

/**
 * Format relative time for display
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

/**
 * Compact auto-save badge
 */
export function AutoSaveBadge({
  status,
  className,
}: {
  status: AutoSaveStatus;
  className?: string;
}) {
  if (status === "idle") return null;

  const config: Record<
    Exclude<AutoSaveStatus, "idle">,
    { icon: React.ElementType; text: string; bgClass: string; textClass: string }
  > = {
    saving: {
      icon: Loader2,
      text: "Saving",
      bgClass: "bg-[var(--primary)]/10",
      textClass: "text-[var(--primary)]",
    },
    saved: {
      icon: Check,
      text: "Saved",
      bgClass: "bg-green-500/10",
      textClass: "text-green-500",
    },
    error: {
      icon: AlertCircle,
      text: "Error",
      bgClass: "bg-red-500/10",
      textClass: "text-red-500",
    },
    offline: {
      icon: CloudOff,
      text: "Offline",
      bgClass: "bg-yellow-500/10",
      textClass: "text-yellow-500",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        c.bgClass,
        c.textClass,
        className
      )}
      role="status"
    >
      <Icon
        className={cn("w-3 h-3", status === "saving" && "animate-spin")}
        aria-hidden="true"
      />
      {c.text}
    </span>
  );
}

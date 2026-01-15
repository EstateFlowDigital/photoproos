"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  updatePresence,
  getActiveEditors,
  removePresence,
} from "@/lib/actions/marketing-cms";
import type { CMSPresence } from "@prisma/client";
import { Users } from "lucide-react";

interface ActiveEditorsProps {
  /** Entity type (e.g., "MarketingPage", "FAQ") */
  entityType: string;
  /** Entity ID */
  entityId: string;
  /** Currently active field (optional) */
  activeField?: string;
  /** Heartbeat interval in ms (default: 15000 = 15 seconds) */
  heartbeatInterval?: number;
  /** Polling interval for checking other editors (default: 10000 = 10 seconds) */
  pollInterval?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Display active editors with avatars and names
 */
export function ActiveEditors({
  entityType,
  entityId,
  activeField,
  heartbeatInterval = 15000,
  pollInterval = 10000,
  className,
}: ActiveEditorsProps) {
  const [editors, setEditors] = useState<CMSPresence[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  // Update own presence (heartbeat)
  const sendHeartbeat = useCallback(async () => {
    await updatePresence(entityType, entityId, activeField);
  }, [entityType, entityId, activeField]);

  // Fetch other active editors
  const fetchEditors = useCallback(async () => {
    const result = await getActiveEditors(entityType, entityId);
    if (result.success && result.data) {
      setEditors(result.data);
    }
  }, [entityType, entityId]);

  // Send heartbeat and fetch editors on mount and interval
  useEffect(() => {
    // Initial calls
    sendHeartbeat();
    fetchEditors();

    // Set up intervals
    const heartbeatTimer = setInterval(sendHeartbeat, heartbeatInterval);
    const pollTimer = setInterval(fetchEditors, pollInterval);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(pollTimer);
      // Remove presence when leaving
      removePresence(entityType, entityId);
    };
  }, [
    entityType,
    entityId,
    heartbeatInterval,
    pollInterval,
    sendHeartbeat,
    fetchEditors,
  ]);

  // Update active field in presence when it changes
  useEffect(() => {
    if (activeField !== undefined) {
      sendHeartbeat();
    }
  }, [activeField, sendHeartbeat]);

  // Don't render if no other editors
  if (editors.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Avatar stack */}
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {editors.slice(0, 3).map((editor) => (
            <div
              key={editor.id}
              className="relative"
              title={editor.userName}
            >
              {editor.userAvatar ? (
                <img
                  src={editor.userAvatar}
                  alt={editor.userName}
                  className="w-7 h-7 rounded-full border-2 border-[var(--card)]"
                  style={{ borderColor: editor.userColor || undefined }}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full border-2 border-[var(--card)] flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: editor.userColor || "#6b7280" }}
                >
                  {editor.userName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Active indicator dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--card)]"
                aria-hidden="true"
              />
            </div>
          ))}
          {editors.length > 3 && (
            <div className="w-7 h-7 rounded-full border-2 border-[var(--card)] bg-[var(--background-elevated)] flex items-center justify-center text-xs font-medium text-[var(--foreground-muted)]">
              +{editors.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs text-[var(--foreground-muted)]">
          {editors.length === 1
            ? "1 editor"
            : `${editors.length} editors`}
        </span>
      </div>

      {/* Tooltip with editor details */}
      {showTooltip && (
        <div
          className={cn(
            "absolute top-full left-0 mt-2 z-50",
            "p-3 rounded-lg shadow-xl",
            "bg-[var(--card)] border border-[var(--border)]",
            "min-w-[200px]",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--foreground-muted)] mb-2 pb-2 border-b border-[var(--border)]">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Also editing this page</span>
          </div>
          <ul className="space-y-2">
            {editors.map((editor) => (
              <li key={editor.id} className="flex items-center gap-2">
                {editor.userAvatar ? (
                  <img
                    src={editor.userAvatar}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: editor.userColor || "#6b7280" }}
                  >
                    {editor.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {editor.userName}
                  </p>
                  {editor.activeField && (
                    <p className="text-xs text-[var(--foreground-muted)] truncate">
                      Editing: {editor.activeField}
                    </p>
                  )}
                </div>
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version showing just avatar count
 */
export function ActiveEditorsCompact({
  entityType,
  entityId,
  className,
}: {
  entityType: string;
  entityId: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const result = await getActiveEditors(entityType, entityId);
      if (result.success && result.data) {
        setCount(result.data.length);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000);

    return () => clearInterval(interval);
  }, [entityType, entityId]);

  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full",
        "bg-green-500/10 text-green-500 text-xs font-medium",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      <span>{count} {count === 1 ? "editor" : "editors"}</span>
    </div>
  );
}

/**
 * Hook to manage presence for a component
 */
export function usePresence(
  entityType: string,
  entityId: string,
  options?: {
    heartbeatInterval?: number;
  }
) {
  const heartbeatInterval = options?.heartbeatInterval || 15000;
  const [activeField, setActiveField] = useState<string | undefined>();

  // Send heartbeat with optional active field
  const sendHeartbeat = useCallback(async () => {
    await updatePresence(entityType, entityId, activeField);
  }, [entityType, entityId, activeField]);

  // Set up heartbeat interval
  useEffect(() => {
    sendHeartbeat();
    const timer = setInterval(sendHeartbeat, heartbeatInterval);

    return () => {
      clearInterval(timer);
      removePresence(entityType, entityId);
    };
  }, [sendHeartbeat, heartbeatInterval, entityType, entityId]);

  return {
    setActiveField,
    sendHeartbeat,
  };
}

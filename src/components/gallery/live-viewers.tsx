"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveViewersProps {
  /** Gallery ID to track presence for */
  galleryId: string;
  /** Polling interval in ms (default: 30000) */
  pollInterval?: number;
  /** Show even when count is 0 */
  showWhenEmpty?: boolean;
  /** Additional class names */
  className?: string;
  /** Variant style */
  variant?: "badge" | "inline" | "compact";
}

/**
 * Live viewers indicator component
 *
 * Shows real-time viewer count for a gallery using polling.
 * Automatically registers presence and updates every 30 seconds.
 */
export function LiveViewers({
  galleryId,
  pollInterval = 30000,
  showWhenEmpty = false,
  className,
  variant = "badge",
}: LiveViewersProps) {
  const [viewerCount, setViewerCount] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const visitorIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a unique visitor ID on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Try to get existing ID from sessionStorage, or create a new one
      let id = sessionStorage.getItem("gallery_visitor_id");
      if (!id) {
        id = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("gallery_visitor_id", id);
      }
      visitorIdRef.current = id;
    }
  }, []);

  // Register presence and poll for updates
  const updatePresence = useCallback(async () => {
    if (!visitorIdRef.current) return;

    try {
      const response = await fetch("/api/gallery/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId,
          visitorId: visitorIdRef.current,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setViewerCount(data.viewerCount);
        setIsLive(data.viewerCount > 0);
      }
    } catch (error) {
      console.error("[LiveViewers] Failed to update presence:", error);
    } finally {
      setIsLoading(false);
    }
  }, [galleryId]);

  // Unregister presence when leaving
  const removePresence = useCallback(async () => {
    if (!visitorIdRef.current) return;

    try {
      await fetch("/api/gallery/presence", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId,
          visitorId: visitorIdRef.current,
        }),
      });
    } catch (error) {
      console.error("[LiveViewers] Failed to remove presence:", error);
    }
  }, [galleryId]);

  // Start presence tracking on mount
  useEffect(() => {
    // Initial presence registration
    updatePresence();

    // Set up polling interval
    intervalRef.current = setInterval(updatePresence, pollInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      removePresence();
    };
  }, [updatePresence, removePresence, pollInterval]);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        updatePresence();
        intervalRef.current = setInterval(updatePresence, pollInterval);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updatePresence, pollInterval]);

  // Don't show if count is 0 and showWhenEmpty is false
  if (!showWhenEmpty && (viewerCount === 0 || isLoading)) {
    return null;
  }

  if (variant === "compact") {
    return (
      <AnimatePresence>
        {viewerCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn("flex items-center gap-1", className)}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-xs text-foreground-muted">{viewerCount}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === "inline") {
    return (
      <AnimatePresence>
        {viewerCount > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("inline-flex items-center gap-1.5 text-xs text-foreground-muted", className)}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
            {viewerCount} viewing
          </motion.span>
        )}
      </AnimatePresence>
    );
  }

  // Default badge variant
  return (
    <AnimatePresence>
      {viewerCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            "bg-[var(--success)]/10 border border-[var(--success)]/20",
            className
          )}
        >
          <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="text-xs font-medium text-[var(--success)]">
            {viewerCount} viewing now
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for custom implementations
interface UsePresenceResult {
  viewerCount: number;
  isLive: boolean;
  isLoading: boolean;
}

export function useGalleryPresence(
  galleryId: string,
  pollInterval: number = 30000
): UsePresenceResult {
  const [viewerCount, setViewerCount] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const visitorIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("gallery_visitor_id");
      if (!id) {
        id = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("gallery_visitor_id", id);
      }
      visitorIdRef.current = id;
    }
  }, []);

  useEffect(() => {
    const updatePresence = async () => {
      if (!visitorIdRef.current) return;

      try {
        const response = await fetch("/api/gallery/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            galleryId,
            visitorId: visitorIdRef.current,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setViewerCount(data.viewerCount);
          setIsLive(data.viewerCount > 0);
        }
      } catch (error) {
        console.error("[useGalleryPresence] Failed to update:", error);
      } finally {
        setIsLoading(false);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, pollInterval);

    return () => {
      clearInterval(interval);
      if (visitorIdRef.current) {
        fetch("/api/gallery/presence", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            galleryId,
            visitorId: visitorIdRef.current,
          }),
        }).catch(() => {});
      }
    };
  }, [galleryId, pollInterval]);

  return { viewerCount, isLive, isLoading };
}

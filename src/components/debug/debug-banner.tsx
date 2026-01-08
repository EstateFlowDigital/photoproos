"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getDevSettings } from "@/lib/utils/dev-settings";

type CapturedError = {
  type: "error" | "rejection";
  message: string;
  stack?: string;
  time: string;
};

interface DebugBannerProps {
  route?: string;
}

export function DebugBanner({ route: routeProp }: DebugBannerProps) {
  const pathname = usePathname();
  const route = routeProp || pathname;
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [isHidden, setIsHidden] = useState(false);

  // Load dev settings on mount and listen for changes
  useEffect(() => {
    const loadSettings = () => {
      const settings = getDevSettings();
      setIsHidden(settings.hideDebugBanner);
    };

    loadSettings();

    // Listen for storage changes (in case settings change in another tab/component)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ppos_dev_settings") {
        loadSettings();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addError = useCallback((err: CapturedError) => {
    setErrors((prev) => [err, ...prev].slice(0, 20));
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addError({
        type: "error",
        message: event.message || "Unknown error",
        stack: event.error?.stack,
        time: new Date().toISOString(),
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      addError({
        type: "rejection",
        message:
          (event.reason && (event.reason.message || String(event.reason))) ||
          "Unhandled promise rejection",
        stack: event.reason?.stack,
        time: new Date().toISOString(),
      });
    };

    const handleKey = (e: KeyboardEvent) => {
      const toggle =
        (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "D" || e.key === "d");
      if (toggle) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("keydown", handleKey);
    };
  }, [addError]);

  // If hidden via dev settings, render nothing
  if (isHidden) return null;

  if (!open && errors.length === 0) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-[60] rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-xs text-foreground-muted shadow-lg"
      >
        Debug (⌘/Ctrl+Shift+D)
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-[60] w-[min(420px,calc(100vw-24px))] rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--card-border)]">
        <div className="text-xs font-semibold text-foreground">
          Debug · {route} · {errors.length} issue{errors.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setErrors([])}
            className="text-[10px] text-foreground-muted hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-[var(--card-border)] px-2 py-1 text-[10px] text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            Hide
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--card-border)] text-xs">
        {errors.length === 0 ? (
          <div className="px-3 py-4 text-foreground-muted">
            No errors captured yet. Trigger with ⌘/Ctrl+Shift+D.
          </div>
        ) : (
          errors.map((err, idx) => (
            <div key={`${err.time}-${idx}`} className="px-3 py-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {err.type === "error" ? "Error" : "Promise Rejection"}
                </span>
                <span className="text-[10px] text-foreground-muted">
                  {new Date(err.time).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-foreground">{err.message}</div>
              {err.stack ? (
                <pre className="whitespace-pre-wrap text-[10px] text-foreground-muted">
                  {err.stack.split("\n").slice(0, 4).join("\n")}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </div>
      <div className="px-3 py-2 border-t border-[var(--card-border)] text-[10px] text-foreground-muted">
        Hotkey: ⌘/Ctrl+Shift+D · Route: {route}
      </div>
    </div>
  );
}

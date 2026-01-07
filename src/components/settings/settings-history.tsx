"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getSettingsHistory,
  type SettingsChange,
} from "@/lib/actions/settings-history";

interface SettingsHistoryProps {
  className?: string;
}

/**
 * SettingsHistory
 *
 * Displays a list of recent settings changes for the organization.
 */
export function SettingsHistory({ className }: SettingsHistoryProps) {
  const [changes, setChanges] = useState<SettingsChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadHistory = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await getSettingsHistory(pageNum);
      if (result.success && result.data) {
        if (append) {
          setChanges((prev) => [...prev, ...result.data.changes]);
        } else {
          setChanges(result.data.changes);
        }
        setHasMore(result.data.hasMore);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error("Failed to load settings history:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadHistory(nextPage, true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatChangeValue = (value: unknown): string => {
    if (value === null || value === undefined) return "empty";
    if (typeof value === "boolean") return value ? "enabled" : "disabled";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Settings History
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--background-tertiary)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-[var(--background-tertiary)]" />
                <div className="h-3 w-24 rounded bg-[var(--background-tertiary)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Settings History
        </h3>
        {total > 0 && (
          <span className="text-xs text-foreground-muted">
            {total} change{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {changes.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          No settings changes recorded yet.
        </p>
      ) : (
        <div className="space-y-0">
          {/* Show first 3 or all if expanded */}
          {(isExpanded ? changes : changes.slice(0, 3)).map((change, index) => (
            <div
              key={change.id}
              className={cn(
                "flex gap-3 py-3",
                index !== 0 && "border-t border-[var(--card-border)]"
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                <SettingsIcon className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">
                  {change.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-foreground-muted">
                    {formatDate(change.createdAt)}
                  </span>
                  {change.userName && (
                    <>
                      <span className="text-xs text-foreground-muted">•</span>
                      <span className="text-xs text-foreground-muted">
                        {change.userName}
                      </span>
                    </>
                  )}
                </div>
                {/* Show change details if available */}
                {change.changes && Object.keys(change.changes).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(change.changes).slice(0, 3).map(([key, val]) => (
                      <div
                        key={key}
                        className="text-xs text-foreground-secondary bg-[var(--background-tertiary)] rounded px-2 py-1"
                      >
                        <span className="font-medium">{key}:</span>{" "}
                        <span className="text-foreground-muted">
                          {formatChangeValue(val.from)}
                        </span>
                        {" → "}
                        <span className="text-foreground">
                          {formatChangeValue(val.to)}
                        </span>
                      </div>
                    ))}
                    {Object.keys(change.changes).length > 3 && (
                      <span className="text-xs text-foreground-muted">
                        +{Object.keys(change.changes).length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Expand/Collapse toggle */}
          {changes.length > 3 && !isExpanded && (
            <div className="pt-3 border-t border-[var(--card-border)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="w-full"
              >
                Show all ({changes.length})
              </Button>
            </div>
          )}

          {/* Load more button */}
          {isExpanded && hasMore && (
            <div className="pt-3 border-t border-[var(--card-border)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}

          {/* Collapse button */}
          {isExpanded && (
            <div className="pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="w-full"
              >
                Show less
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.294 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.294A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

SettingsHistory.displayName = "SettingsHistory";

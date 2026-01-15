"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { MarketingPageVersion } from "@prisma/client";
import {
  Plus,
  Minus,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";

interface ContentDiffProps {
  /** First version to compare (older) */
  version1?: MarketingPageVersion;
  /** Second version to compare (newer) */
  version2?: MarketingPageVersion;
  /** Content objects to compare directly */
  content1?: unknown;
  content2?: unknown;
  /** Labels for the two sides */
  label1?: string;
  label2?: string;
  /** Callback to close the diff view */
  onClose?: () => void;
}

type DiffType = "added" | "removed" | "changed" | "unchanged";

interface DiffLine {
  path: string;
  type: DiffType;
  oldValue?: unknown;
  newValue?: unknown;
  depth: number;
}

/**
 * Recursively flatten an object into paths and values
 */
function flattenObject(
  obj: unknown,
  prefix = "",
  depth = 0
): Array<{ path: string; value: unknown; depth: number }> {
  const result: Array<{ path: string; value: unknown; depth: number }> = [];

  if (obj === null || obj === undefined) {
    return [{ path: prefix || "(root)", value: obj, depth }];
  }

  if (typeof obj !== "object") {
    return [{ path: prefix || "(value)", value: obj, depth }];
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return [{ path: prefix || "(array)", value: "[]", depth }];
    }
    obj.forEach((item, index) => {
      const path = prefix ? `${prefix}[${index}]` : `[${index}]`;
      result.push(...flattenObject(item, path, depth + 1));
    });
    return result;
  }

  const entries = Object.entries(obj as Record<string, unknown>);
  if (entries.length === 0) {
    return [{ path: prefix || "(object)", value: "{}", depth }];
  }

  entries.forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      // Add the key itself as a path
      result.push({ path, value: typeof value, depth });
      result.push(...flattenObject(value, path, depth + 1));
    } else {
      result.push({ path, value, depth });
    }
  });

  return result;
}

/**
 * Generate diff lines between two objects
 */
function generateDiff(obj1: unknown, obj2: unknown): DiffLine[] {
  const flat1 = flattenObject(obj1);
  const flat2 = flattenObject(obj2);

  const map1 = new Map(flat1.map((item) => [item.path, item]));
  const map2 = new Map(flat2.map((item) => [item.path, item]));

  const allPaths = new Set([...map1.keys(), ...map2.keys()]);
  const result: DiffLine[] = [];

  // Sort paths for consistent output
  const sortedPaths = Array.from(allPaths).sort();

  sortedPaths.forEach((path) => {
    const item1 = map1.get(path);
    const item2 = map2.get(path);

    if (item1 && item2) {
      // Path exists in both
      const value1 = JSON.stringify(item1.value);
      const value2 = JSON.stringify(item2.value);

      if (value1 === value2) {
        result.push({
          path,
          type: "unchanged",
          oldValue: item1.value,
          newValue: item2.value,
          depth: item1.depth,
        });
      } else {
        result.push({
          path,
          type: "changed",
          oldValue: item1.value,
          newValue: item2.value,
          depth: Math.max(item1.depth, item2.depth),
        });
      }
    } else if (item1) {
      // Path only in obj1 (removed)
      result.push({
        path,
        type: "removed",
        oldValue: item1.value,
        depth: item1.depth,
      });
    } else if (item2) {
      // Path only in obj2 (added)
      result.push({
        path,
        type: "added",
        newValue: item2.value,
        depth: item2.depth,
      });
    }
  });

  return result;
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Single diff line component
 */
function DiffLineItem({
  line,
  showUnchanged,
}: {
  line: DiffLine;
  showUnchanged: boolean;
}) {
  const [_isExpanded, _setIsExpanded] = useState(line.type !== "unchanged");

  // Don't render unchanged lines when hidden
  if (line.type === "unchanged" && !showUnchanged) {
    return null;
  }

  const bgColor = {
    added: "bg-green-500/10",
    removed: "bg-red-500/10",
    changed: "bg-yellow-500/10",
    unchanged: "",
  }[line.type];

  const borderColor = {
    added: "border-l-green-500",
    removed: "border-l-red-500",
    changed: "border-l-yellow-500",
    unchanged: "border-l-transparent",
  }[line.type];

  const icon = {
    added: <Plus className="w-3 h-3 text-green-500" aria-hidden="true" />,
    removed: <Minus className="w-3 h-3 text-red-500" aria-hidden="true" />,
    changed: <RefreshCw className="w-3 h-3 text-yellow-500" aria-hidden="true" />,
    unchanged: null,
  }[line.type];

  return (
    <div
      className={cn(
        "px-3 py-1.5 border-l-2 transition-colors",
        bgColor,
        borderColor,
        "hover:bg-[var(--background-elevated)]"
      )}
      style={{ paddingLeft: `${(line.depth + 1) * 12}px` }}
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <span className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">
          {icon}
        </span>

        {/* Path */}
        <span
          className={cn(
            "font-mono text-xs flex-shrink-0",
            line.type === "unchanged"
              ? "text-[var(--foreground-muted)]"
              : "text-[var(--foreground)]"
          )}
        >
          {line.path}
        </span>

        {/* Values */}
        <div className="flex-1 font-mono text-xs overflow-hidden">
          {line.type === "changed" ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-red-400 line-through opacity-70">
                {formatValue(line.oldValue)}
              </span>
              <span className="text-green-400">{formatValue(line.newValue)}</span>
            </div>
          ) : line.type === "removed" ? (
            <span className="text-red-400">{formatValue(line.oldValue)}</span>
          ) : line.type === "added" ? (
            <span className="text-green-400">{formatValue(line.newValue)}</span>
          ) : (
            <span className="text-[var(--foreground-muted)]">
              {formatValue(line.oldValue)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Content diff component showing changes between two content objects
 */
export function ContentDiff({
  version1,
  version2,
  content1: propContent1,
  content2: propContent2,
  label1 = "Previous",
  label2 = "Current",
  onClose,
}: ContentDiffProps) {
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [filterType, setFilterType] = useState<DiffType | "all">("all");

  // Use version content if provided, otherwise use prop content
  const content1 = version1?.content ?? propContent1;
  const content2 = version2?.content ?? propContent2;

  // Generate diff
  const diffLines = useMemo(() => {
    if (!content1 && !content2) return [];
    return generateDiff(content1, content2);
  }, [content1, content2]);

  // Filter diff lines
  const filteredLines = useMemo(() => {
    if (filterType === "all") return diffLines;
    return diffLines.filter((line) => line.type === filterType);
  }, [diffLines, filterType]);

  // Count changes by type
  const counts = useMemo(() => {
    return {
      added: diffLines.filter((l) => l.type === "added").length,
      removed: diffLines.filter((l) => l.type === "removed").length,
      changed: diffLines.filter((l) => l.type === "changed").length,
      unchanged: diffLines.filter((l) => l.type === "unchanged").length,
    };
  }, [diffLines]);

  const hasChanges = counts.added > 0 || counts.removed > 0 || counts.changed > 0;

  return (
    <div className="flex flex-col h-full bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Content Comparison
            </h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              {label1} → {label2}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--background-elevated)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              )}
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--background-elevated)] border-b border-[var(--border)]">
        {/* Change counts */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setFilterType(filterType === "added" ? "all" : "added")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
              filterType === "added"
                ? "bg-green-500/20 text-green-500"
                : "text-[var(--foreground-secondary)] hover:text-green-500"
            )}
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
            <span>{counts.added} added</span>
          </button>
          <button
            onClick={() => setFilterType(filterType === "removed" ? "all" : "removed")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
              filterType === "removed"
                ? "bg-red-500/20 text-red-500"
                : "text-[var(--foreground-secondary)] hover:text-red-500"
            )}
          >
            <Minus className="w-3 h-3" aria-hidden="true" />
            <span>{counts.removed} removed</span>
          </button>
          <button
            onClick={() => setFilterType(filterType === "changed" ? "all" : "changed")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
              filterType === "changed"
                ? "bg-yellow-500/20 text-yellow-500"
                : "text-[var(--foreground-secondary)] hover:text-yellow-500"
            )}
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            <span>{counts.changed} modified</span>
          </button>
        </div>

        {/* Show unchanged toggle */}
        <label className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(e) => setShowUnchanged(e.target.checked)}
            className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          <span>Show unchanged ({counts.unchanged})</span>
        </label>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto">
        {!hasChanges && !showUnchanged ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <GitCompare
              className="w-12 h-12 text-[var(--foreground-muted)] mb-4"
              aria-hidden="true"
            />
            <p className="text-[var(--foreground-secondary)]">No changes detected</p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              The content is identical between versions
            </p>
          </div>
        ) : filteredLines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertTriangle
              className="w-12 h-12 text-[var(--foreground-muted)] mb-4"
              aria-hidden="true"
            />
            <p className="text-[var(--foreground-secondary)]">
              No {filterType} fields found
            </p>
            <button
              onClick={() => setFilterType("all")}
              className="text-sm text-[var(--primary)] hover:underline mt-2"
            >
              Show all changes
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredLines.map((line, index) => (
              <DiffLineItem key={`${line.path}-${index}`} line={line} showUnchanged={showUnchanged} />
            ))}
          </div>
        )}
      </div>

      {/* Version info footer */}
      {(version1 || version2) && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--background-elevated)] border-t border-[var(--border)] text-xs text-[var(--foreground-muted)]">
          {version1 && (
            <span>
              {label1}: Version {version1.version} ({new Date(version1.createdAt).toLocaleDateString()})
            </span>
          )}
          {version2 && (
            <span>
              {label2}: Version {version2.version} ({new Date(version2.createdAt).toLocaleDateString()})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Modal wrapper for content diff
 */
export function ContentDiffModal({
  isOpen,
  onClose,
  ...props
}: ContentDiffProps & { isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
    >
      <div
        className="w-full max-w-4xl h-[80vh] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <ContentDiff {...props} onClose={onClose} />
      </div>
    </div>
  );
}

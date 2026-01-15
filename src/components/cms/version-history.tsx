"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  getPageVersions,
  getPageVersion,
  restoreVersion as restoreVersionAction,
  compareVersions,
} from "@/lib/actions/marketing-cms";
import type { MarketingPageVersion } from "@prisma/client";
import {
  History,
  RotateCcw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Check,
  Loader2,
  GitCompare,
} from "lucide-react";

interface VersionHistoryProps {
  /** Page slug to show version history for */
  slug: string;
  /** Current page content for comparison */
  currentContent?: unknown;
  /** Callback when a version is restored */
  onRestore?: () => void;
  /** Whether to show as a panel (true) or modal (false) */
  asPanel?: boolean;
}

interface VersionItemProps {
  version: MarketingPageVersion;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onRestore: () => void;
  isRestoring: boolean;
}

/**
 * Single version item in the history list
 */
function VersionItem({
  version,
  isSelected,
  onSelect,
  onPreview,
  onRestore,
  isRestoring,
}: VersionItemProps) {
  const formattedDate = new Date(version.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = new Date(version.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "group relative p-4 border-b border-[var(--border)] cursor-pointer transition-colors",
        "hover:bg-[var(--background-elevated)]",
        "focus-within:ring-2 focus-within:ring-inset focus-within:ring-[var(--primary)]",
        isSelected && "bg-[var(--background-elevated)] border-l-2 border-l-[var(--primary)]"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Version number and date */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              Version {version.version}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              {formattedDate} at {formattedTime}
            </span>
          </div>

          {/* Change summary */}
          {version.changesSummary && (
            <p className="text-sm text-[var(--foreground-secondary)] mb-2 line-clamp-2">
              {version.changesSummary}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
            <User className="w-3 h-3" aria-hidden="true" />
            <span>{version.createdByName || "Unknown user"}</span>
          </div>
        </div>

        {/* Action buttons - shown on hover or when selected */}
        <div
          className={cn(
            "flex items-center gap-1 transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onPreview}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
              "hover:bg-[var(--background-tertiary)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            )}
            aria-label={`Preview version ${version.version}`}
            title="Preview"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={onRestore}
            disabled={isRestoring}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              "text-[var(--foreground-muted)] hover:text-[var(--primary)]",
              "hover:bg-[var(--primary)]/10",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label={`Restore to version ${version.version}`}
            title="Restore"
          >
            {isRestoring ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Version preview panel showing the content of a selected version
 */
function VersionPreviewPanel({
  version,
  onClose,
  onRestore,
  isRestoring,
}: {
  version: MarketingPageVersion;
  onClose: () => void;
  onRestore: () => void;
  isRestoring: boolean;
}) {
  const formattedDate = new Date(version.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = new Date(version.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Format JSON content for display
  const contentJson = JSON.stringify(version.content, null, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Version {version.version}
          </h3>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--background-elevated)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          )}
          aria-label="Close preview"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Metadata */}
      <div className="p-4 bg-[var(--background-elevated)] border-b border-[var(--border)]">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--foreground-muted)]">Created</span>
            <p className="text-[var(--foreground)]">{formattedDate}</p>
            <p className="text-[var(--foreground-secondary)]">{formattedTime}</p>
          </div>
          <div>
            <span className="text-[var(--foreground-muted)]">Author</span>
            <p className="text-[var(--foreground)]">
              {version.createdByName || "Unknown user"}
            </p>
          </div>
        </div>
        {version.changesSummary && (
          <div className="mt-3">
            <span className="text-sm text-[var(--foreground-muted)]">Changes</span>
            <p className="text-sm text-[var(--foreground)]">{version.changesSummary}</p>
          </div>
        )}
        {(version.metaTitle || version.metaDescription) && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            {version.metaTitle && (
              <div className="mb-2">
                <span className="text-xs text-[var(--foreground-muted)]">Meta Title</span>
                <p className="text-sm text-[var(--foreground)]">{version.metaTitle}</p>
              </div>
            )}
            {version.metaDescription && (
              <div>
                <span className="text-xs text-[var(--foreground-muted)]">Meta Description</span>
                <p className="text-sm text-[var(--foreground)]">{version.metaDescription}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content preview */}
      <div className="flex-1 overflow-auto p-4">
        <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
          Content
        </h4>
        <pre className="text-xs text-[var(--foreground-secondary)] bg-[var(--background-tertiary)] p-4 rounded-lg overflow-auto">
          <code>{contentJson}</code>
        </pre>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)]">
        <button
          onClick={onClose}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--background-elevated)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          )}
        >
          Cancel
        </button>
        <button
          onClick={onRestore}
          disabled={isRestoring}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isRestoring ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Restoring...
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Restore This Version
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Confirmation dialog for restore action
 */
function RestoreConfirmDialog({
  version,
  onConfirm,
  onCancel,
  isRestoring,
}: {
  version: MarketingPageVersion;
  onConfirm: () => void;
  onCancel: () => void;
  isRestoring: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-dialog-title"
    >
      <div
        className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
              <AlertTriangle className="w-5 h-5 text-orange-500" aria-hidden="true" />
            </div>
            <h2
              id="restore-dialog-title"
              className="text-lg font-semibold text-[var(--foreground)]"
            >
              Restore to Version {version.version}?
            </h2>
          </div>

          <p className="text-sm text-[var(--foreground-secondary)] mb-4">
            This will replace the current page content with the content from version{" "}
            {version.version}. The current content will be saved as a new version before
            restoring, so you can undo this action if needed.
          </p>

          <div className="p-3 bg-[var(--background-elevated)] rounded-lg text-sm mb-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>
                {new Date(version.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {version.changesSummary && (
              <p className="mt-1 text-[var(--foreground-secondary)]">
                {version.changesSummary}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={onCancel}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]",
              "hover:bg-[var(--background-elevated)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRestoring}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-[var(--primary)] text-white",
              "hover:bg-[var(--primary)]/90",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isRestoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Restoring...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                Confirm Restore
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Version history component showing all versions of a marketing page
 * with preview and restore capabilities
 */
export function VersionHistory({
  slug,
  currentContent,
  onRestore,
  asPanel = true,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<MarketingPageVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<MarketingPageVersion | null>(null);
  const [previewVersion, setPreviewVersion] = useState<MarketingPageVersion | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<MarketingPageVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const pageSize = 10;

  // Fetch versions
  const fetchVersions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getPageVersions(slug, {
      limit: pageSize,
      offset: page * pageSize,
    });

    if (result.success) {
      setVersions(result.data.versions);
      setTotal(result.data.total);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }, [slug, page]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // Handle restore confirmation
  const handleRestoreConfirm = async () => {
    if (!versionToRestore) return;

    setIsRestoring(true);
    const result = await restoreVersionAction(versionToRestore.id);

    if (result.success) {
      setRestoreSuccess(true);
      setVersionToRestore(null);
      // Refresh versions
      fetchVersions();
      // Callback to parent
      onRestore?.();
      // Reset success message after delay
      setTimeout(() => setRestoreSuccess(false), 3000);
    } else {
      setError(result.error);
    }

    setIsRestoring(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  // Empty state
  if (!isLoading && versions.length === 0 && !error) {
    return (
      <div className={cn("flex flex-col", asPanel && "h-full")}>
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
          <History className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Version History</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <History className="w-12 h-12 text-[var(--foreground-muted)] mb-4" aria-hidden="true" />
          <p className="text-[var(--foreground-secondary)]">No version history yet</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Versions are created automatically when you save changes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-[var(--card)]", asPanel && "h-full border-l border-[var(--border)]")}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Version History</h2>
          {total > 0 && (
            <span className="text-sm text-[var(--foreground-muted)]">({total})</span>
          )}
        </div>
      </div>

      {/* Success message */}
      {restoreSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border-b border-green-500/20">
          <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
          <span className="text-sm text-green-500 font-medium">
            Successfully restored to previous version
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--error)]/10 border-b border-[var(--error)]/20">
          <AlertTriangle className="w-4 h-4 text-[var(--error)]" aria-hidden="true" />
          <span className="text-sm text-[var(--error)]">{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" aria-hidden="true" />
        </div>
      )}

      {/* Version list */}
      {!isLoading && versions.length > 0 && (
        <>
          <div className="flex-1 overflow-auto" role="list" aria-label="Version history">
            {versions.map((version) => (
              <VersionItem
                key={version.id}
                version={version}
                isSelected={selectedVersion?.id === version.id}
                onSelect={() => setSelectedVersion(version)}
                onPreview={() => setPreviewVersion(version)}
                onRestore={() => setVersionToRestore(version)}
                isRestoring={isRestoring && versionToRestore?.id === version.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <span className="text-sm text-[var(--foreground-muted)]">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                    "hover:bg-[var(--background-elevated)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                    "hover:bg-[var(--background-elevated)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview panel modal */}
      {previewVersion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setPreviewVersion(null)}
        >
          <div
            className="w-full max-w-3xl h-[80vh] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <VersionPreviewPanel
              version={previewVersion}
              onClose={() => setPreviewVersion(null)}
              onRestore={() => {
                setPreviewVersion(null);
                setVersionToRestore(previewVersion);
              }}
              isRestoring={isRestoring}
            />
          </div>
        </div>
      )}

      {/* Restore confirmation dialog */}
      {versionToRestore && (
        <RestoreConfirmDialog
          version={versionToRestore}
          onConfirm={handleRestoreConfirm}
          onCancel={() => setVersionToRestore(null)}
          isRestoring={isRestoring}
        />
      )}
    </div>
  );
}

/**
 * Compact version badge showing version count with link to history
 */
export function VersionBadge({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-[var(--background-elevated)] text-[var(--foreground-secondary)]",
        "hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]",
        "transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      )}
      aria-label={`View ${count} version${count === 1 ? "" : "s"}`}
    >
      <History className="w-3 h-3" aria-hidden="true" />
      <span>{count} version{count === 1 ? "" : "s"}</span>
    </button>
  );
}

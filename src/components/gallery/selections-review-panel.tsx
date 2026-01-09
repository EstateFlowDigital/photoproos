"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  getGallerySelections,
  reviewSelections,
  exportSelectionsCSV,
  updateSelectionSettings,
} from "@/lib/actions/client-selections";
import {
  Check,
  X,
  Download,
  Image as ImageIcon,
  StickyNote,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings,
  Users,
  Clock,
} from "lucide-react";

interface SelectionsReviewPanelProps {
  galleryId: string;
  allowSelections?: boolean;
  selectionLimit?: number | null;
  selectionsSubmitted?: boolean;
  onSettingsClick?: () => void;
  className?: string;
}

interface SelectionItem {
  id: string;
  assetId: string;
  notes: string | null;
  status: "in_progress" | "submitted" | "approved" | "rejected";
  createdAt: Date;
  submittedAt: Date | null;
  clientEmail: string | null;
  asset: {
    id: string;
    filename: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
  };
}

export function SelectionsReviewPanel({
  galleryId,
  allowSelections = false,
  selectionLimit,
  selectionsSubmitted = false,
  onSettingsClick,
  className,
}: SelectionsReviewPanelProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selections, setSelections] = useState<SelectionItem[]>([]);
  const [selectionsByClient, setSelectionsByClient] = useState<Record<string, SelectionItem[]>>({});
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [isReviewing, setIsReviewing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "by-client">("all");

  const fetchSelections = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getGallerySelections(galleryId);
      if (result.success && result.data) {
        setSelections(result.data.selections as SelectionItem[]);
        setSelectionsByClient(result.data.selectionsByClient as Record<string, SelectionItem[]>);
      }
    } catch (error) {
      console.error("Error fetching selections:", error);
    } finally {
      setIsLoading(false);
    }
  }, [galleryId]);

  useEffect(() => {
    fetchSelections();
  }, [fetchSelections]);

  const handleReview = async (status: "approved" | "rejected") => {
    setIsReviewing(true);
    try {
      const result = await reviewSelections(galleryId, status);
      if (result.success) {
        showToast(
          status === "approved"
            ? "Selections approved successfully"
            : "Selections rejected",
          status === "approved" ? "success" : "info"
        );
        fetchSelections();
      } else if (!result.success) {
        showToast(result.error || "Failed to review selections", "error");
      }
    } catch (error) {
      console.error("Error reviewing selections:", error);
      showToast("An error occurred", "error");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportSelectionsCSV(galleryId);
      if (result.success && result.data) {
        // Create and download CSV
        const blob = new Blob([result.data.csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast("Selections exported successfully", "success");
      } else if (!result.success) {
        showToast("error" in result ? result.error : "Failed to export selections", "error");
      }
    } catch (error) {
      console.error("Error exporting selections:", error);
      showToast("An error occurred", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleNoteExpansion = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Get unique client count
  const clientCount = Object.keys(selectionsByClient).length;

  // Get status counts
  const statusCounts = selections.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Check if there are submitted selections pending review
  const hasSubmittedSelections = (statusCounts["submitted"] || 0) > 0;

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6", className)}>
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--foreground-muted)]" />
          <p className="mt-4 text-sm text-[var(--foreground-muted)]">Loading selections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Client Selections</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              {selectionsSubmitted
                ? "Client has submitted their photo selections"
                : allowSelections
                ? "Waiting for client to submit their selections"
                : "Photo selections are disabled for this gallery"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectionsSubmitted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400">
                <Check className="h-3.5 w-3.5" />
                Submitted
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="h-4 w-4 text-[var(--foreground-muted)]" />
              <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Selected</p>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {selections.length}
              {selectionLimit && <span className="text-sm font-normal text-[var(--foreground-muted)]"> / {selectionLimit}</span>}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-[var(--foreground-muted)]" />
              <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Clients</p>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{clientCount}</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[var(--foreground-muted)]" />
              <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Pending</p>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{statusCounts["submitted"] || 0}</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-[var(--foreground-muted)]" />
              <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Approved</p>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{statusCounts["approved"] || 0}</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {hasSubmittedSelections && (
            <>
              <button
                onClick={() => handleReview("approved")}
                disabled={isReviewing}
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                {isReviewing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve All
              </button>
              <button
                onClick={() => handleReview("rejected")}
                disabled={isReviewing}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </>
          )}
          {selections.length > 0 && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </button>
          )}
          <button
            onClick={onSettingsClick}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background-hover)]"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={fetchSelections}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Selections Display */}
      {selections.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          {/* View Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setViewMode("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--background-hover)]"
              )}
            >
              All Photos
            </button>
            <button
              onClick={() => setViewMode("by-client")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "by-client"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--background-hover)]"
              )}
            >
              By Client
            </button>
          </div>

          {viewMode === "all" ? (
            /* All Photos Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {selections.map((selection) => (
                <SelectionCard
                  key={selection.id}
                  selection={selection}
                  isExpanded={expandedNotes.has(selection.id)}
                  onToggleExpand={() => toggleNoteExpansion(selection.id)}
                />
              ))}
            </div>
          ) : (
            /* By Client View */
            <div className="space-y-6">
              {Object.entries(selectionsByClient).map(([clientEmail, clientSelections]) => (
                <div key={clientEmail} className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                        <Users className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {clientEmail === "anonymous" ? "Anonymous" : clientEmail}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {(clientSelections as SelectionItem[]).length} selections
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      (clientSelections as SelectionItem[])[0]?.status === "approved"
                        ? "bg-green-500/10 text-green-400"
                        : (clientSelections as SelectionItem[])[0]?.status === "rejected"
                        ? "bg-red-500/10 text-red-400"
                        : (clientSelections as SelectionItem[])[0]?.status === "submitted"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-[var(--background-elevated)] text-[var(--foreground-muted)]"
                    )}>
                      {(clientSelections as SelectionItem[])[0]?.status || "in_progress"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {(clientSelections as SelectionItem[]).map((selection) => (
                      <SelectionCard
                        key={selection.id}
                        selection={selection}
                        compact
                        isExpanded={expandedNotes.has(selection.id)}
                        onToggleExpand={() => toggleNoteExpansion(selection.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background-elevated)]">
              <ImageIcon className="h-6 w-6 text-[var(--foreground-muted)]" />
            </div>
            <h4 className="mt-4 font-medium text-[var(--foreground)]">No selections yet</h4>
            <p className="mt-1 max-w-sm text-sm text-[var(--foreground-muted)]">
              {allowSelections
                ? "Your client hasn't selected any photos yet. They can make selections from the gallery view."
                : "Enable selections in the gallery settings to allow clients to choose their favorite photos."}
            </p>
            {!allowSelections && onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <Settings className="h-4 w-4" />
                Enable Selections
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Selection Card Component */
interface SelectionCardProps {
  selection: SelectionItem;
  compact?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function SelectionCard({ selection, compact, isExpanded, onToggleExpand }: SelectionCardProps) {
  const statusColors = {
    in_progress: "border-[var(--card-border)]",
    submitted: "border-yellow-500/50",
    approved: "border-green-500/50",
    rejected: "border-red-500/50",
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border-2 overflow-hidden bg-[var(--background)]",
        statusColors[selection.status]
      )}
    >
      {/* Image */}
      <div className={cn("relative", compact ? "aspect-square" : "aspect-[4/3]")}>
        {selection.asset.thumbnailUrl || selection.asset.mediumUrl ? (
          <img
            src={selection.asset.thumbnailUrl || selection.asset.mediumUrl || ""}
            alt={selection.asset.filename}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--background-elevated)]">
            <ImageIcon className="h-8 w-8 text-[var(--foreground-muted)]" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase",
            selection.status === "approved"
              ? "bg-green-500 text-white"
              : selection.status === "rejected"
              ? "bg-red-500 text-white"
              : selection.status === "submitted"
              ? "bg-yellow-500 text-black"
              : "bg-[var(--background-elevated)] text-[var(--foreground-muted)]"
          )}>
            {selection.status === "in_progress" ? "In Progress" : selection.status}
          </span>
        </div>

        {/* Notes indicator */}
        {selection.notes && (
          <button
            onClick={onToggleExpand}
            className="absolute top-2 right-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white"
          >
            <StickyNote className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Info */}
      {!compact && (
        <div className="p-2">
          <p className="text-xs font-medium text-[var(--foreground)] truncate">
            {selection.asset.filename}
          </p>
          {selection.clientEmail && (
            <p className="text-[10px] text-[var(--foreground-muted)] truncate">
              {selection.clientEmail}
            </p>
          )}
        </div>
      )}

      {/* Expanded Notes */}
      {selection.notes && isExpanded && (
        <div className="absolute inset-0 bg-black/80 p-3 flex flex-col">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
            <span className="text-xs font-medium text-white">Client Notes</span>
            <button
              onClick={onToggleExpand}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-white/90 flex-1 overflow-y-auto">
            {selection.notes}
          </p>
        </div>
      )}
    </div>
  );
}

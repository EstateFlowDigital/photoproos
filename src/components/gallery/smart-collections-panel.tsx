"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  analyzePhotosForSmartCollections,
  applySmartCollection,
  applyAllSmartCollections,
  type SmartCollectionSuggestion,
} from "@/lib/actions/smart-collections";
import {
  Sparkles,
  Calendar,
  FileText,
  Camera,
  Check,
  X,
  RefreshCw,
  FolderPlus,
  Wand2,
} from "lucide-react";

interface SmartCollectionsPanelProps {
  galleryId: string;
  onCollectionCreated?: () => void;
  className?: string;
}

const typeIcons = {
  date: Calendar,
  filename: FileText,
  camera: Camera,
  custom: FolderPlus,
};

const typeColors = {
  date: "text-blue-400 bg-blue-400/10",
  filename: "text-purple-400 bg-purple-400/10",
  camera: "text-amber-400 bg-amber-400/10",
  custom: "text-emerald-400 bg-emerald-400/10",
};

export function SmartCollectionsPanel({
  galleryId,
  onCollectionCreated,
  className,
}: SmartCollectionsPanelProps) {
  const { showToast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartCollectionSuggestion[]>([]);
  const [totalUncategorized, setTotalUncategorized] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [applyingIds, setApplyingIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [isApplyingAll, setIsApplyingAll] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    setMessage(null);
    setAppliedIds(new Set());

    try {
      const result = await analyzePhotosForSmartCollections(galleryId);
      if (result.success && result.data) {
        setSuggestions(result.data.suggestions);
        setTotalUncategorized(result.data.totalUncategorized ?? 0);
        setMessage(result.data.message);
      } else if (!result.success) {
        showToast(result.error || "Failed to analyze photos", "error");
      }
    } catch (error) {
      console.error("Error analyzing photos:", error);
      showToast("An error occurred while analyzing photos", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = async (suggestion: SmartCollectionSuggestion) => {
    const suggestionKey = `${suggestion.type}-${suggestion.name}`;
    setApplyingIds((prev) => new Set(prev).add(suggestionKey));

    try {
      const result = await applySmartCollection(galleryId, {
        name: suggestion.name,
        assetIds: suggestion.assetIds,
      });

      if (result.success) {
        setAppliedIds((prev) => new Set(prev).add(suggestionKey));
        showToast(`Created "${suggestion.name}" with ${suggestion.photoCount} photos`, "success");
        onCollectionCreated?.();
      } else {
        showToast(result.error || "Failed to create collection", "error");
      }
    } catch (error) {
      console.error("Error applying suggestion:", error);
      showToast("An error occurred", "error");
    } finally {
      setApplyingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(suggestionKey);
        return newSet;
      });
    }
  };

  const handleApplyAll = async () => {
    const unappliedSuggestions = suggestions.filter(
      (s) => !appliedIds.has(`${s.type}-${s.name}`)
    );

    if (unappliedSuggestions.length === 0) {
      showToast("All suggestions have already been applied", "info");
      return;
    }

    setIsApplyingAll(true);

    try {
      const result = await applyAllSmartCollections(
        galleryId,
        unappliedSuggestions.map((s) => ({
          name: s.name,
          assetIds: s.assetIds,
        }))
      );

      if (result.success && result.data) {
        const { successCount, totalCount, results } = result.data;

        // Mark successful ones as applied
        results.forEach((r: { name: string; success: boolean }) => {
          if (r.success) {
            const suggestion = unappliedSuggestions.find((s) => s.name === r.name);
            if (suggestion) {
              setAppliedIds((prev) => new Set(prev).add(`${suggestion.type}-${suggestion.name}`));
            }
          }
        });

        showToast(
          `Created ${successCount} of ${totalCount} collections`,
          successCount === totalCount ? "success" : "info"
        );
        onCollectionCreated?.();
      } else if (!result.success) {
        showToast(result.error || "Failed to apply collections", "error");
      }
    } catch (error) {
      console.error("Error applying all suggestions:", error);
      showToast("An error occurred", "error");
    } finally {
      setIsApplyingAll(false);
    }
  };

  const unappliedCount = suggestions.filter(
    (s) => !appliedIds.has(`${s.type}-${s.name}`)
  ).length;

  return (
    <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <Wand2 className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)]">Smart Collections</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Auto-organize photos into collections
            </p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Photos
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {suggestions.length === 0 && !isAnalyzing && !message && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background-elevated)]">
              <Sparkles className="h-6 w-6 text-[var(--foreground-muted)]" />
            </div>
            <h4 className="mt-4 font-medium text-[var(--foreground)]">
              Auto-organize your photos
            </h4>
            <p className="mt-1 max-w-sm text-sm text-[var(--foreground-muted)]">
              Click &quot;Analyze Photos&quot; to detect patterns and automatically group your photos into collections.
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary)]" />
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">
              Analyzing photo patterns...
            </p>
          </div>
        )}

        {!isAnalyzing && message && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background-elevated)]">
              <Check className="h-6 w-6 text-[var(--success)]" />
            </div>
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">{message}</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <>
            {/* Stats Bar */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-[var(--background-elevated)] px-4 py-3">
              <div className="text-sm">
                <span className="font-medium text-[var(--foreground)]">
                  {suggestions.length} groupings found
                </span>
                <span className="text-[var(--foreground-muted)]">
                  {" "}from {totalUncategorized} uncategorized photos
                </span>
              </div>
              {unappliedCount > 0 && (
                <button
                  onClick={handleApplyAll}
                  disabled={isApplyingAll}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20 disabled:opacity-50"
                >
                  {isApplyingAll ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Apply All ({unappliedCount})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Suggestions List */}
            <div className="space-y-3">
              {suggestions.map((suggestion) => {
                const suggestionKey = `${suggestion.type}-${suggestion.name}`;
                const isApplying = applyingIds.has(suggestionKey);
                const isApplied = appliedIds.has(suggestionKey);
                const Icon = typeIcons[suggestion.type];
                const colorClass = typeColors[suggestion.type];

                return (
                  <div
                    key={suggestionKey}
                    className={cn(
                      "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                      isApplied
                        ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:bg-[var(--background-hover)]"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colorClass)}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[var(--foreground)] truncate">
                          {suggestion.name}
                        </h4>
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
                            <Check className="h-3 w-3" />
                            Created
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)] truncate">
                        {suggestion.description}
                      </p>
                    </div>

                    {/* Preview Photos */}
                    <div className="hidden sm:flex shrink-0 -space-x-2">
                      {suggestion.previewPhotos.slice(0, 3).map((photo) => (
                        <div
                          key={photo.id}
                          className="h-8 w-8 overflow-hidden rounded-md border-2 border-[var(--card)] bg-[var(--background-elevated)]"
                        >
                          {photo.thumbnailUrl && (
                            <img
                              src={photo.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {suggestion.photoCount > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-[var(--card)] bg-[var(--background-elevated)] text-xs font-medium text-[var(--foreground-muted)]">
                          +{suggestion.photoCount - 3}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {!isApplied && (
                      <button
                        onClick={() => handleApplySuggestion(suggestion)}
                        disabled={isApplying || isApplyingAll}
                        className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
                      >
                        {isApplying ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <FolderPlus className="h-4 w-4" />
                        )}
                        <span className="hidden md:inline">Create</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

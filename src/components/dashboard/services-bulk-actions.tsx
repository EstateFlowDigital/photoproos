"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  bulkToggleServiceStatus,
  bulkArchiveServices,
  bulkDeleteServices
} from "@/lib/actions/services";
import { toast } from "sonner";

interface ServicesBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export function ServicesBulkActions({
  selectedIds,
  onClearSelection,
  onActionComplete,
}: ServicesBulkActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const count = selectedIds.length;

  if (count === 0) return null;

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const result = await bulkToggleServiceStatus(selectedIds);
      if (result.success) {
        toast.success(`Updated ${result.data?.count || count} services`);
        onClearSelection();
        onActionComplete();
      } else {
        toast.error(result.error || "Failed to update services");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      const result = await bulkArchiveServices(selectedIds, true);
      if (result.success) {
        toast.success(`Archived ${result.data?.count || count} services`);
        onClearSelection();
        onActionComplete();
      } else {
        toast.error(result.error || "Failed to archive services");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await bulkDeleteServices(selectedIds);
      if (result.success) {
        toast.success(`Deleted ${result.data?.count || count} services`);
        onClearSelection();
        onActionComplete();
        setShowDeleteConfirm(false);
      } else {
        toast.error(result.error || "Failed to delete services");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBundle = () => {
    const params = new URLSearchParams();
    params.set("services", selectedIds.join(","));
    router.push(`/services/bundles/new?${params.toString()}`);
  };

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-2 shadow-xl">
          {/* Selection Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-[var(--card-border)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
              {count}
            </span>
            <span className="text-sm font-medium text-foreground">selected</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleStatus}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-foreground hover:bg-[var(--background-hover)]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <ToggleIcon className="h-4 w-4" />
              Toggle Status
            </button>

            <button
              onClick={handleArchive}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-foreground hover:bg-[var(--background-hover)]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArchiveIcon className="h-4 w-4" />
              Archive
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-[var(--error)] hover:bg-[var(--error)]/10",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>

            <div className="w-px h-6 bg-[var(--card-border)]" />

            <button
              onClick={handleCreateBundle}
              disabled={isLoading || count < 2}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
                (isLoading || count < 2) && "opacity-50 cursor-not-allowed"
              )}
              title={count < 2 ? "Select at least 2 services to create a bundle" : undefined}
            >
              <BundleIcon className="h-4 w-4" />
              Create Bundle
            </button>
          </div>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10">
                <TrashIcon className="h-5 w-5 text-[var(--error)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Delete {count} services?</h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  This action cannot be undone. Services that are in use by galleries or bookings will be archived instead.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className={cn(
                  "rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--error)]/90 transition-colors",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Icons
function ToggleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 2a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5A.75.75 0 0 1 10 2ZM5.404 4.343a.75.75 0 0 1 0 1.06 6.5 6.5 0 1 0 9.192 0 .75.75 0 1 1 1.06-1.06 8 8 0 1 1-11.313 0 .75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
      <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function BundleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.196 12.87l-.825.483a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .758 0l7.25-4.25a.75.75 0 0 0 0-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 0 1-2.276 0L3.196 12.87Z" />
      <path d="M3.196 8.87l-.825.483a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .758 0l7.25-4.25a.75.75 0 0 0 0-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 0 1-2.276 0L3.196 8.87Z" />
      <path d="M10.38 1.103a.75.75 0 0 0-.76 0l-7.25 4.25a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .76 0l7.25-4.25a.75.75 0 0 0 0-1.294l-7.25-4.25Z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

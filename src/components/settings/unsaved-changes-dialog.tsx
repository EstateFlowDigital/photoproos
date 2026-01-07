"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangleIcon } from "lucide-react";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Unsaved Changes",
  description = "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.",
  confirmText = "Leave",
  cancelText = "Stay",
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[var(--error)] text-white hover:bg-[var(--error)]/90"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Unsaved Changes Indicator
// ============================================================================

interface UnsavedChangesIndicatorProps {
  hasChanges: boolean;
  className?: string;
}

/**
 * Small indicator dot that shows when there are unsaved changes
 */
export function UnsavedChangesIndicator({
  hasChanges,
  className,
}: UnsavedChangesIndicatorProps) {
  if (!hasChanges) return null;

  return (
    <span
      className={`inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse ${className || ""}`}
      title="Unsaved changes"
    />
  );
}

// ============================================================================
// Unsaved Changes Banner
// ============================================================================

interface UnsavedChangesBannerProps {
  hasChanges: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  isSaving?: boolean;
  className?: string;
}

/**
 * Banner that appears when there are unsaved changes
 */
export function UnsavedChangesBanner({
  hasChanges,
  onSave,
  onDiscard,
  isSaving = false,
  className,
}: UnsavedChangesBannerProps) {
  if (!hasChanges) return null;

  return (
    <div
      className={`sticky bottom-0 left-0 right-0 z-50 border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 backdrop-blur-sm ${className || ""}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-foreground">
            You have unsaved changes
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              Discard
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

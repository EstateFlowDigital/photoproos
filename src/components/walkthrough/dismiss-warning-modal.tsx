"use client";

import * as React from "react";
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
import { AlertTriangle } from "lucide-react";

interface DismissWarningModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when user confirms dismissal */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Title of the page/walkthrough being dismissed */
  pageTitle: string;
}

/**
 * DismissWarningModal Component
 *
 * Confirmation dialog shown when a user attempts to permanently dismiss a walkthrough.
 * Warns that this action cannot be undone and suggests using "Hide" instead.
 *
 * @example
 * <DismissWarningModal
 *   isOpen={showWarning}
 *   onConfirm={handleConfirmDismiss}
 *   onCancel={() => setShowWarning(false)}
 *   pageTitle="Dashboard Walkthrough"
 * />
 */
export function DismissWarningModal({
  isOpen,
  onConfirm,
  onCancel,
  pageTitle,
}: DismissWarningModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--warning)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <AlertDialogTitle>Dismiss Tutorial?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              Are you sure you want to dismiss the <strong>{pageTitle}</strong>{" "}
              tutorial? It will be hidden from this page.
            </p>
            <p className="text-foreground-muted">
              You can restore it later from{" "}
              <strong>Settings &rarr; Walkthroughs</strong>. If you just want to
              hide it temporarily, use the <strong>Hide</strong> option instead.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
          >
            Dismiss Tutorial
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

DismissWarningModal.displayName = "DismissWarningModal";

"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ============================================================================
// Context
// ============================================================================

interface UnsavedChangesContextValue {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  confirmNavigation: (callback: () => void) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface UnsavedChangesProviderProps {
  children: React.ReactNode;
}

export function UnsavedChangesProvider({ children }: UnsavedChangesProviderProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Handle browser back/forward and tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const confirmNavigation = useCallback((callback: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => callback);
      setShowDialog(true);
    } else {
      callback();
    }
  }, [hasUnsavedChanges]);

  const handleDiscard = () => {
    setHasUnsavedChanges(false);
    setShowDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPendingNavigation(null);
  };

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges,
        confirmNavigation,
      }}
    >
      {children}

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes that will be lost if you leave this page.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex items-start gap-3 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4">
              <WarningIcon className="h-5 w-5 text-[var(--warning)] shrink-0 mt-0.5" />
              <p className="text-sm text-foreground-secondary">
                Are you sure you want to leave? Your changes will not be saved.
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Stay on Page
            </Button>
            <Button variant="danger" onClick={handleDiscard}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UnsavedChangesContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error("useUnsavedChanges must be used within an UnsavedChangesProvider");
  }
  return context;
}

// ============================================================================
// Hook for forms
// ============================================================================

/**
 * Hook to track form changes and warn before navigation
 *
 * Usage:
 * ```tsx
 * const { markAsChanged, markAsSaved } = useFormUnsavedChanges();
 *
 * const handleFieldChange = () => {
 *   markAsChanged();
 * };
 *
 * const handleSave = async () => {
 *   await saveData();
 *   markAsSaved();
 * };
 * ```
 */
export function useFormUnsavedChanges() {
  const { setHasUnsavedChanges } = useUnsavedChanges();

  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, [setHasUnsavedChanges]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setHasUnsavedChanges(false);
    };
  }, [setHasUnsavedChanges]);

  return { markAsChanged, markAsSaved };
}

// ============================================================================
// Icons
// ============================================================================

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

UnsavedChangesProvider.displayName = "UnsavedChangesProvider";

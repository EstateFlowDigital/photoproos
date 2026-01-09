"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import {
  getClientSelections,
  submitSelections,
  resetSelections,
  updateSelectionNotes,
  type Selection,
  type SelectionSummary,
} from "@/lib/actions/client-selections";

interface SelectionPanelProps {
  galleryId: string;
  deliverySlug?: string;
  onSelectionChange?: () => void;
  className?: string;
}

export function SelectionPanel({
  galleryId,
  deliverySlug,
  onSelectionChange,
  className,
}: SelectionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [summary, setSummary] = useState<SelectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSelections();
    }
  }, [isOpen, galleryId]);

  async function loadSelections() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getClientSelections(galleryId, deliverySlug);
      if (result.success && result.data) {
        setSelections(result.data.selections as Selection[]);
        setSummary(result.data.summary as SelectionSummary);
      } else {
        setError("error" in result ? result.error : "Failed to load selections");
      }
    } catch {
      setError("Failed to load selections");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const result = await submitSelections(galleryId, deliverySlug);
      if (result.success) {
        setShowConfirmSubmit(false);
        await loadSelections();
        onSelectionChange?.();
      } else {
        setError(result.error || "Failed to submit selections");
      }
    } catch {
      setError("Failed to submit selections");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset() {
    setIsSubmitting(true);
    try {
      const result = await resetSelections(galleryId, deliverySlug);
      if (result.success) {
        setShowConfirmReset(false);
        setSelections([]);
        setSummary((prev) => prev ? { ...prev, total: 0, submitted: false, submittedAt: null } : null);
        onSelectionChange?.();
      } else {
        setError(result.error || "Failed to reset selections");
      }
    } catch {
      setError("Failed to reset selections");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveNotes(assetId: string) {
    try {
      const result = await updateSelectionNotes(galleryId, assetId, notesText, deliverySlug);
      if (result.success) {
        setSelections((prev) =>
          prev.map((s) =>
            s.assetId === assetId ? { ...s, notes: notesText || null } : s
          )
        );
        setEditingNotes(null);
        setNotesText("");
      } else {
        setError(result.error || "Failed to save notes");
      }
    } catch {
      setError("Failed to save notes");
    }
  }

  const getStatusBadge = () => {
    if (!summary) return null;
    switch (summary.status) {
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warning)]/10 px-2.5 py-1 text-xs font-medium text-[var(--warning)]">
            <ClockIcon className="h-3 w-3" />
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
            <CheckIcon className="h-3 w-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--error)]/10 px-2.5 py-1 text-xs font-medium text-[var(--error)]">
            <XIcon className="h-3 w-3" />
            Needs Changes
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Selection Counter */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-[var(--primary)] px-4 py-3 text-white shadow-lg transition-transform hover:scale-105",
          className
        )}
      >
        <SelectionIcon className="h-5 w-5" />
        <span className="text-sm font-medium">
          {summary?.total || 0} Selected
          {summary?.limit && ` / ${summary.limit}`}
        </span>
        {summary?.submitted && (
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            Submitted
          </span>
        )}
      </button>

      {/* Selection Panel Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <DialogTitle>Your Selections</DialogTitle>
                <DialogDescription>
                  {summary?.limit
                    ? `Select up to ${summary.limit} photos for your final gallery`
                    : "Select your favorite photos for the final delivery"}
                </DialogDescription>
              </div>
              {getStatusBadge()}
            </div>
          </DialogHeader>

          <DialogBody className="max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/5 p-4 text-center">
                <p className="text-sm text-[var(--error)]">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    loadSelections();
                  }}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            ) : selections.length === 0 ? (
              <div className="py-12 text-center">
                <SelectionIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                <h3 className="mt-4 text-sm font-medium text-foreground">No selections yet</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Click on photos in the gallery to select them
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Bar */}
                <div className="flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--background)] p-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{summary?.total}</p>
                      <p className="text-xs text-foreground-muted">
                        {summary?.limit ? `of ${summary.limit}` : "photos"} selected
                      </p>
                    </div>
                    {summary?.limit && (
                      <div className="h-8 w-px bg-[var(--card-border)]" />
                    )}
                    {summary?.limit && (
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-[var(--background-hover)]">
                          <div
                            className="h-2 rounded-full bg-[var(--primary)] transition-all"
                            style={{
                              width: `${Math.min(100, (summary.total / summary.limit) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-foreground-muted">
                          {summary.limit - summary.total} remaining
                        </p>
                      </div>
                    )}
                  </div>
                  {summary?.submittedAt && (
                    <p className="text-xs text-foreground-muted">
                      Submitted {new Date(summary.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Selected Photos Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selections.map((selection) => (
                    <div
                      key={selection.id}
                      className="group relative overflow-x-auto rounded-lg border border-[var(--card-border)] bg-[var(--card)]"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={selection.asset.thumbnailUrl || selection.asset.mediumUrl || ""}
                          alt={selection.asset.filename}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-medium text-foreground">
                          {selection.asset.filename}
                        </p>
                        {editingNotes === selection.assetId ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              placeholder="Add notes..."
                              rows={2}
                              className="w-full resize-none rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-xs text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveNotes(selection.assetId)}
                                className="flex-1 rounded bg-[var(--primary)] px-2 py-1 text-xs font-medium text-white"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingNotes(null);
                                  setNotesText("");
                                }}
                                className="flex-1 rounded border border-[var(--card-border)] px-2 py-1 text-xs font-medium text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : selection.notes ? (
                          <button
                            onClick={() => {
                              if (!summary?.submitted) {
                                setEditingNotes(selection.assetId);
                                setNotesText(selection.notes || "");
                              }
                            }}
                            className="mt-1 text-left text-xs text-foreground-muted hover:text-foreground"
                            disabled={summary?.submitted}
                          >
                            <NoteIcon className="mr-1 inline h-3 w-3" />
                            {selection.notes}
                          </button>
                        ) : !summary?.submitted ? (
                          <button
                            onClick={() => {
                              setEditingNotes(selection.assetId);
                              setNotesText("");
                            }}
                            className="mt-1 text-xs text-foreground-muted hover:text-foreground"
                          >
                            + Add notes
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            {!summary?.submitted && selections.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmReset(true)}
                  disabled={isSubmitting}
                >
                  Reset All
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={isSubmitting}
                >
                  Submit Selections
                </Button>
              </>
            )}
            {summary?.submitted && (
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Submit Selections?</DialogTitle>
            <DialogDescription>
              You're about to submit {selections.length} photo
              {selections.length !== 1 ? "s" : ""} for review. You won't be able to change your selections after submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowConfirmSubmit(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              Submit Selections
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Reset Selections?</DialogTitle>
            <DialogDescription>
              This will remove all {selections.length} selected photo
              {selections.length !== 1 ? "s" : ""}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowConfirmReset(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
              loading={isSubmitting}
            >
              Reset All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Icons
function SelectionIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

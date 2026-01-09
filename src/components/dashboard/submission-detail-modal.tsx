"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { convertSubmissionToBooking, rejectSubmission } from "@/lib/actions/booking-forms";
import type { BookingFormSubmissionStatus } from "@prisma/client";
import { combineDateAndTime } from "@/lib/dates";

// =============================================================================
// Types
// =============================================================================

interface UploadedFile {
  filename: string;
  url: string;
  key: string;
  size: number;
  type: string;
}

interface FormField {
  id: string;
  label: string;
  type: string;
}

interface Submission {
  id: string;
  bookingFormId: string;
  data: Record<string, unknown>;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  serviceId: string | null;
  status: BookingFormSubmissionStatus;
  createdAt: Date;
  rejectionNote?: string | null;
}

interface SubmissionDetailModalProps {
  submission: Submission;
  fields: FormField[];
  onClose: () => void;
  onStatusChange: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function SubmissionDetailModal({
  submission,
  fields,
  onClose,
  onStatusChange,
}: SubmissionDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [convertDate, setConvertDate] = useState("");
  const [convertTime, setConvertTime] = useState("09:00");
  const [convertDuration, setConvertDuration] = useState("60");
  const [error, setError] = useState<string | null>(null);
  const [allowConflicts, setAllowConflicts] = useState(false);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const handleReject = () => {
    setError(null);
    startTransition(async () => {
      const result = await rejectSubmission({
        submissionId: submission.id,
        rejectionNote: rejectionNote || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onStatusChange();
      onClose();
    });
  };

  const handleConvert = () => {
    if (!convertDate) {
      setError("Please select a date for the booking");
      return;
    }

    setError(null);
    startTransition(async () => {
      const startTime = combineDateAndTime(convertDate, convertTime);
      const endTime = new Date(startTime.getTime() + parseInt(convertDuration) * 60000);

      const result = await convertSubmissionToBooking({
        submissionId: submission.id,
        bookingData: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          serviceId: submission.serviceId || undefined,
          timezone,
          allowConflicts,
        },
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onStatusChange();
      onClose();
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageFile = (type: string) => type.startsWith("image/");

  const renderFieldValue = (field: FormField, value: unknown) => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-foreground-muted italic">Not provided</span>;
    }

    // Handle file uploads
    if (field.type === "file" && Array.isArray(value)) {
      const files = value as UploadedFile[];
      if (files.length === 0) {
        return <span className="text-foreground-muted italic">No files uploaded</span>;
      }

      return (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={file.key || index}
              className="flex items-start gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
            >
              {isImageFile(file.type) ? (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-[var(--card-border)]">
                    <Image
                      src={file.url}
                      alt={file.filename}
                      fill
                      className="object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                </a>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background-hover)]">
                  {file.type === "application/pdf" ? (
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{file.filename}</p>
                <p className="text-xs text-foreground-muted">{formatFileSize(file.size)}</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs text-[var(--primary)] hover:underline"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open file
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Handle arrays (multiselect)
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-sm rounded-md bg-[var(--background-hover)] text-foreground"
            >
              {String(v)}
            </span>
          ))}
        </div>
      );
    }

    // Handle booleans (checkbox)
    if (typeof value === "boolean") {
      return (
        <span className={cn("text-sm", value ? "text-green-400" : "text-foreground-muted")}>
          {value ? "Yes" : "No"}
        </span>
      );
    }

    // Handle dates
    if (field.type === "date" && typeof value === "string") {
      return (
        <span className="text-foreground">
          {new Date(value).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      );
    }

    // Default string display
    return <span className="text-foreground whitespace-pre-wrap">{String(value)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Submission Details</h2>
            <p className="text-sm text-foreground-muted">
              Submitted {new Date(submission.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground-muted">Status:</span>
            <StatusBadge status={submission.status} />
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wide">
              Contact Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-foreground-muted">Name</p>
                <p className="text-sm text-foreground font-medium">
                  {submission.clientName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Email</p>
                <p className="text-sm text-foreground font-medium">
                  {submission.clientEmail ? (
                    <a
                      href={`mailto:${submission.clientEmail}`}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {submission.clientEmail}
                    </a>
                  ) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Phone</p>
                <p className="text-sm text-foreground font-medium">
                  {submission.clientPhone ? (
                    <a
                      href={`tel:${submission.clientPhone}`}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {submission.clientPhone}
                    </a>
                  ) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Preferred Date/Time</p>
                <p className="text-sm text-foreground font-medium">
                  {submission.preferredDate ? (
                    <>
                      {new Date(submission.preferredDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {submission.preferredTime && ` at ${submission.preferredTime}`}
                    </>
                  ) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          {fields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wide">
                Form Responses
              </h3>
              <div className="space-y-4">
                {fields.map((field) => {
                  const value = submission.data[field.id];
                  return (
                    <div key={field.id} className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{field.label}</p>
                      <div className="text-sm">{renderFieldValue(field, value)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rejection Note (if rejected) */}
          {submission.status === "rejected" && submission.rejectionNote && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <h3 className="text-sm font-medium text-red-400 mb-1">Rejection Note</h3>
              <p className="text-sm text-foreground">{submission.rejectionNote}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
              <p className="text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">Reject Submission</h3>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Optional: Add a note explaining why this submission was rejected..."
                rows={3}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Rejecting..." : "Confirm Rejection"}
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm font-medium text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Convert Form */}
          {showConvertForm && (
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">Convert to Booking</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-foreground-muted mb-1">Date</label>
                  <input
                    type="date"
                    value={convertDate}
                    onChange={(e) => setConvertDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground-muted mb-1">Time</label>
                  <input
                    type="time"
                    value={convertTime}
                    onChange={(e) => setConvertTime(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground-muted mb-1">Duration</label>
                  <select
                    value={convertDuration}
                    onChange={(e) => setConvertDuration(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={allowConflicts}
                  onChange={(e) => setAllowConflicts(e.target.checked)}
                />
                <div>
                  <p className="text-sm text-foreground">Allow conflict override</p>
                  <p className="text-xs text-foreground-muted">Create even if another booking overlaps (timezone: {timezone})</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConvert}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Converting..." : "Create Booking"}
                </button>
                <button
                  onClick={() => setShowConvertForm(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm font-medium text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {submission.status === "pending" && !showRejectForm && !showConvertForm && (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--card-border)] px-6 py-4">
            <button
              onClick={() => setShowRejectForm(true)}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => setShowConvertForm(true)}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              Convert to Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Status Badge Component
// =============================================================================

function StatusBadge({ status }: { status: BookingFormSubmissionStatus }) {
  const colors: Record<BookingFormSubmissionStatus, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/10 text-green-400 border-green-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
    converted: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    expired: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  };

  const labels: Record<BookingFormSubmissionStatus, string> = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    converted: "Converted to Booking",
    expired: "Expired",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-sm font-medium border", colors[status])}>
      {labels[status]}
    </span>
  );
}

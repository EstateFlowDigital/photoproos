"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BookingFormSubmissionStatus } from "@prisma/client";

interface BookingForm {
  id: string;
  name: string;
  slug: string;
}

interface Submission {
  id: string;
  bookingFormId?: string;
  bookingId?: string | null;
  data: unknown;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  serviceId?: string | null;
  status: BookingFormSubmissionStatus;
  createdAt: Date;
  booking?: {
    id: string;
    title: string;
    startTime: Date;
    status: string;
  } | null;
}

interface SubmissionsPageClientProps {
  bookingForm: BookingForm;
  submissions: Submission[];
}

const statusColors: Record<BookingFormSubmissionStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
  converted: "bg-blue-500/10 text-blue-400",
  expired: "bg-gray-500/10 text-gray-400",
};

const statusLabels: Record<BookingFormSubmissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  converted: "Converted",
  expired: "Expired",
};

export function SubmissionsPageClient({ bookingForm, submissions }: SubmissionsPageClientProps) {
  const [filter, setFilter] = useState<BookingFormSubmissionStatus | "all">("all");

  const filteredSubmissions = filter === "all"
    ? submissions
    : submissions.filter((s) => s.status === filter);

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    converted: submissions.filter((s) => s.status === "converted").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    expired: submissions.filter((s) => s.status === "expired").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="stack-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-foreground-muted mb-1">
            <Link href="/scheduling/booking-forms" className="hover:text-foreground">
              Booking Forms
            </Link>
            <span>/</span>
            <Link href={`/scheduling/booking-forms/${bookingForm.id}`} className="hover:text-foreground">
              {bookingForm.name}
            </Link>
            <span>/</span>
            <span>Submissions</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Form Submissions</h1>
        </div>
        <div className="stack-actions">
          <Link
            href={`/scheduling/booking-forms/${bookingForm.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Back to Form
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} color="text-yellow-400" />
        <StatCard label="Approved" value={stats.approved} color="text-green-400" />
        <StatCard label="Converted" value={stats.converted} color="text-blue-400" />
        <StatCard label="Rejected" value={stats.rejected} color="text-red-400" />
        <StatCard label="Expired" value={stats.expired} color="text-gray-400" />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground-muted">Filter:</span>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "converted", "rejected", "expired"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-hover)] text-foreground-muted hover:text-foreground"
              )}
            >
              {status === "all" ? "All" : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        {filteredSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--background)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">Preferred Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">Submitted</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-[var(--background-hover)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{submission.clientName || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{submission.clientEmail || "—"}</p>
                      {submission.clientPhone && (
                        <p className="text-xs text-foreground-muted">{submission.clientPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {submission.preferredDate ? (
                        <p className="text-sm text-foreground">
                          {new Date(submission.preferredDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {submission.preferredTime && ` at ${submission.preferredTime}`}
                        </p>
                      ) : (
                        <span className="text-foreground-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[submission.status])}>
                        {statusLabels[submission.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground-muted">
                        {new Date(submission.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {submission.booking ? (
                        <Link
                          href={`/scheduling/${submission.booking.id}`}
                          className="text-sm text-[var(--primary)] hover:underline"
                        >
                          View Booking
                        </Link>
                      ) : submission.status === "pending" ? (
                        <button className="text-sm text-[var(--primary)] hover:underline">
                          Review
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-foreground">No submissions yet</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Submissions will appear here when clients fill out your booking form
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <p className="text-sm text-foreground-muted">{label}</p>
      <p className={cn("text-2xl font-semibold", color || "text-foreground")}>{value}</p>
    </div>
  );
}

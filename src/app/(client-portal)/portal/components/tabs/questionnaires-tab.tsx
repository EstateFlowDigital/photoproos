"use client";

import Link from "next/link";
import { ClipboardIcon, CheckCircleIcon, ChevronRightIcon } from "../icons";
import { EmptyState } from "../empty-state";
import { formatDate } from "../utils";
import type { QuestionnaireData } from "../types";

interface QuestionnairesTabProps {
  questionnaires: QuestionnaireData[];
}

export function QuestionnairesTab({ questionnaires }: QuestionnairesTabProps) {
  if (questionnaires.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardIcon className="h-12 w-12" />}
        illustration="questionnaire"
        title="No questionnaires yet"
        description="Your photographer will send you questionnaires to complete before your shoot. These help ensure they capture exactly what you need."
      />
    );
  }

  const pendingQuestionnaires = questionnaires.filter(
    (q) => q.status === "pending" || q.status === "in_progress"
  );
  const completedQuestionnaires = questionnaires.filter(
    (q) => q.status === "completed" || q.status === "approved"
  );

  return (
    <div className="space-y-4">
      {pendingQuestionnaires.length > 0 && (
        <PendingQuestionnairesSection questionnaires={pendingQuestionnaires} />
      )}
      {completedQuestionnaires.length > 0 && (
        <CompletedQuestionnairesSection questionnaires={completedQuestionnaires} />
      )}
    </div>
  );
}

function PendingQuestionnairesSection({ questionnaires }: { questionnaires: QuestionnaireData[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">Requires your attention</h3>
      {questionnaires.map((q) => (
        <PendingQuestionnaireCard key={q.id} questionnaire={q} />
      ))}
    </div>
  );
}

function PendingQuestionnaireCard({ questionnaire: q }: { questionnaire: QuestionnaireData }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/20">
          <ClipboardIcon className="h-5 w-5 text-[var(--warning)]" />
        </div>
        <div>
          <h3 className="font-medium text-[var(--foreground)]">{q.templateName}</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {q.bookingTitle && `For: ${q.bookingTitle}`}
            {q.bookingDate && ` • ${formatDate(q.bookingDate)}`}
            {q.isRequired && (
              <span className="ml-2 text-[var(--warning)]">Required</span>
            )}
          </p>
          {q.dueDate && (
            <p className="text-xs text-[var(--foreground-muted)]">
              Due: {formatDate(q.dueDate)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <QuestionnaireStatusBadge status={q.status} />
        <Link
          href={`/portal/questionnaires/${q.id}`}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          {q.status === "in_progress" ? "Continue" : "Start"}
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function CompletedQuestionnairesSection({ questionnaires }: { questionnaires: QuestionnaireData[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">Completed</h3>
      {questionnaires.map((q) => (
        <CompletedQuestionnaireCard key={q.id} questionnaire={q} />
      ))}
    </div>
  );
}

function CompletedQuestionnaireCard({ questionnaire: q }: { questionnaire: QuestionnaireData }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/20">
          <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
        </div>
        <div>
          <h3 className="font-medium text-[var(--foreground)]">{q.templateName}</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {q.bookingTitle && `For: ${q.bookingTitle}`}
            {q.completedAt && ` • Completed ${formatDate(q.completedAt)}`}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-[var(--success)]/20 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
        {q.status === "approved" ? "Approved" : "Submitted"}
      </span>
    </div>
  );
}

function QuestionnaireStatusBadge({ status }: { status: string }) {
  const statusStyles = {
    in_progress: "bg-[var(--ai)]/20 text-[var(--ai)]",
    pending: "bg-[var(--warning)]/20 text-[var(--warning)]",
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  const label = status === "in_progress" ? "In Progress" : "Pending";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

"use client";

import Link from "next/link";
import { ClipboardIcon, CheckCircleIcon, ChevronRightIcon } from "../icons";
import { formatDate } from "../utils";
import type { QuestionnaireData } from "../types";

interface QuestionnairesTabProps {
  questionnaires: QuestionnaireData[];
}

export function QuestionnairesTab({ questionnaires }: QuestionnairesTabProps) {
  if (questionnaires.length === 0) {
    return (
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
        <ClipboardIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
        <p className="mt-4 text-lg font-medium text-white">No questionnaires yet</p>
        <p className="mt-2 text-sm text-[#7c7c7c]">
          Your photographer will send you questionnaires to complete before your shoot
        </p>
      </div>
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
      <h3 className="text-sm font-medium text-[#a7a7a7]">Requires your attention</h3>
      {questionnaires.map((q) => (
        <PendingQuestionnaireCard key={q.id} questionnaire={q} />
      ))}
    </div>
  );
}

function PendingQuestionnaireCard({ questionnaire: q }: { questionnaire: QuestionnaireData }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f97316]/20">
          <ClipboardIcon className="h-5 w-5 text-[#f97316]" />
        </div>
        <div>
          <h3 className="font-medium text-white">{q.templateName}</h3>
          <p className="text-sm text-[#7c7c7c]">
            {q.bookingTitle && `For: ${q.bookingTitle}`}
            {q.bookingDate && ` • ${formatDate(q.bookingDate)}`}
            {q.isRequired && (
              <span className="ml-2 text-[#f97316]">Required</span>
            )}
          </p>
          {q.dueDate && (
            <p className="text-xs text-[#7c7c7c]">
              Due: {formatDate(q.dueDate)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <QuestionnaireStatusBadge status={q.status} />
        <Link
          href={`/portal/questionnaires/${q.id}`}
          className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3b82f6]/90"
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
      <h3 className="text-sm font-medium text-[#a7a7a7]">Completed</h3>
      {questionnaires.map((q) => (
        <CompletedQuestionnaireCard key={q.id} questionnaire={q} />
      ))}
    </div>
  );
}

function CompletedQuestionnaireCard({ questionnaire: q }: { questionnaire: QuestionnaireData }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#22c55e]/20">
          <CheckCircleIcon className="h-5 w-5 text-[#22c55e]" />
        </div>
        <div>
          <h3 className="font-medium text-white">{q.templateName}</h3>
          <p className="text-sm text-[#7c7c7c]">
            {q.bookingTitle && `For: ${q.bookingTitle}`}
            {q.completedAt && ` • Completed ${formatDate(q.completedAt)}`}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-[#22c55e]/20 px-2.5 py-1 text-xs font-medium text-[#22c55e]">
        {q.status === "approved" ? "Approved" : "Submitted"}
      </span>
    </div>
  );
}

function QuestionnaireStatusBadge({ status }: { status: string }) {
  const statusStyles = {
    in_progress: "bg-[#8b5cf6]/20 text-[#8b5cf6]",
    pending: "bg-[#f97316]/20 text-[#f97316]",
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  const label = status === "in_progress" ? "In Progress" : "Pending";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ClientQuestionnaireWithRelations } from "@/lib/actions/client-questionnaires";
import {
  approveQuestionnaire,
  sendQuestionnaireReminder,
} from "@/lib/actions/client-questionnaires";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Check,
  Clock,
  Mail,
  User,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface QuestionnaireResponseViewerProps {
  questionnaire: ClientQuestionnaireWithRelations;
}

export function QuestionnaireResponseViewer({
  questionnaire,
}: QuestionnaireResponseViewerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isApproving, setIsApproving] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Group responses by section
  const responsesBySection = questionnaire.template.fields.reduce(
    (acc, field) => {
      const section = field.section || "General Information";
      if (!acc[section]) {
        acc[section] = [];
      }
      const response = questionnaire.responses.find(
        (r) => r.fieldLabel === field.label
      );
      acc[section].push({
        field,
        value: response?.value,
      });
      return acc;
    },
    {} as Record<
      string,
      Array<{
        field: (typeof questionnaire.template.fields)[0];
        value: unknown;
      }>
    >
  );

  const handleApprove = async () => {
    setIsApproving(true);
    startTransition(async () => {
      const result = await approveQuestionnaire({ id: questionnaire.id });
      if (result.success) {
        showToast("Questionnaire approved", "success");
        router.refresh();
      } else {
        showToast(result.error, "error");
      }
      setIsApproving(false);
    });
  };

  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    startTransition(async () => {
      const result = await sendQuestionnaireReminder(questionnaire.id);
      if (result.success) {
        showToast("Reminder sent", "success");
        router.refresh();
      } else {
        showToast(result.error, "error");
      }
      setIsSendingReminder(false);
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "in_progress":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "approved":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "expired":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const isOverdue =
    questionnaire.dueDate &&
    new Date(questionnaire.dueDate) < new Date() &&
    (questionnaire.status === "pending" || questionnaire.status === "in_progress");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/questionnaires"
            className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Questionnaires
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {questionnaire.template.name}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Assigned to {questionnaire.client.fullName || questionnaire.client.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(questionnaire.status === "pending" ||
            questionnaire.status === "in_progress") && (
            <button
              onClick={handleSendReminder}
              disabled={isPending || isSendingReminder}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {isSendingReminder ? "Sending..." : "Send Reminder"}
            </button>
          )}
          {questionnaire.status === "completed" && (
            <button
              onClick={handleApprove}
              disabled={isPending || isApproving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isApproving ? "Approving..." : "Approve"}
            </button>
          )}
        </div>
      </div>

      {/* Status and Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                questionnaire.status === "completed" || questionnaire.status === "approved"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {questionnaire.status === "completed" || questionnaire.status === "approved" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Status</p>
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium mt-1 ${getStatusColor(
                  questionnaire.status
                )}`}
              >
                {questionnaire.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Client</p>
              <p className="text-sm font-medium text-foreground">
                {questionnaire.client.fullName || "No name"}
              </p>
              <p className="text-xs text-foreground-muted">{questionnaire.client.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                isOverdue ? "bg-red-500/10 text-red-400" : "bg-purple-500/10 text-purple-400"
              }`}
            >
              {isOverdue ? <AlertTriangle className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Due Date</p>
              <p className={`text-sm font-medium ${isOverdue ? "text-red-400" : "text-foreground"}`}>
                {questionnaire.dueDate ? formatDate(questionnaire.dueDate) : "No deadline"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Responses</p>
              <p className="text-sm font-medium text-foreground">
                {questionnaire.responses.length} / {questionnaire.template.fields.length} fields
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking/Project Info */}
      {(questionnaire.booking || questionnaire.project) && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h3 className="text-sm font-medium text-foreground-muted mb-2">Linked To</h3>
          <div className="flex items-center gap-4">
            {questionnaire.booking && (
              <div>
                <p className="text-sm font-medium text-foreground">
                  {questionnaire.booking.title}
                </p>
                <p className="text-xs text-foreground-muted">
                  {formatDate(questionnaire.booking.startTime)}
                </p>
              </div>
            )}
            {questionnaire.project && (
              <div>
                <p className="text-sm font-medium text-foreground">
                  {questionnaire.project.name}
                </p>
                <p className="text-xs text-foreground-muted">Project</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responses by Section */}
      {Object.entries(responsesBySection).map(([section, items]) => (
        <div
          key={section}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
        >
          <div className="border-b border-[var(--card-border)] px-6 py-4">
            <h2 className="text-lg font-medium text-foreground">{section}</h2>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {items.map(({ field, value }) => (
              <div key={field.id} className="px-6 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {field.label}
                      {field.isRequired && <span className="ml-1 text-[var(--error)]">*</span>}
                    </p>
                    {field.helpText && (
                      <p className="text-xs text-foreground-muted mt-0.5">{field.helpText}</p>
                    )}
                  </div>
                  <div className="max-w-md text-left sm:text-right">
                    <p
                      className={`text-sm ${
                        value ? "text-foreground" : "text-foreground-muted italic"
                      }`}
                    >
                      {formatValue(value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Legal Agreements */}
      {questionnaire.agreements.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="border-b border-[var(--card-border)] px-6 py-4">
            <h2 className="text-lg font-medium text-foreground">Legal Agreements</h2>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {questionnaire.agreements.map((agreement) => (
              <div key={agreement.id} className="px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-full p-1 mt-0.5 ${
                        agreement.accepted
                          ? "bg-green-500/10 text-green-400"
                          : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {agreement.accepted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{agreement.title}</p>
                      <p className="text-xs text-foreground-muted">
                        {agreement.agreementType.replace(/_/g, " ")}
                      </p>

                      {/* Signature display */}
                      {agreement.signatureData && (
                        <div className="mt-3">
                          <p className="text-xs text-foreground-muted mb-2">Signature:</p>
                          <div className="inline-block rounded-lg border border-[var(--card-border)] bg-white p-2">
                            <img
                              src={agreement.signatureData}
                              alt={`Signature for ${agreement.title}`}
                              className="h-12 w-auto"
                            />
                          </div>
                          <p className="text-xs text-foreground-muted mt-1">
                            {agreement.signatureType === "drawn" ? "Hand-drawn" :
                             agreement.signatureType === "typed" ? "Typed" :
                             agreement.signatureType === "uploaded" ? "Uploaded" : ""} signature
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {agreement.accepted ? (
                      <div>
                        <p className="text-sm text-green-400">Accepted</p>
                        {agreement.acceptedAt && (
                          <p className="text-xs text-foreground-muted">
                            {formatDate(agreement.acceptedAt)}
                          </p>
                        )}
                        {agreement.acceptedIp && (
                          <p className="text-xs text-foreground-muted mt-1">
                            IP: {agreement.acceptedIp}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground-muted">Not accepted</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal Notes */}
      {questionnaire.internalNotes && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-medium text-foreground-muted mb-2">Internal Notes</h3>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {questionnaire.internalNotes}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="text-sm font-medium text-foreground-muted mb-4">Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-foreground-muted">Created:</span>
            <span className="text-foreground">{formatDate(questionnaire.createdAt)}</span>
          </div>
          {questionnaire.startedAt && (
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-purple-400" />
              <span className="text-foreground-muted">Started:</span>
              <span className="text-foreground">{formatDate(questionnaire.startedAt)}</span>
            </div>
          )}
          {questionnaire.completedAt && (
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-foreground-muted">Completed:</span>
              <span className="text-foreground">{formatDate(questionnaire.completedAt)}</span>
            </div>
          )}
          {questionnaire.lastReminder && (
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="text-foreground-muted">Last reminder:</span>
              <span className="text-foreground">
                {formatDate(questionnaire.lastReminder)} ({questionnaire.remindersSent} sent)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuestionnaireTemplateWithRelations } from "@/lib/actions/questionnaire-templates";
import type { ClientQuestionnaireWithRelations } from "@/lib/actions/client-questionnaires";
import type { Industry } from "@prisma/client";
import { FileText, Plus, Users, Clock, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { AssignQuestionnaireModal } from "@/components/modals/assign-questionnaire-modal";

interface QuestionnaireStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  approved: number;
  overdue: number;
}

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  company?: string | null;
}

interface QuestionnairesPageClientProps {
  templates: QuestionnaireTemplateWithRelations[];
  templatesByIndustry: Record<string, QuestionnaireTemplateWithRelations[]>;
  questionnaires: ClientQuestionnaireWithRelations[];
  stats: QuestionnaireStats | null;
  organizationIndustries: Industry[];
  primaryIndustry: Industry;
  clients: Client[];
}

export function QuestionnairesPageClient({
  templates,
  questionnaires,
  stats,
  clients,
}: QuestionnairesPageClientProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "assigned">("templates");
  const [showAssignModal, setShowAssignModal] = useState(false);

  const statCards = [
    { label: "Total Sent", value: stats?.total || 0, icon: FileText, color: "text-blue-400" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-yellow-400" },
    { label: "In Progress", value: stats?.inProgress || 0, icon: Users, color: "text-purple-400" },
    { label: "Completed", value: stats?.completed || 0, icon: CheckCircle, color: "text-green-400" },
    { label: "Overdue", value: stats?.overdue || 0, icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Questionnaires</h1>
          <p className="text-sm text-foreground-muted">
            Create templates and send questionnaires to clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
          >
            <Send className="h-4 w-4" />
            Assign to Client
          </button>
          <Link
            href="/questionnaires/templates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
          >
            <div className="flex items-center gap-3">
              <div className={"rounded-lg bg-background p-2 " + stat.color}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-foreground-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-[var(--card-border)]">
        <button
          onClick={() => setActiveTab("templates")}
          className={"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px " +
            (activeTab === "templates"
              ? "border-[var(--primary)] text-foreground"
              : "border-transparent text-foreground-muted hover:text-foreground")
          }
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab("assigned")}
          className={"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px " +
            (activeTab === "assigned"
              ? "border-[var(--primary)] text-foreground"
              : "border-transparent text-foreground-muted hover:text-foreground")
          }
        >
          Assigned ({questionnaires.length})
        </button>
      </div>

      {activeTab === "templates" ? (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-foreground-muted" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No templates yet</h3>
              <p className="mt-2 text-sm text-foreground-muted">
                Create your first questionnaire template to start collecting client information.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Link
                  key={template.id}
                  href={"/questionnaires/templates/" + template.id}
                  className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-[var(--border-hover)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-[var(--primary)]">
                        {template.name}
                      </h3>
                      <p className="mt-1 text-xs text-foreground-muted capitalize">
                        {template.industry.replace(/_/g, " ")}
                      </p>
                    </div>
                    {template.isSystemTemplate && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                        System
                      </span>
                    )}
                  </div>
                  {template.description && (
                    <p className="mt-2 text-sm text-foreground-muted line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-xs text-foreground-muted">
                    <span>{template.fields.length} fields</span>
                    <span>{template._count.questionnaires} uses</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {questionnaires.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-foreground-muted" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No questionnaires assigned</h3>
              <p className="mt-2 text-sm text-foreground-muted">
                Assign questionnaire templates to clients to start collecting responses.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[var(--card-border)] bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Template</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {questionnaires.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-background/50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/questionnaires/assigned/${q.id}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{q.client.fullName || q.client.email}</p>
                        <p className="text-xs text-foreground-muted">{q.client.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{q.template.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-muted">
                        {q.dueDate ? new Date(q.dueDate).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AssignQuestionnaireModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        templates={templates}
        clients={clients}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    in_progress: "bg-purple-500/10 text-purple-400",
    completed: "bg-green-500/10 text-green-400",
    approved: "bg-blue-500/10 text-blue-400",
  };
  return (
    <span className={"inline-flex rounded-full px-2 py-0.5 text-xs font-medium " + (styles[status] || "bg-gray-500/10 text-gray-400")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

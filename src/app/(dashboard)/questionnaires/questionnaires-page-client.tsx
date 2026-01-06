"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { QuestionnaireTemplateWithRelations } from "@/lib/actions/questionnaire-templates";
import type { ClientQuestionnaireWithRelations } from "@/lib/actions/client-questionnaires";
import type { Industry } from "@prisma/client";
import { FileText, Plus, Users, Clock, CheckCircle, AlertTriangle, Send, Search, X } from "lucide-react";
import { AssignQuestionnaireModal } from "@/components/modals/assign-questionnaire-modal";
import { VirtualList } from "@/components/ui/virtual-list";

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

type QuestionnaireStatus = "all" | "pending" | "in_progress" | "completed" | "approved";

export function QuestionnairesPageClient({
  templates,
  questionnaires,
  stats,
  clients,
}: QuestionnairesPageClientProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "assigned">("templates");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuestionnaireStatus>("all");

  // Filter templates by search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter((t) =>
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.industry.replace(/_/g, " ").toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // Filter questionnaires by search query and status
  const filteredQuestionnaires = useMemo(() => {
    return questionnaires.filter((q) => {
      // Status filter
      if (statusFilter !== "all" && q.status !== statusFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const clientName = q.client.fullName?.toLowerCase() || "";
        const clientEmail = q.client.email.toLowerCase();
        const templateName = q.template.name.toLowerCase();
        return clientName.includes(query) || clientEmail.includes(query) || templateName.includes(query);
      }
      return true;
    });
  }, [questionnaires, searchQuery, statusFilter]);

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    return {
      all: questionnaires.length,
      pending: questionnaires.filter((q) => q.status === "pending").length,
      in_progress: questionnaires.filter((q) => q.status === "in_progress").length,
      completed: questionnaires.filter((q) => q.status === "completed").length,
      approved: questionnaires.filter((q) => q.status === "approved").length,
    };
  }, [questionnaires]);

  const statCards = [
    { label: "Total Sent", value: stats?.total || 0, icon: FileText, color: "text-[var(--primary)]" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-[var(--warning)]" },
    { label: "In Progress", value: stats?.inProgress || 0, icon: Users, color: "text-[var(--ai)]" },
    { label: "Completed", value: stats?.completed || 0, icon: CheckCircle, color: "text-[var(--success)]" },
    { label: "Overdue", value: stats?.overdue || 0, icon: AlertTriangle, color: "text-[var(--error)]" },
  ];

  return (
    <div className="space-y-6">
      <div className="stack-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Questionnaires</h1>
          <p className="text-sm text-foreground-muted">
            Create templates and send questionnaires to clients
          </p>
        </div>
        <div className="stack-actions">
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

      <div className="auto-grid grid-min-220 grid-gap-4">
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

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder={activeTab === "templates" ? "Search templates..." : "Search by client or template..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status filters (only show on assigned tab) */}
        {activeTab === "assigned" && (
          <div className="flex flex-wrap gap-1.5">
            {(["all", "pending", "in_progress", "completed", "approved"] as QuestionnaireStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  statusFilter === status
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                )}
              >
                {status === "all" ? "All" : status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                <span className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  statusFilter === status ? "bg-white/20" : "bg-[var(--background)]"
                )}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--card-border)]">
        <button
          onClick={() => setActiveTab("templates")}
          className={"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px " +
            (activeTab === "templates"
              ? "border-[var(--primary)] text-foreground"
              : "border-transparent text-foreground-muted hover:text-foreground")
          }
        >
          Templates ({searchQuery && activeTab === "templates" ? `${filteredTemplates.length}/` : ""}{templates.length})
        </button>
        <button
          onClick={() => setActiveTab("assigned")}
          className={"px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px " +
            (activeTab === "assigned"
              ? "border-[var(--primary)] text-foreground"
              : "border-transparent text-foreground-muted hover:text-foreground")
          }
        >
          Assigned ({(searchQuery || statusFilter !== "all") && activeTab === "assigned" ? `${filteredQuestionnaires.length}/` : ""}{questionnaires.length})
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
          ) : filteredTemplates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-foreground-muted" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No templates found</h3>
              <p className="mt-2 text-sm text-foreground-muted">
                No templates match &quot;{searchQuery}&quot;. Try a different search term.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="auto-grid grid-min-240 grid-gap-4">
              {filteredTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={"/questionnaires/templates/" + template.id}
                  className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-[var(--border-hover)] transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-[var(--primary)]">
                        {template.name}
                      </h3>
                      <p className="mt-1 text-xs text-foreground-muted capitalize">
                        {template.industry.replace(/_/g, " ")}
                      </p>
                    </div>
                    {template.isSystemTemplate && (
                      <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]">
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
          ) : filteredQuestionnaires.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-foreground-muted" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No questionnaires found</h3>
              <p className="mt-2 text-sm text-foreground-muted">
                {searchQuery
                  ? `No questionnaires match "${searchQuery}".`
                  : `No ${statusFilter.replace(/_/g, " ")} questionnaires.`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
              <VirtualList
                className="max-h-[70vh]"
                items={filteredQuestionnaires}
                getItemKey={(q) => q.id}
                estimateSize={() => 96}
                itemGap={0}
                prepend={
                  <div className="sticky top-0 z-10 hidden grid-cols-[1.4fr,1.2fr,1fr,1fr] items-center gap-3 border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted md:grid">
                    <span>Client</span>
                    <span>Template</span>
                    <span>Status</span>
                    <span>Due</span>
                  </div>
                }
                renderItem={(q) => (
                  <button
                    key={q.id}
                    onClick={() => (window.location.href = `/questionnaires/assigned/${q.id}`)}
                    className="flex w-full flex-col gap-3 border-b border-[var(--card-border)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--background-hover)] md:grid md:grid-cols-[1.4fr,1.2fr,1fr,1fr] md:items-center md:gap-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{q.client.fullName || q.client.email}</p>
                      <p className="text-xs text-foreground-muted">{q.client.email}</p>
                    </div>
                    <div className="text-sm text-foreground">{q.template.name}</div>
                    <div>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="text-sm text-foreground-muted">
                      {q.dueDate ? new Date(q.dueDate).toLocaleDateString() : "-"}
                    </div>
                  </button>
                )}
              />
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
    pending: "bg-[var(--warning)]/10 text-[var(--warning-text)]",
    in_progress: "bg-[var(--ai)]/10 text-[var(--ai-text)]",
    completed: "bg-[var(--success)]/10 text-[var(--success-text)]",
    approved: "bg-[var(--primary)]/10 text-[var(--primary)]",
  };
  return (
    <span className={"inline-flex rounded-full px-2 py-0.5 text-xs font-medium " + (styles[status] || "bg-[var(--foreground-muted)]/10 text-foreground-muted")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

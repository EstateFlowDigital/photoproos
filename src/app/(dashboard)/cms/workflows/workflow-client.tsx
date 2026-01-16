"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  ChevronLeft,
  Plus,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit3,
  Info,
  Loader2,
  ArrowRight,
  Square,
  Zap,
  Bell,
} from "lucide-react";
import {
  WorkflowBuilder,
  WorkflowInstanceStatus,
} from "@/components/cms/workflow-builder";
import {
  initializeDefaultWorkflows,
  toggleWorkflowActive,
  deleteExistingWorkflow,
  startEntityWorkflow,
  approveWorkflowStep,
  rejectWorkflowStep,
  getWorkflows,
} from "@/lib/actions/cms-workflows";
import type { WorkflowStep, WorkflowInstanceData } from "@/lib/actions/cms-workflows-types";
import type { CMSWorkflow, WorkflowStepType } from "@prisma/client";

interface WorkflowPageClientProps {
  initialWorkflows: CMSWorkflow[];
  initialStats: {
    totalWorkflows: number;
    activeWorkflows: number;
    pendingInstances: number;
    completedInstances: number;
    rejectedInstances: number;
  } | null;
  userId: string;
}

export function WorkflowPageClient({
  initialWorkflows,
  initialStats,
  userId,
}: WorkflowPageClientProps) {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [stats] = useState(initialStats);
  const [view, setView] = useState<"list" | "builder" | "demo">("list");
  const [selectedWorkflow, setSelectedWorkflow] = useState<CMSWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo state
  const [demoInstance, setDemoInstance] = useState<WorkflowInstanceData | null>(null);
  const [demoEntityId] = useState(`demo-page-${Date.now()}`);

  const handleInitDefaults = async () => {
    setIsLoading(true);
    const result = await initializeDefaultWorkflows();
    if (result.success) {
      const refreshed = await getWorkflows();
      if (refreshed.success && refreshed.data) {
        setWorkflows(refreshed.data);
      }
    }
    setIsLoading(false);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const result = await toggleWorkflowActive(id, !isActive);
    if (result.success && result.data) {
      setWorkflows(workflows.map(w => w.id === id ? result.data! : w));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    const result = await deleteExistingWorkflow(id);
    if (result.success) {
      setWorkflows(workflows.filter(w => w.id !== id));
      if (selectedWorkflow?.id === id) {
        setSelectedWorkflow(null);
      }
    }
  };

  const handleStartDemo = async (workflow: CMSWorkflow) => {
    setIsLoading(true);
    const result = await startEntityWorkflow(
      workflow.id,
      "DemoPage",
      demoEntityId,
      "Demo Marketing Page",
      { id: userId, name: "Demo User" }
    );
    if (result.success && result.data) {
      setDemoInstance(result.data);
      setView("demo");
    }
    setIsLoading(false);
  };

  const handleApprove = async (comment?: string) => {
    if (!demoInstance) return;
    setIsLoading(true);
    const result = await approveWorkflowStep(
      demoInstance.id,
      { id: userId, name: "Demo User" },
      comment
    );
    if (result.success && result.data) {
      setDemoInstance(result.data);
    }
    setIsLoading(false);
  };

  const handleReject = async (reason?: string) => {
    if (!demoInstance) return;
    setIsLoading(true);
    const result = await rejectWorkflowStep(
      demoInstance.id,
      { id: userId, name: "Demo User" },
      reason
    );
    if (result.success && result.data) {
      setDemoInstance(result.data);
    }
    setIsLoading(false);
  };

  // Builder view
  if (view === "builder") {
    return (
      <div className="h-[calc(100vh-120px)]">
        <WorkflowBuilder
          workflow={selectedWorkflow || undefined}
          onSave={async () => {
            const refreshed = await getWorkflows();
            if (refreshed.success && refreshed.data) {
              setWorkflows(refreshed.data);
            }
            setView("list");
            setSelectedWorkflow(null);
          }}
          onCancel={() => {
            setView("list");
            setSelectedWorkflow(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/cms"
          className="p-2 hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-500" />
            Workflow Builder
          </h1>
          <p className="text-foreground-secondary text-sm">
            Create visual approval workflows for content
          </p>
        </div>
        <button
          onClick={handleInitDefaults}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Init Defaults
        </button>
        <button
          onClick={() => {
            setSelectedWorkflow(null);
            setView("builder");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Instructions Panel */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-purple-500 mb-1">How to Test Workflows</p>
            <ol className="list-decimal list-inside space-y-1 text-foreground-secondary">
              <li>Click &quot;Init Defaults&quot; to create sample workflows</li>
              <li>Click any workflow card to edit it in the visual builder</li>
              <li>Click the play button to start a demo workflow instance</li>
              <li>Approve or reject steps to see the workflow progress</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <StatCard label="Total" value={stats.totalWorkflows} icon={GitBranch} color="text-purple-500" />
          <StatCard label="Active" value={stats.activeWorkflows} icon={CheckCircle} color="text-green-500" />
          <StatCard label="Pending" value={stats.pendingInstances} icon={Clock} color="text-yellow-500" />
          <StatCard label="Completed" value={stats.completedInstances} icon={CheckCircle} color="text-blue-500" />
          <StatCard label="Rejected" value={stats.rejectedInstances} icon={XCircle} color="text-red-500" />
        </div>
      )}

      {/* Demo Instance */}
      {view === "demo" && demoInstance && (
        <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Live Workflow Demo
            </h2>
            <button
              onClick={() => {
                setView("list");
                setDemoInstance(null);
              }}
              className="text-sm text-foreground-secondary hover:text-foreground"
            >
              Close Demo
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Instance Status */}
            <WorkflowInstanceStatus
              instance={demoInstance}
              onApprove={handleApprove}
              onReject={handleReject}
            />

            {/* Visual Progress */}
            <div className="p-4 bg-[var(--background-tertiary)] rounded-lg">
              <h3 className="text-sm font-medium mb-4">Workflow Progress</h3>
              <WorkflowVisualProgress instance={demoInstance} />
            </div>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Available Workflows</h2>

        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
            <p className="text-foreground-secondary mb-4">No workflows created yet</p>
            <button
              onClick={handleInitDefaults}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
            >
              Initialize Default Workflows
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={() => {
                  setSelectedWorkflow(workflow);
                  setView("builder");
                }}
                onToggle={() => handleToggleActive(workflow.id, workflow.isActive)}
                onDelete={() => handleDelete(workflow.id)}
                onStartDemo={() => handleStartDemo(workflow)}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Step Type Reference */}
      <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Step Types Reference</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StepTypeCard type="start" name="Start" description="Entry point" icon={Play} color="text-green-500" />
          <StepTypeCard type="end" name="End" description="Completion point" icon={Square} color="text-gray-500" />
          <StepTypeCard type="approval" name="Approval" description="Requires user approval" icon={CheckCircle} color="text-blue-500" />
          <StepTypeCard type="condition" name="Condition" description="Branch based on rules" icon={GitBranch} color="text-yellow-500" />
          <StepTypeCard type="action" name="Action" description="Automated action" icon={Zap} color="text-purple-500" />
          <StepTypeCard type="delay" name="Delay" description="Wait period" icon={Clock} color="text-orange-500" />
          <StepTypeCard type="notification" name="Notification" description="Send alerts" icon={Bell} color="text-pink-500" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-foreground-secondary">{label}</p>
    </div>
  );
}

function WorkflowCard({
  workflow,
  onEdit,
  onToggle,
  onDelete,
  onStartDemo,
  isLoading,
}: {
  workflow: CMSWorkflow;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onStartDemo: () => void;
  isLoading: boolean;
}) {
  const steps = workflow.steps as unknown as WorkflowStep[];
  const stepCount = steps.length;
  const targetCount = (workflow.targetTypes as string[]).length;

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      workflow.isActive
        ? "bg-[var(--background-tertiary)] border-[var(--border)]"
        : "bg-[var(--background)] border-[var(--border)] opacity-60"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={onEdit}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{workflow.name}</h3>
            {workflow.isDefault && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/10 text-purple-500 rounded">
                DEFAULT
              </span>
            )}
          </div>
          {workflow.description && (
            <p className="text-sm text-foreground-secondary mb-2">{workflow.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-foreground-muted">
            <span>{stepCount} steps</span>
            <span>{targetCount} types</span>
            <span>Priority: {workflow.priority}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onStartDemo}
            disabled={isLoading || !workflow.isActive}
            className="p-2 text-green-500 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
            title="Start Demo"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] rounded transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className={`p-2 rounded transition-colors ${
              workflow.isActive
                ? "text-green-500 hover:bg-green-500/10"
                : "text-foreground-muted hover:bg-[var(--background-hover)]"
            }`}
            title={workflow.isActive ? "Deactivate" : "Activate"}
          >
            {workflow.isActive ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-foreground-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Step Preview */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {steps.slice(0, 6).map((step, index) => (
            <div key={step.id} className="flex items-center gap-1">
              <StepBadge type={step.type} name={step.name} />
              {index < Math.min(steps.length - 1, 5) && (
                <ArrowRight className="w-3 h-3 text-foreground-muted shrink-0" />
              )}
            </div>
          ))}
          {steps.length > 6 && (
            <span className="text-xs text-foreground-muted">+{steps.length - 6} more</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBadge({ type, name }: { type: WorkflowStepType; name: string }) {
  const colors: Record<WorkflowStepType, string> = {
    start: "bg-green-500/10 text-green-500 border-green-500/20",
    end: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    approval: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    condition: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    action: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delay: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    notification: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  };

  return (
    <span className={`px-2 py-1 text-[10px] font-medium rounded border whitespace-nowrap ${colors[type]}`}>
      {name}
    </span>
  );
}

function StepTypeCard({
  type: _type,
  name,
  description,
  icon: Icon,
  color,
}: {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="font-medium text-sm">{name}</span>
      </div>
      <p className="text-xs text-foreground-muted">{description}</p>
    </div>
  );
}

function WorkflowVisualProgress({ instance }: { instance: WorkflowInstanceData }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    in_progress: "bg-blue-500",
    paused: "bg-orange-500",
    completed: "bg-green-500",
    rejected: "bg-red-500",
    cancelled: "bg-gray-500",
  };

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${statusColors[instance.status]}`} />
        <span className="font-medium capitalize">{instance.status.replace("_", " ")}</span>
      </div>

      {/* Progress Steps */}
      <div className="space-y-2">
        {instance.history.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              entry.action === "completed" || entry.action === "started"
                ? "bg-green-500"
                : entry.action === "entered"
                ? "bg-blue-500"
                : "bg-gray-500"
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{entry.stepName}</p>
              <p className="text-xs text-foreground-muted">
                {entry.action}
                {entry.userName && ` by ${entry.userName}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Current Step */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm">
          <span className="text-foreground-muted">Current Step:</span>{" "}
          <span className="font-medium">{instance.currentStepName}</span>
        </p>
      </div>
    </div>
  );
}

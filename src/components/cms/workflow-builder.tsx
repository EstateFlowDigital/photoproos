"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  getWorkflows,
  createNewWorkflow,
  updateExistingWorkflow,
  deleteExistingWorkflow,
  toggleWorkflowActive,
  getWorkflowStats,
  initializeDefaultWorkflows,
  type WorkflowStep,
  type WorkflowInstanceData,
} from "@/lib/actions/cms-workflows";
import type { CMSWorkflow, WorkflowStepType } from "@prisma/client";
import {
  Play,
  CheckCircle,
  XCircle,
  GitBranch,
  Zap,
  Clock,
  Bell,
  Square,
  Plus,
  Trash2,
  Save,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface WorkflowBuilderProps {
  workflow?: CMSWorkflow;
  onSave?: (workflow: CMSWorkflow) => void;
  onCancel?: () => void;
  className?: string;
}

interface WorkflowListProps {
  workflows: CMSWorkflow[];
  onSelect: (workflow: CMSWorkflow) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
  className?: string;
}

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  layout: Record<string, { x: number; y: number }>;
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  onUpdateLayout: (layout: Record<string, { x: number; y: number }>) => void;
  onDeleteStep: (id: string) => void;
  className?: string;
}

interface StepEditorProps {
  step: WorkflowStep | null;
  onUpdate: (step: WorkflowStep) => void;
  onClose: () => void;
  className?: string;
}

interface WorkflowInstanceStatusProps {
  instance: WorkflowInstanceData;
  onApprove?: (comment?: string) => void;
  onReject?: (reason?: string) => void;
  onCancel?: (reason?: string) => void;
  className?: string;
}

// ============================================================================
// STEP TYPE CONFIG
// ============================================================================

const STEP_TYPES: {
  type: WorkflowStepType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    type: "start",
    name: "Start",
    description: "Workflow entry point",
    icon: Play,
    color: "text-green-500",
  },
  {
    type: "end",
    name: "End",
    description: "Workflow completion",
    icon: Square,
    color: "text-gray-500",
  },
  {
    type: "approval",
    name: "Approval",
    description: "Requires user approval",
    icon: CheckCircle,
    color: "text-blue-500",
  },
  {
    type: "condition",
    name: "Condition",
    description: "Branch based on rules",
    icon: GitBranch,
    color: "text-yellow-500",
  },
  {
    type: "action",
    name: "Action",
    description: "Perform an action",
    icon: Zap,
    color: "text-purple-500",
  },
  {
    type: "delay",
    name: "Delay",
    description: "Wait before continuing",
    icon: Clock,
    color: "text-orange-500",
  },
  {
    type: "notification",
    name: "Notification",
    description: "Send notifications",
    icon: Bell,
    color: "text-pink-500",
  },
];

// ============================================================================
// WORKFLOW BUILDER
// ============================================================================

export function WorkflowBuilder({
  workflow,
  onSave,
  onCancel,
  className,
}: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || "New Workflow");
  const [description, setDescription] = useState(workflow?.description || "");
  const [targetTypes, setTargetTypes] = useState<string[]>(
    (workflow?.targetTypes as string[]) || ["MarketingPage"]
  );
  const [steps, setSteps] = useState<WorkflowStep[]>(
    (workflow?.steps as unknown as WorkflowStep[]) || [
      {
        id: "start",
        name: "Start",
        type: "start" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
      {
        id: "end",
        name: "End",
        type: "end" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
    ]
  );
  const [layout, setLayout] = useState<Record<string, { x: number; y: number }>>(
    (workflow?.layout as Record<string, { x: number; y: number }>) || {
      start: { x: 250, y: 50 },
      end: { x: 250, y: 250 },
    }
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedStep = useMemo(
    () => steps.find((s) => s.id === selectedStepId) || null,
    [steps, selectedStepId]
  );

  const handleAddStep = useCallback(
    (type: WorkflowStepType) => {
      const typeConfig = STEP_TYPES.find((t) => t.type === type);
      const id = `${type}-${Date.now()}`;

      const newStep: WorkflowStep = {
        id,
        name: typeConfig?.name || type,
        type,
        config: {},
        nextSteps: [],
      };

      // Position new step below center
      const maxY = Math.max(...Object.values(layout).map((l) => l.y), 0);
      setLayout((prev) => ({
        ...prev,
        [id]: { x: 250, y: maxY + 100 },
      }));

      setSteps((prev) => [...prev, newStep]);
      setSelectedStepId(id);
    },
    [layout]
  );

  const handleUpdateStep = useCallback((updatedStep: WorkflowStep) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === updatedStep.id ? updatedStep : s))
    );
  }, []);

  const handleDeleteStep = useCallback(
    (id: string) => {
      const step = steps.find((s) => s.id === id);
      if (step?.type === "start" || step?.type === "end") {
        return; // Can't delete start/end
      }

      // Remove from all nextSteps references
      setSteps((prev) =>
        prev
          .filter((s) => s.id !== id)
          .map((s) => ({
            ...s,
            nextSteps: s.nextSteps.filter((ns) => ns !== id),
          }))
      );

      setLayout((prev) => {
        const newLayout = { ...prev };
        delete newLayout[id];
        return newLayout;
      });

      if (selectedStepId === id) {
        setSelectedStepId(null);
      }
    },
    [steps, selectedStepId]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        name,
        description: description || undefined,
        targetTypes,
        steps,
        layout,
        priority: workflow?.priority || 0,
        isActive: workflow?.isActive ?? true,
      };

      const result = workflow
        ? await updateExistingWorkflow(workflow.id, data)
        : await createNewWorkflow(data);

      if (result.success && result.data) {
        onSave?.(result.data);
      } else {
        console.error("Failed to save workflow:", result.error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0"
            placeholder="Workflow name"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm text-foreground-secondary bg-transparent border-none focus:outline-none focus:ring-0"
            placeholder="Description (optional)"
          />
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Workflow
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Step Library */}
        <div className="w-48 border-r border-[var(--border)] p-4 overflow-y-auto">
          <h3 className="text-sm font-medium mb-3">Add Step</h3>
          <div className="space-y-2">
            {STEP_TYPES.filter(
              (t) => t.type !== "start" && t.type !== "end"
            ).map((type) => (
              <button
                key={type.type}
                onClick={() => handleAddStep(type.type)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)] transition-colors text-left"
              >
                <type.icon className={cn("w-4 h-4", type.color)} />
                <div>
                  <p className="text-sm font-medium">{type.name}</p>
                  <p className="text-xs text-foreground-muted">
                    {type.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Target Types */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Target Types</h3>
            <div className="space-y-1">
              {["MarketingPage", "BlogPost", "FAQ"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={targetTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTargetTypes((prev) => [...prev, type]);
                      } else {
                        setTargetTypes((prev) =>
                          prev.filter((t) => t !== type)
                        );
                      }
                    }}
                    className="rounded border-[var(--border)]"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <WorkflowCanvas
          steps={steps}
          layout={layout}
          selectedStepId={selectedStepId}
          onSelectStep={setSelectedStepId}
          onUpdateLayout={setLayout}
          onDeleteStep={handleDeleteStep}
          className="flex-1"
        />

        {/* Step Editor */}
        {selectedStep && (
          <StepEditor
            step={selectedStep}
            onUpdate={handleUpdateStep}
            onClose={() => setSelectedStepId(null)}
            className="w-80 border-l border-[var(--border)]"
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// WORKFLOW CANVAS
// ============================================================================

function WorkflowCanvas({
  steps,
  layout,
  selectedStepId,
  onSelectStep,
  onUpdateLayout,
  onDeleteStep,
  className,
}: WorkflowCanvasProps) {
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, stepId: string) => {
      e.stopPropagation();
      const stepPos = layout[stepId] || { x: 0, y: 0 };
      setDraggedStep(stepId);
      setDragOffset({
        x: e.clientX - stepPos.x,
        y: e.clientY - stepPos.y,
      });
    },
    [layout]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedStep) return;

      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);

      onUpdateLayout({
        ...layout,
        [draggedStep]: { x: newX, y: newY },
      });
    },
    [draggedStep, dragOffset, layout, onUpdateLayout]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedStep(null);
  }, []);

  // Draw connections
  const connections = useMemo(() => {
    const lines: { from: string; to: string }[] = [];
    steps.forEach((step) => {
      step.nextSteps.forEach((nextId) => {
        lines.push({ from: step.id, to: nextId });
      });
    });
    return lines;
  }, [steps]);

  return (
    <div
      className={cn(
        "relative overflow-auto bg-[var(--background-tertiary)]",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => onSelectStep(null)}
    >
      {/* Connection lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: "100%", minHeight: "100%" }}>
        {connections.map((conn) => {
          const fromPos = layout[conn.from] || { x: 0, y: 0 };
          const toPos = layout[conn.to] || { x: 0, y: 0 };

          return (
            <g key={`${conn.from}-${conn.to}`}>
              <line
                x1={fromPos.x + 80}
                y1={fromPos.y + 25}
                x2={toPos.x + 80}
                y2={toPos.y + 25}
                stroke="var(--border-visible)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--border-visible)"
            />
          </marker>
        </defs>
      </svg>

      {/* Step nodes */}
      {steps.map((step) => {
        const pos = layout[step.id] || { x: 0, y: 0 };
        const typeConfig = STEP_TYPES.find((t) => t.type === step.type);
        const Icon = typeConfig?.icon || Square;

        return (
          <div
            key={step.id}
            className={cn(
              "absolute flex items-center gap-2 px-3 py-2 rounded-lg cursor-move select-none transition-shadow",
              "bg-[var(--card)] border border-[var(--card-border)]",
              selectedStepId === step.id && "ring-2 ring-[var(--primary)]",
              draggedStep === step.id && "shadow-lg"
            )}
            style={{
              left: pos.x,
              top: pos.y,
              minWidth: 160,
            }}
            onMouseDown={(e) => handleMouseDown(e, step.id)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStep(step.id);
            }}
          >
            <Icon className={cn("w-4 h-4 shrink-0", typeConfig?.color)} />
            <span className="text-sm font-medium truncate">{step.name}</span>
            {step.type !== "start" && step.type !== "end" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStep(step.id);
                }}
                className="ml-auto p-1 text-foreground-muted hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// STEP EDITOR
// ============================================================================

function StepEditor({ step, onUpdate, onClose, className }: StepEditorProps) {
  if (!step) return null;

  const typeConfig = STEP_TYPES.find((t) => t.type === step.type);
  const Icon = typeConfig?.icon || Square;

  const handleNameChange = (name: string) => {
    onUpdate({ ...step, name });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    onUpdate({
      ...step,
      config: { ...step.config, [key]: value },
    });
  };

  const handleNextStepsChange = (nextSteps: string[]) => {
    onUpdate({ ...step, nextSteps });
  };

  return (
    <div className={cn("p-4 overflow-y-auto", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-5 h-5", typeConfig?.color)} />
          <h3 className="font-semibold">{typeConfig?.name || step.type}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-foreground-muted hover:text-foreground transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Step Name</label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={step.config.description || ""}
            onChange={(e) => handleConfigChange("description", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
            placeholder="Optional description"
          />
        </div>

        {/* Type-specific config */}
        {step.type === "approval" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Approvers (comma-separated)
              </label>
              <input
                type="text"
                value={(step.config.approvers || []).join(", ")}
                onChange={(e) =>
                  handleConfigChange(
                    "approvers",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
                placeholder="admin, editor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Approvals
              </label>
              <input
                type="number"
                value={step.config.minApprovals || 1}
                onChange={(e) =>
                  handleConfigChange("minApprovals", parseInt(e.target.value) || 1)
                }
                min={1}
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </>
        )}

        {step.type === "condition" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Field to Check
              </label>
              <input
                type="text"
                value={step.config.rules?.[0]?.field || ""}
                onChange={(e) =>
                  handleConfigChange("rules", [
                    { ...step.config.rules?.[0], field: e.target.value },
                  ])
                }
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
                placeholder="entityType"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Operator</label>
              <select
                value={step.config.rules?.[0]?.operator || "equals"}
                onChange={(e) =>
                  handleConfigChange("rules", [
                    { ...step.config.rules?.[0], operator: e.target.value },
                  ])
                }
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="not_contains">Not Contains</option>
                <option value="is_empty">Is Empty</option>
                <option value="is_not_empty">Is Not Empty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                type="text"
                value={String(step.config.rules?.[0]?.value || "")}
                onChange={(e) =>
                  handleConfigChange("rules", [
                    { ...step.config.rules?.[0], value: e.target.value },
                  ])
                }
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
                placeholder="MarketingPage"
              />
            </div>
          </>
        )}

        {step.type === "action" && (
          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <select
              value={step.config.action || "publish"}
              onChange={(e) => handleConfigChange("action", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="archive">Archive</option>
              <option value="notify_author">Notify Author</option>
              <option value="notify_reviewers">Notify Reviewers</option>
              <option value="set_status">Set Status</option>
            </select>
          </div>
        )}

        {step.type === "delay" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Delay (hours)
            </label>
            <input
              type="number"
              value={step.config.delayHours || 1}
              onChange={(e) =>
                handleConfigChange("delayHours", parseInt(e.target.value) || 1)
              }
              min={1}
              className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        )}

        {step.type === "notification" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Notify Users (comma-separated)
              </label>
              <input
                type="text"
                value={(step.config.notifyUsers || []).join(", ")}
                onChange={(e) =>
                  handleConfigChange(
                    "notifyUsers",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
                placeholder="author, editor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Addresses (comma-separated)
              </label>
              <input
                type="text"
                value={(step.config.notifyEmail || []).join(", ")}
                onChange={(e) =>
                  handleConfigChange(
                    "notifyEmail",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
                placeholder="admin@example.com"
              />
            </div>
          </>
        )}

        {/* Next Steps (for non-end nodes) */}
        {step.type !== "end" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Next Steps (comma-separated IDs)
            </label>
            <input
              type="text"
              value={step.nextSteps.join(", ")}
              onChange={(e) =>
                handleNextStepsChange(
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
              placeholder="step-id-1, step-id-2"
            />
            <p className="text-xs text-foreground-muted mt-1">
              Enter the IDs of steps this step should connect to
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// WORKFLOW LIST
// ============================================================================

export function WorkflowList({
  workflows,
  onSelect,
  onToggleActive,
  onDelete,
  selectedId,
  className,
}: WorkflowListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {workflows.length === 0 ? (
        <p className="text-sm text-foreground-secondary text-center py-8">
          No workflows created yet
        </p>
      ) : (
        workflows.map((workflow) => {
          const stepCount = (workflow.steps as unknown as WorkflowStep[])
            .length;
          const targetCount = (workflow.targetTypes as string[]).length;

          return (
            <div
              key={workflow.id}
              className={cn(
                "p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg cursor-pointer transition-all",
                selectedId === workflow.id && "ring-2 ring-[var(--primary)]"
              )}
              onClick={() => onSelect(workflow)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{workflow.name}</h4>
                    {workflow.isDefault && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-foreground-secondary truncate mt-0.5">
                      {workflow.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-foreground-muted">
                    <span>{stepCount} steps</span>
                    <span>{targetCount} types</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive(workflow.id, !workflow.isActive);
                    }}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      workflow.isActive
                        ? "text-green-500 hover:bg-green-500/10"
                        : "text-foreground-muted hover:bg-[var(--background-hover)]"
                    )}
                    title={workflow.isActive ? "Active" : "Inactive"}
                  >
                    {workflow.isActive ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          "Are you sure you want to delete this workflow?"
                        )
                      ) {
                        onDelete(workflow.id);
                      }
                    }}
                    className="p-1.5 text-foreground-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ============================================================================
// WORKFLOW INSTANCE STATUS
// ============================================================================

export function WorkflowInstanceStatus({
  instance,
  onApprove,
  onReject,
  onCancel,
  className,
}: WorkflowInstanceStatusProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    in_progress: "bg-blue-500/10 text-blue-500",
    paused: "bg-orange-500/10 text-orange-500",
    completed: "bg-green-500/10 text-green-500",
    rejected: "bg-red-500/10 text-red-500",
    cancelled: "bg-gray-500/10 text-gray-500",
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsLoading(true);
    try {
      await onApprove(comment || undefined);
      setComment("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsLoading(true);
    try {
      await onReject(comment || undefined);
      setComment("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    if (!confirm("Are you sure you want to cancel this workflow?")) return;
    setIsLoading(true);
    try {
      await onCancel(comment || undefined);
      setComment("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{instance.workflowName}</h4>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                statusColors[instance.status]
              )}
            >
              {instance.status.replace("_", " ")}
            </span>
          </div>
          {instance.entityTitle && (
            <p className="text-sm text-foreground-secondary mt-0.5">
              {instance.entityTitle}
            </p>
          )}
        </div>

        {onCancel &&
          (instance.status === "pending" ||
            instance.status === "in_progress") && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="p-1.5 text-foreground-muted hover:text-red-500 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
      </div>

      {/* Current Step */}
      <div className="flex items-center gap-2 p-3 bg-[var(--background-tertiary)] rounded-lg mb-4">
        <ArrowRight className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-sm">
          Current step: <strong>{instance.currentStepName}</strong>
        </span>
      </div>

      {/* Actions */}
      {(instance.status === "pending" || instance.status === "in_progress") &&
        (onApprove || onReject) && (
          <div className="space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              rows={2}
              className="w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
            />
            <div className="flex items-center gap-2">
              {onApprove && (
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve
                </button>
              )}
              {onReject && (
                <button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </button>
              )}
            </div>
          </div>
        )}

      {/* History */}
      {instance.history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <h5 className="text-sm font-medium mb-2">History</h5>
          <div className="space-y-2">
            {instance.history.slice(-5).map((entry, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-visible)] mt-1.5" />
                <div>
                  <span className="text-foreground-secondary">
                    {entry.stepName}
                  </span>
                  <span className="mx-1">-</span>
                  <span>{entry.action}</span>
                  {entry.userName && (
                    <span className="text-foreground-muted">
                      {" "}
                      by {entry.userName}
                    </span>
                  )}
                  {entry.comment && (
                    <p className="text-foreground-muted mt-0.5 italic">
                      &quot;{entry.comment}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WORKFLOW DASHBOARD
// ============================================================================

interface WorkflowDashboardProps {
  className?: string;
}

export function WorkflowDashboard({ className }: WorkflowDashboardProps) {
  const [workflows, setWorkflows] = useState<CMSWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<CMSWorkflow | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalWorkflows: number;
    activeWorkflows: number;
    pendingInstances: number;
    completedInstances: number;
    rejectedInstances: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [workflowsResult, statsResult] = await Promise.all([
        getWorkflows(),
        getWorkflowStats(),
      ]);

      if (workflowsResult.success && workflowsResult.data) {
        setWorkflows(workflowsResult.data);
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const result = await toggleWorkflowActive(id, isActive);
    if (result.success) {
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteExistingWorkflow(id);
    if (result.success) {
      if (selectedWorkflow?.id === id) {
        setSelectedWorkflow(null);
      }
      loadData();
    }
  };

  const handleInitDefaults = async () => {
    const result = await initializeDefaultWorkflows();
    if (result.success) {
      loadData();
    }
  };

  // Load on mount
  useState(() => {
    loadData();
  });

  if (isEditing) {
    return (
      <WorkflowBuilder
        workflow={selectedWorkflow || undefined}
        onSave={() => {
          setIsEditing(false);
          setSelectedWorkflow(null);
          loadData();
        }}
        onCancel={() => {
          setIsEditing(false);
        }}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
            <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
            <p className="text-sm text-foreground-secondary">Total Workflows</p>
          </div>
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
            <p className="text-2xl font-bold text-green-500">
              {stats.activeWorkflows}
            </p>
            <p className="text-sm text-foreground-secondary">Active</p>
          </div>
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
            <p className="text-2xl font-bold text-yellow-500">
              {stats.pendingInstances}
            </p>
            <p className="text-sm text-foreground-secondary">Pending</p>
          </div>
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
            <p className="text-2xl font-bold text-blue-500">
              {stats.completedInstances}
            </p>
            <p className="text-sm text-foreground-secondary">Completed</p>
          </div>
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
            <p className="text-2xl font-bold text-red-500">
              {stats.rejectedInstances}
            </p>
            <p className="text-sm text-foreground-secondary">Rejected</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workflow Builder</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInitDefaults}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Init Defaults
          </button>
          <button
            onClick={() => {
              setSelectedWorkflow(null);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-foreground-muted" />
        </div>
      ) : (
        <WorkflowList
          workflows={workflows}
          onSelect={(w) => {
            setSelectedWorkflow(w);
            setIsEditing(true);
          }}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          selectedId={selectedWorkflow?.id}
        />
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  WorkflowBuilderProps,
  WorkflowListProps,
  WorkflowCanvasProps,
  StepEditorProps,
  WorkflowInstanceStatusProps,
  WorkflowDashboardProps,
};

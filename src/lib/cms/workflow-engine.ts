"use server";

import { db } from "@/lib/db";
import type { WorkflowStepType, WorkflowInstanceStatus, CMSWorkflow } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: WorkflowStepConfig;
  nextSteps: string[];
  position?: { x: number; y: number };
}

export interface WorkflowStepConfig {
  // For approval steps
  approvers?: string[];        // User IDs or role names
  minApprovals?: number;       // Minimum approvals required
  autoApproveAfter?: number;   // Auto-approve after X hours

  // For condition steps
  condition?: string;          // Condition expression
  trueStep?: string;           // Step ID if condition is true
  falseStep?: string;          // Step ID if condition is false
  rules?: ConditionRule[];     // Array of rules

  // For action steps
  action?: WorkflowAction;     // Action to perform
  actionConfig?: Record<string, unknown>;

  // For delay steps
  delayHours?: number;         // Hours to wait
  delayUntil?: string;         // Specific time (HH:MM)

  // For notification steps
  notifyUsers?: string[];      // User IDs to notify
  notifyRoles?: string[];      // Roles to notify
  notifyEmail?: string[];      // Email addresses
  notifyTemplate?: string;     // Notification template

  // Common
  description?: string;
  timeout?: number;            // Timeout in hours
}

export type WorkflowAction =
  | "publish"
  | "unpublish"
  | "archive"
  | "notify_author"
  | "notify_reviewers"
  | "send_email"
  | "set_status"
  | "custom";

export interface ConditionRule {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value?: unknown;
}

export interface WorkflowHistoryEntry {
  stepId: string;
  stepName: string;
  action: string;
  userId?: string;
  userName?: string;
  timestamp: Date;
  comment?: string;
  data?: Record<string, unknown>;
}

export interface WorkflowInstanceData {
  id: string;
  workflowId: string;
  workflowName: string;
  entityType: string;
  entityId: string;
  entityTitle: string | null;
  currentStepId: string;
  currentStepName: string;
  status: WorkflowInstanceStatus;
  history: WorkflowHistoryEntry[];
  startedAt: Date;
  completedAt: Date | null;
  dueAt: Date | null;
  startedByName: string | null;
}

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

/**
 * Get all workflows
 */
export async function getAllWorkflows(): Promise<CMSWorkflow[]> {
  return db.cMSWorkflow.findMany({
    orderBy: [{ priority: "desc" }, { name: "asc" }],
  });
}

/**
 * Get active workflows for a content type
 */
export async function getWorkflowsForType(
  entityType: string
): Promise<CMSWorkflow[]> {
  return db.cMSWorkflow.findMany({
    where: {
      isActive: true,
      targetTypes: { has: entityType },
    },
    orderBy: [{ priority: "desc" }, { name: "asc" }],
  });
}

/**
 * Get a workflow by ID
 */
export async function getWorkflow(id: string): Promise<CMSWorkflow | null> {
  return db.cMSWorkflow.findUnique({
    where: { id },
  });
}

/**
 * Create a workflow
 */
export async function createWorkflow(data: {
  name: string;
  description?: string;
  targetTypes: string[];
  steps: WorkflowStep[];
  triggerConfig?: Record<string, unknown>;
  layout?: Record<string, { x: number; y: number }>;
  priority?: number;
  isActive?: boolean;
  isDefault?: boolean;
  createdBy?: string;
}): Promise<CMSWorkflow> {
  return db.cMSWorkflow.create({
    data: {
      name: data.name,
      description: data.description,
      targetTypes: data.targetTypes,
      steps: data.steps as unknown as object,
      triggerConfig: data.triggerConfig as object || null,
      layout: data.layout as object || null,
      priority: data.priority || 0,
      isActive: data.isActive ?? true,
      isDefault: data.isDefault ?? false,
      createdBy: data.createdBy,
    },
  });
}

/**
 * Update a workflow
 */
export async function updateWorkflow(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    targetTypes: string[];
    steps: WorkflowStep[];
    triggerConfig: Record<string, unknown> | null;
    layout: Record<string, { x: number; y: number }> | null;
    priority: number;
    isActive: boolean;
    isDefault: boolean;
  }>
): Promise<CMSWorkflow> {
  return db.cMSWorkflow.update({
    where: { id },
    data: {
      ...data,
      steps: data.steps ? (data.steps as unknown as object) : undefined,
      triggerConfig: data.triggerConfig !== undefined
        ? (data.triggerConfig as object)
        : undefined,
      layout: data.layout !== undefined ? (data.layout as object) : undefined,
    },
  });
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string): Promise<void> {
  await db.cMSWorkflow.delete({
    where: { id },
  });
}

// ============================================================================
// WORKFLOW INSTANCE MANAGEMENT
// ============================================================================

/**
 * Start a workflow instance
 */
export async function startWorkflowInstance(
  workflowId: string,
  entityType: string,
  entityId: string,
  entityTitle: string | null,
  startedBy: { id: string; name: string }
): Promise<WorkflowInstanceData> {
  const workflow = await getWorkflow(workflowId);
  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const steps = workflow.steps as unknown as WorkflowStep[];
  const startStep = steps.find((s) => s.type === "start");
  if (!startStep) {
    throw new Error("Workflow has no start step");
  }

  // Find the first real step after start
  const firstStep = steps.find((s) => startStep.nextSteps.includes(s.id));
  if (!firstStep) {
    throw new Error("Workflow has no steps after start");
  }

  const initialHistory: WorkflowHistoryEntry[] = [
    {
      stepId: startStep.id,
      stepName: startStep.name,
      action: "started",
      userId: startedBy.id,
      userName: startedBy.name,
      timestamp: new Date(),
    },
    {
      stepId: firstStep.id,
      stepName: firstStep.name,
      action: "entered",
      timestamp: new Date(),
    },
  ];

  const instance = await db.cMSWorkflowInstance.create({
    data: {
      workflowId,
      entityType,
      entityId,
      entityTitle,
      currentStepId: firstStep.id,
      status: "in_progress",
      history: initialHistory as unknown as object,
      startedBy: startedBy.id,
      startedByName: startedBy.name,
    },
  });

  return mapInstance(instance, workflow.name, firstStep.name);
}

/**
 * Get workflow instance by ID
 */
export async function getWorkflowInstance(
  id: string
): Promise<WorkflowInstanceData | null> {
  const instance = await db.cMSWorkflowInstance.findUnique({
    where: { id },
    include: { workflow: true },
  });

  if (!instance) return null;

  const steps = instance.workflow.steps as unknown as WorkflowStep[];
  const currentStep = steps.find((s) => s.id === instance.currentStepId);

  return mapInstance(
    instance,
    instance.workflow.name,
    currentStep?.name || "Unknown"
  );
}

/**
 * Get active instances for an entity
 */
export async function getEntityInstances(
  entityType: string,
  entityId: string
): Promise<WorkflowInstanceData[]> {
  const instances = await db.cMSWorkflowInstance.findMany({
    where: {
      entityType,
      entityId,
      status: { in: ["pending", "in_progress", "paused"] },
    },
    include: { workflow: true },
    orderBy: { startedAt: "desc" },
  });

  return instances.map((instance) => {
    const steps = instance.workflow.steps as unknown as WorkflowStep[];
    const currentStep = steps.find((s) => s.id === instance.currentStepId);
    return mapInstance(
      instance,
      instance.workflow.name,
      currentStep?.name || "Unknown"
    );
  });
}

/**
 * Advance workflow to next step
 */
export async function advanceWorkflow(
  instanceId: string,
  action: string,
  user: { id: string; name: string },
  comment?: string,
  data?: Record<string, unknown>
): Promise<WorkflowInstanceData> {
  const instance = await db.cMSWorkflowInstance.findUnique({
    where: { id: instanceId },
    include: { workflow: true },
  });

  if (!instance) {
    throw new Error("Workflow instance not found");
  }

  const steps = instance.workflow.steps as unknown as WorkflowStep[];
  const currentStep = steps.find((s) => s.id === instance.currentStepId);

  if (!currentStep) {
    throw new Error("Current step not found");
  }

  // Determine next step based on action and step type
  let nextStepId: string | null = null;

  if (currentStep.type === "condition") {
    // For conditions, evaluate and branch
    const conditionResult = evaluateCondition(currentStep.config, data);
    nextStepId = conditionResult
      ? currentStep.config.trueStep || currentStep.nextSteps[0]
      : currentStep.config.falseStep || currentStep.nextSteps[1];
  } else if (currentStep.type === "approval") {
    if (action === "approve") {
      nextStepId = currentStep.nextSteps[0];
    } else if (action === "reject") {
      // Find reject path or end
      nextStepId = currentStep.nextSteps[1] || null;
    }
  } else {
    // Default: move to first next step
    nextStepId = currentStep.nextSteps[0];
  }

  // Update history
  const history = instance.history as unknown as WorkflowHistoryEntry[];
  history.push({
    stepId: currentStep.id,
    stepName: currentStep.name,
    action,
    userId: user.id,
    userName: user.name,
    timestamp: new Date(),
    comment,
    data,
  });

  // Determine final state
  const nextStep = nextStepId ? steps.find((s) => s.id === nextStepId) : null;
  let status: WorkflowInstanceStatus = instance.status;
  let completedAt: Date | null = instance.completedAt;

  if (!nextStep || nextStep.type === "end") {
    // Workflow complete
    status = action === "reject" ? "rejected" : "completed";
    completedAt = new Date();

    if (nextStep) {
      history.push({
        stepId: nextStep.id,
        stepName: nextStep.name,
        action: "completed",
        timestamp: new Date(),
      });
    }
  } else {
    // Entering next step
    history.push({
      stepId: nextStep.id,
      stepName: nextStep.name,
      action: "entered",
      timestamp: new Date(),
    });
  }

  const updatedInstance = await db.cMSWorkflowInstance.update({
    where: { id: instanceId },
    data: {
      currentStepId: nextStep?.id || currentStep.id,
      status,
      history: history as unknown as object,
      completedAt,
    },
  });

  return mapInstance(
    updatedInstance,
    instance.workflow.name,
    nextStep?.name || currentStep.name
  );
}

/**
 * Cancel a workflow instance
 */
export async function cancelWorkflow(
  instanceId: string,
  user: { id: string; name: string },
  reason?: string
): Promise<void> {
  const instance = await db.cMSWorkflowInstance.findUnique({
    where: { id: instanceId },
  });

  if (!instance) {
    throw new Error("Workflow instance not found");
  }

  const history = instance.history as unknown as WorkflowHistoryEntry[];
  history.push({
    stepId: instance.currentStepId,
    stepName: "Cancelled",
    action: "cancelled",
    userId: user.id,
    userName: user.name,
    timestamp: new Date(),
    comment: reason,
  });

  await db.cMSWorkflowInstance.update({
    where: { id: instanceId },
    data: {
      status: "cancelled",
      history: history as unknown as object,
      completedAt: new Date(),
    },
  });
}

// ============================================================================
// CONDITION EVALUATION
// ============================================================================

function evaluateCondition(
  config: WorkflowStepConfig,
  data?: Record<string, unknown>
): boolean {
  if (!config.rules || config.rules.length === 0) {
    return true; // Default to true if no rules
  }

  return config.rules.every((rule) => evaluateRule(rule, data));
}

function evaluateRule(
  rule: ConditionRule,
  data?: Record<string, unknown>
): boolean {
  const fieldValue = data?.[rule.field];

  switch (rule.operator) {
    case "equals":
      return fieldValue === rule.value;
    case "not_equals":
      return fieldValue !== rule.value;
    case "contains":
      return String(fieldValue).includes(String(rule.value));
    case "not_contains":
      return !String(fieldValue).includes(String(rule.value));
    case "greater_than":
      return Number(fieldValue) > Number(rule.value);
    case "less_than":
      return Number(fieldValue) < Number(rule.value);
    case "is_empty":
      return !fieldValue || fieldValue === "" || fieldValue === null;
    case "is_not_empty":
      return !!fieldValue && fieldValue !== "";
    default:
      return true;
  }
}

// ============================================================================
// DEFAULT WORKFLOW TEMPLATES
// ============================================================================

export const DEFAULT_WORKFLOWS = {
  simpleApproval: {
    name: "Simple Approval",
    description: "Basic single-step approval workflow",
    targetTypes: ["MarketingPage", "BlogPost"],
    steps: [
      {
        id: "start",
        name: "Start",
        type: "start" as WorkflowStepType,
        config: {},
        nextSteps: ["review"],
      },
      {
        id: "review",
        name: "Review",
        type: "approval" as WorkflowStepType,
        config: {
          approvers: ["admin"],
          minApprovals: 1,
          description: "Review and approve the content",
        },
        nextSteps: ["publish", "end-rejected"],
      },
      {
        id: "publish",
        name: "Publish",
        type: "action" as WorkflowStepType,
        config: {
          action: "publish" as WorkflowAction,
          description: "Publish the content",
        },
        nextSteps: ["end-approved"],
      },
      {
        id: "end-approved",
        name: "Approved",
        type: "end" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
      {
        id: "end-rejected",
        name: "Rejected",
        type: "end" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
    ],
    layout: {
      start: { x: 250, y: 50 },
      review: { x: 250, y: 150 },
      publish: { x: 150, y: 250 },
      "end-approved": { x: 150, y: 350 },
      "end-rejected": { x: 350, y: 250 },
    },
    priority: 10,
  },

  twoStageApproval: {
    name: "Two-Stage Approval",
    description: "Content reviewed by editor then manager",
    targetTypes: ["MarketingPage", "BlogPost"],
    steps: [
      {
        id: "start",
        name: "Start",
        type: "start" as WorkflowStepType,
        config: {},
        nextSteps: ["editor-review"],
      },
      {
        id: "editor-review",
        name: "Editor Review",
        type: "approval" as WorkflowStepType,
        config: {
          approvers: ["editor"],
          minApprovals: 1,
          description: "Initial content review by editor",
        },
        nextSteps: ["manager-review", "end-rejected"],
      },
      {
        id: "manager-review",
        name: "Manager Review",
        type: "approval" as WorkflowStepType,
        config: {
          approvers: ["manager", "admin"],
          minApprovals: 1,
          description: "Final review by manager",
        },
        nextSteps: ["publish", "end-rejected"],
      },
      {
        id: "publish",
        name: "Publish",
        type: "action" as WorkflowStepType,
        config: {
          action: "publish" as WorkflowAction,
        },
        nextSteps: ["notify"],
      },
      {
        id: "notify",
        name: "Notify Author",
        type: "notification" as WorkflowStepType,
        config: {
          notifyUsers: ["author"],
          notifyTemplate: "content_published",
        },
        nextSteps: ["end-approved"],
      },
      {
        id: "end-approved",
        name: "Published",
        type: "end" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
      {
        id: "end-rejected",
        name: "Rejected",
        type: "end" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
    ],
    layout: {
      start: { x: 250, y: 25 },
      "editor-review": { x: 250, y: 100 },
      "manager-review": { x: 150, y: 200 },
      publish: { x: 150, y: 300 },
      notify: { x: 150, y: 400 },
      "end-approved": { x: 150, y: 500 },
      "end-rejected": { x: 350, y: 200 },
    },
    priority: 20,
  },

  conditionalApproval: {
    name: "Conditional Approval",
    description: "Routes based on content type",
    targetTypes: ["MarketingPage", "BlogPost", "FAQ"],
    steps: [
      {
        id: "start",
        name: "Start",
        type: "start" as WorkflowStepType,
        config: {},
        nextSteps: ["check-type"],
      },
      {
        id: "check-type",
        name: "Check Content Type",
        type: "condition" as WorkflowStepType,
        config: {
          rules: [
            { field: "entityType", operator: "equals" as const, value: "MarketingPage" },
          ],
          trueStep: "marketing-review",
          falseStep: "simple-review",
        },
        nextSteps: ["marketing-review", "simple-review"],
      },
      {
        id: "marketing-review",
        name: "Marketing Review",
        type: "approval" as WorkflowStepType,
        config: {
          approvers: ["marketing", "admin"],
          minApprovals: 1,
          description: "Marketing team review required",
        },
        nextSteps: ["publish", "end-rejected"],
      },
      {
        id: "simple-review",
        name: "Quick Review",
        type: "approval" as WorkflowStepType,
        config: {
          approvers: ["editor", "admin"],
          minApprovals: 1,
          description: "Quick content review",
        },
        nextSteps: ["publish", "end-rejected"],
      },
      {
        id: "publish",
        name: "Publish",
        type: "action" as WorkflowStepType,
        config: {
          action: "publish" as WorkflowAction,
        },
        nextSteps: ["end-approved"],
      },
      {
        id: "end-approved",
        name: "Published",
        type: "end" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
      {
        id: "end-rejected",
        name: "Rejected",
        type: "end" as WorkflowStepType,
        config: {},
        nextSteps: [],
      },
    ],
    layout: {
      start: { x: 250, y: 25 },
      "check-type": { x: 250, y: 100 },
      "marketing-review": { x: 100, y: 200 },
      "simple-review": { x: 400, y: 200 },
      publish: { x: 250, y: 300 },
      "end-approved": { x: 250, y: 400 },
      "end-rejected": { x: 450, y: 300 },
    },
    priority: 15,
  },
};

/**
 * Seed default workflows
 */
export async function seedDefaultWorkflows(): Promise<void> {
  for (const workflow of Object.values(DEFAULT_WORKFLOWS)) {
    const existing = await db.cMSWorkflow.findFirst({
      where: { name: workflow.name },
    });

    if (!existing) {
      await createWorkflow({
        ...workflow,
        isDefault: true,
      });
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function mapInstance(
  instance: {
    id: string;
    workflowId: string;
    entityType: string;
    entityId: string;
    entityTitle: string | null;
    currentStepId: string;
    status: WorkflowInstanceStatus;
    history: unknown;
    startedAt: Date;
    completedAt: Date | null;
    dueAt: Date | null;
    startedByName: string | null;
  },
  workflowName: string,
  currentStepName: string
): WorkflowInstanceData {
  return {
    id: instance.id,
    workflowId: instance.workflowId,
    workflowName,
    entityType: instance.entityType,
    entityId: instance.entityId,
    entityTitle: instance.entityTitle,
    currentStepId: instance.currentStepId,
    currentStepName,
    status: instance.status,
    history: (instance.history as WorkflowHistoryEntry[]) || [],
    startedAt: instance.startedAt,
    completedAt: instance.completedAt,
    dueAt: instance.dueAt,
    startedByName: instance.startedByName,
  };
}

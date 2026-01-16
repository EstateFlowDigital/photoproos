"use server";

import { isSuperAdmin } from "@/lib/auth/super-admin";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";
import {
  getAllWorkflows,
  getWorkflowsForType,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  startWorkflowInstance,
  getWorkflowInstance,
  getEntityInstances,
  advanceWorkflow,
  cancelWorkflow,
  seedDefaultWorkflows,
  type WorkflowStep,
  type WorkflowInstanceData,
} from "@/lib/cms/workflow-engine";
import type { CMSWorkflow } from "@prisma/client";

// ============================================================================
// WORKFLOW MANAGEMENT ACTIONS
// ============================================================================

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<ActionResult<CMSWorkflow[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const workflows = await getAllWorkflows();
    return ok(workflows);
  } catch (error) {
    console.error("Error getting workflows:", error);
    return fail("Failed to get workflows");
  }
}

/**
 * Get workflows for a specific content type
 */
export async function getWorkflowsForContentType(
  entityType: string
): Promise<ActionResult<CMSWorkflow[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const workflows = await getWorkflowsForType(entityType);
    return ok(workflows);
  } catch (error) {
    console.error("Error getting workflows for type:", error);
    return fail("Failed to get workflows");
  }
}

/**
 * Get a single workflow by ID
 */
export async function getWorkflowById(
  id: string
): Promise<ActionResult<CMSWorkflow>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const workflow = await getWorkflow(id);
    if (!workflow) {
      return fail("Workflow not found");
    }

    return ok(workflow);
  } catch (error) {
    console.error("Error getting workflow:", error);
    return fail("Failed to get workflow");
  }
}

/**
 * Create a new workflow
 */
export async function createNewWorkflow(data: {
  name: string;
  description?: string;
  targetTypes: string[];
  steps: WorkflowStep[];
  triggerConfig?: Record<string, unknown>;
  layout?: Record<string, { x: number; y: number }>;
  priority?: number;
  isActive?: boolean;
  isDefault?: boolean;
}): Promise<ActionResult<CMSWorkflow>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Validate workflow has required steps
    const hasStart = data.steps.some((s) => s.type === "start");
    const hasEnd = data.steps.some((s) => s.type === "end");

    if (!hasStart) {
      return fail("Workflow must have a start step");
    }
    if (!hasEnd) {
      return fail("Workflow must have at least one end step");
    }

    const workflow = await createWorkflow(data);
    return ok(workflow);
  } catch (error) {
    console.error("Error creating workflow:", error);
    return fail("Failed to create workflow");
  }
}

/**
 * Update an existing workflow
 */
export async function updateExistingWorkflow(
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
): Promise<ActionResult<CMSWorkflow>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Validate steps if provided
    if (data.steps) {
      const hasStart = data.steps.some((s) => s.type === "start");
      const hasEnd = data.steps.some((s) => s.type === "end");

      if (!hasStart) {
        return fail("Workflow must have a start step");
      }
      if (!hasEnd) {
        return fail("Workflow must have at least one end step");
      }
    }

    const workflow = await updateWorkflow(id, data);
    return ok(workflow);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return fail("Failed to update workflow");
  }
}

/**
 * Delete a workflow
 */
export async function deleteExistingWorkflow(
  id: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await deleteWorkflow(id);
    return ok(undefined);
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return fail("Failed to delete workflow");
  }
}

/**
 * Toggle workflow active status
 */
export async function toggleWorkflowActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<CMSWorkflow>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const workflow = await updateWorkflow(id, { isActive });
    return ok(workflow);
  } catch (error) {
    console.error("Error toggling workflow:", error);
    return fail("Failed to toggle workflow");
  }
}

// ============================================================================
// WORKFLOW INSTANCE ACTIONS
// ============================================================================

/**
 * Start a workflow for an entity
 */
export async function startEntityWorkflow(
  workflowId: string,
  entityType: string,
  entityId: string,
  entityTitle: string | null,
  user: { id: string; name: string }
): Promise<ActionResult<WorkflowInstanceData>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const instance = await startWorkflowInstance(
      workflowId,
      entityType,
      entityId,
      entityTitle,
      user
    );

    return ok(instance);
  } catch (error) {
    console.error("Error starting workflow:", error);
    return fail(
      error instanceof Error ? error.message : "Failed to start workflow"
    );
  }
}

/**
 * Get a workflow instance by ID
 */
export async function getWorkflowInstanceById(
  id: string
): Promise<ActionResult<WorkflowInstanceData>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const instance = await getWorkflowInstance(id);
    if (!instance) {
      return fail("Workflow instance not found");
    }

    return ok(instance);
  } catch (error) {
    console.error("Error getting workflow instance:", error);
    return fail("Failed to get workflow instance");
  }
}

/**
 * Get active workflow instances for an entity
 */
export async function getEntityWorkflowInstances(
  entityType: string,
  entityId: string
): Promise<ActionResult<WorkflowInstanceData[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const instances = await getEntityInstances(entityType, entityId);
    return ok(instances);
  } catch (error) {
    console.error("Error getting entity instances:", error);
    return fail("Failed to get workflow instances");
  }
}

/**
 * Advance a workflow instance to the next step
 */
export async function advanceWorkflowInstance(
  instanceId: string,
  action: string,
  user: { id: string; name: string },
  comment?: string,
  data?: Record<string, unknown>
): Promise<ActionResult<WorkflowInstanceData>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const instance = await advanceWorkflow(
      instanceId,
      action,
      user,
      comment,
      data
    );

    return ok(instance);
  } catch (error) {
    console.error("Error advancing workflow:", error);
    return fail(
      error instanceof Error ? error.message : "Failed to advance workflow"
    );
  }
}

/**
 * Approve current step in workflow
 */
export async function approveWorkflowStep(
  instanceId: string,
  user: { id: string; name: string },
  comment?: string
): Promise<ActionResult<WorkflowInstanceData>> {
  return advanceWorkflowInstance(instanceId, "approve", user, comment);
}

/**
 * Reject current step in workflow
 */
export async function rejectWorkflowStep(
  instanceId: string,
  user: { id: string; name: string },
  reason?: string
): Promise<ActionResult<WorkflowInstanceData>> {
  return advanceWorkflowInstance(instanceId, "reject", user, reason);
}

/**
 * Cancel a workflow instance
 */
export async function cancelWorkflowInstance(
  instanceId: string,
  user: { id: string; name: string },
  reason?: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await cancelWorkflow(instanceId, user, reason);
    return ok(undefined);
  } catch (error) {
    console.error("Error cancelling workflow:", error);
    return fail(
      error instanceof Error ? error.message : "Failed to cancel workflow"
    );
  }
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

/**
 * Initialize default workflows
 */
export async function initializeDefaultWorkflows(): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await seedDefaultWorkflows();
    return ok(undefined);
  } catch (error) {
    console.error("Error seeding workflows:", error);
    return fail("Failed to initialize default workflows");
  }
}

/**
 * Get workflow statistics
 */
export async function getWorkflowStats(): Promise<
  ActionResult<{
    totalWorkflows: number;
    activeWorkflows: number;
    pendingInstances: number;
    completedInstances: number;
    rejectedInstances: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const { db } = await import("@/lib/db");

    const [workflows, instances] = await Promise.all([
      db.cMSWorkflow.findMany({
        select: { isActive: true },
      }),
      db.cMSWorkflowInstance.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const statusCounts = instances.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    return ok({
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter((w) => w.isActive).length,
      pendingInstances:
        (statusCounts.pending || 0) + (statusCounts.in_progress || 0),
      completedInstances: statusCounts.completed || 0,
      rejectedInstances: statusCounts.rejected || 0,
    });
  } catch (error) {
    console.error("Error getting workflow stats:", error);
    return fail("Failed to get workflow statistics");
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: Type exports (WorkflowStep, WorkflowInstanceData) are available from
// "@/lib/actions/cms-workflows-types" - this is separated because "use server"
// files can only export async functions.

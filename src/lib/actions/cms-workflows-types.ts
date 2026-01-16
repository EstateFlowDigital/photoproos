/**
 * CMS Workflows Types
 *
 * Type definitions for CMS workflows.
 * These are separated from the main cms-workflows.ts server actions file
 * because "use server" files require all exports to be async functions.
 */

export type { WorkflowStep, WorkflowInstanceData } from "@/lib/cms/workflow-engine";

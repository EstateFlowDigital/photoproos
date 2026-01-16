import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { WorkflowPageClient } from "./workflow-client";
import { getWorkflows, getWorkflowStats } from "@/lib/actions/cms-workflows";

export const metadata: Metadata = {
  title: "Workflow Builder | CMS Admin",
  description: "Create and manage content approval workflows.",
};

export const dynamic = "force-dynamic";

export default async function WorkflowPage() {
  const { userId } = await auth();

  const [workflowsResult, statsResult] = await Promise.all([
    getWorkflows(),
    getWorkflowStats(),
  ]);

  const workflows = workflowsResult.success ? workflowsResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <WorkflowPageClient
      initialWorkflows={workflows || []}
      initialStats={stats}
      userId={userId || ""}
    />
  );
}

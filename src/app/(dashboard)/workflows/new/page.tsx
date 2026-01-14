export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewWorkflowPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="New Workflow"
      subtitle="Create a new automated workflow"
      icon="✨"
      description="Start from scratch or use templates for common photography workflows."
      features={[
        "Visual workflow builder",
        "Pre-built workflow templates",
        "Trigger and action configuration",
        "Conditional logic and branching",
        "Delay and timing controls",
        "Test and preview functionality",
      ]}
      relatedLinks={[
        { label: "All Workflows", href: "/workflows" },
        { label: "Automations", href: "/automations" },
      ]}
    />
  );
}

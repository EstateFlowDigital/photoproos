export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Workflow Editor"
      subtitle="Edit workflow steps"
      icon="🔧"
      description="Visual workflow editor with drag-and-drop step configuration."
      features={[
        "Visual drag-and-drop workflow builder",
        "Step configuration and conditions",
        "Email and SMS action triggers",
        "Time-based delay settings",
        "Workflow testing and preview",
        "Run history and analytics",
      ]}
      relatedLinks={[
        { label: "All Workflows", href: "/workflows" },
        { label: "Automations", href: "/automations" },
        { label: "Templates", href: "/templates" },
      ]}
    />
  );
}

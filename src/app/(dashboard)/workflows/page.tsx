export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WorkflowsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="workflows-page">
      <ComingSoonPage
        title="Workflows"
        subtitle="Create and manage automated workflows"
        icon="⚙️"
        description="Build custom workflows with triggers, conditions, and actions to automate your business processes."
        features={[
          "Visual workflow builder with drag-and-drop",
          "Triggers: booking confirmed, payment received, contract signed",
          "Actions: send email, create task, update status, notify team",
          "Conditional logic and branching paths",
          "Time-based delays (wait 3 days, then send)",
          "Pre-built templates for common scenarios",
        ]}
        relatedLinks={[
          { label: "Automations", href: "/automations" },
          { label: "Email Templates", href: "/templates/emails" },
          { label: "Notifications", href: "/settings/notifications" },
        ]}
      />
    </div>
  );
}

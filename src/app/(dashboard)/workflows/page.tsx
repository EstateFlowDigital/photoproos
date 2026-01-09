export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WorkflowsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="workflows-page">
      <PageHeader
        title="Workflows"
        subtitle="Create and manage automated workflows"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">⚙️</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Build custom workflows with triggers, conditions, and actions to automate your business processes.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Visual workflow builder with drag-and-drop</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Triggers: booking confirmed, payment received, contract signed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Actions: send email, create task, update status, notify team</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Conditional logic and branching paths</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Time-based delays (wait 3 days, then send)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Pre-built templates for common scenarios</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/automations" className="btn btn-secondary text-sm">Automations</a>
          <a href="/templates/emails" className="btn btn-secondary text-sm">Email Templates</a>
          <a href="/settings/notifications" className="btn btn-secondary text-sm">Notifications</a>
        </div>
      </div>
    </div>
  );
}

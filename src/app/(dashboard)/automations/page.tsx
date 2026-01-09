export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AutomationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations"
        subtitle="Automated actions and triggers"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Set up automatic emails, reminders, task assignments, and status updates based on triggers.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Auto-send questionnaires after booking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Payment reminder emails (1 day, 3 days, 7 days before)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Session reminder notifications to clients</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Thank you emails after gallery delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Review request emails after project completion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Birthday and anniversary greetings</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/workflows" className="btn btn-secondary text-sm">Workflows</a>
          <a href="/templates/emails" className="btn btn-secondary text-sm">Email Templates</a>
          <a href="/settings/email" className="btn btn-secondary text-sm">Email Settings</a>
        </div>
      </div>
    </div>
  );
}

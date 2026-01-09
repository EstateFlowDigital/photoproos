export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect third-party apps and services"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Connect with Google, QuickBooks, Zapier, and more to streamline your workflow.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Integrations available:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Google Calendar - sync bookings and availability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>QuickBooks - automatic invoice and expense sync</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Zapier - connect to 5,000+ apps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Dropbox - automatic gallery backup</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Mailchimp - sync contacts for email marketing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Slack - team notifications and updates</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/integrations/google" className="btn btn-secondary text-sm">Google</a>
          <a href="/integrations/quickbooks" className="btn btn-secondary text-sm">QuickBooks</a>
          <a href="/integrations/zapier" className="btn btn-secondary text-sm">Zapier</a>
        </div>
      </div>
    </div>
  );
}

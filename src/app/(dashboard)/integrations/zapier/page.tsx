export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ZapierIntegrationPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zapier Integration"
        subtitle="Connect to thousands of apps via Zapier"
        backHref="/integrations"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">⚡</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Automate workflows with 5,000+ apps through Zapier integration.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Connect to 5,000+ apps and services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Trigger-based workflow automation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Pre-built Zap templates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Multi-step workflow support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Data mapping and transformation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Error handling and notifications</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/integrations" className="btn btn-secondary text-sm">All Integrations</a>
          <a href="/automations" className="btn btn-secondary text-sm">Automations</a>
          <a href="/webhooks" className="btn btn-secondary text-sm">Webhooks</a>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ApiKeysPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="api-keys-page">
      <PageHeader
        title="API Keys"
        subtitle="Manage API access and authentication"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🔑</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Generate and manage API keys for custom integrations and development.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>API key generation and management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Scoped permissions per key</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Key expiration and rotation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Usage analytics and rate limits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>API documentation access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Test and production environments</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/webhooks" className="btn btn-secondary text-sm">Webhooks</a>
          <a href="/integrations" className="btn btn-secondary text-sm">Integrations</a>
          <a href="/settings/security" className="btn btn-secondary text-sm">Security Settings</a>
        </div>
      </div>
    </div>
  );
}

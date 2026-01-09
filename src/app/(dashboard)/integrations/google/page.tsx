export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GoogleIntegrationPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="google-integration-page" className="space-y-6">
      <PageHeader
        title="Google Integration"
        subtitle="Sync with Google Calendar and Drive"
        backHref="/integrations"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🔄</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Two-way sync with Google Calendar, Drive storage, and Gmail integration.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Two-way Google Calendar sync</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Google Drive file storage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Gmail inbox integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Contact sync with Google Contacts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Google Meet scheduling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Multiple account support</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/integrations" className="btn btn-secondary text-sm">All Integrations</a>
          <a href="/calendar" className="btn btn-secondary text-sm">Calendar</a>
          <a href="/email-inbox" className="btn btn-secondary text-sm">Email Inbox</a>
        </div>
      </div>
    </div>
  );
}

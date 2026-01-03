export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getOrganizationSettings } from "@/lib/actions/settings";

// Available integrations catalog
const availableIntegrations = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Two-way sync bookings with your Google Calendar",
      icon: "📅",
      category: "Scheduling",
      connectUrl: "/settings/calendar",
      featured: true,
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Sync invoices and payments for accounting",
      icon: "📊",
      category: "Accounting",
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5000+ apps and automate workflows",
      icon: "⚡",
      category: "Automation",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Sync clients for email marketing campaigns",
      icon: "📧",
      category: "Marketing",
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Backup photos and sync deliverables",
      icon: "📦",
      category: "Storage",
      connectUrl: "/settings/dropbox",
      featured: true,
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Backup photos and sync deliverables",
      icon: "☁️",
      category: "Storage",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications in your Slack workspace",
      icon: "💬",
      category: "Communication",
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Let clients book sessions through Calendly",
      icon: "🗓️",
      category: "Scheduling",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Sync projects and client info to Notion",
      icon: "📝",
      category: "Productivity",
    },
  ];

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect third-party apps and services"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Integrations are disabled. This is a preview of the integrations page.
        </p>
      </div>

      <div className="space-y-6">
        {/* Connected Integrations */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Connected</h2>

          <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-8 text-center">
            <p className="text-foreground-muted">No integrations connected yet</p>
          </div>
        </div>

        {/* Available Integrations */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Integrations</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {availableIntegrations.map((integration) => (
              <div
                key={integration.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border bg-[var(--background)] p-4 transition-colors hover:border-[var(--border-hover)]",
                  integration.featured
                    ? "border-[var(--primary)]/30"
                    : "border-[var(--card-border)]"
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-2xl">
                  {integration.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{integration.name}</p>
                    <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs text-foreground-muted">
                      {integration.category}
                    </span>
                    {integration.featured && (
                      <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground-muted">{integration.description}</p>
                  {integration.connectUrl ? (
                    <Link
                      href={integration.connectUrl}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                    >
                      Connect
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="mt-3 rounded-lg bg-[var(--background-secondary)] px-4 py-1.5 text-sm font-medium text-foreground-muted cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Access */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <CodeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">API Access</h2>
              <p className="text-sm text-foreground-muted">Build custom integrations with our API</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)]">
              <div>
                <p className="text-sm font-medium text-foreground">API Key</p>
                <p className="text-xs text-foreground-muted">Use this key to authenticate API requests</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded-lg bg-[var(--background-secondary)] px-3 py-1.5 text-sm text-foreground-muted">
                  sk_live_••••••••••••••••
                </code>
                <button className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground">
                  <CopyIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium text-foreground-muted cursor-not-allowed"
                title="API Documentation coming soon"
              >
                View API Documentation
                <span className="ml-1 inline-flex items-center rounded-full bg-[var(--background-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
                  Soon
                </span>
              </span>
              <span className="text-foreground-muted">•</span>
              <button className="text-sm font-medium text-foreground-muted hover:text-foreground">
                Regenerate Key
              </button>
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <WebhookIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Webhooks</h2>
                <p className="text-sm text-foreground-muted">Receive real-time event notifications</p>
              </div>
            </div>
            <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
              Add Webhook
            </button>
          </div>

          <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-8 text-center">
            <WebhookIcon className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-2 text-sm text-foreground">No webhooks configured</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Add a webhook endpoint to receive event notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 0 1 0 1.06L2.56 10l3.72 3.72a.75.75 0 0 1-1.06 1.06L.97 10.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Zm7.44 0a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 0 1 0-1.06ZM11.377 2.011a.75.75 0 0 1 .612.867l-2.5 14.5a.75.75 0 0 1-1.478-.255l2.5-14.5a.75.75 0 0 1 .866-.612Z" clipRule="evenodd" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function WebhookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.258a33.186 33.186 0 0 1 6.668.83.75.75 0 0 1-.336 1.461 31.28 31.28 0 0 0-1.103-.232l1.702 7.545a.75.75 0 0 1-.387.832A4.981 4.981 0 0 1 15 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 0 1-.387-.832l1.77-7.849a31.743 31.743 0 0 0-3.339-.254v11.505a20.01 20.01 0 0 1 3.78.501.75.75 0 1 1-.339 1.462A18.558 18.558 0 0 0 10 17.5c-1.442 0-2.845.165-4.191.477a.75.75 0 0 1-.339-1.462 20.01 20.01 0 0 1 3.78-.501V4.509c-1.129.026-2.243.112-3.339.254l1.77 7.85a.75.75 0 0 1-.387.83A4.981 4.981 0 0 1 5 14a4.982 4.982 0 0 1-2.294-.556.75.75 0 0 1-.387-.832l1.702-7.545c-.37.07-.738.148-1.103.232a.75.75 0 0 1-.336-1.462 33.053 33.053 0 0 1 6.668-.829V2.75A.75.75 0 0 1 10 2ZM5 11.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

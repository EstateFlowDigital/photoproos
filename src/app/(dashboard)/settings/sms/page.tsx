export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import Link from "next/link";
import { getSMSSettings, getSMSStats, getSMSTemplates, getSMSLogs } from "@/lib/actions/sms";
import { SMSSettingsClient } from "./sms-settings-client";

export default async function SMSSettingsPage() {
  const [settingsResult, statsResult, templatesResult, logsResult] = await Promise.all([
    getSMSSettings(),
    getSMSStats(),
    getSMSTemplates(),
    getSMSLogs({ limit: 10 }),
  ]);

  const settings = settingsResult.success
    ? settingsResult.data
    : { smsEnabled: false, twilioAccountSid: null, twilioAuthToken: null, twilioPhoneNumber: null };

  const stats = statsResult.success
    ? statsResult.data
    : { totalSent: 0, delivered: 0, failed: 0, pending: 0, deliveryRate: 0 };

  const templates = templatesResult.success && templatesResult.data
    ? templatesResult.data
    : [];
  const recentLogs = logsResult.success && logsResult.data?.logs
    ? logsResult.data.logs
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/settings" },
          { label: "SMS Notifications" },
        ]}
      />

      <PageHeader
        title="SMS Notifications"
        subtitle="Configure Twilio SMS integration and message templates"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/settings"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] sm:w-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <Link
              href="/settings/sms/templates"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 sm:w-auto"
            >
              <TemplateIcon className="h-4 w-4" />
              Manage Templates
            </Link>
          </div>
        }
      />

      <SMSSettingsClient
        settings={settings!}
        stats={stats!}
        templates={templates}
        recentLogs={recentLogs}
      />
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

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v11A2.5 2.5 0 0 0 4.5 18h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 15.5 2h-11ZM5 5.75A.75.75 0 0 1 5.75 5h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 5.75Zm0 3A.75.75 0 0 1 5.75 8h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 5 8.75Zm0 3a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

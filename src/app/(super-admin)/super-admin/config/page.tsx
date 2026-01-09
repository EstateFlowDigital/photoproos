import { Suspense } from "react";
import { ConfigPageClient } from "./config-client";
import {
  getFeatureFlags,
  getSystemSettings,
  getAuditLogs,
} from "@/lib/actions/super-admin";

async function ConfigLoader() {
  const [flagsResult, settingsResult, auditResult] = await Promise.all([
    getFeatureFlags(),
    getSystemSettings(),
    getAuditLogs({ limit: 10 }),
  ]);

  const flags = flagsResult.success ? (flagsResult.data as unknown[]) : [];
  const settings = settingsResult.success ? (settingsResult.data as unknown[]) : [];
  const auditLogs = auditResult.success ? auditResult.data.logs : [];

  return (
    <ConfigPageClient
      initialFlags={flags}
      initialSettings={settings}
      initialAuditLogs={auditLogs}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default function ConfigPage() {
  return (
    <div data-element="super-admin-config-page">
      <div className="mb-8" data-element="super-admin-config-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]" data-element="super-admin-config-title">
          Platform Configuration
        </h1>
        <p className="text-[var(--foreground-muted)]">
          System-wide settings and feature flags
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ConfigLoader />
      </Suspense>
    </div>
  );
}

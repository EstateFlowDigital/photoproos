"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  toggleFeatureFlag,
  updateSystemSetting,
  seedDefaultFeatureFlags,
  seedDefaultSystemSettings,
} from "@/lib/actions/super-admin";

// Icons
function ToggleRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

interface FeatureFlag {
  id: string;
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  icon?: string;
  isSystem?: boolean;
  rolloutPercentage?: number;
}

interface SystemSetting {
  id: string;
  key: string;
  name: string;
  description: string;
  value: string;
  valueType: string;
  category: string;
}

interface AuditLog {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
  targetType?: string;
}

interface ConfigPageClientProps {
  initialFlags: unknown[];
  initialSettings: unknown[];
  initialAuditLogs: unknown[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: SparklesIcon,
  trophy: TrophyIcon,
  "message-circle": MessageCircleIcon,
  mail: MailIcon,
  bell: BellIcon,
  calendar: CalendarIcon,
};

const CATEGORY_NAMES: Record<string, string> = {
  ai_features: "AI Features",
  engagement: "Engagement",
  communications: "Communications",
  finance: "Finance",
  experimental: "Experimental",
  system: "System",
};

export function ConfigPageClient({
  initialFlags,
  initialSettings,
  initialAuditLogs,
}: ConfigPageClientProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags as FeatureFlag[]);
  const [settings, setSettings] = useState<SystemSetting[]>(initialSettings as SystemSetting[]);
  const [auditLogs] = useState<AuditLog[]>(initialAuditLogs as AuditLog[]);
  const [isPending, startTransition] = useTransition();

  const handleToggleFlag = async (slugOrId: string, currentEnabled: boolean) => {
    startTransition(async () => {
      const result = await toggleFeatureFlag(slugOrId, !currentEnabled);
      if (result.success) {
        setFlags((prev) =>
          prev.map((f) =>
            f.slug === slugOrId || f.id === slugOrId
              ? { ...f, enabled: !currentEnabled }
              : f
          )
        );
        toast.success(`Feature flag ${!currentEnabled ? "enabled" : "disabled"}`);
      } else {
        toast.error(result.error || "Failed to toggle feature flag");
      }
    });
  };

  const handleToggleSetting = async (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    startTransition(async () => {
      const result = await updateSystemSetting(key, newValue);
      if (result.success) {
        setSettings((prev) =>
          prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
        );
        toast.success("System setting updated");
      } else {
        toast.error(result.error || "Failed to update setting");
      }
    });
  };

  const handleSeedDefaults = async () => {
    startTransition(async () => {
      const [flagsResult, settingsResult] = await Promise.all([
        seedDefaultFeatureFlags(),
        seedDefaultSystemSettings(),
      ]);

      if (flagsResult.success && settingsResult.success) {
        toast.success(
          `Seeded ${flagsResult.data} flags and ${settingsResult.data} settings`
        );
        // Reload page to get fresh data
        window.location.reload();
      } else {
        toast.error("Failed to seed defaults");
      }
    });
  };

  // Group flags by category
  const flagsByCategory = flags.reduce((acc, flag) => {
    const categoryName = CATEGORY_NAMES[flag.category] || flag.category;
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  // Check if we have data
  const hasData = flags.length > 0 || settings.length > 0;

  return (
    <div className="space-y-6">
      {/* Empty State - Seed Button */}
      {!hasData && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]",
            "p-8 text-center"
          )}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-4">
            <ToggleRightIcon className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No Configuration Data
          </h3>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            Seed the default feature flags and system settings to get started.
          </p>
          <Button onClick={handleSeedDefaults} disabled={isPending}>
            {isPending ? "Seeding..." : "Seed Default Configuration"}
          </Button>
        </div>
      )}

      {/* System Settings */}
      {settings.length > 0 && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg",
                  "bg-[var(--error)]/10",
                  "flex items-center justify-center"
                )}
              >
                <ToggleRightIcon className="w-5 h-5 text-[var(--error)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  System Settings
                </h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Critical platform-wide settings
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg",
                  "border border-[var(--border)]",
                  "bg-[var(--background)]",
                  isPending && "opacity-50"
                )}
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {setting.name}
                  </p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  checked={setting.value === "true"}
                  onCheckedChange={() => handleToggleSetting(setting.key, setting.value)}
                  disabled={isPending}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags by Category */}
      {Object.entries(flagsByCategory).map(([category, categoryFlags]) => (
        <div
          key={category}
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {category}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {categoryFlags.map((flag) => {
              const IconComponent = flag.icon ? ICON_MAP[flag.icon] : SparklesIcon;
              return (
                <div
                  key={flag.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg",
                    "border border-[var(--border)]",
                    "bg-[var(--background)]",
                    isPending && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg",
                        "bg-[var(--primary)]/10",
                        "flex items-center justify-center"
                      )}
                    >
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 text-[var(--primary)]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--foreground)]">
                          {flag.name}
                        </p>
                        {flag.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {flag.description}
                      </p>
                      {flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100 && (
                        <p className="text-xs text-[var(--warning)] mt-1">
                          Rollout: {flag.rolloutPercentage}%
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        flag.enabled
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]"
                      )}
                    >
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggleFlag(flag.slug, flag.enabled)}
                      disabled={isPending}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Recent Audit Log */}
      {auditLogs.length > 0 && (
        <div
          className={cn(
            "rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Recent Activity
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-[var(--foreground)]">{log.description}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {log.actionType.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="text-xs text-[var(--foreground-muted)]">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      {hasData && (
        <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
          <p className="text-sm text-[var(--success)]">
            <strong>Database-backed:</strong> All changes are persisted to the database and take effect immediately across all instances. Actions are logged for audit purposes.
          </p>
        </div>
      )}

      {/* Clerk Super Admin Setup Instructions */}
      <div
        className={cn(
          "rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]",
          "p-6"
        )}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Setting Up Super Admin Access
        </h2>
        <div className="space-y-4 text-sm text-[var(--foreground-muted)]">
          <p>
            To grant super admin access to a user:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">Clerk Dashboard</a></li>
            <li>Navigate to <strong>Users</strong> and find the user</li>
            <li>Click on the user → <strong>Metadata</strong> tab</li>
            <li>Under <strong>Public metadata</strong>, add:</li>
          </ol>
          <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)] font-mono text-xs">
            {`{`}<br/>
            {`  "isSuperAdmin": true`}<br/>
            {`}`}
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            The user will immediately have access to the Super Admin area without needing to log out.
          </p>
        </div>
      </div>
    </div>
  );
}

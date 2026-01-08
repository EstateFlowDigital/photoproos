"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

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
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: "ai_assistant",
    name: "AI Business Assistant",
    description: "Claude-powered AI assistant for business queries",
    enabled: true,
    category: "AI Features",
    icon: SparklesIcon,
  },
  {
    id: "gamification",
    name: "Gamification System",
    description: "XP, levels, achievements, and streaks",
    enabled: true,
    category: "Engagement",
    icon: TrophyIcon,
  },
  {
    id: "feedback_modal",
    name: "Feedback Collection",
    description: "Session-based feedback modal for users",
    enabled: true,
    category: "Engagement",
    icon: MessageCircleIcon,
  },
  {
    id: "email_notifications",
    name: "Email Notifications",
    description: "Transactional and marketing emails",
    enabled: true,
    category: "Communications",
    icon: MailIcon,
  },
  {
    id: "slack_notifications",
    name: "Slack Notifications",
    description: "Support ticket notifications to Slack",
    enabled: true,
    category: "Communications",
    icon: BellIcon,
  },
  {
    id: "tax_prep",
    name: "Tax Preparation",
    description: "Seasonal tax preparation wizard",
    enabled: true,
    category: "Finance",
    icon: CalendarIcon,
  },
];

const SYSTEM_SETTINGS = [
  {
    id: "maintenance_mode",
    name: "Maintenance Mode",
    description: "Show maintenance page to all users",
    enabled: false,
  },
  {
    id: "new_signups",
    name: "New Signups",
    description: "Allow new user registrations",
    enabled: true,
  },
  {
    id: "trial_period",
    name: "Free Trial",
    description: "14-day free trial for new users",
    enabled: true,
  },
];

export function ConfigPageClient() {
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [settings, setSettings] = useState(SYSTEM_SETTINGS);

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Group flags by category
  const flagsByCategory = flags.reduce((acc, flag) => {
    if (!acc[flag.category]) acc[flag.category] = [];
    acc[flag.category].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  return (
    <div className="space-y-6">
      {/* System Settings */}
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
                "bg-[var(--background)]"
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
                checked={setting.enabled}
                onCheckedChange={() => toggleSetting(setting.id)}
              />
            </div>
          ))}
        </div>
      </div>

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
            {categoryFlags.map((flag) => (
              <div
                key={flag.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg",
                  "border border-[var(--border)]",
                  "bg-[var(--background)]"
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
                    <flag.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {flag.name}
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {flag.description}
                    </p>
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
                    onCheckedChange={() => toggleFlag(flag.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Info Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Note:</strong> Feature flag changes take effect immediately but are stored in memory for this demo.
          In production, these would be stored in the database and synced across all instances.
        </p>
      </div>

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

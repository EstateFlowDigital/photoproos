"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getSocialMediaIntegrations,
  type Integration,
  type IntegrationStatus,
} from "@/lib/integrations/registry";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  AlertCircle,
  Loader2,
  Settings,
  RefreshCw,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Link2,
  Shield,
  Zap,
} from "lucide-react";

// Custom icons for platforms not in lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  tiktok: "#000000",
  pinterest: "#BD081C",
};

// Mock connection status - in real app, this would come from database/API
interface ConnectionState {
  [key: string]: {
    status: IntegrationStatus;
    connectedAt?: string;
    accountName?: string;
  };
}

export default function MarketingStudioIntegrationsPage() {
  const [integrations] = React.useState<Integration[]>(getSocialMediaIntegrations());
  const [connections, setConnections] = React.useState<ConnectionState>({});
  const [connecting, setConnecting] = React.useState<string | null>(null);
  const [disconnecting, setDisconnecting] = React.useState<string | null>(null);

  // Load saved connections from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("photoproos-social-connections");
        if (saved) {
          setConnections(JSON.parse(saved));
        }
      } catch {
        // Ignore errors
      }
    }
  }, []);

  // Save connections to localStorage
  const saveConnections = (newConnections: ConnectionState) => {
    setConnections(newConnections);
    if (typeof window !== "undefined") {
      localStorage.setItem("photoproos-social-connections", JSON.stringify(newConnections));
    }
  };

  // Mock OAuth flow - in real app, this would redirect to the platform's OAuth page
  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);

    // Simulate OAuth delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newConnections = {
      ...connections,
      [platformId]: {
        status: "connected" as IntegrationStatus,
        connectedAt: new Date().toISOString(),
        accountName: `@your_${platformId}_account`,
      },
    };
    saveConnections(newConnections);
    setConnecting(null);
  };

  const handleDisconnect = async (platformId: string) => {
    if (!window.confirm("Are you sure you want to disconnect this account?")) {
      return;
    }

    setDisconnecting(platformId);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newConnections = { ...connections };
    delete newConnections[platformId];
    saveConnections(newConnections);
    setDisconnecting(null);
  };

  const getStatusBadge = (integration: Integration) => {
    const connection = connections[integration.id];
    const isComingSoon = integration.comingSoon;

    if (isComingSoon) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background-hover)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-muted)]">
          Coming Soon
        </span>
      );
    }

    if (!connection || connection.status === "disconnected") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background-hover)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground-muted)]" />
          Not Connected
        </span>
      );
    }

    if (connection.status === "connected") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
          <Check className="h-3 w-3" />
          Connected
        </span>
      );
    }

    if (connection.status === "error") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--error)]/10 px-2.5 py-1 text-xs font-medium text-[var(--error)]">
          <AlertCircle className="h-3 w-3" />
          Error
        </span>
      );
    }

    return null;
  };

  const connectedCount = Object.values(connections).filter((c) => c.status === "connected").length;
  const availableCount = integrations.filter((i) => !i.comingSoon).length;

  return (
    <div className="marketing-studio-integrations-page space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/super-admin/marketing-studio"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--background-hover)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--foreground-muted)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Social Media Connections</h1>
          <p className="text-[var(--foreground-muted)]">
            Connect your social media accounts to publish directly from Marketing Studio
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <Link2 className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{connectedCount}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Connected</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
            <Zap className="h-5 w-5 text-[var(--success)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{availableCount}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Available</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
            <Shield className="h-5 w-5 text-[var(--ai)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">OAuth 2.0</p>
            <p className="text-sm text-[var(--foreground-muted)]">Secure</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
        <h2 className="text-sm font-semibold text-[var(--primary)] mb-2">How it works</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Connect your social media accounts using secure OAuth authentication. This allows PhotoProOS
          to publish content on your behalf without storing your passwords. You can disconnect at any time.
        </p>
      </div>

      {/* Platform list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
          Available Platforms
        </h2>
        <div className="grid gap-4">
          {integrations.map((integration) => {
            const Icon = PLATFORM_ICONS[integration.id] || Link2;
            const color = PLATFORM_COLORS[integration.id] || "var(--primary)";
            const connection = connections[integration.id];
            const isConnected = connection?.status === "connected";
            const isConnecting = connecting === integration.id;
            const isDisconnecting = disconnecting === integration.id;
            const isComingSoon = integration.comingSoon;

            return (
              <div
                key={integration.id}
                className={cn(
                  "rounded-xl border bg-[var(--card)] overflow-hidden transition-all",
                  isComingSoon
                    ? "border-[var(--card-border)] opacity-75"
                    : isConnected
                    ? "border-[var(--success)]/30"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">
                            {integration.name}
                          </h3>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {integration.description}
                          </p>
                        </div>
                        {getStatusBadge(integration)}
                      </div>

                      {/* Connected account info */}
                      {isConnected && connection && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-[var(--foreground-secondary)]">
                          <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                          <span>{connection.accountName}</span>
                          <span className="text-[var(--foreground-muted)]">
                            · Connected {new Date(connection.connectedAt!).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {integration.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature.id}
                            className="inline-flex items-center rounded-md bg-[var(--background-hover)] px-2 py-1 text-xs text-[var(--foreground-muted)]"
                          >
                            {feature.label}
                          </span>
                        ))}
                        {integration.features.length > 3 && (
                          <span className="inline-flex items-center rounded-md bg-[var(--background-hover)] px-2 py-1 text-xs text-[var(--foreground-muted)]">
                            +{integration.features.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {isComingSoon ? (
                          <button
                            disabled
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-hover)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] cursor-not-allowed"
                          >
                            Coming Soon
                          </button>
                        ) : isConnected ? (
                          <>
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              disabled={isDisconnecting}
                              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 px-4 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/5 transition-colors disabled:opacity-50"
                            >
                              {isDisconnecting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Disconnecting...
                                </>
                              ) : (
                                "Disconnect"
                              )}
                            </button>
                            <button
                              onClick={() => handleConnect(integration.id)}
                              disabled={isConnecting}
                              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Reconnect
                            </button>
                            <Link
                              href={`/super-admin/marketing-studio/integrations/${integration.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              Settings
                            </Link>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(integration.id)}
                            disabled={isConnecting}
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                            style={{ backgroundColor: color }}
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Icon className="h-4 w-4" />
                                Connect {integration.name}
                              </>
                            )}
                          </button>
                        )}

                        {integration.docsUrl && (
                          <a
                            href={integration.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            API Docs
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded description */}
                {integration.longDescription && (
                  <div className="border-t border-[var(--card-border)] bg-[var(--background-tertiary)] px-5 py-3">
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {integration.longDescription}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Note about OAuth */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/10">
            <AlertCircle className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
              About OAuth Connections
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              When you connect a social media account, you&apos;ll be redirected to that platform&apos;s website
              to authorize PhotoProOS. We never see or store your password. You can revoke access
              at any time from your social media account settings or by disconnecting here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

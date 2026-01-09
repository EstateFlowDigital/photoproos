"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  IntegrationCard,
  ConnectedIntegrationCard,
  ApiKeyManager,
  WebhookManager,
} from "@/components/integrations";
import {
  getAllIntegrations,
  getIntegrationCategories,
  getCategoryLabel,
  type Integration,
  type IntegrationCategory,
  type IntegrationStatus,
} from "@/lib/integrations/registry";
import { CodeIcon, PlugIcon, ChevronDownIcon } from "@/components/ui/settings-icons";
import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  isActive: boolean;
  lastDeliveryAt: Date | null;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    deliveries: number;
  };
}

interface IntegrationsClientProps {
  connectedIntegrations: Record<string, { connected: boolean; lastSync?: Date }>;
  apiKeys: ApiKey[];
  webhooks: WebhookEndpoint[];
}

// ============================================================================
// Client Component
// ============================================================================

export function IntegrationsClient({
  connectedIntegrations: initialConnectedIntegrations,
  apiKeys: initialApiKeys,
  webhooks: initialWebhooks,
}: IntegrationsClientProps) {
  const router = useRouter();
  const [connectedIntegrations, setConnectedIntegrations] = React.useState(initialConnectedIntegrations);
  const [apiKeys, setApiKeys] = React.useState(initialApiKeys);
  const [webhooks, setWebhooks] = React.useState(initialWebhooks);
  const [selectedCategory, setSelectedCategory] = React.useState<IntegrationCategory | "all">("all");
  const [showApiSection, setShowApiSection] = React.useState(true);
  const [showWebhookSection, setShowWebhookSection] = React.useState(true);

  const allIntegrations = getAllIntegrations();
  const categories = getIntegrationCategories();

  // Get integration status
  const getStatus = (integration: Integration): IntegrationStatus => {
    const data = connectedIntegrations[integration.id];
    if (!data) return "disconnected";
    return data.connected ? "connected" : "disconnected";
  };

  // Filter integrations
  const filteredIntegrations =
    selectedCategory === "all"
      ? allIntegrations
      : allIntegrations.filter((i) => i.category === selectedCategory);

  // Get connected integrations
  const connectedIntegrationsList = allIntegrations.filter(
    (i) => connectedIntegrations[i.id]?.connected && !i.comingSoon
  );

  // Get available (not connected) integrations
  const availableIntegrations = filteredIntegrations.filter(
    (i) => !connectedIntegrations[i.id]?.connected
  );

  // Refresh data
  const handleRefresh = async () => {
    // Trigger a soft refresh to get updated data from the server
    router.refresh();
  };

  // Handle connect (redirect to settings page or OAuth flow)
  const handleConnect = (integration: Integration) => {
    if (integration.settingsHref) {
      window.location.href = integration.settingsHref;
    }
  };

  return (
    <div className="space-y-8">
      {/* Connected Integrations */}
      {connectedIntegrationsList.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Connected</h2>
          <div className="space-y-3">
            {connectedIntegrationsList.map((integration) => (
              <ConnectedIntegrationCard
                key={integration.id}
                integration={integration}
                lastSync={connectedIntegrations[integration.id]?.lastSync}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Filters */}
      <section>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h2 className="text-lg font-semibold text-foreground">Available Integrations</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                selectedCategory === category
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              )}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* Integration Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              status={getStatus(integration)}
              onConnect={() => handleConnect(integration)}
            />
          ))}
        </div>

        {availableIntegrations.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
            <PlugIcon className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-2 text-sm font-medium text-foreground">No integrations found</p>
            <p className="mt-1 text-sm text-foreground-muted">
              {selectedCategory === "all"
                ? "Check back later for new integrations"
                : `No integrations in the ${getCategoryLabel(selectedCategory)} category`}
            </p>
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Coming Soon</h2>
        <p className="mb-4 text-sm text-foreground-muted">
          Powerful marketing features in development. Click to learn more and join the waitlist.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Email Marketing */}
          <Link
            href="/features/email-marketing"
            className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--ai)]/50 hover:shadow-lg hover:shadow-[var(--ai)]/5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--ai)]/10">
                <MailIcon className="h-6 w-6 text-[var(--ai)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground group-hover:text-[var(--ai)] transition-colors">
                    Email Marketing
                  </h3>
                  <span className="rounded-full bg-[var(--ai)]/10 px-2 py-0.5 text-xs font-medium text-[var(--ai)]">
                    Q2 2026
                  </span>
                </div>
                <p className="text-sm text-foreground-muted">
                  Nurture leads, engage clients, and grow your business with beautiful, automated email campaigns.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--ai)] group-hover:underline">
                  Learn more & join waitlist
                  <ArrowRightIcon className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>

          {/* Social Media Manager */}
          <Link
            href="/features/social-media"
            className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/10">
                <ShareIcon className="h-6 w-6 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground group-hover:text-pink-400 transition-colors">
                    Social Media Manager
                  </h3>
                  <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-xs font-medium text-pink-400">
                    Q3 2026
                  </span>
                </div>
                <p className="text-sm text-foreground-muted">
                  Schedule, publish, and analyze your social media content across Instagram, Facebook, Pinterest, and more.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-pink-400 group-hover:underline">
                  Learn more & join waitlist
                  <ArrowRightIcon className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* API Access Section */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowApiSection(!showApiSection)}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[var(--background-hover)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <CodeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">API Access</h2>
              <p className="text-sm text-foreground-muted">Build custom integrations with our API</p>
            </div>
          </div>
          <ChevronDownIcon
            className={cn(
              "h-5 w-5 text-foreground-muted transition-transform",
              showApiSection && "rotate-180"
            )}
          />
        </button>
        {showApiSection && (
          <div className="border-t border-[var(--card-border)] p-6">
            <ApiKeyManager apiKeys={apiKeys} onRefresh={handleRefresh} />
          </div>
        )}
      </section>

      {/* Webhooks Section */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowWebhookSection(!showWebhookSection)}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[var(--background-hover)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <PlugIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Webhooks</h2>
              <p className="text-sm text-foreground-muted">Receive real-time event notifications</p>
            </div>
          </div>
          <ChevronDownIcon
            className={cn(
              "h-5 w-5 text-foreground-muted transition-transform",
              showWebhookSection && "rotate-180"
            )}
          />
        </button>
        {showWebhookSection && (
          <div className="border-t border-[var(--card-border)] p-6">
            <WebhookManager webhooks={webhooks} onRefresh={handleRefresh} />
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

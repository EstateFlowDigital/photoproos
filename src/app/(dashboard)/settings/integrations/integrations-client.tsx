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
        <div className="flex items-center justify-between mb-4">
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

      {/* API Access Section */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowApiSection(!showApiSection)}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[var(--background-hover)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
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

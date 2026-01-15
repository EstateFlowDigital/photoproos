import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations | PhotoProOS",
  description: "Connect third-party apps and services to PhotoProOS.",
};

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { IntegrationsClient } from "./integrations-client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

// ============================================================================
// Data Fetching
// ============================================================================

async function getIntegrationsData() {
  const auth = await getAuthContext();
  if (!auth) {
    return {
      connectedIntegrations: {},
      apiKeys: [],
      webhooks: [],
    };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
    select: {
      // Google Calendar connection
      id: true,
      // Dropbox connection
      dropboxIntegration: {
        select: {
          isActive: true,
          lastSyncAt: true,
        },
      },
      // Slack connection
      slackTeamId: true,
      slackAccessToken: true,
      slackIntegrations: {
        where: { isActive: true },
        take: 1,
        select: {
          isActive: true,
          updatedAt: true,
        },
      },
      // Stripe connection
      stripeConnectAccountId: true,
      stripeConnectOnboarded: true,
      // API Keys
      apiKeys: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          scopes: true,
          isActive: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
        },
      },
      // Webhooks
      webhookEndpoints: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          description: true,
          events: true,
          isActive: true,
          lastDeliveryAt: true,
          failureCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              deliveries: true,
            },
          },
        },
      },
    },
  });

  if (!organization) {
    return {
      connectedIntegrations: {},
      apiKeys: [],
      webhooks: [],
    };
  }

  // Check for Google Calendar connection by looking for OAuth tokens
  // This would need to be implemented based on how Google Calendar stores tokens
  const googleCalendarConnected = false; // Placeholder - check for google_calendar table

  // Build connected integrations map
  const connectedIntegrations: Record<string, { connected: boolean; lastSync?: Date }> = {
    google_calendar: {
      connected: googleCalendarConnected,
    },
    dropbox: {
      connected: organization.dropboxIntegration?.isActive ?? false,
      lastSync: organization.dropboxIntegration?.lastSyncAt ?? undefined,
    },
    slack: {
      connected:
        (!!organization.slackTeamId && !!organization.slackAccessToken) ||
        (organization.slackIntegrations?.length ?? 0) > 0,
      lastSync: organization.slackIntegrations?.[0]?.updatedAt ?? undefined,
    },
    stripe: {
      connected: !!organization.stripeConnectAccountId && organization.stripeConnectOnboarded,
    },
  };

  return {
    connectedIntegrations,
    apiKeys: organization.apiKeys,
    webhooks: organization.webhookEndpoints,
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function IntegrationsSettingsPage() {
  const [data, walkthroughPreferenceResult] = await Promise.all([
    getIntegrationsData(),
    getWalkthroughPreference("integrations"),
  ]);

  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div data-element="settings-integrations-page" className="space-y-6">
      <WalkthroughWrapper pageId="integrations" initialState={walkthroughState} />
      <PageHeader
        title="Integrations"
        subtitle="Connect third-party apps and services to extend PhotoProOS"
      />

      <IntegrationsClient
        connectedIntegrations={data.connectedIntegrations}
        apiKeys={data.apiKeys}
        webhooks={data.webhooks}
      />
    </div>
  );
}

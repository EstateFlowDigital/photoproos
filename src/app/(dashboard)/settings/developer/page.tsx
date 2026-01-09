export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { SeedDatabaseButton, ClearDataButton, LifetimeLicenseButton } from "./seed-buttons";
import { StripeProductsSection } from "./stripe-products";
import { SubscriptionPlansSection } from "./subscription-plans";
import { DevToolsSettings } from "./dev-tools-settings";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { getProductSyncOverview } from "@/lib/stripe/product-sync";
import {
  getSubscriptionPlans,
  getPricingExperiments,
} from "@/lib/actions/subscription-plans";

export default async function DeveloperSettingsPage() {
  const organizationId = await requireOrganizationId();

  // Fetch all data in parallel
  const [syncOverview, plansResult, experimentsResult] = await Promise.all([
    getProductSyncOverview(organizationId),
    getSubscriptionPlans(),
    getPricingExperiments(),
  ]);

  const plans = plansResult.success ? plansResult.data : [];
  const experiments = experimentsResult.success ? experimentsResult.data : [];

  return (
    <div data-element="settings-developer-page" className="space-y-6">
      <PageHeader
        title="Developer Tools"
        subtitle="Database seeding and testing utilities"
        actions={
          <Link
            href="/settings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] sm:w-auto"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      {/* API Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <CodeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Public API</h2>
              <p className="text-sm text-foreground-muted">Integrate with external applications</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/integrations"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <KeyIcon className="h-4 w-4" />
              API Keys
            </Link>
            <Link
              href="/settings/developer/api"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
            >
              <BookOpenIcon className="h-4 w-4" />
              View Documentation
            </Link>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <p className="text-2xl font-bold text-foreground">v1</p>
            <p className="text-sm text-foreground-muted">API Version</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <p className="text-2xl font-bold text-foreground">REST</p>
            <p className="text-sm text-foreground-muted">Architecture</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <p className="text-2xl font-bold text-foreground">JSON</p>
            <p className="text-sm text-foreground-muted">Response Format</p>
          </div>
        </div>
      </div>

      {/* Debug Tools Visibility */}
      <DevToolsSettings />

      {/* Warning Banner */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
        <p className="text-sm text-[var(--warning)]">
          <strong>Warning:</strong> These tools modify your database. Use with caution in production environments.
        </p>
      </div>

      {/* Lifetime License */}
      <div className="rounded-xl border border-[var(--ai)]/30 bg-[var(--card)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--ai)]/30 bg-[var(--ai)]/10 text-[var(--ai)]">
            <CrownIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lifetime License</h2>
            <p className="text-sm text-foreground-muted">Unlock all features and modules</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-foreground-secondary">
            This will upgrade your account to the Enterprise plan with:
          </p>
          <div className="grid gap-x-4 gap-y-1.5 text-sm text-foreground-muted sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[var(--ai)]" />
              All 28+ modules enabled
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[var(--ai)]" />
              Enterprise plan tier
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[var(--ai)]" />
              Lifetime license flag
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[var(--ai)]" />
              All advanced features
            </div>
          </div>
        </div>

        <LifetimeLicenseButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Seed Database */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <DatabaseIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Seed Database</h2>
              <p className="text-sm text-foreground-muted">Add sample data for testing</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm text-foreground-secondary">
              This will create comprehensive sample data in your organization:
            </p>
            <div className="grid gap-x-4 gap-y-1.5 text-sm text-foreground-muted sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                8 sample clients
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                7 client tags
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                6 photography services
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                8 projects/galleries
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Sample photos per gallery
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                6 calendar bookings
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                5 invoices with payments
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                4 contracts with signers
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                4 property websites
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Property leads & analytics
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                6 equipment items
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                4 availability blocks
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Task board with 8 tasks
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Activity logs & notifications
              </div>
            </div>
          </div>

          <SeedDatabaseButton />
        </div>

        {/* Clear Data */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--error)]/10 text-[var(--error)]">
              <TrashIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Clear All Data</h2>
              <p className="text-sm text-foreground-muted">Reset your organization data</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm text-foreground-secondary">
              This will permanently delete all data from your organization:
            </p>
            <ul className="space-y-1.5 text-sm text-foreground-muted">
              <li className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-[var(--error)]" />
                All clients and their data
              </li>
              <li className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-[var(--error)]" />
                All projects and galleries
              </li>
              <li className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-[var(--error)]" />
                All bookings and invoices
              </li>
              <li className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-[var(--error)]" />
                All contracts and templates
              </li>
              <li className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-[var(--error)]" />
                All services and tags
              </li>
            </ul>
            <p className="text-xs text-[var(--error)] font-medium">
              This action cannot be undone!
            </p>
          </div>

          <ClearDataButton />
        </div>
      </div>

      {/* Stripe Products (Organization Services & Bundles) */}
      <StripeProductsSection
        organizationId={organizationId}
        initialSyncOverview={syncOverview}
      />

      {/* Subscription Plans (Application Pricing Tiers) */}
      <SubscriptionPlansSection
        initialPlans={plans}
        initialExperiments={experiments}
      />

      {/* Data Overview */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
        <p className="text-sm text-foreground-muted mb-4">
          After seeding, explore these areas to see the sample data:
        </p>
        <div className="auto-grid grid-min-200 grid-gap-3">
          <QuickLink href="/clients" label="Clients" count="8 clients" />
          <QuickLink href="/projects" label="Projects" count="8 projects" />
          <QuickLink href="/galleries" label="Galleries" count="With photos" />
          <QuickLink href="/scheduling" label="Calendar" count="6 bookings" />
          <QuickLink href="/invoices" label="Invoices" count="5 invoices" />
          <QuickLink href="/contracts" label="Contracts" count="4 contracts" />
          <QuickLink href="/services" label="Services" count="6 services" />
          <QuickLink href="/properties" label="Properties" count="4 websites" />
          <QuickLink href="/dashboard" label="Dashboard" count="Overview" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, label, count }: { href: string; label: string; count: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
    >
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-xs text-foreground-muted">{count}</span>
    </Link>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4Zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37ZM3 13.179V15c0 2.21 3.134 4 7 4s7-1.79 7-4v-1.822c-.396.37-.842.688-1.306.953-1.532.875-3.548 1.369-5.694 1.369s-4.162-.494-5.694-1.37A7.009 7.009 0 0 1 3 13.179Z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
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

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8 7a5 5 0 1 1 3.61 4.804l-1.903 1.903A1 1 0 0 1 9 14H8v1a1 1 0 0 1-1 1H6v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707L8.196 8.39A5.002 5.002 0 0 1 8 7Zm5-3a.75.75 0 0 0 0 1.5A1.5 1.5 0 0 1 14.5 7 .75.75 0 0 0 16 7a3 3 0 0 0-3-3Z" clipRule="evenodd" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06v-11a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 3a8.963 8.963 0 0 0-4.25 1.065V16.82ZM9.25 4.065A8.963 8.963 0 0 0 5 3c-.85 0-1.673.118-2.454.339A.75.75 0 0 0 2 4.06v11a.75.75 0 0 0 .954.721A7.463 7.463 0 0 1 5 15.5c1.579 0 3.042.487 4.25 1.32V4.065Z" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

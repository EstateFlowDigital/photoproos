export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { BrokerageForm } from "../brokerage-form";

async function getStats(organizationId: string) {
  try {
    const [totalBrokerages, totalAgents] = await Promise.all([
      prisma.brokerage.count({ where: { organizationId } }),
      prisma.agent.count({ where: { brokerage: { organizationId } } }),
    ]);

    return { totalBrokerages, totalAgents };
  } catch {
    return { totalBrokerages: 0, totalAgents: 0 };
  }
}

export default async function NewBrokeragePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const stats = await getStats(auth.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Brokerage"
        subtitle="Add a new brokerage partner to your network"
        actions={
          <Link
            href="/brokerages"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Brokerages
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BrokerageForm />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Add brokerage details to enable co-branded marketing materials.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Upload the brokerage logo for use in property websites and flyers.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Add agents after creating the brokerage to complete your setup.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Brokerages</span>
                <span className="text-sm font-medium text-foreground">{stats.totalBrokerages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Agents</span>
                <span className="text-sm font-medium text-foreground">{stats.totalAgents}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/brokerages"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View All Brokerages
              </Link>
              <Link
                href="/properties"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Property Websites
              </Link>
              <Link
                href="/settings/branding"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Branding Settings
              </Link>
            </div>
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

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getBrokerage } from "@/lib/actions/brokerages";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { BrokerageForm } from "../../brokerage-form";

interface EditBrokeragePageProps {
  params: Promise<{ id: string }>;
}

async function getStats(organizationId: string, brokerageId: string) {
  try {
    const [totalBrokerages, brokerageAgents, totalAgents] = await Promise.all([
      prisma.brokerage.count({ where: { organizationId } }),
      prisma.agent.count({ where: { brokerageId } }),
      prisma.agent.count({ where: { brokerage: { organizationId } } }),
    ]);

    return { totalBrokerages, brokerageAgents, totalAgents };
  } catch {
    return { totalBrokerages: 0, brokerageAgents: 0, totalAgents: 0 };
  }
}

export default async function EditBrokeragePage({ params }: EditBrokeragePageProps) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const result = await getBrokerage(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const brokerage = result.data;
  const stats = await getStats(auth.organizationId, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Brokerage"
        subtitle={`Editing ${brokerage.name}`}
        actions={
          <Link
            href={`/brokerages/${id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Brokerage
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BrokerageForm brokerage={brokerage} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Update the logo to refresh co-branded marketing materials.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Keep contact information current for agent communications.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Primary color affects all brokerage-branded materials.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Brokerage Info</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Agents</span>
                <span className="text-sm font-medium text-foreground">{stats.brokerageAgents}</span>
              </div>
              {brokerage.website && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Website</span>
                  <a
                    href={brokerage.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--primary)] hover:underline truncate max-w-[150px]"
                  >
                    View Site
                  </a>
                </div>
              )}
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
                href={`/brokerages/${id}`}
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View Brokerage
              </Link>
              <Link
                href="/brokerages"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                All Brokerages
              </Link>
              <Link
                href="/brokerages/new"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Add New Brokerage
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

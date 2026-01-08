export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { EditEstimateForm } from "./edit-estimate-form";

interface Props {
  params: Promise<{ id: string }>;
}

async function getStats(organizationId: string) {
  try {
    const [totalEstimates, pendingEstimates, acceptedEstimates, totalValue] = await Promise.all([
      prisma.estimate.count({ where: { organizationId } }),
      prisma.estimate.count({ where: { organizationId, status: "sent" } }),
      prisma.estimate.count({ where: { organizationId, status: "accepted" } }),
      prisma.estimate.aggregate({
        where: { organizationId, status: "accepted" },
        _sum: { totalCents: true },
      }),
    ]);

    return {
      totalEstimates,
      pendingEstimates,
      acceptedEstimates,
      totalValue: totalValue._sum.totalCents || 0,
    };
  } catch {
    return { totalEstimates: 0, pendingEstimates: 0, acceptedEstimates: 0, totalValue: 0 };
  }
}

export default async function EditEstimatePage({ params }: Props) {
  const { id } = await params;
  const organizationId = await requireOrganizationId();

  const [estimate, clients, services, stats] = await Promise.all([
    prisma.estimate.findFirst({
      where: { id, organizationId },
      include: {
        lineItems: { orderBy: { sortOrder: "asc" } },
        client: { select: { id: true, fullName: true, email: true } },
      },
    }),
    prisma.client.findMany({
      where: { organizationId },
      select: { id: true, fullName: true, company: true, email: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.service.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, priceCents: true, description: true },
      orderBy: { name: "asc" },
    }),
    getStats(organizationId),
  ]);

  if (!estimate) {
    notFound();
  }

  if (estimate.status !== "draft") {
    redirect(`/billing/estimates/${id}`);
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${estimate.estimateNumber}`}
        subtitle="Update estimate details"
        actions={
          <Link
            href={`/billing/estimates/${id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Estimate
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EditEstimateForm estimate={estimate} clients={clients} services={services} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Update line items to reflect any changes in scope or pricing.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Adjust the expiration date to give clients more time if needed.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Preview the estimate before sending to your client.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Estimate Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Status</span>
                <span className="inline-flex items-center rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs font-medium text-foreground-muted capitalize">
                  {estimate.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Client</span>
                <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                  {estimate.client?.fullName || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total</span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(estimate.totalCents)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Line Items</span>
                <span className="text-sm font-medium text-foreground">
                  {estimate.lineItems.length}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Estimates</span>
                <span className="text-sm font-medium text-foreground">{stats.totalEstimates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Awaiting Response</span>
                <span className="text-sm font-medium text-foreground">{stats.pendingEstimates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Accepted</span>
                <span className="text-sm font-medium text-foreground">{stats.acceptedEstimates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Accepted Value</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(stats.totalValue)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href={`/billing/estimates/${id}`}
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View Estimate
              </Link>
              <Link
                href="/billing/estimates"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                All Estimates
              </Link>
              <Link
                href="/billing/estimates/new"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Create New Estimate
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

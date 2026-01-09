export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ContractFormClient } from "./contract-form-client";

async function getStats(organizationId: string) {
  try {
    const [totalContracts, pendingContracts, signedContracts, totalTemplates] = await Promise.all([
      prisma.contract.count({ where: { organizationId } }),
      prisma.contract.count({ where: { organizationId, status: "sent" } }),
      prisma.contract.count({ where: { organizationId, status: "signed" } }),
      prisma.contractTemplate.count({ where: { organizationId } }),
    ]);

    return { totalContracts, pendingContracts, signedContracts, totalTemplates };
  } catch {
    return { totalContracts: 0, pendingContracts: 0, signedContracts: 0, totalTemplates: 0 };
  }
}

export default async function NewContractPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // Fetch clients, templates, and stats in parallel
  const [clients, templates, stats] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.contractTemplate.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
      },
      orderBy: { name: "asc" },
    }),
    getStats(auth.organizationId),
  ]);

  return (
    <div className="space-y-6" data-element="contracts-new-page">
      <PageHeader
        title="Create Contract"
        subtitle="Create a new contract from scratch or use a template"
        actions={
          <Link
            href="/contracts"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Contracts
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContractFormClient clients={clients} templates={templates} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Use a template to get started quickly with pre-written terms.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Insert variables like {"{{client_name}}"} that auto-fill when sent.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Set an expiration date to encourage timely signatures.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Total Contracts</span>
                <span className="text-sm font-medium text-foreground">{stats.totalContracts}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Awaiting Signature</span>
                <span className="text-sm font-medium text-foreground">{stats.pendingContracts}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Fully Signed</span>
                <span className="text-sm font-medium text-foreground">{stats.signedContracts}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Templates</span>
                <span className="text-sm font-medium text-foreground">{stats.totalTemplates}</span>
              </div>
            </div>
          </div>

          {templates.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Available Templates</h2>
              <div className="space-y-2">
                {templates.slice(0, 5).map((template) => (
                  <div key={template.id} className="text-sm">
                    <span className="text-foreground">{template.name}</span>
                    {template.description && (
                      <p className="text-xs text-foreground-muted truncate">{template.description}</p>
                    )}
                  </div>
                ))}
                {templates.length > 5 && (
                  <p className="text-xs text-foreground-muted">+{templates.length - 5} more</p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/contracts"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View All Contracts
              </Link>
              <Link
                href="/contracts/templates"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Manage Templates
              </Link>
              <Link
                href="/clients"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View Clients
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

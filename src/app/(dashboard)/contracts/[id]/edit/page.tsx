export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { getContract } from "@/lib/actions/contracts";
import { ContractEditClient } from "./contract-edit-client";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getStats(organizationId: string) {
  try {
    const [totalContracts, pendingContracts, signedContracts] = await Promise.all([
      prisma.contract.count({ where: { organizationId } }),
      prisma.contract.count({ where: { organizationId, status: "sent" } }),
      prisma.contract.count({ where: { organizationId, status: "signed" } }),
    ]);

    return { totalContracts, pendingContracts, signedContracts };
  } catch {
    return { totalContracts: 0, pendingContracts: 0, signedContracts: 0 };
  }
}

export default async function ContractEditPage({ params }: PageProps) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const contract = await getContract(id);

  if (!contract) {
    notFound();
  }

  // Can't edit signed contracts
  if (contract.status === "signed") {
    redirect(`/contracts/${id}`);
  }

  // Get clients for dropdown
  const [clients, templates, stats] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.contractTemplate.findMany({
      where: { organizationId: auth.organizationId },
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
    <div className="space-y-6">
      <PageHeader
        title="Edit Contract"
        subtitle={contract.name}
        actions={
          <Link
            href={`/contracts/${contract.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Contract
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContractEditClient
            contract={contract}
            clients={clients}
            templates={templates}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Add signers before sending the contract for signatures.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Each signer receives a unique signing link via email.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Set an expiration date to create urgency for signing.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contract Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Contracts</span>
                <span className="text-sm font-medium text-foreground">{stats.totalContracts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Awaiting Signature</span>
                <span className="text-sm font-medium text-foreground">{stats.pendingContracts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Fully Signed</span>
                <span className="text-sm font-medium text-foreground">{stats.signedContracts}</span>
              </div>
            </div>
          </div>

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
                href="/contracts/new"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Create New Contract
              </Link>
              <Link
                href="/settings/contracts"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Contract Settings
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

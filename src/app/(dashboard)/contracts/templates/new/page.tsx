export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { TemplateFormClient } from "../template-form-client";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

async function getStats(organizationId: string) {
  try {
    const [totalTemplates, totalContracts, signedContracts] = await Promise.all([
      prisma.contractTemplate.count({ where: { organizationId } }),
      prisma.contract.count({ where: { organizationId } }),
      prisma.contract.count({ where: { organizationId, status: "signed" } }),
    ]);

    return { totalTemplates, totalContracts, signedContracts };
  } catch {
    return { totalTemplates: 0, totalContracts: 0, signedContracts: 0 };
  }
}

export default async function NewContractTemplatePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const stats = await getStats(auth.organizationId);

  return (
    <div className="space-y-6" data-element="contracts-templates-new-page">
      <PageHeader
        title="Create Template"
        subtitle="Create a reusable contract template for your business"
        actions={
          <Link
            href="/contracts/templates"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Templates
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TemplateFormClient mode="create" />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Give your template a clear, descriptive name for easy identification.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Use variables like {"{{client_name}}"} that auto-populate when creating contracts.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Include all standard terms and conditions to save time on future contracts.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Template Variables</h2>
            <div className="space-y-2 text-sm">
              <p className="text-foreground-muted mb-3">Insert these variables in your template content:</p>
              <div className="grid gap-1.5">
                <code className="text-xs bg-[var(--background-tertiary)] px-2 py-1 rounded">{"{{client_name}}"}</code>
                <code className="text-xs bg-[var(--background-tertiary)] px-2 py-1 rounded">{"{{client_email}}"}</code>
                <code className="text-xs bg-[var(--background-tertiary)] px-2 py-1 rounded">{"{{photographer_name}}"}</code>
                <code className="text-xs bg-[var(--background-tertiary)] px-2 py-1 rounded">{"{{session_date}}"}</code>
                <code className="text-xs bg-[var(--background-tertiary)] px-2 py-1 rounded">{"{{total_amount}}"}</code>
                <code className="text-xs bg-[var(--background-tertiary)] px-2 py-1 rounded">{"{{current_date}}"}</code>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Templates</span>
                <span className="text-sm font-medium text-foreground">{stats.totalTemplates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Contracts</span>
                <span className="text-sm font-medium text-foreground">{stats.totalContracts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Signed Contracts</span>
                <span className="text-sm font-medium text-foreground">{stats.signedContracts}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/contracts/templates"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View All Templates
              </Link>
              <Link
                href="/contracts/new"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Create Contract
              </Link>
              <Link
                href="/contracts"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View All Contracts
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

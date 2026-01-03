export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { PageHeader } from "@/components/dashboard";

export default async function LicensingPage() {
  const organizationId = await requireOrganizationId();

  const [templates, contracts] = await Promise.all([
    prisma.contractTemplate.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.contract.findMany({
      where: { organizationId },
      include: {
        client: { select: { fullName: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const signedCount = contracts.filter((c) => c.status === "signed").length;
  const sentCount = contracts.filter((c) => c.status === "sent").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Licensing"
        subtitle="Track usage rights and attach licensing terms to contracts"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ContractIcon className="h-4 w-4" />
              View Contracts
            </Link>
            <Link
              href="/contracts/templates/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              New Template
            </Link>
          </div>
        }
      />

      <div className="auto-grid grid-min-200 grid-gap-3">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Templates</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{templates.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Sent</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{sentCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Signed</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{signedCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Recent Contracts</h2>
            <Link
              href="/contracts"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>

          {contracts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
              <ContractIcon className="mx-auto h-10 w-10 text-foreground-muted" />
              <p className="mt-3 text-sm font-medium text-foreground">No licensing contracts yet</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Create a template to start sending licensing terms.
              </p>
              <Link
                href="/contracts/templates/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PlusIcon className="h-4 w-4" />
                Create Template
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--background-hover)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{contract.name}</p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {contract.client?.company || contract.client?.fullName || "No client"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      contract.status === "signed"
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : contract.status === "sent"
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : contract.status === "expired"
                        ? "bg-[var(--error)]/10 text-[var(--error)]"
                        : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                    }`}
                  >
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Licensing Essentials</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-secondary">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Define usage rights by client type and industry.
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Set expiration terms for limited usage.
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Link licensing terms to contract templates.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Templates</h3>
            <div className="mt-3 space-y-2">
              {templates.length === 0 ? (
                <p className="text-sm text-foreground-muted">No templates created yet.</p>
              ) : (
                templates.map((template) => (
                  <Link
                    key={template.id}
                    href={`/contracts/templates/${template.id}`}
                    className="block rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    {template.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13ZM13.25 9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm4-1.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.5a1 1 0 0 1-1.415.001L3.29 9.704a1 1 0 1 1 1.42-1.408l3.086 3.113 6.792-6.82a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
    </svg>
  );
}

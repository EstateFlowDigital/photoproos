export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav, DocumentIcon } from "@/components/dashboard";
import { TemplatesListClient } from "./templates-list-client";
import Link from "next/link";
import { getContractTemplates, seedDefaultContractTemplates } from "@/lib/actions/contract-templates";

export default async function ContractTemplatesPage() {
  // Fetch templates from database
  const result = await getContractTemplates();
  const templates = result.success ? result.data : [];

  // If no templates exist, try to seed defaults
  if (templates.length === 0) {
    await seedDefaultContractTemplates();
    // Refetch after seeding
    const seededResult = await getContractTemplates();
    const seededTemplates = seededResult.success ? seededResult.data : [];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Contract Templates"
          subtitle="Create and manage reusable contract templates"
          actions={
            <Link
              href="/contracts/templates/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:px-4"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden md:inline">Create Template</span>
            </Link>
          }
        />

        {/* Context Navigation */}
        <PageContextNav
          items={[
            { label: "All Contracts", href: "/contracts", icon: <DocumentIcon className="h-4 w-4" /> },
            { label: "Templates", href: "/contracts/templates", icon: <TemplateIcon className="h-4 w-4" /> },
          ]}
        />

        {seededTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-[var(--primary)]/10 p-4 mb-4">
              <TemplateIcon className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No templates yet</h2>
            <p className="mt-2 text-foreground-muted max-w-md">
              Create your first contract template to streamline your contract creation process.
            </p>
            <Link
              href="/contracts/templates/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Your First Template
            </Link>
          </div>
        ) : (
          <TemplatesListClient templates={seededTemplates} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contract Templates"
        subtitle="Create and manage reusable contract templates"
        actions={
          <Link
            href="/contracts/templates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Template
          </Link>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Contracts", href: "/contracts", icon: <DocumentIcon className="h-4 w-4" /> },
          { label: "Templates", href: "/contracts/templates", icon: <TemplateIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Templates List */}
      <TemplatesListClient templates={templates} />
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

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Zm10.5 5.5a.5.5 0 0 0-.5-.5H7a.5.5 0 0 0 0 1h6a.5.5 0 0 0 .5-.5Zm0 3a.5.5 0 0 0-.5-.5H7a.5.5 0 0 0 0 1h6a.5.5 0 0 0 .5-.5Zm-3.5 3a.5.5 0 0 0 0-1H7a.5.5 0 0 0 0 1h3Z" />
    </svg>
  );
}

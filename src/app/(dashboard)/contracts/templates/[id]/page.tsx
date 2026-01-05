export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav, DocumentIcon } from "@/components/dashboard";
import { TemplateFormClient } from "../template-form-client";
import Link from "next/link";
import { getContractTemplates } from "@/lib/actions/contract-templates";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditContractTemplatePage({ params }: Props) {
  const { id } = await params;
  const result = await getContractTemplates();
  const template = result.success ? result.data.find((t) => t.id === id) : null;

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Template"
        subtitle={template.name}
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

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Contracts", href: "/contracts", icon: <DocumentIcon className="h-4 w-4" /> },
          { label: "Templates", href: "/contracts/templates", icon: <TemplateIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Template Form */}
      <TemplateFormClient
        mode="edit"
        initialData={{
          id: template.id,
          name: template.name,
          description: template.description,
          content: template.content || "",
          isDefault: false,
        }}
      />
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

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
    </svg>
  );
}

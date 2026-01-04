"use client";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";

interface Form {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: unknown[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FormEditorClientProps {
  form: Form;
}

export function FormEditorClient({ form }: FormEditorClientProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${form.name}`}
        subtitle="Form editor coming soon"
        actions={
          <Link
            href="/forms"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Forms
          </Link>
        }
      />

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10">
            <FormIcon className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Form Editor</h3>
          <p className="text-sm text-foreground-muted max-w-md mx-auto">
            The drag-and-drop form editor is coming soon. You&apos;ll be able to customize
            fields, add validations, and configure form behavior.
          </p>
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

function FormIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

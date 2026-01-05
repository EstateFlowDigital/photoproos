"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { duplicateContractTemplate, deleteContractTemplate } from "@/lib/actions/contract-templates";
import type { ContractTemplateWithCount } from "@/lib/actions/contract-templates";

interface TemplatesListClientProps {
  templates: ContractTemplateWithCount[];
}

export function TemplatesListClient({ templates }: TemplatesListClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Filter templates by search query
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDuplicate = async (templateId: string) => {
    setIsDuplicating(templateId);
    try {
      const result = await duplicateContractTemplate(templateId);
      if (result.success) {
        showToast("Template duplicated successfully", "success");
        router.refresh();
      } else {
        showToast("Failed to duplicate template", "error");
      }
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async (templateId: string) => {
    const confirmed = await confirm({
      title: "Delete template",
      description: "Are you sure you want to delete this template? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    setIsDeleting(templateId);
    try {
      const result = await deleteContractTemplate(templateId);
      if (result.success) {
        showToast("Template deleted successfully", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete template", "error");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <p className="text-foreground-muted">
            {searchQuery ? "No templates match your search." : "No templates yet."}
          </p>
        </div>
      ) : (
        <div className="auto-grid grid-min-240 grid-gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-sm"
            >
              {/* Default Badge */}
              {template.isDefault && (
                <div className="absolute -top-2 -right-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
                  Default
                </div>
              )}

              {/* Template Info */}
              <Link href={`/contracts/templates/${template.id}`} className="block">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <TemplateIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-medium text-foreground line-clamp-2 sm:line-clamp-1"
                      title={template.name}
                    >
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="mt-0.5 text-sm text-foreground-muted line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <DocumentIcon className="h-3.5 w-3.5" />
                  {template._count.contracts} contract{template._count.contracts !== 1 ? "s" : ""}
                </span>
                <span>
                  Updated {formatDate(template.updatedAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 border-t border-[var(--card-border)] pt-4">
                <Link
                  href={`/contracts/templates/${template.id}`}
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(template.id)}
                  disabled={isDuplicating === template.id}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
                  title="Duplicate"
                  aria-label={`Duplicate ${template.name} template`}
                >
                  {isDuplicating === template.id ? (
                    <LoadingIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <DuplicateIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  disabled={isDeleting === template.id || template._count.contracts > 0}
                  className={cn(
                    "rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-1.5 transition-colors disabled:opacity-50",
                    template._count.contracts > 0
                      ? "text-foreground-muted cursor-not-allowed"
                      : "text-foreground-muted hover:bg-[var(--error)]/10 hover:border-[var(--error)]/30 hover:text-[var(--error)]"
                  )}
                  title={template._count.contracts > 0 ? "Cannot delete: template in use" : "Delete"}
                  aria-label={template._count.contracts > 0 ? `Cannot delete ${template.name}: template in use` : `Delete ${template.name} template`}
                >
                  {isDeleting === template.id ? (
                    <LoadingIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
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

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.44A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

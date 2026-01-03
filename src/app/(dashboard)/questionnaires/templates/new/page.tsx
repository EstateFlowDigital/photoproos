import { redirect } from "next/navigation";
import Link from "next/link";
import {
  createQuestionnaireTemplate,
  duplicateQuestionnaireTemplate,
  getQuestionnaireTemplate,
} from "@/lib/actions/questionnaire-templates";
import type { Industry } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ from?: string; industry?: string }>;
}

const industries: { value: Industry; label: string }[] = [
  { value: "real_estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
  { value: "events", label: "Events & Weddings" },
  { value: "portraits", label: "Portraits & Headshots" },
  { value: "food", label: "Food & Product" },
  { value: "product", label: "Product" },
];

export default async function NewQuestionnaireTemplatePage({ searchParams }: Props) {
  const params = await searchParams;
  const fromTemplateId = params.from;
  const defaultIndustry = params.industry as Industry | undefined;

  // If duplicating from an existing template
  if (fromTemplateId) {
    const sourceResult = await getQuestionnaireTemplate(fromTemplateId);
    if (!sourceResult.success || !sourceResult.data) {
      redirect("/questionnaires");
    }

    const source = sourceResult.data;
    return <DuplicateTemplateForm source={source} />;
  }

  return <CreateTemplateForm defaultIndustry={defaultIndustry} />;
}

// ============================================================================
// CREATE TEMPLATE FORM
// ============================================================================

function CreateTemplateForm({ defaultIndustry }: { defaultIndustry?: Industry }) {
  async function createTemplate(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const industry = formData.get("industry") as Industry;

    if (!name || !slug || !industry) {
      return;
    }

    const result = await createQuestionnaireTemplate({
      name,
      slug,
      description: description || null,
      industry,
      isActive: true,
    });

    if (result.success) {
      redirect(`/questionnaires/templates/${result.data.id}`);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/questionnaires"
            className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Questionnaires
          </Link>
        </div>

        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h1 className="text-xl font-semibold text-foreground mb-6">
            Create New Template
          </h1>

          <form action={createTemplate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Template Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g., Property Details Questionnaire"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                URL Slug <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                name="slug"
                required
                placeholder="e.g., property-details"
                pattern="^[a-z0-9-]+$"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Industry <span className="text-[var(--error)]">*</span>
              </label>
              <select
                name="industry"
                required
                defaultValue={defaultIndustry || ""}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="">Select an industry</option>
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Brief description of this questionnaire template"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
              <Link
                href="/questionnaires"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
              >
                Create Template
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DUPLICATE TEMPLATE FORM
// ============================================================================

interface SourceTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: Industry;
  isSystemTemplate: boolean;
}

function DuplicateTemplateForm({ source }: { source: SourceTemplate }) {
  async function duplicateTemplate(formData: FormData) {
    "use server";

    const newName = formData.get("name") as string;
    const newSlug = formData.get("slug") as string;

    if (!newName || !newSlug) {
      return;
    }

    const result = await duplicateQuestionnaireTemplate({
      id: source.id,
      newName,
      newSlug,
    });

    if (result.success) {
      redirect(`/questionnaires/templates/${result.data.id}`);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/questionnaires"
            className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Questionnaires
          </Link>
        </div>

        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Create Copy of Template
          </h1>
          <p className="text-sm text-foreground-muted mb-6">
            Creating a copy of &ldquo;{source.name}&rdquo; ({source.industry.replace(/_/g, " ")})
          </p>

          <form action={duplicateTemplate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Template Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={`${source.name} (Copy)`}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                URL Slug <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                name="slug"
                required
                defaultValue={`${source.slug}-copy`}
                pattern="^[a-z0-9-]+$"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
              <p className="text-sm text-foreground-muted">
                <strong>Note:</strong> This will copy all fields and legal agreements from the source template. You can customize them after creation.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
              <Link
                href="/questionnaires"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
              >
                Create Copy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

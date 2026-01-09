import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import {
  createQuestionnaireTemplate,
  duplicateQuestionnaireTemplate,
  getQuestionnaireTemplate,
} from "@/lib/actions/questionnaire-templates";
import { getAuthContext } from "@/lib/auth/clerk";
import { prisma } from "@/lib/db";
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

async function getStats(organizationId: string) {
  try {
    const [totalTemplates, activeTemplates, totalResponses] = await Promise.all([
      prisma.questionnaireTemplate.count({ where: { organizationId } }),
      prisma.questionnaireTemplate.count({ where: { organizationId, isActive: true } }),
      prisma.questionnaireResponse.count({
        where: { template: { organizationId } },
      }),
    ]);

    return { totalTemplates, activeTemplates, totalResponses };
  } catch {
    return { totalTemplates: 0, activeTemplates: 0, totalResponses: 0 };
  }
}

export default async function NewQuestionnaireTemplatePage({ searchParams }: Props) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const fromTemplateId = params.from;
  const defaultIndustry = params.industry as Industry | undefined;

  const stats = await getStats(auth.organizationId);

  // If duplicating from an existing template
  if (fromTemplateId) {
    const sourceResult = await getQuestionnaireTemplate(fromTemplateId);
    if (!sourceResult.success || !sourceResult.data) {
      redirect("/questionnaires");
    }

    const source = sourceResult.data;
    return (
      <div className="space-y-6" data-element="questionnaires-templates-new-page">
        <PageHeader
          title="Duplicate Template"
          subtitle={`Creating a copy of "${source.name}"`}
          actions={
            <Link
              href="/questionnaires"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Questionnaires
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DuplicateTemplateForm source={source} />
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
              <div className="space-y-4 text-sm text-foreground-secondary">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                  <p>Give your copy a unique name to distinguish it from the original.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                  <p>All fields and legal agreements will be copied automatically.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                  <p>You can customize the copy after creation to fit your needs.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <span className="text-sm text-foreground-muted">Total Templates</span>
                  <span className="text-sm font-medium text-foreground">{stats.totalTemplates}</span>
                </div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <span className="text-sm text-foreground-muted">Active Templates</span>
                  <span className="text-sm font-medium text-foreground">{stats.activeTemplates}</span>
                </div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <span className="text-sm text-foreground-muted">Total Responses</span>
                  <span className="text-sm font-medium text-foreground">{stats.totalResponses}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-element="questionnaires-templates-new-page">
      <PageHeader
        title="Create New Template"
        subtitle="Design a questionnaire to collect information from your clients"
        actions={
          <Link
            href="/questionnaires"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Questionnaires
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreateTemplateForm defaultIndustry={defaultIndustry} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Choose a descriptive name that clients will recognize.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>The URL slug will be used in shareable links to your questionnaire.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Select the industry that best matches your use case for tailored fields.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Total Templates</span>
                <span className="text-sm font-medium text-foreground">{stats.totalTemplates}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Active Templates</span>
                <span className="text-sm font-medium text-foreground">{stats.activeTemplates}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Total Responses</span>
                <span className="text-sm font-medium text-foreground">{stats.totalResponses}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/questionnaires"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View All Templates
              </Link>
              <Link
                href="/settings/questionnaires"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Questionnaire Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
    <form action={createTemplate} className="space-y-6">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Template Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Template Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Property Details Questionnaire"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              URL Slug <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              name="slug"
              required
              placeholder="e.g., property-details"
              pattern="^[a-z0-9-]+$"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <p className="text-xs text-foreground-muted mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Industry <span className="text-[var(--error)]">*</span>
            </label>
            <select
              name="industry"
              required
              defaultValue={defaultIndustry || ""}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
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
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief description of this questionnaire template"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/questionnaires"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          Create Template
        </button>
      </div>
    </form>
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
    <form action={duplicateTemplate} className="space-y-6">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">New Template Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Template Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={`${source.name} (Copy)`}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              URL Slug <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              name="slug"
              required
              defaultValue={`${source.slug}-copy`}
              pattern="^[a-z0-9-]+$"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <p className="text-xs text-foreground-muted mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
            <InfoIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">What will be copied</h3>
            <p className="text-sm text-foreground-muted mt-1">
              All fields and legal agreements from &ldquo;{source.name}&rdquo; will be copied to your new template. You can customize them after creation.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/questionnaires"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          Create Copy
        </button>
      </div>
    </form>
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}

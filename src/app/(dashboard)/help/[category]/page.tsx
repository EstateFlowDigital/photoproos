export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import {
  HelpSearch,
  HelpBreadcrumb,
  HelpArticleCard,
} from "@/components/help";
import {
  getHelpCategory,
  getArticlesByCategory,
} from "@/lib/help/articles";

// ============================================================================
// Types
// ============================================================================

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function HelpCategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  const category = getHelpCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const articles = getArticlesByCategory(categorySlug);

  return (
    <div data-element="help-category-page" className="space-y-8">
      {/* Breadcrumb */}
      <HelpBreadcrumb
        items={[
          { label: "Help", href: "/help" },
          { label: category.title },
        ]}
      />

      <PageHeader title={category.title} subtitle={category.description} />

      {/* Search */}
      <div className="max-w-xl">
        <HelpSearch placeholder={`Search ${category.title.toLowerCase()}...`} />
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground-muted">
            {articles.length} {articles.length === 1 ? "article" : "articles"}{" "}
            in this category
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <HelpArticleCard
                key={article.slug}
                slug={article.slug}
                categorySlug={article.categorySlug}
                title={article.title}
                description={article.description}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--foreground-muted)]/15 text-foreground-muted">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No articles yet
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            We&apos;re working on adding content to this category. Check back
            soon!
          </p>
        </div>
      )}
    </div>
  );
}

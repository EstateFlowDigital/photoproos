export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { PageHeader } from "@/components/dashboard";
import { HelpBreadcrumb } from "@/components/help";
import {
  getHelpArticle,
  getHelpCategory,
  getRelatedArticles,
} from "@/lib/help/articles";

// ============================================================================
// Types
// ============================================================================

interface ArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function HelpArticlePage({ params }: ArticlePageProps) {
  const { category: categorySlug, slug } = await params;

  const article = getHelpArticle(categorySlug, slug);
  const category = getHelpCategory(categorySlug);

  if (!article || !category) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(slug, 3);

  return (
    <div data-element="help-article-page" className="space-y-6">
      {/* Breadcrumb */}
      <HelpBreadcrumb
        items={[
          { label: "Help", href: "/help" },
          { label: category.title, href: `/help/${categorySlug}` },
          { label: article.title },
        ]}
      />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          <PageHeader title={article.title} subtitle={article.description} />

          {/* Article Content */}
          <div className="prose prose-invert mt-8 max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-foreground mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-[var(--card-border)]">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground-secondary mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground-secondary">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground-secondary">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground-secondary">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-[var(--background-secondary)] px-1.5 py-0.5 text-sm font-mono text-foreground">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="rounded-lg bg-[var(--background-secondary)] p-4 overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                a: ({ href, children }) => (
                  <Link
                    href={href || "#"}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {children}
                  </Link>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[var(--primary)] pl-4 italic text-foreground-muted my-4">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="border-[var(--card-border)] my-8" />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[var(--background-secondary)]">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-foreground-secondary border-t border-[var(--card-border)]">
                    {children}
                  </td>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Article Footer */}
          <div className="mt-8 flex items-start justify-between gap-4 flex-wrap border-t border-[var(--card-border)] pt-6">
            <Link
              href={`/help/${categorySlug}`}
              className="flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
              Back to {category.title}
            </Link>
            <span className="text-xs text-foreground-muted">
              Was this article helpful?
              <button className="ml-2 rounded-full bg-[var(--background-secondary)] px-2 py-1 text-xs transition-colors hover:bg-[var(--background-hover)]">
                Yes
              </button>
              <button className="ml-1 rounded-full bg-[var(--background-secondary)] px-2 py-1 text-xs transition-colors hover:bg-[var(--background-hover)]">
                No
              </button>
            </span>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-6 space-y-6">
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Related Articles
                </h3>
                <div className="mt-4 space-y-3">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/help/${related.categorySlug}/${related.slug}`}
                      className="group flex items-start gap-2 text-sm text-foreground-secondary transition-colors hover:text-foreground"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted group-hover:text-[var(--primary)]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="group-hover:text-[var(--primary)]">
                        {related.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Need More Help? */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Need More Help?
              </h3>
              <p className="mt-2 text-xs text-foreground-muted">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <Link
                href="/help/contact"
                className="mt-4 flex w-full items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

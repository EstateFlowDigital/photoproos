export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import {
  HelpSearch,
  HelpCategoryCard,
  HelpArticleCard,
} from "@/components/help";
import {
  helpCategories,
  getArticlesByCategory,
} from "@/lib/help/articles";

// ============================================================================
// Page
// ============================================================================

export default function HelpPage() {
  // Get popular articles (first article from each category)
  const popularArticles = helpCategories
    .map((category) => {
      const articles = getArticlesByCategory(category.slug);
      return articles[0];
    })
    .filter(Boolean)
    .slice(0, 6);

  // Get getting started articles
  const gettingStartedArticles = getArticlesByCategory("getting-started").slice(
    0,
    3
  );

  return (
    <div data-element="help-page" className="space-y-10">
      <PageHeader
        title="Help & Support"
        subtitle="Find answers, guides, and tutorials for PhotoProOS"
      />

      {/* Hero Search Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 p-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-semibold text-foreground">
            How can we help you today?
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Search our knowledge base or browse categories below
          </p>
          <div className="mt-6">
            <HelpSearch
              placeholder="Search for articles, guides, and tutorials..."
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Getting Started Banner */}
      <Link
        href="/help/getting-started"
        className="group flex items-center gap-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-5 transition-all hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">
            New to PhotoProOS?
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Start here with our quick setup guides and get up and running in
            minutes
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-foreground-muted transition-transform group-hover:translate-x-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      {/* Browse by Category */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Browse by Category
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Find help articles organized by topic
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {helpCategories.map((category) => {
            const articleCount = getArticlesByCategory(category.slug).length;
            return (
              <HelpCategoryCard
                key={category.slug}
                slug={category.slug}
                title={category.title}
                description={category.description}
                icon={category.icon}
                articleCount={articleCount}
              />
            );
          })}
        </div>
      </div>

      {/* Popular Articles */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Popular Articles
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Frequently viewed articles by our users
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          {popularArticles.map((article, index) => (
            <div
              key={article.slug}
              className={
                index < popularArticles.length - 1
                  ? "border-b border-[var(--card-border)]"
                  : ""
              }
            >
              <HelpArticleCard
                slug={article.slug}
                categorySlug={article.categorySlug}
                title={article.title}
                description={article.description}
                categoryLabel={article.category}
                variant="compact"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started Quick Links */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Quick Start Guides
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Essential guides to get you started
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {gettingStartedArticles.map((article) => (
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

      {/* Contact Support CTA */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--card-border)] bg-[var(--foreground-muted)]/15 text-foreground-muted">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M2 4.5A2.5 2.5 0 014.5 2h11A2.5 2.5 0 0118 4.5v8.75a.75.75 0 01-1.5 0V4.5a1 1 0 00-1-1h-11a1 1 0 00-1 1v10a1 1 0 001 1h5.75a.75.75 0 010 1.5H4.5A2.5 2.5 0 012 14.5v-10z" />
              <path d="M16.72 17.78a.75.75 0 01-1.06-.02 4.5 4.5 0 10-6.08-6.66.75.75 0 01-1.06-1.06 6 6 0 118.18 8.76l.02-.02z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Our support team is here to help. Send us a message and we&apos;ll
              get back to you within 24 hours.
            </p>
          </div>
          <Link
            href="/help/contact"
            className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
